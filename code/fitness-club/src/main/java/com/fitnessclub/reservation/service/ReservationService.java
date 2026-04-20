package com.fitnessclub.reservation.service;

import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.facility.entity.Facility;
import com.fitnessclub.facility.entity.FacilityType;
import com.fitnessclub.facility.service.FacilityService;
import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.entity.MembershipStatus;
import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.notification.event.NotificationEvent;
import com.fitnessclub.notification.event.NotificationType;
import com.fitnessclub.reservation.dto.*;
import com.fitnessclub.reservation.entity.*;
import com.fitnessclub.reservation.repository.BookingRepository;
import com.fitnessclub.reservation.repository.ClassSessionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ReservationService {

    private final BookingRepository bookingRepository;
    private final ClassSessionRepository classSessionRepository;
    private final MemberRepository memberRepository;
    private final UserAccountRepository userAccountRepository;
    private final FacilityService facilityService;
    private final ApplicationEventPublisher eventPublisher;

    public ReservationService(BookingRepository bookingRepository,
                               ClassSessionRepository classSessionRepository,
                               MemberRepository memberRepository,
                               UserAccountRepository userAccountRepository,
                               FacilityService facilityService,
                               ApplicationEventPublisher eventPublisher) {
        this.bookingRepository = bookingRepository;
        this.classSessionRepository = classSessionRepository;
        this.memberRepository = memberRepository;
        this.userAccountRepository = userAccountRepository;
        this.facilityService = facilityService;
        this.eventPublisher = eventPublisher;
    }

    public List<ClassSessionResponse> getUpcomingSchedule() {
        List<ClassSession> sessions = classSessionRepository
                .findByDateGreaterThanEqualOrderByDateAscStartTimeAsc(LocalDate.now());
        return sessions.stream().map(s -> {
            int confirmed = bookingRepository.countByClassSessionIdAndStatus(s.getId(), BookingStatus.CONFIRMED);
            return ClassSessionResponse.from(s, confirmed);
        }).toList();
    }

    @Transactional
    public BookingResponse bookClass(UUID userId, BookClassRequest request) {
        Member member = getMemberFromUser(userId);
        validateMembershipActive(member);

        ClassSession session = classSessionRepository.findById(request.getClassSessionId())
                .orElseThrow(() -> new EntityNotFoundException("Class session not found"));

        // Check duplicate booking
        if (bookingRepository.existsByMemberIdAndClassSessionIdAndStatusIn(
                member.getId(), session.getId(), List.of(BookingStatus.CONFIRMED, BookingStatus.WAITLISTED))) {
            throw new BusinessException("You already have a booking for this class");
        }

        int confirmedCount = bookingRepository.countByClassSessionIdAndStatus(session.getId(), BookingStatus.CONFIRMED);

        Booking booking = new Booking();
        booking.setMemberId(member.getId());
        booking.setClassSessionId(session.getId());
        booking.setSlotDate(session.getDate());
        booking.setStartTime(session.getStartTime());
        booking.setEndTime(session.getEndTime());
        booking.setBookingType(BookingType.CLASS);

        if (confirmedCount < session.getCapacity()) {
            booking.setStatus(BookingStatus.CONFIRMED);
            booking = bookingRepository.save(booking);

            eventPublisher.publishEvent(new NotificationEvent(
                    this, member.getId(), NotificationType.BOOKING_CONFIRM,
                    Map.of("class", session.getClassName(), "date", session.getDate().toString(),
                           "time", session.getStartTime().toString())
            ));

            BookingResponse response = BookingResponse.from(booking);
            response.setClassName(session.getClassName());
            return response;
        } else {
            booking.setStatus(BookingStatus.WAITLISTED);
            booking = bookingRepository.save(booking);

            // Calculate waitlist position
            List<Booking> waitlisted = bookingRepository.findByClassSessionIdAndStatusOrderByCreatedAtAsc(
                    session.getId(), BookingStatus.WAITLISTED);
            int position = waitlisted.indexOf(booking) + 1;

            BookingResponse response = BookingResponse.from(booking);
            response.setClassName(session.getClassName());
            response.setWaitlistPosition(position);
            return response;
        }
    }

    @Transactional
    public BookingResponse bookCourt(UUID userId, BookCourtRequest request) {
        Member member = getMemberFromUser(userId);
        validateMembershipActive(member);

        Facility facility = facilityService.findFacility(request.getFacilityId());

        // Validate facility is a court type
        if (facility.getFacilityType() != FacilityType.BADMINTON_COURT
                && facility.getFacilityType() != FacilityType.SQUASH_COURT) {
            throw new BusinessException("This facility is not a bookable court");
        }

        // Check duplicate booking
        if (bookingRepository.existsByMemberIdAndFacilityIdAndSlotDateAndStartTimeAndStatusIn(
                member.getId(), facility.getId(), request.getDate(), request.getStartTime(),
                List.of(BookingStatus.CONFIRMED, BookingStatus.WAITLISTED))) {
            throw new BusinessException("You already have a booking for this court at this time");
        }

        // Check availability - court capacity is the max number of concurrent bookings
        int confirmedCount = bookingRepository.countByFacilityIdAndSlotDateAndStartTimeAndStatus(
                facility.getId(), request.getDate(), request.getStartTime(), BookingStatus.CONFIRMED);

        Booking booking = new Booking();
        booking.setMemberId(member.getId());
        booking.setFacilityId(facility.getId());
        booking.setSlotDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setBookingType(BookingType.COURT);

        // Each court can have 1 confirmed booking per time slot
        if (confirmedCount < 1) {
            booking.setStatus(BookingStatus.CONFIRMED);
            booking = bookingRepository.save(booking);

            eventPublisher.publishEvent(new NotificationEvent(
                    this, member.getId(), NotificationType.BOOKING_CONFIRM,
                    Map.of("court", facility.getName(), "date", request.getDate().toString(),
                           "time", request.getStartTime().toString())
            ));

            BookingResponse response = BookingResponse.from(booking);
            response.setFacilityName(facility.getName());
            return response;
        } else {
            booking.setStatus(BookingStatus.WAITLISTED);
            booking = bookingRepository.save(booking);

            BookingResponse response = BookingResponse.from(booking);
            response.setFacilityName(facility.getName());
            response.setWaitlistPosition(1);
            return response;
        }
    }

    @Transactional
    public void cancelReservation(UUID userId, UUID bookingId) {
        Member member = getMemberFromUser(userId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getMemberId().equals(member.getId())) {
            throw new BusinessException("You can only cancel your own bookings", HttpStatus.FORBIDDEN);
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Booking is already cancelled");
        }

        BookingStatus previousStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        eventPublisher.publishEvent(new NotificationEvent(
                this, member.getId(), NotificationType.BOOKING_CANCELLED,
                Map.of("bookingId", bookingId.toString())
        ));

        // Auto-promote from waitlist if a confirmed booking was cancelled
        if (previousStatus == BookingStatus.CONFIRMED && booking.getBookingType() == BookingType.CLASS
                && booking.getClassSessionId() != null) {
            promoteFromWaitlist(booking.getClassSessionId());
        }
    }

    public List<BookingResponse> getMyReservations(UUID userId) {
        Member member = getMemberFromUser(userId);
        List<Booking> bookings = bookingRepository
                .findByMemberIdAndSlotDateGreaterThanEqualOrderBySlotDateAscStartTimeAsc(
                        member.getId(), LocalDate.now());
        return bookings.stream().map(b -> {
            BookingResponse r = BookingResponse.from(b);
            if (b.getClassSessionId() != null) {
                classSessionRepository.findById(b.getClassSessionId())
                        .ifPresent(s -> r.setClassName(s.getClassName()));
            }
            if (b.getFacilityId() != null) {
                r.setFacilityName(facilityService.findFacility(b.getFacilityId()).getName());
            }
            return r;
        }).toList();
    }

    // --- Trainer methods ---

    public List<ClassSessionResponse> getTrainerSchedule(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getStaffId() == null) {
            throw new BusinessException("No staff profile linked to this account");
        }

        List<ClassSession> sessions = classSessionRepository
                .findByTrainerIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(user.getStaffId(), LocalDate.now());

        return sessions.stream().map(s -> {
            int confirmed = bookingRepository.countByClassSessionIdAndStatus(s.getId(), BookingStatus.CONFIRMED);
            return ClassSessionResponse.from(s, confirmed);
        }).toList();
    }

    public List<MemberInfo> getAttendees(UUID sessionId) {
        classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Class session not found"));

        List<Booking> confirmed = bookingRepository.findByClassSessionIdAndStatus(sessionId, BookingStatus.CONFIRMED);
        return confirmed.stream().map(b -> {
            Member member = memberRepository.findById(b.getMemberId())
                    .orElseThrow(() -> new EntityNotFoundException("Member not found"));
            return new MemberInfo(member.getId(), member.getMemberId(), member.getFirstName(), member.getLastName());
        }).toList();
    }

    // --- Admin methods ---

    @Transactional
    public ClassSessionResponse createClassSession(CreateClassSessionRequest request) {
        // Check for time conflicts at the same facility
        if (request.getFacilityId() != null) {
            List<ClassSession> conflicts = classSessionRepository
                    .findByFacilityIdAndDateAndStartTimeLessThanAndEndTimeGreaterThan(
                            request.getFacilityId(), request.getDate(),
                            request.getEndTime(), request.getStartTime());
            if (!conflicts.isEmpty()) {
                throw new BusinessException("Time conflict with existing class: " + conflicts.get(0).getClassName());
            }
        }

        ClassSession session = new ClassSession();
        session.setClassName(request.getClassName());
        session.setDate(request.getDate());
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setCapacity(request.getCapacity());
        session.setTrainerId(request.getTrainerId());
        session.setFacilityId(request.getFacilityId());
        session = classSessionRepository.save(session);

        return ClassSessionResponse.from(session, 0);
    }

    // --- Helper methods ---

    private Member getMemberFromUser(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getMemberId() == null) {
            throw new BusinessException("No member profile linked to this account");
        }
        return memberRepository.findById(user.getMemberId())
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));
    }

    private void validateMembershipActive(Member member) {
        if (member.getStatus() != MembershipStatus.ACTIVE) {
            throw new BusinessException("Membership is not active");
        }
        if (member.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Membership has expired");
        }
    }

    private void promoteFromWaitlist(UUID classSessionId) {
        bookingRepository.findFirstByClassSessionIdAndStatusOrderByCreatedAtAsc(
                classSessionId, BookingStatus.WAITLISTED).ifPresent(waitlisted -> {
            waitlisted.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(waitlisted);

            eventPublisher.publishEvent(new NotificationEvent(
                    this, waitlisted.getMemberId(), NotificationType.WAITLIST_PROMOTED,
                    Map.of("bookingId", waitlisted.getId().toString())
            ));
        });
    }

    // Simple inner record for attendee info
    public record MemberInfo(UUID id, String memberId, String firstName, String lastName) {}
}
