package com.fitnessclub.admin.service;

import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.payment.entity.Payment;
import com.fitnessclub.payment.entity.PaymentStatus;
import com.fitnessclub.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class ReportService {

    private final MemberRepository memberRepository;
    private final PaymentRepository paymentRepository;

    public ReportService(MemberRepository memberRepository, PaymentRepository paymentRepository) {
        this.memberRepository = memberRepository;
        this.paymentRepository = paymentRepository;
    }

    public String generateMembersCsv() {
        List<Member> members = memberRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("Member ID,First Name,Last Name,Email,Phone,Membership Type,Access Level,Status,Start Date,Expiry Date\n");

        for (Member m : members) {
            sb.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    m.getMemberId(),
                    escapeCsv(m.getFirstName()),
                    escapeCsv(m.getLastName()),
                    m.getEmail(),
                    m.getPhone(),
                    m.getMembershipType(),
                    m.getAccessLevel(),
                    m.getStatus(),
                    m.getStartDate(),
                    m.getExpiryDate()));
        }
        return sb.toString();
    }

    public String generatePaymentsCsv(LocalDate from, LocalDate to) {
        Instant fromInstant = from.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant toInstant = to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<Payment> payments = paymentRepository.findAll().stream()
                .filter(p -> p.getCreatedAt().isAfter(fromInstant) && p.getCreatedAt().isBefore(toInstant))
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("Payment ID,Member ID,Amount,Currency,Type,Status,Razorpay Order ID,Razorpay Payment ID,Created At\n");

        for (Payment p : payments) {
            sb.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    p.getId(),
                    p.getMemberId(),
                    p.getAmount(),
                    p.getCurrency(),
                    p.getPaymentType(),
                    p.getStatus(),
                    p.getRazorpayOrderId() != null ? p.getRazorpayOrderId() : "",
                    p.getRazorpayPaymentId() != null ? p.getRazorpayPaymentId() : "",
                    p.getCreatedAt()));
        }
        return sb.toString();
    }

    public String generateRevenueSummaryCsv() {
        List<Payment> captured = paymentRepository.findByStatus(PaymentStatus.CAPTURED);

        StringBuilder sb = new StringBuilder();
        sb.append("Payment Type,Count,Total Amount\n");

        captured.stream()
                .collect(java.util.stream.Collectors.groupingBy(Payment::getPaymentType))
                .forEach((type, payments) -> {
                    java.math.BigDecimal total = payments.stream()
                            .map(Payment::getAmount)
                            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                    sb.append(String.format("%s,%d,%s\n", type, payments.size(), total));
                });

        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
