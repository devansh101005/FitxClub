package com.fitnessclub.payment.service;

import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.payment.dto.InvoiceResponse;
import com.fitnessclub.payment.entity.Invoice;
import com.fitnessclub.payment.entity.InvoiceStatus;
import com.fitnessclub.payment.repository.InvoiceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final MemberRepository memberRepository;
    private final MembershipPricingService pricingService;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          MemberRepository memberRepository,
                          MembershipPricingService pricingService) {
        this.invoiceRepository = invoiceRepository;
        this.memberRepository = memberRepository;
        this.pricingService = pricingService;
    }

    @Transactional
    public Invoice createInvoice(UUID memberId, BigDecimal amount, String description, UUID paymentId) {
        BigDecimal tax = pricingService.calculateTax(amount);
        BigDecimal total = amount.add(tax);

        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setMemberId(memberId);
        invoice.setPaymentId(paymentId);
        invoice.setAmount(amount);
        invoice.setTax(tax);
        invoice.setTotal(total);
        invoice.setDescription(description);
        invoice.setStatus(InvoiceStatus.PENDING);
        invoice.setDueDate(LocalDate.now().plusDays(7));

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public void markInvoicePaid(UUID paymentId) {
        invoiceRepository.findByPaymentId(paymentId).ifPresent(invoice -> {
            invoice.setStatus(InvoiceStatus.PAID);
            invoice.setPaidAt(Instant.now());
            invoiceRepository.save(invoice);
        });
    }

    @Transactional
    public void markInvoiceCancelled(UUID paymentId) {
        invoiceRepository.findByPaymentId(paymentId).ifPresent(invoice -> {
            invoice.setStatus(InvoiceStatus.CANCELLED);
            invoiceRepository.save(invoice);
        });
    }

    public List<InvoiceResponse> getMemberInvoices(UUID memberId) {
        return invoiceRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream().map(this::enrichResponse).toList();
    }

    public InvoiceResponse getInvoiceByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
        return enrichResponse(invoice);
    }

    private InvoiceResponse enrichResponse(Invoice invoice) {
        InvoiceResponse r = InvoiceResponse.from(invoice);
        memberRepository.findById(invoice.getMemberId())
                .ifPresent(m -> r.setMemberName(m.getFirstName() + " " + m.getLastName()));
        return r;
    }

    private String generateInvoiceNumber() {
        int seq = invoiceRepository.findMaxInvoiceSequence() + 1;
        return String.format("INV-%05d", seq);
    }
}
