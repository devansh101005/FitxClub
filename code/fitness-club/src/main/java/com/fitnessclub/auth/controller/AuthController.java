package com.fitnessclub.auth.controller;

import com.fitnessclub.auth.dto.LoginRequest;
import com.fitnessclub.auth.dto.RefreshTokenRequest;
import com.fitnessclub.auth.dto.TokenResponse;
import com.fitnessclub.auth.service.AuthService;
import com.fitnessclub.common.ApiResponse;
import com.fitnessclub.membership.dto.RegisterRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Auth endpoints for registration, login, and token refresh")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Self-register as a member")
    public ResponseEntity<ApiResponse<TokenResponse>> register(@Valid @RequestBody RegisterRequest request) {
        TokenResponse tokens = authService.selfRegister(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(tokens, "Registration successful"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT tokens")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokens = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(tokens, "Login successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh an expired access token")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse tokens = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(tokens));
    }
}
