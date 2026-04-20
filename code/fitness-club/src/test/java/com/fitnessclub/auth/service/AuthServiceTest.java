package com.fitnessclub.auth.service;

import com.fitnessclub.auth.dto.LoginRequest;
import com.fitnessclub.auth.dto.TokenResponse;
import com.fitnessclub.auth.entity.Role;
import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.config.JwtTokenProvider;
import com.fitnessclub.membership.service.MemberService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private MemberService memberService;

    @InjectMocks
    private AuthService authService;

    private UserAccount activeUser;
    private UserAccount inactiveUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        activeUser = new UserAccount();
        activeUser.setId(userId);
        activeUser.setEmail("john@example.com");
        activeUser.setPasswordHash("hashedPassword");
        activeUser.setRole(Role.MEMBER);
        activeUser.setActive(true);

        inactiveUser = new UserAccount();
        inactiveUser.setId(UUID.randomUUID());
        inactiveUser.setEmail("disabled@example.com");
        inactiveUser.setPasswordHash("hashedPassword");
        inactiveUser.setRole(Role.MEMBER);
        inactiveUser.setActive(false);
    }

    // ==================== LOGIN TESTS ====================

    @Test
    @DisplayName("TC-AUTH-001: Login with valid credentials returns tokens")
    void testLoginSuccess() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("Password@123");

        when(userAccountRepository.findByEmail("john@example.com"))
                .thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("Password@123", "hashedPassword"))
                .thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(eq(userId), eq("john@example.com"), eq(Role.MEMBER)))
                .thenReturn("access-token-123");
        when(jwtTokenProvider.generateRefreshToken(eq(userId)))
                .thenReturn("refresh-token-123");
        when(jwtTokenProvider.getAccessTokenExpirationMs())
                .thenReturn(3600000L);

        // Act
        TokenResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("access-token-123", response.getAccessToken());
        assertEquals("refresh-token-123", response.getRefreshToken());
        assertEquals(3600, response.getExpiresIn()); // milliseconds / 1000
        verify(userAccountRepository).findByEmail("john@example.com");
        verify(passwordEncoder).matches("Password@123", "hashedPassword");
    }

    @Test
    @DisplayName("TC-AUTH-002: Login with non-existent email throws exception")
    void testLoginInvalidEmail() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@example.com");
        request.setPassword("Password@123");

        when(userAccountRepository.findByEmail("nonexistent@example.com"))
                .thenReturn(Optional.empty());

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> authService.login(request));

        assertEquals("Invalid email or password", exception.getMessage());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("TC-AUTH-003: Login with wrong password throws exception")
    void testLoginWrongPassword() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("WrongPassword");

        when(userAccountRepository.findByEmail("john@example.com"))
                .thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("WrongPassword", "hashedPassword"))
                .thenReturn(false);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> authService.login(request));

        assertEquals("Invalid email or password", exception.getMessage());
        verify(jwtTokenProvider, never()).generateAccessToken(any(), anyString(), any());
    }

    @Test
    @DisplayName("TC-AUTH-004: Login with inactive account throws FORBIDDEN")
    void testLoginInactiveAccount() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("disabled@example.com");
        request.setPassword("Password@123");

        when(userAccountRepository.findByEmail("disabled@example.com"))
                .thenReturn(Optional.of(inactiveUser));
        when(passwordEncoder.matches("Password@123", "hashedPassword"))
                .thenReturn(true);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> authService.login(request));

        assertEquals("Account is disabled", exception.getMessage());
        verify(jwtTokenProvider, never()).generateAccessToken(any(), anyString(), any());
    }

    // ==================== REFRESH TOKEN TESTS ====================

    @Test
    @DisplayName("TC-AUTH-005: Refresh with valid token returns new tokens")
    void testRefreshTokenValid() {
        // Arrange
        String validRefreshToken = "valid-refresh-token";

        when(jwtTokenProvider.validateToken(validRefreshToken)).thenReturn(true);
        when(jwtTokenProvider.getUserId(validRefreshToken)).thenReturn(userId);
        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(activeUser));
        when(jwtTokenProvider.generateAccessToken(eq(userId), eq("john@example.com"), eq(Role.MEMBER)))
                .thenReturn("new-access-token");
        when(jwtTokenProvider.generateRefreshToken(eq(userId)))
                .thenReturn("new-refresh-token");
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(3600000L);

        // Act
        TokenResponse response = authService.refresh(validRefreshToken);

        // Assert
        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        assertEquals("new-refresh-token", response.getRefreshToken());
    }

    @Test
    @DisplayName("TC-AUTH-006: Refresh with invalid token throws UNAUTHORIZED")
    void testRefreshTokenInvalid() {
        // Arrange
        String invalidToken = "invalid-token";
        when(jwtTokenProvider.validateToken(invalidToken)).thenReturn(false);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> authService.refresh(invalidToken));

        assertEquals("Invalid or expired refresh token", exception.getMessage());
        verify(userAccountRepository, never()).findById(any());
    }
}
