package com.fitnessclub.payment.dto;

import com.fitnessclub.payment.entity.Payment;
import com.fitnessclub.payment.entity.PaymentStatus;
import com.fitnessclub.payment.entity.PaymentType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class PaymentResponse {

    private UUID id;
    private UUID memberId;
    private BigDecimal amount;
    private String currency;
    private PaymentType paymentType;
    private PaymentStatus status;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String description;
    private Instant createdAt;

    public static PaymentResponse from(Payment payment) {
        PaymentResponse r = new PaymentResponse();
        r.id = payment.getId();
        r.memberId = payment.getMemberId();
        r.amount = payment.getAmount();
        r.currency = payment.getCurrency();
        r.paymentType = payment.getPaymentType();
        r.status = payment.getStatus();
        r.razorpayOrderId = payment.getRazorpayOrderId();
        r.razorpayPaymentId = payment.getRazorpayPaymentId();
        r.description = payment.getDescription();
        r.createdAt = payment.getCreatedAt();
        return r;
    }

    public UUID getId() { return id; }
    public UUID getMemberId() { return memberId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public PaymentType getPaymentType() { return paymentType; }
    public PaymentStatus getStatus() { return status; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
}
