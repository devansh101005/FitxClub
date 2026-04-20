package com.fitnessclub.admin.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public class BulkOperationRequest {

    @NotEmpty(message = "At least one member ID is required")
    private List<UUID> memberIds;

    private String action; // e.g., "EXPIRE", "ACTIVATE", "CANCEL", "NOTIFY_RENEWAL"

    public List<UUID> getMemberIds() { return memberIds; }
    public void setMemberIds(List<UUID> memberIds) { this.memberIds = memberIds; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
