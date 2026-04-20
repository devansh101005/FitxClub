package com.fitnessclub.staff.controller;

import com.fitnessclub.common.ApiResponse;
import com.fitnessclub.staff.dto.*;
import com.fitnessclub.staff.service.StaffService;
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
@Tag(name = "Trainer Profiles", description = "Trainer profile and availability management")
public class TrainerProfileController {

    private final StaffService staffService;

    public TrainerProfileController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping("/api/trainers")
    @Operation(summary = "List all trainers with profiles and availability")
    public ResponseEntity<ApiResponse<List<TrainerProfileResponse>>> getAllTrainers() {
        return ResponseEntity.ok(ApiResponse.success(staffService.getAllTrainers()));
    }

    @GetMapping("/api/trainers/{id}")
    @Operation(summary = "Get trainer profile by ID")
    public ResponseEntity<ApiResponse<TrainerProfileResponse>> getTrainerProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(staffService.getTrainerProfile(id)));
    }

    @GetMapping("/api/trainer/profile")
    @PreAuthorize("hasRole('TRAINER')")
    @Operation(summary = "View own trainer profile")
    public ResponseEntity<ApiResponse<TrainerProfileResponse>> getMyProfile(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(staffService.getMyProfile(userId)));
    }

    @PutMapping("/api/trainer/profile")
    @PreAuthorize("hasRole('TRAINER')")
    @Operation(summary = "Update own trainer profile (bio, specialization, rate)")
    public ResponseEntity<ApiResponse<TrainerProfileResponse>> updateMyProfile(
            Authentication auth, @RequestBody UpdateTrainerProfileRequest request) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(
                staffService.updateMyProfile(userId, request), "Profile updated"));
    }

    @PostMapping("/api/trainer/availability")
    @PreAuthorize("hasRole('TRAINER')")
    @Operation(summary = "Add availability slot")
    public ResponseEntity<ApiResponse<AvailabilitySlot>> addAvailability(
            Authentication auth, @Valid @RequestBody AddAvailabilityRequest request) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(
                staffService.addAvailability(userId, request), "Availability added"));
    }

    @DeleteMapping("/api/trainer/availability/{slotId}")
    @PreAuthorize("hasRole('TRAINER')")
    @Operation(summary = "Remove availability slot")
    public ResponseEntity<ApiResponse<Void>> removeAvailability(
            Authentication auth, @PathVariable UUID slotId) {
        UUID userId = UUID.fromString(auth.getName());
        staffService.removeAvailability(userId, slotId);
        return ResponseEntity.ok(ApiResponse.success(null, "Availability removed"));
    }
}
