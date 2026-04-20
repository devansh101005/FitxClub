package com.fitnessclub.facility.controller;

import com.fitnessclub.common.ApiResponse;
import com.fitnessclub.facility.dto.FacilityResponse;
import com.fitnessclub.facility.service.FacilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/facilities")
@Tag(name = "Facilities", description = "Facility management and live occupancy")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    @Operation(summary = "List all facilities with live occupancy")
    public ResponseEntity<ApiResponse<List<FacilityResponse>>> getAllFacilities() {
        return ResponseEntity.ok(ApiResponse.success(facilityService.getAllFacilities()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get facility by ID")
    public ResponseEntity<ApiResponse<FacilityResponse>> getFacility(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(facilityService.getFacilityById(id)));
    }
}
