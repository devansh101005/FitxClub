package com.fitnessclub.access.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ScanRequest {

    private String qrPayload;

    private String memberId;

    @NotNull(message = "Facility ID is required")
    private UUID facilityId;

    private String direction;

    public String getQrPayload() { return qrPayload; }
    public void setQrPayload(String qrPayload) { this.qrPayload = qrPayload; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public UUID getFacilityId() { return facilityId; }
    public void setFacilityId(UUID facilityId) { this.facilityId = facilityId; }
    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }
}
