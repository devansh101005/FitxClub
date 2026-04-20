package com.fitnessclub.admin.controller;

import com.fitnessclub.admin.dto.BulkOperationRequest;
import com.fitnessclub.admin.dto.BulkOperationResult;
import com.fitnessclub.admin.service.BulkOperationsService;
import com.fitnessclub.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/bulk")
@Tag(name = "Admin Bulk Operations", description = "Bulk member management operations")
public class AdminBulkController {

    private final BulkOperationsService bulkOperationsService;

    public AdminBulkController(BulkOperationsService bulkOperationsService) {
        this.bulkOperationsService = bulkOperationsService;
    }

    @PostMapping("/members")
    @Operation(summary = "Execute bulk action on members (EXPIRE, ACTIVATE, CANCEL, NOTIFY_RENEWAL)")
    public ResponseEntity<ApiResponse<BulkOperationResult>> bulkMemberAction(
            @Valid @RequestBody BulkOperationRequest request) {
        BulkOperationResult result = bulkOperationsService.executeBulkAction(request);
        return ResponseEntity.ok(ApiResponse.success(result, result.getMessage()));
    }
}
