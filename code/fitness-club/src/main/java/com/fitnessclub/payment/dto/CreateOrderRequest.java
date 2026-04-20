package com.fitnessclub.payment.dto;

import com.fitnessclub.payment.entity.PaymentType;
import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;

    // For membership renewal/upgrade
    private String membershipType;
    private String accessLevel;

    // For PT session payment
    private java.util.UUID ptSessionId;

    public PaymentType getPaymentType() { return paymentType; }
    public void setPaymentType(PaymentType paymentType) { this.paymentType = paymentType; }
    public String getMembershipType() { return membershipType; }
    public void setMembershipType(String membershipType) { this.membershipType = membershipType; }
    public String getAccessLevel() { return accessLevel; }
    public void setAccessLevel(String accessLevel) { this.accessLevel = accessLevel; }
    public java.util.UUID getPtSessionId() { return ptSessionId; }
    public void setPtSessionId(java.util.UUID ptSessionId) { this.ptSessionId = ptSessionId; }
}
