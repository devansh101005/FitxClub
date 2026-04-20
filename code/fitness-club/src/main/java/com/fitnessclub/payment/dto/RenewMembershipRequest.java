package com.fitnessclub.payment.dto;

import jakarta.validation.constraints.NotNull;

public class RenewMembershipRequest {

    @NotNull(message = "Membership type is required")
    private String membershipType;

    private String accessLevel;

    public String getMembershipType() { return membershipType; }
    public void setMembershipType(String membershipType) { this.membershipType = membershipType; }
    public String getAccessLevel() { return accessLevel; }
    public void setAccessLevel(String accessLevel) { this.accessLevel = accessLevel; }
}
