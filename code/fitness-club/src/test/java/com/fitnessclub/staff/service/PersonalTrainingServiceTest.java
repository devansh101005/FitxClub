package com.fitnessclub.staff.service;

import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.entity.MembershipStatus;
import com.fitnessclub.membership.repository.MemberRepository;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PersonalTrainingService Unit Tests")
class PersonalTrainingServiceTest {

    @Mock
    private PersonalTrainingSessionRepository ptRepository;

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private TrainerAvailabilityRepository availabilityRepository;

    @Mock
    private ClassSessionRepository classSessionRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private PersonalTrainingService personalTrainingService;

    private UUID userId;
    private UUID memberId;
    private UUID trainerId;
    private UserAccount userAccount;
    private Member activeMember;
    private Staff trainer;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        memberId = UUID.randomUUID();
        trainerId = UUID.randomUUID();

        userAccount = new UserAccount();
        userAccount.setId(userId);
        userAccount.setMemberId(memberId);

        activeMember = new Member();
        activeMember.setId(memberId);
        activeMember.setFirstName("Rahul");
        activeMember.setLastName("Sharma");
        activeMember.setStatus(MembershipStatus.ACTIVE);
        activeMember.setExpiryDate(LocalDate.now().plusMonths(6));

        trainer = new Staff();
        trainer.setId(trainerId);
        trainer.setName("Coach Arjun");
        trainer.setRole("TRAINER");
    }

    // ==================== BOOK PT SESSION TESTS ====================

    @Test
    @DisplayName("TC-PT-002: Book PT session with past date throws exception")
    void testBookPTSessionPastDate() {
        // Arrange
        BookPTSessionRequest request = new BookPTSessionRequest();
        request.setTrainerId(trainerId);
        request.setSessionDate(LocalDate.now().minusDays(1)); // Past date
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(staffRepository.findById(trainerId)).thenReturn(Optional.of(trainer));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> personalTrainingService.bookSession(userId, request));

        assertEquals("Session date must be in the future", exception.getMessage());
        verify(ptRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-PT-003: Book PT when trainer not available on that day throws exception")
    void testBookPTTrainerNotAvailable() {
        // Arrange — pick a future Monday
        LocalDate nextMonday = LocalDate.now().with(java.time.temporal.TemporalAdjusters.next(DayOfWeek.MONDAY));

        BookPTSessionRequest request = new BookPTSessionRequest();
        request.setTrainerId(trainerId);
        request.setSessionDate(nextMonday);
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(staffRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(availabilityRepository.findByTrainerIdAndDayOfWeek(trainerId, DayOfWeek.MONDAY))
                .thenReturn(Collections.emptyList()); // No availability on Monday

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> personalTrainingService.bookSession(userId, request));

        assertEquals("Trainer is not available on MONDAY", exception.getMessage());
    }

    @Test
    @DisplayName("TC-PT-004: Book PT when trainer has conflicting session throws exception")
    void testBookPTTrainerConflict() {
        // Arrange — pick a future Wednesday
        LocalDate nextWednesday = LocalDate.now().with(java.time.temporal.TemporalAdjusters.next(DayOfWeek.WEDNESDAY));

        BookPTSessionRequest request = new BookPTSessionRequest();
        request.setTrainerId(trainerId);
        request.setSessionDate(nextWednesday);
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));

        // Trainer is available on Wednesday
        TrainerAvailability availability = new TrainerAvailability();
        availability.setTrainerId(trainerId);
        availability.setDayOfWeek(DayOfWeek.WEDNESDAY);
        availability.setStartTime(LocalTime.of(8, 0));
        availability.setEndTime(LocalTime.of(17, 0));

        // But there's a conflicting session
        PersonalTrainingSession conflicting = new PersonalTrainingSession();
        conflicting.setId(UUID.randomUUID());

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(staffRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(availabilityRepository.findByTrainerIdAndDayOfWeek(trainerId, DayOfWeek.WEDNESDAY))
                .thenReturn(List.of(availability));
        when(ptRepository.findConflictingTrainerSessions(trainerId, nextWednesday,
                LocalTime.of(10, 0), LocalTime.of(11, 0)))
                .thenReturn(List.of(conflicting));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> personalTrainingService.bookSession(userId, request));

        assertEquals("Trainer has a conflicting session at this time", exception.getMessage());
    }

    // ==================== UPDATE STATUS TESTS ====================

    @Test
    @DisplayName("TC-PT-005: Trainer confirms a PT request - status changes to CONFIRMED")
    void testTrainerConfirmsPTRequest() {
        // Arrange
        UUID sessionId = UUID.randomUUID();
        UUID trainerUserId = UUID.randomUUID();

        UserAccount trainerUser = new UserAccount();
        trainerUser.setId(trainerUserId);
        trainerUser.setStaffId(trainerId);

        PersonalTrainingSession session = new PersonalTrainingSession();
        session.setId(sessionId);
        session.setTrainerId(trainerId);
        session.setMemberId(memberId);
        session.setSessionDate(LocalDate.now().plusDays(5));
        session.setStartTime(LocalTime.of(10, 0));
        session.setEndTime(LocalTime.of(11, 0));
        session.setStatus(PTSessionStatus.REQUESTED);

        when(userAccountRepository.findById(trainerUserId)).thenReturn(Optional.of(trainerUser));
        when(ptRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(ptRepository.save(any(PersonalTrainingSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(staffRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));

        // Act
        PTSessionResponse response = personalTrainingService.updateSessionStatus(
                trainerUserId, sessionId, PTSessionStatus.CONFIRMED);

        // Assert
        assertNotNull(response);
        assertEquals(PTSessionStatus.CONFIRMED, response.getStatus());
        assertEquals(PTSessionStatus.CONFIRMED, session.getStatus());
        verify(ptRepository).save(session);
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    @DisplayName("TC-PT-006: Member cancels own PT session - status changes to CANCELLED")
    void testMemberCancelsPTSession() {
        // Arrange
        UUID sessionId = UUID.randomUUID();

        PersonalTrainingSession session = new PersonalTrainingSession();
        session.setId(sessionId);
        session.setTrainerId(trainerId);
        session.setMemberId(memberId);
        session.setSessionDate(LocalDate.now().plusDays(5));
        session.setStartTime(LocalTime.of(10, 0));
        session.setEndTime(LocalTime.of(11, 0));
        session.setStatus(PTSessionStatus.CONFIRMED);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(ptRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));
        when(ptRepository.save(any(PersonalTrainingSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(staffRepository.findById(trainerId)).thenReturn(Optional.of(trainer));

        // Act
        PTSessionResponse response = personalTrainingService.updateSessionStatus(
                userId, sessionId, PTSessionStatus.CANCELLED);

        // Assert
        assertNotNull(response);
        assertEquals(PTSessionStatus.CANCELLED, response.getStatus());
        verify(ptRepository).save(session);
    }

    @Test
    @DisplayName("TC-PT-FORBIDDEN: Member tries non-cancel status throws exception")
    void testMemberTriesNonCancelStatus() {
        // Arrange
        UUID sessionId = UUID.randomUUID();

        PersonalTrainingSession session = new PersonalTrainingSession();
        session.setId(sessionId);
        session.setTrainerId(trainerId);
        session.setMemberId(memberId);
        session.setStatus(PTSessionStatus.REQUESTED);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));
        when(ptRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(activeMember));

        // Act & Assert — member trying to CONFIRM (only trainers can)
        BusinessException exception = assertThrows(BusinessException.class,
                () -> personalTrainingService.updateSessionStatus(userId, sessionId, PTSessionStatus.CONFIRMED));

        assertEquals("Members can only cancel sessions", exception.getMessage());
    }
}
