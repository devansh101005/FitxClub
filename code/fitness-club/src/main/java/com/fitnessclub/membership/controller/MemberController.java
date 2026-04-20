package com.fitnessclub.membership.controller;

import com.fitnessclub.common.ApiResponse;
import com.fitnessclub.membership.dto.MemberResponse;
import com.fitnessclub.membership.dto.RegisterRequest;
import com.fitnessclub.membership.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/members")
@Tag(name = "Membership", description = "Member registration and profile management")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    @Operation(summary = "Register a member (receptionist/admin)")
    public ResponseEntity<ApiResponse<MemberResponse>> register(@Valid @RequestBody RegisterRequest request) {
        MemberResponse member = memberService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(member, "Member registered successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "View own membership profile with QR code")
    public ResponseEntity<ApiResponse<MemberResponse>> getMyProfile(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        MemberResponse profile = memberService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @Operation(summary = "View a member by ID (manager/admin)")
    public ResponseEntity<ApiResponse<MemberResponse>> getMember(@PathVariable UUID id) {
        MemberResponse member = memberService.getMemberById(id);
        return ResponseEntity.ok(ApiResponse.success(member));
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN') or hasRole('RECEPTIONIST')")
    @Operation(summary = "List all members (staff only)")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.success(memberService.listAll()));
    }
}
