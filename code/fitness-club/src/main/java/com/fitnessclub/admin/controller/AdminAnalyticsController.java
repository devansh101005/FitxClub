package com.fitnessclub.admin.controller;

import com.fitnessclub.admin.dto.*;
import com.fitnessclub.admin.service.AnalyticsService;
import com.fitnessclub.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/analytics")
@Tag(name = "Admin Analytics", description = "Dashboard analytics and statistics")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    public AdminAnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard summary (key metrics overview)")
    public ResponseEntity<ApiResponse<DashboardSummary>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardSummary()));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue statistics with monthly breakdown")
    public ResponseEntity<ApiResponse<RevenueStats>> getRevenue() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRevenueStats()));
    }

    @GetMapping("/members")
    @Operation(summary = "Get member statistics (counts, types, access levels)")
    public ResponseEntity<ApiResponse<MemberStats>> getMemberStats() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getMemberStats()));
    }

    @GetMapping("/facilities")
    @Operation(summary = "Get facility utilization stats (visits, occupancy)")
    public ResponseEntity<ApiResponse<FacilityUtilization>> getFacilityUtilization() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getFacilityUtilization()));
    }

    @GetMapping("/peak-hours")
    @Operation(summary = "Get peak hours and day-of-week analysis")
    public ResponseEntity<ApiResponse<PeakHoursStats>> getPeakHours() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPeakHours()));
    }
}
