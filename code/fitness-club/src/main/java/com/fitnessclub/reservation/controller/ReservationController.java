package com.fitnessclub.reservation.controller;

import com.fitnessclub.common.ApiResponse;
import com.fitnessclub.reservation.dto.*;
import com.fitnessclub.reservation.service.ReservationService;
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
@Tag(name = "Reservations", description = "Class and court booking management")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping("/api/classes/schedule")
    @Operation(summary = "View upcoming class schedule")
    public ResponseEntity<ApiResponse<List<ClassSessionResponse>>> getSchedule() {
        return ResponseEntity.ok(ApiResponse.success(reservationService.getUpcomingSchedule()));
    }

    @PostMapping("/api/reservations/class")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "Book a class")
    public ResponseEntity<ApiResponse<BookingResponse>> bookClass(
            Authentication auth, @Valid @RequestBody BookClassRequest request) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(reservationService.bookClass(userId, request), "Booking created"));
    }

    @PostMapping("/api/reservations/court")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "Book a court")
    public ResponseEntity<ApiResponse<BookingResponse>> bookCourt(
            Authentication auth, @Valid @RequestBody BookCourtRequest request) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(reservationService.bookCourt(userId, request), "Booking created"));
    }

    @GetMapping("/api/reservations/me")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "View my upcoming reservations")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyReservations(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(reservationService.getMyReservations(userId)));
    }

    @DeleteMapping("/api/reservations/{id}")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "Cancel a reservation")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            Authentication auth, @PathVariable UUID id) {
        UUID userId = UUID.fromString(auth.getName());
        reservationService.cancelReservation(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Reservation cancelled"));
    }
}
