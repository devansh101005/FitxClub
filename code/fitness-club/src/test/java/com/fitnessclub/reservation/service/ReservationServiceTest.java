package com.fitnessclub.reservation.service;

import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.facility.entity.Facility;
import com.fitnessclub.facility.entity.FacilityType;
import com.fitnessclub.facility.service.FacilityService;
import com.fitnessclub.membership.entity.*;
import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.reservation.dto.BookClassRequest;
import com.fitnessclub.reservation.dto.BookCourtRequest;
import com.fitnessclub.reservation.dto.BookingResponse;
import com.fitnessclub.reservation.entity.*;
import com.fitnessclub.reservation.repository.BookingRepository;
import com.fitnessclub.reservation.repository.ClassSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReservationService Unit Tests")
class ReservationServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ClassSessionRepository classSessionRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private FacilityService facilityService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ReservationService reservationService;

    private UUID userId;
    private UUID memberId;
    private UUID sessionId;
    private UserAccount userAccount;
    private Member activeMember;
    private Member expiredMember;
    private ClassSession classSession;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        memberId = UUID.randomUUID();
        sessionId = UUID.randomUUID();

        // Set up user account
        userAccount = new UserAccount();
        userAccount.setId(userId);
        userAccount.setMemberId(memberId);

        // Set up active member
        activeMember = new Member();
        activeMember.setId(memberId);
        activeMember.setFirstName("Rahul");
        activeMember.setLastName("Sharma");
        activeMember.setStatus(MembershipStatus.ACTIVE);
        activeMember.setExpiryDate(LocalDate.now().plusMonths(6));

        // Set up expired member
        expiredMember = new Member();
        expiredMember.setId(memberId);
        expiredMember.setStatus(MembershipStatus.ACTIVE);
        expiredMember.setExpiryDate(LocalDate.now().minusDays(1));

        // Set up class session
        classSession = new ClassSession();
        classSession.setId(sessionId);
        classSession.setClassName("Morning Yoga");
        classSession.setDate(LocalDate.now().plusDays(3));
        classSession.setStartTime(LocalTime.of(7, 0));
        classSession.setEndTime(LocalTime.of(8, 0));
        classSession.setCapacity(20);
    }

    // ==================== BOOK CLASS TESTS ====================

    @Test
    @DisplayName("TC-CLASS-002: Book a class successfully - CONFIRMED status")
    void testBookClassSuccess() {
        // Arrange
        BookClassRequest request = new BookClassRequest();
        request.setClassSessionId(sessionId);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(classSessionRepository.findById(sessionId)).thenReturn(Optional.of(classSession));
        when(bookingRepository.existsByMemberIdAndClassSessionIdAndStatusIn(
                eq(memberId), eq(sessionId), anyList())).thenReturn(false);
        when(bookingRepository.countByClassSessionIdAndStatus(sessionId, BookingStatus.CONFIRMED))
                .thenReturn(5); // 5 out of 20 capacity — room available
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(UUID.randomUUID());
            return b;
        });

        // Act
        BookingResponse response = reservationService.bookClass(userId, request);

        // Assert
        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
        assertEquals("Morning Yoga", response.getClassName());
        assertEquals(BookingType.CLASS, response.getBookingType());
        verify(bookingRepository).save(any(Booking.class));
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    @DisplayName("TC-CLASS-003: Duplicate booking throws exception")
    void testBookClassDuplicate() {
        // Arrange
        BookClassRequest request = new BookClassRequest();
        request.setClassSessionId(sessionId);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(classSessionRepository.findById(sessionId)).thenReturn(Optional.of(classSession));
        when(bookingRepository.existsByMemberIdAndClassSessionIdAndStatusIn(
                eq(memberId), eq(sessionId), anyList())).thenReturn(true); // Already booked

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> reservationService.bookClass(userId, request));

        assertEquals("You already have a booking for this class", exception.getMessage());
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("TC-CLASS-004: Book class when full results in WAITLISTED status")
    void testBookClassWaitlisted() {
        // Arrange
        BookClassRequest request = new BookClassRequest();
        request.setClassSessionId(sessionId);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(classSessionRepository.findById(sessionId)).thenReturn(Optional.of(classSession));
        when(bookingRepository.existsByMemberIdAndClassSessionIdAndStatusIn(
                eq(memberId), eq(sessionId), anyList())).thenReturn(false);
        when(bookingRepository.countByClassSessionIdAndStatus(sessionId, BookingStatus.CONFIRMED))
                .thenReturn(20); // Equal to capacity — full

        Booking waitlistedBooking = new Booking();
        waitlistedBooking.setId(UUID.randomUUID());
        waitlistedBooking.setStatus(BookingStatus.WAITLISTED);
        waitlistedBooking.setMemberId(memberId);
        waitlistedBooking.setClassSessionId(sessionId);
        waitlistedBooking.setSlotDate(classSession.getDate());
        waitlistedBooking.setStartTime(classSession.getStartTime());
        waitlistedBooking.setEndTime(classSession.getEndTime());
        waitlistedBooking.setBookingType(BookingType.CLASS);

        when(bookingRepository.save(any(Booking.class))).thenReturn(waitlistedBooking);
        when(bookingRepository.findByClassSessionIdAndStatusOrderByCreatedAtAsc(sessionId, BookingStatus.WAITLISTED))
                .thenReturn(List.of(waitlistedBooking));

        // Act
        BookingResponse response = reservationService.bookClass(userId, request);

        // Assert
        assertNotNull(response);
        assertEquals(BookingStatus.WAITLISTED, response.getStatus());
        assertEquals(1, response.getWaitlistPosition());
    }

    @Test
    @DisplayName("TC-CLASS-006: Book class with expired membership throws exception")
    void testBookClassExpiredMembership() {
        // Arrange
        BookClassRequest request = new BookClassRequest();
        request.setClassSessionId(sessionId);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(expiredMember));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> reservationService.bookClass(userId, request));

        assertEquals("Membership has expired", exception.getMessage());
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    // ==================== BOOK COURT TESTS ====================

    @Test
    @DisplayName("TC-COURT-001: Book a badminton court successfully")
    void testBookCourtSuccess() {
        // Arrange
        UUID facilityId = UUID.randomUUID();
        BookCourtRequest request = new BookCourtRequest();
        request.setFacilityId(facilityId);
        request.setDate(LocalDate.now().plusDays(5));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));

        Facility badmintonCourt = new Facility();
        badmintonCourt.setId(facilityId);
        badmintonCourt.setName("Badminton Court 1");
        badmintonCourt.setFacilityType(FacilityType.BADMINTON_COURT);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(facilityService.findFacility(facilityId)).thenReturn(badmintonCourt);
        when(bookingRepository.existsByMemberIdAndFacilityIdAndSlotDateAndStartTimeAndStatusIn(
                any(), any(), any(), any(), anyList())).thenReturn(false);
        when(bookingRepository.countByFacilityIdAndSlotDateAndStartTimeAndStatus(
                any(), any(), any(), eq(BookingStatus.CONFIRMED))).thenReturn(0);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(UUID.randomUUID());
            return b;
        });

        // Act
        BookingResponse response = reservationService.bookCourt(userId, request);

        // Assert
        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
        assertEquals("Badminton Court 1", response.getFacilityName());
        assertEquals(BookingType.COURT, response.getBookingType());
    }

    @Test
    @DisplayName("TC-COURT-002: Book a non-court facility throws exception")
    void testBookCourtNonCourtFacility() {
        // Arrange
        UUID facilityId = UUID.randomUUID();
        BookCourtRequest request = new BookCourtRequest();
        request.setFacilityId(facilityId);
        request.setDate(LocalDate.now().plusDays(5));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));

        Facility gym = new Facility();
        gym.setId(facilityId);
        gym.setName("Main Gym");
        gym.setFacilityType(FacilityType.GYM);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(facilityService.findFacility(facilityId)).thenReturn(gym);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> reservationService.bookCourt(userId, request));

        assertEquals("This facility is not a bookable court", exception.getMessage());
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    // ==================== CANCEL BOOKING TESTS ====================

    @Test
    @DisplayName("TC-COURT-005: Cancel own booking sets status to CANCELLED")
    void testCancelBookingSuccess() {
        // Arrange
        UUID bookingId = UUID.randomUUID();

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setMemberId(memberId);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setBookingType(BookingType.COURT);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        reservationService.cancelReservation(userId, bookingId);

        // Assert
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
        verify(bookingRepository).save(booking);
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    @DisplayName("TC-BND-003: Cancel another member's booking throws FORBIDDEN")
    void testCancelOtherMemberBooking() {
        // Arrange
        UUID bookingId = UUID.randomUUID();
        UUID otherMemberId = UUID.randomUUID();

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setMemberId(otherMemberId); // Belongs to a different member
        booking.setStatus(BookingStatus.CONFIRMED);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> reservationService.cancelReservation(userId, bookingId));

        assertEquals("You can only cancel your own bookings", exception.getMessage());
        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
