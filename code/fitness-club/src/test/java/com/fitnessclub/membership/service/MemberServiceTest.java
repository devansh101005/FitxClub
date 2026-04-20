package com.fitnessclub.membership.service;

import com.fitnessclub.auth.entity.Role;
import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.membership.dto.MemberResponse;
import com.fitnessclub.membership.dto.RegisterRequest;
import com.fitnessclub.membership.entity.AccessLevel;
import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.entity.MembershipStatus;
import com.fitnessclub.membership.entity.MembershipType;
import com.fitnessclub.membership.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MemberService Unit Tests")
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private QrCodeService qrCodeService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private MemberService memberService;

    private RegisterRequest validRequest;
    private UUID userId;
    private UUID memberId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        memberId = UUID.randomUUID();

        validRequest = new RegisterRequest();
        validRequest.setFirstName("Rahul");
        validRequest.setLastName("Sharma");
        validRequest.setEmail("rahul@example.com");
        validRequest.setPhone("9876543210");
        validRequest.setPassword("Secure@123");
        validRequest.setMembershipType(MembershipType.MONTHLY);
        validRequest.setAccessLevel(AccessLevel.GYM_ONLY);
    }

    // ==================== REGISTRATION TESTS ====================

    @Test
    @DisplayName("TC-REG-001: Register new member with valid data succeeds")
    void testRegisterSuccess() {
        // Arrange
        when(memberRepository.existsByEmail("rahul@example.com")).thenReturn(false);
        when(qrCodeService.generateQrCode(anyString(), any(LocalDate.class))).thenReturn("qr-code-data");
        when(passwordEncoder.encode("Secure@123")).thenReturn("encoded-password");
        when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> {
            Member m = invocation.getArgument(0);
            m.setId(memberId);
            return m;
        });
        when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        MemberResponse response = memberService.register(validRequest);

        // Assert
        assertNotNull(response);
        assertEquals("Rahul", response.getFirstName());
        assertEquals("Sharma", response.getLastName());
        assertEquals("rahul@example.com", response.getEmail());
        assertEquals(MembershipStatus.ACTIVE, response.getStatus());
        assertEquals(MembershipType.MONTHLY, response.getMembershipType());
        assertNotNull(response.getQrCode());

        verify(memberRepository).save(any(Member.class));
        verify(userAccountRepository).save(any(UserAccount.class));
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    @DisplayName("TC-REG-002: Register with duplicate email throws exception")
    void testRegisterDuplicateEmail() {
        // Arrange
        when(memberRepository.existsByEmail("rahul@example.com")).thenReturn(true);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> memberService.register(validRequest));

        assertEquals("Email already registered", exception.getMessage());
        verify(memberRepository, never()).save(any(Member.class));
        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }

    // ==================== GET PROFILE TESTS ====================

    @Test
    @DisplayName("TC-REG-003: Get profile for valid user returns member data")
    void testGetProfileSuccess() {
        // Arrange
        UserAccount user = new UserAccount();
        user.setId(userId);
        user.setMemberId(memberId);

        Member member = new Member();
        member.setId(memberId);
        member.setFirstName("Rahul");
        member.setLastName("Sharma");
        member.setEmail("rahul@example.com");
        member.setPhone("9876543210");
        member.setMembershipType(MembershipType.MONTHLY);
        member.setAccessLevel(AccessLevel.GYM_ONLY);
        member.setStatus(MembershipStatus.ACTIVE);
        member.setStartDate(LocalDate.now());
        member.setExpiryDate(LocalDate.now().plusMonths(1));

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(user));
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));

        // Act
        MemberResponse response = memberService.getProfile(userId);

        // Assert
        assertNotNull(response);
        assertEquals("Rahul", response.getFirstName());
        assertEquals(MembershipStatus.ACTIVE, response.getStatus());
    }

    @Test
    @DisplayName("TC-REG-004: Get profile with no linked member throws exception")
    void testGetProfileNoLinkedMember() {
        // Arrange
        UserAccount user = new UserAccount();
        user.setId(userId);
        user.setMemberId(null); // No member linked

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> memberService.getProfile(userId));

        assertEquals("No member profile linked to this account", exception.getMessage());
    }

    @Test
    @DisplayName("TC-REG-005: Get profile for non-existent user throws exception")
    void testGetProfileUserNotFound() {
        // Arrange
        UUID unknownUserId = UUID.randomUUID();
        when(userAccountRepository.findById(unknownUserId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class,
                () -> memberService.getProfile(unknownUserId));
    }

    @Test
    @DisplayName("TC-REG-006: Get member by ID returns correct member")
    void testGetMemberByIdSuccess() {
        // Arrange
        Member member = new Member();
        member.setId(memberId);
        member.setFirstName("Rahul");
        member.setLastName("Sharma");
        member.setEmail("rahul@example.com");
        member.setPhone("9876543210");
        member.setMembershipType(MembershipType.ANNUAL);
        member.setAccessLevel(AccessLevel.ALL_FACILITIES);
        member.setStatus(MembershipStatus.ACTIVE);
        member.setStartDate(LocalDate.now());
        member.setExpiryDate(LocalDate.now().plusYears(1));

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));

        // Act
        MemberResponse response = memberService.getMemberById(memberId);

        // Assert
        assertNotNull(response);
        assertEquals("Rahul", response.getFirstName());
        assertEquals(MembershipType.ANNUAL, response.getMembershipType());
        assertEquals(LocalDate.now().plusYears(1), response.getExpiryDate());
    }
}
