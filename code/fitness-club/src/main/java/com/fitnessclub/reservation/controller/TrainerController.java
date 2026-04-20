package com.fitnessclub.reservation.controller;

import com.fitnessclub.common.ApiResponse;
import com.fitnessclub.reservation.dto.ClassSessionResponse;
import com.fitnessclub.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trainer")
@Tag(name = "Trainer", description = "Trainer schedule and class attendees")
public class TrainerController {

    private final ReservationService reservationService;

    public TrainerController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping("/schedule")
    @PreAuthorize("hasRole('TRAINER')")
    @Operation(summary = "View trainer's own upcoming schedule")
    public ResponseEntity<ApiResponse<List<ClassSessionResponse>>> getMySchedule(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(reservationService.getTrainerSchedule(userId)));
    }

    @GetMapping("/classes/{sessionId}/attendees")
    @PreAuthorize("hasRole('TRAINER')")
    @Operation(summary = "View attendees for a class session")
    public ResponseEntity<ApiResponse<List<ReservationService.MemberInfo>>> getAttendees(
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.getAttendees(sessionId)));
    }
}
