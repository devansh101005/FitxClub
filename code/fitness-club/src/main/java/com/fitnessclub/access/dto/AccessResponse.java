package com.fitnessclub.access.dto;

import com.fitnessclub.access.entity.AccessStatus;

public class AccessResponse {

    private AccessStatus status;
    private String facilityName;
    private int currentOccupancy;
    private String message;

    public AccessResponse(AccessStatus status, String facilityName, int currentOccupancy, String message) {
        this.status = status;
        this.facilityName = facilityName;
        this.currentOccupancy = currentOccupancy;
        this.message = message;
    }

    public AccessStatus getStatus() { return status; }
    public String getFacilityName() { return facilityName; }
    public int getCurrentOccupancy() { return currentOccupancy; }
    public String getMessage() { return message; }
}
