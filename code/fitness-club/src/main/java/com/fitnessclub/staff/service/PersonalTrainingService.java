package com.fitnessclub.staff.service;

import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.entity.MembershipStatus;
import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.notification.event.NotificationEvent;
import com.fitnessclub.notification.event.NotificationType;
import com.fitnessclub.reservation.entity.ClassSession;
import com.fitnessclub.reservation.repository.ClassSessionRepository;
import com.fitnessclub.staff.dto.BookPTSessionRequest;
import com.fitnessclub.staff.dto.PTSessionResponse;
import com.fitnessclub.staff.entity.PTSessionStatus;
import com.fitnessclub.staff.entity.PersonalTrainingSession;
import com.fitnessclub.staff.entity.Staff;
import com.fitnessclub.staff.entity.TrainerAvailability;
import com.fitnessclub.staff.repository.PersonalTrainingSessionRepository;
import com.fitnessclub.staff.repository.StaffRepository;
import com.fitnessclub.staff.repository.TrainerAvailabilityRepository;
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
public class PersonalTrainingService {

    private final PersonalTrainingSessionRepository ptRepository;
    private final StaffRepository staffRepository;
    private final MemberRepository memberRepository;
    private final UserAccountRepository userAccountRepository;
    private final TrainerAvailabilityRepository availabilityRepository;
    private final ClassSessionRepository classSessionRepository;
    private final ApplicationEventPublisher eventPublisher;

    public PersonalTrainingService(PersonalTrainingSessionRepository ptRepository,
                                    StaffRepository staffRepository,
                                    MemberRepository memberRepository,
                                    UserAccountRepository userAccountRepository,
                                    TrainerAvailabilityRepository availabilityRepository,
                                    ClassSessionRepository classSessionRepository,
                                    ApplicationEventPublisher eventPublisher) {
        this.ptRepository = ptRepository;
        this.staffRepository = staffRepository;
        this.memberRepository = memberRepository;
        this.userAccountRepository = userAccountRepository;
        this.availabilityRepository = availabilityRepository;
        this.classSessionRepository = classSessionRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public PTSessionResponse bookSession(UUID userId, BookPTSessionRequest request) {
        Member member = getMemberFromUser(userId);

        // Validate membership
        if (member.getStatus() != MembershipStatus.ACTIVE) {
            throw new BusinessException("Membership is not active");
        }
        if (member.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Membership has expired");
        }

        Staff trainer = staffRepository.findById(request.getTrainerId())
                .orElseThrow(() -> new EntityNotFoundException("Trainer not found"));
        if (!"TRAINER".equals(trainer.getRole())) {
            throw new BusinessException("Selected staff member is not a trainer");
        }

        // Validate date is in the future
        if (!request.getSessionDate().isAfter(LocalDate.now())) {
            throw new BusinessException("Session date must be in the future");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BusinessException("End time must be after start time");
        }

        // Check trainer availability for the day of week
        validateTrainerAvailability(trainer.getId(), request);

        // Check for trainer conflicts (PT sessions)
        List<PersonalTrainingSession> trainerConflicts = ptRepository.findConflictingTrainerSessions(
                trainer.getId(), request.getSessionDate(), request.getStartTime(), request.getEndTime());
        if (!trainerConflicts.isEmpty()) {
            throw new BusinessException("Trainer has a conflicting session at this time");
        }

        // Check for trainer conflicts (group classes)
        boolean hasClassConflict = classSessionRepository
                .findByTrainerIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(trainer.getId(), request.getSessionDate())
                .stream()
                .anyMatch(cs -> cs.getDate().equals(request.getSessionDate())
                        && cs.getStartTime().isBefore(request.getEndTime())
                        && cs.getEndTime().isAfter(request.getStartTime()));
        if (hasClassConflict) {
            throw new BusinessException("Trainer has a group class at this time");
        }

        // Check for member conflicts
        List<PersonalTrainingSession> memberConflicts = ptRepository.findConflictingMemberSessions(
                member.getId(), request.getSessionDate(), request.getStartTime(), request.getEndTime());
        if (!memberConflicts.isEmpty()) {
            throw new BusinessException("You already have a session at this time");
        }

        PersonalTrainingSession session = new PersonalTrainingSession();
        session.setTrainerId(trainer.getId());
        session.setMemberId(member.getId());
        session.setSessionDate(request.getSessionDate());
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setStatus(PTSessionStatus.REQUESTED);
        session.setNotes(request.getNotes());
        session = ptRepository.save(session);

        eventPublisher.publishEvent(new NotificationEvent(
                this, trainer.getId(), NotificationType.BOOKING_CONFIRM,
                Map.of("type", "Personal Training Request",
                       "member", member.getFirstName() + " " + member.getLastName(),
                       "date", request.getSessionDate().toString(),
                       "time", request.getStartTime().toString())
        ));

        PTSessionResponse response = PTSessionResponse.from(session);
        response.setTrainerName(trainer.getName());
        response.setMemberName(member.getFirstName() + " " + member.getLastName());
        return response;
    }

    public List<PTSessionResponse> getMySessions(UUID userId) {
        Member member = getMemberFromUser(userId);
        return ptRepository.findByMemberIdAndSessionDateGreaterThanEqualOrderBySessionDateAscStartTimeAsc(
                        member.getId(), LocalDate.now())
                .stream().map(this::enrichResponse).toList();
    }

    public List<PTSessionResponse> getTrainerSessions(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getStaffId() == null) {
            throw new BusinessException("No staff profile linked");
        }
        return ptRepository.findByTrainerIdAndSessionDateGreaterThanEqualOrderBySessionDateAscStartTimeAsc(
                        user.getStaffId(), LocalDate.now())
                .stream().map(this::enrichResponse).toList();
    }

    public List<PTSessionResponse> getPendingRequests(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getStaffId() == null) {
            throw new BusinessException("No staff profile linked");
        }
        return ptRepository.findByTrainerIdAndStatusOrderBySessionDateAscStartTimeAsc(
                        user.getStaffId(), PTSessionStatus.REQUESTED)
                .stream().map(this::enrichResponse).toList();
    }

    @Transactional
    public PTSessionResponse updateSessionStatus(UUID userId, UUID sessionId, PTSessionStatus newStatus) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        PersonalTrainingSession session = ptRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));

        // Trainer can confirm/cancel; member can cancel
        if (user.getStaffId() != null && user.getStaffId().equals(session.getTrainerId())) {
            if (newStatus != PTSessionStatus.CONFIRMED && newStatus != PTSessionStatus.CANCELLED
                    && newStatus != PTSessionStatus.COMPLETED && newStatus != PTSessionStatus.NO_SHOW) {
                throw new BusinessException("Invalid status transition for trainer");
            }
        } else if (user.getMemberId() != null) {
            Member member = memberRepository.findById(user.getMemberId())
                    .orElseThrow(() -> new EntityNotFoundException("Member not found"));
            if (!session.getMemberId().equals(member.getId())) {
                throw new BusinessException("Not your session", HttpStatus.FORBIDDEN);
            }
            if (newStatus != PTSessionStatus.CANCELLED) {
                throw new BusinessException("Members can only cancel sessions");
            }
        } else {
            throw new BusinessException("Unauthorized", HttpStatus.FORBIDDEN);
        }

        session.setStatus(newStatus);
        session = ptRepository.save(session);

        NotificationType notifType = newStatus == PTSessionStatus.CANCELLED
                ? NotificationType.BOOKING_CANCELLED : NotificationType.BOOKING_CONFIRM;
        eventPublisher.publishEvent(new NotificationEvent(
                this, session.getMemberId(), notifType,
                Map.of("type", "Personal Training", "status", newStatus.name(),
                       "date", session.getSessionDate().toString())
        ));

        return enrichResponse(session);
    }

    private void validateTrainerAvailability(UUID trainerId, BookPTSessionRequest request) {
        java.time.DayOfWeek dow = request.getSessionDate().getDayOfWeek();
        List<TrainerAvailability> slots = availabilityRepository.findByTrainerIdAndDayOfWeek(trainerId, dow);

        if (slots.isEmpty()) {
            throw new BusinessException("Trainer is not available on " + dow);
        }

        boolean withinSlot = slots.stream().anyMatch(slot ->
                !request.getStartTime().isBefore(slot.getStartTime())
                        && !request.getEndTime().isAfter(slot.getEndTime()));

        if (!withinSlot) {
            throw new BusinessException("Requested time is outside trainer's availability on " + dow);
        }
    }

    private Member getMemberFromUser(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getMemberId() == null) {
            throw new BusinessException("No member profile linked to this account");
        }
        return memberRepository.findById(user.getMemberId())
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));
    }

    private PTSessionResponse enrichResponse(PersonalTrainingSession session) {
        PTSessionResponse r = PTSessionResponse.from(session);
        staffRepository.findById(session.getTrainerId()).ifPresent(t -> r.setTrainerName(t.getName()));
        memberRepository.findById(session.getMemberId()).ifPresent(m ->
                r.setMemberName(m.getFirstName() + " " + m.getLastName()));
        return r;
    }
}
