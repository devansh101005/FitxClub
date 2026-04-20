package com.fitnessclub.admin.dto;

import java.util.List;
import java.util.UUID;

public class BulkOperationResult {

    private int totalRequested;
    private int successful;
    private int failed;
    private List<UUID> failedIds;
    private String message;

    public BulkOperationResult(int totalRequested, int successful, int failed,
                                List<UUID> failedIds, String message) {
        this.totalRequested = totalRequested;
        this.successful = successful;
        this.failed = failed;
        this.failedIds = failedIds;
        this.message = message;
    }

    public int getTotalRequested() { return totalRequested; }
    public int getSuccessful() { return successful; }
    public int getFailed() { return failed; }
    public List<UUID> getFailedIds() { return failedIds; }
    public String getMessage() { return message; }
}
