package com.fitnessclub.staff.controller;

import com.fitnessclub.common.ApiResponse;
import com.fitnessclub.staff.dto.BookPTSessionRequest;
import com.fitnessclub.staff.dto.PTSessionResponse;
import com.fitnessclub.staff.entity.PTSessionStatus;
import com.fitnessclub.staff.service.PersonalTrainingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Personal Training", description = "One-on-one personal training session booking")
public class PersonalTrainingController {

    private final PersonalTrainingService ptService;

    public PersonalTrainingController(PersonalTrainingService ptService) {
        this.ptService = ptService;
    }

    @PostMapping("/api/pt-sessions")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "Book a personal training session")
    public ResponseEntity<ApiResponse<PTSessionResponse>> bookSession(
            Authentication auth, @Valid @RequestBody BookPTSessionRequest request) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(
                ptService.bookSession(userId, request), "Session requested"));
    }

    @GetMapping("/api/pt-sessions/me")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "View my upcoming PT sessions")
    public ResponseEntity<ApiResponse<List<PTSessionResponse>>> getMySessions(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(ptService.getMySessions(userId)));
    }

    @GetMapping("/api/trainer/pt-sessions")
    @PreAuthorize("hasRole('TRAINER')")
    @Operation(summary = "View trainer's upcoming PT sessions")
    public ResponseEntity<ApiResponse<List<PTSessionResponse>>> getTrainerSessions(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(ptService.getTrainerSessions(userId)));
    }

    @GetMapping("/api/trainer/pt-sessions/pending")
    @PreAuthorize("hasRole('TRAINER')")
    @Operation(summary = "View pending PT session requests")
    public ResponseEntity<ApiResponse<List<PTSessionResponse>>> getPendingRequests(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(ptService.getPendingRequests(userId)));
    }

    @PutMapping("/api/pt-sessions/{id}/status")
    @PreAuthorize("hasAnyRole('MEMBER', 'TRAINER')")
    @Operation(summary = "Update PT session status (confirm/cancel/complete)")
    public ResponseEntity<ApiResponse<PTSessionResponse>> updateStatus(
            Authentication auth, @PathVariable UUID id, @RequestParam PTSessionStatus status) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(
                ptService.updateSessionStatus(userId, id, status), "Session status updated"));
    }
}
