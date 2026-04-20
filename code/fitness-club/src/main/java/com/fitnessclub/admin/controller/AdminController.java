package com.fitnessclub.admin.controller;

import com.fitnessclub.admin.dto.CreateTrainerRequest;
import com.fitnessclub.admin.service.AdminTrainerService;
import com.fitnessclub.common.ApiResponse;
import com.fitnessclub.facility.dto.FacilityResponse;
import com.fitnessclub.facility.service.FacilityService;
import com.fitnessclub.reservation.dto.ClassSessionResponse;
import com.fitnessclub.reservation.dto.CreateClassSessionRequest;
import com.fitnessclub.reservation.service.ReservationService;
import com.fitnessclub.staff.dto.TrainerProfileResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin operations for classes, facilities, and trainers")
public class AdminController {

    private final ReservationService reservationService;
    private final FacilityService facilityService;
    private final AdminTrainerService adminTrainerService;

    public AdminController(ReservationService reservationService,
                           FacilityService facilityService,
                           AdminTrainerService adminTrainerService) {
        this.reservationService = reservationService;
        this.facilityService = facilityService;
        this.adminTrainerService = adminTrainerService;
    }

    @PostMapping("/trainers")
    @Operation(summary = "Create a new trainer account")
    public ResponseEntity<ApiResponse<TrainerProfileResponse>> createTrainer(
            @Valid @RequestBody CreateTrainerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                adminTrainerService.createTrainer(request), "Trainer created successfully"));
    }

    @PostMapping("/classes")
    @Operation(summary = "Create a new class session")
    public ResponseEntity<ApiResponse<ClassSessionResponse>> createClass(
            @Valid @RequestBody CreateClassSessionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.createClassSession(request), "Class session created"));
    }

    @PutMapping("/facilities/{id}/capacity")
    @Operation(summary = "Update facility max capacity")
    public ResponseEntity<ApiResponse<FacilityResponse>> updateCapacity(
            @PathVariable UUID id, @RequestParam int capacity) {
        return ResponseEntity.ok(ApiResponse.success(
                facilityService.updateCapacity(id, capacity), "Capacity updated"));
    }

    @PutMapping("/facilities/{id}/status")
    @Operation(summary = "Open or close a facility")
    public ResponseEntity<ApiResponse<FacilityResponse>> updateStatus(
            @PathVariable UUID id, @RequestParam boolean open) {
        return ResponseEntity.ok(ApiResponse.success(
                facilityService.updateStatus(id, open), "Facility status updated"));
    }
}
