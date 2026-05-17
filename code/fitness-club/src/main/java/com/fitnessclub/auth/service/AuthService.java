package com.fitnessclub.auth.service;

import com.fitnessclub.auth.dto.LoginRequest;
import com.fitnessclub.auth.dto.SignupRequest;
import com.fitnessclub.auth.dto.TokenResponse;
import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.config.JwtTokenProvider;
import com.fitnessclub.membership.dto.RegisterRequest;
import com.fitnessclub.membership.entity.AccessLevel;
import com.fitnessclub.membership.entity.MembershipType;
import com.fitnessclub.membership.service.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;

    public AuthService(UserAccountRepository userAccountRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       MemberService memberService) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.memberService = memberService;
    }

    @Transactional
    public TokenResponse selfRegister(RegisterRequest request) {
        memberService.register(request);

        UserAccount user = userAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Registration failed"));

        return generateTokens(user);
    }

    @Transactional
    public TokenResponse signup(SignupRequest request) {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFirstName(request.getFirstName());
        registerRequest.setLastName(request.getLastName());
        registerRequest.setEmail(request.getEmail());
        registerRequest.setPhone(request.getPhone());
        registerRequest.setPassword(request.getPassword());
        registerRequest.setMembershipType(
                request.getMembershipType() != null ? request.getMembershipType() : MembershipType.MONTHLY);
        registerRequest.setAccessLevel(
                request.getAccessLevel() != null ? request.getAccessLevel() : AccessLevel.ALL_FACILITIES);

        return selfRegister(registerRequest);
    }

    public TokenResponse login(LoginRequest request) {
        UserAccount user = userAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        if (!user.isActive()) {
            throw new BusinessException("Account is disabled", HttpStatus.FORBIDDEN);
        }

        return generateTokens(user);
    }

    public TokenResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED);
        }

        var userId = jwtTokenProvider.getUserId(refreshToken);
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.UNAUTHORIZED));

        if (!user.isActive()) {
            throw new BusinessException("Account is disabled", HttpStatus.FORBIDDEN);
        }

        return generateTokens(user);
    }

    private TokenResponse generateTokens(UserAccount user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        return new TokenResponse(accessToken, refreshToken, jwtTokenProvider.getAccessTokenExpirationMs() / 1000);
    }
}
