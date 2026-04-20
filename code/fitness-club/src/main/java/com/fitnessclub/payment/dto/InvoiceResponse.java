package com.fitnessclub.payment.dto;

import com.fitnessclub.payment.entity.Invoice;
import com.fitnessclub.payment.entity.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class InvoiceResponse {

    private UUID id;
    private String invoiceNumber;
    private UUID memberId;
    private String memberName;
    private BigDecimal amount;
    private BigDecimal tax;
    private BigDecimal total;
    private String description;
    private InvoiceStatus status;
    private LocalDate dueDate;
    private Instant paidAt;
    private Instant createdAt;

    public static InvoiceResponse from(Invoice invoice) {
        InvoiceResponse r = new InvoiceResponse();
        r.id = invoice.getId();
        r.invoiceNumber = invoice.getInvoiceNumber();
        r.memberId = invoice.getMemberId();
        r.amount = invoice.getAmount();
        r.tax = invoice.getTax();
        r.total = invoice.getTotal();
        r.description = invoice.getDescription();
        r.status = invoice.getStatus();
        r.dueDate = invoice.getDueDate();
        r.paidAt = invoice.getPaidAt();
        r.createdAt = invoice.getCreatedAt();
        return r;
    }

    public void setMemberName(String memberName) { this.memberName = memberName; }

    public UUID getId() { return id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public UUID getMemberId() { return memberId; }
    public String getMemberName() { return memberName; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getTax() { return tax; }
    public BigDecimal getTotal() { return total; }
    public String getDescription() { return description; }
    public InvoiceStatus getStatus() { return status; }
    public LocalDate getDueDate() { return dueDate; }
    public Instant getPaidAt() { return paidAt; }
    public Instant getCreatedAt() { return createdAt; }
}
