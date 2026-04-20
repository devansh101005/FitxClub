package com.fitnessclub.payment.controller;

import com.fitnessclub.common.ApiResponse;
import com.fitnessclub.payment.dto.*;
import com.fitnessclub.payment.service.InvoiceService;
import com.fitnessclub.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Razorpay payment integration and invoicing")
public class PaymentController {

    private final PaymentService paymentService;
    private final InvoiceService invoiceService;

    public PaymentController(PaymentService paymentService, InvoiceService invoiceService) {
        this.paymentService = paymentService;
        this.invoiceService = invoiceService;
    }

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "Create a Razorpay order (returns order ID for frontend checkout)")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            Authentication auth, @Valid @RequestBody CreateOrderRequest request) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.createOrder(userId, request), "Order created"));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "Verify payment after Razorpay checkout completes")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            Authentication auth, @Valid @RequestBody VerifyPaymentRequest request) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.verifyPayment(userId, request), "Payment verified successfully"));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "View payment history")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentHistory(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(paymentService.getMyPayments(userId)));
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "View my invoices")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getMyInvoices(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(paymentService.getMyInvoices(userId)));
    }

    @GetMapping("/invoices/{invoiceNumber}")
    @PreAuthorize("hasAnyRole('MEMBER', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Get invoice by number")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoice(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoiceByNumber(invoiceNumber)));
    }
}
