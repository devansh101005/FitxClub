package com.fitnessclub.access.controller;

import com.fitnessclub.access.dto.AccessResponse;
import com.fitnessclub.access.dto.ScanRequest;
import com.fitnessclub.access.service.AccessControlService;
import com.fitnessclub.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/access")
@Tag(name = "Access Control", description = "QR-based facility entry/exit")
public class AccessController {

    private final AccessControlService accessControlService;

    public AccessController(AccessControlService accessControlService) {
        this.accessControlService = accessControlService;
    }

    @PostMapping("/scan")
    @Operation(summary = "Scan QR code for facility entry or exit")
    public ResponseEntity<ApiResponse<AccessResponse>> scan(@Valid @RequestBody ScanRequest request) {
        AccessResponse response = accessControlService.scan(request);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }
}
