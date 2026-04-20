package com.fitnessclub.payment.service;

import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.membership.entity.AccessLevel;
import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.entity.MembershipType;
import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.notification.event.NotificationEvent;
import com.fitnessclub.notification.event.NotificationType;
import com.fitnessclub.payment.config.RazorpayConfig;
import com.fitnessclub.payment.dto.*;
import com.fitnessclub.payment.entity.Payment;
import com.fitnessclub.payment.entity.PaymentStatus;
import com.fitnessclub.payment.entity.PaymentType;
import com.fitnessclub.payment.repository.PaymentRepository;
import com.fitnessclub.staff.entity.PersonalTrainingSession;
import com.fitnessclub.staff.repository.PersonalTrainingSessionRepository;
import com.fitnessclub.staff.repository.StaffRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.persistence.EntityNotFoundException;
import org.json.JSONObject;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final UserAccountRepository userAccountRepository;
    private final PersonalTrainingSessionRepository ptRepository;
    private final StaffRepository staffRepository;
    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;
    private final MembershipPricingService pricingService;
    private final InvoiceService invoiceService;
    private final SubscriptionService subscriptionService;
    private final ApplicationEventPublisher eventPublisher;

    public PaymentService(PaymentRepository paymentRepository,
                          MemberRepository memberRepository,
                          UserAccountRepository userAccountRepository,
                          PersonalTrainingSessionRepository ptRepository,
                          StaffRepository staffRepository,
                          RazorpayClient razorpayClient,
                          RazorpayConfig razorpayConfig,
                          MembershipPricingService pricingService,
                          InvoiceService invoiceService,
                          SubscriptionService subscriptionService,
                          ApplicationEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.memberRepository = memberRepository;
        this.userAccountRepository = userAccountRepository;
        this.ptRepository = ptRepository;
        this.staffRepository = staffRepository;
        this.razorpayClient = razorpayClient;
        this.razorpayConfig = razorpayConfig;
        this.pricingService = pricingService;
        this.invoiceService = invoiceService;
        this.subscriptionService = subscriptionService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public OrderResponse createOrder(UUID userId, CreateOrderRequest request) {
        Member member = getMemberFromUser(userId);

        BigDecimal amount;
        String description;

        switch (request.getPaymentType()) {
            case MEMBERSHIP_NEW, MEMBERSHIP_RENEWAL -> {
                MembershipType mType = request.getMembershipType() != null
                        ? MembershipType.valueOf(request.getMembershipType())
                        : member.getMembershipType();
                AccessLevel aLevel = request.getAccessLevel() != null
                        ? AccessLevel.valueOf(request.getAccessLevel())
                        : member.getAccessLevel();
                amount = pricingService.calculateTotal(pricingService.calculatePrice(mType, aLevel));
                description = "Membership " + request.getPaymentType().name().replace("MEMBERSHIP_", "")
                        + " - " + mType + " / " + aLevel;
            }
            case MEMBERSHIP_UPGRADE -> {
                if (request.getMembershipType() == null && request.getAccessLevel() == null) {
                    throw new BusinessException("Specify membershipType or accessLevel for upgrade");
                }
                MembershipType mType = request.getMembershipType() != null
                        ? MembershipType.valueOf(request.getMembershipType())
                        : member.getMembershipType();
                AccessLevel aLevel = request.getAccessLevel() != null
                        ? AccessLevel.valueOf(request.getAccessLevel())
                        : member.getAccessLevel();
                amount = pricingService.calculateTotal(pricingService.calculatePrice(mType, aLevel));
                description = "Membership UPGRADE to " + mType + " / " + aLevel;
            }
            case PT_SESSION -> {
                if (request.getPtSessionId() == null) {
                    throw new BusinessException("PT session ID is required for PT payment");
                }
                PersonalTrainingSession ptSession = ptRepository.findById(request.getPtSessionId())
                        .orElseThrow(() -> new EntityNotFoundException("PT session not found"));
                BigDecimal hourlyRate = staffRepository.findById(ptSession.getTrainerId())
                        .map(t -> t.getHourlyRate() != null ? t.getHourlyRate() : new BigDecimal("1500.00"))
                        .orElse(new BigDecimal("1500.00"));
                amount = pricingService.calculateTotal(hourlyRate);
                description = "Personal Training Session on " + ptSession.getSessionDate();
            }
            default -> throw new BusinessException("Unsupported payment type");
        }

        // Create Razorpay order
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue()); // Razorpay uses paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + UUID.randomUUID().toString().substring(0, 8));

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            // Save payment record
            Payment payment = new Payment();
            payment.setMemberId(member.getId());
            payment.setAmount(amount);
            payment.setPaymentType(request.getPaymentType());
            payment.setRazorpayOrderId(razorpayOrder.get("id"));
            payment.setStatus(PaymentStatus.CREATED);
            payment.setDescription(description);
            payment = paymentRepository.save(payment);

            // Create invoice
            BigDecimal baseAmount = pricingService.calculatePrice(
                    request.getMembershipType() != null ? MembershipType.valueOf(request.getMembershipType()) : member.getMembershipType(),
                    request.getAccessLevel() != null ? AccessLevel.valueOf(request.getAccessLevel()) : member.getAccessLevel()
            );
            invoiceService.createInvoice(member.getId(), baseAmount, description, payment.getId());

            // Build response for frontend
            OrderResponse response = new OrderResponse();
            response.setPaymentId(payment.getId());
            response.setRazorpayOrderId(razorpayOrder.get("id"));
            response.setAmount(amount);
            response.setCurrency("INR");
            response.setRazorpayKeyId(razorpayConfig.getKeyId());
            response.setDescription(description);
            response.setMemberName(member.getFirstName() + " " + member.getLastName());
            response.setMemberEmail(member.getEmail());
            return response;

        } catch (RazorpayException e) {
            throw new BusinessException("Failed to create Razorpay order: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public PaymentResponse verifyPayment(UUID userId, VerifyPaymentRequest request) {
        Member member = getMemberFromUser(userId);

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new EntityNotFoundException("Payment not found for this order"));

        if (!payment.getMemberId().equals(member.getId())) {
            throw new BusinessException("Payment does not belong to you", HttpStatus.FORBIDDEN);
        }

        // Verify signature with Razorpay
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(attributes, razorpayConfig.getKeyId());

            if (!isValid) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                invoiceService.markInvoiceCancelled(payment.getId());

                eventPublisher.publishEvent(new NotificationEvent(
                        this, member.getId(), NotificationType.PAYMENT_FAILED,
                        Map.of("orderId", request.getRazorpayOrderId())
                ));

                throw new BusinessException("Payment verification failed");
            }
        } catch (RazorpayException e) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BusinessException("Payment verification error: " + e.getMessage());
        }

        // Payment verified - update records
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.CAPTURED);
        payment = paymentRepository.save(payment);

        // Mark invoice as paid
        invoiceService.markInvoicePaid(payment.getId());

        // Apply business logic based on payment type
        switch (payment.getPaymentType()) {
            case MEMBERSHIP_NEW, MEMBERSHIP_RENEWAL -> subscriptionService.renewMembership(member.getId());
            case MEMBERSHIP_UPGRADE -> subscriptionService.applyUpgrade(member.getId(), payment.getDescription());
            case PT_SESSION, COURT_BOOKING -> {} // handled at booking time
        }

        eventPublisher.publishEvent(new NotificationEvent(
                this, member.getId(), NotificationType.PAYMENT_SUCCESS,
                Map.of("amount", payment.getAmount().toString(),
                       "type", payment.getPaymentType().name(),
                       "paymentId", payment.getRazorpayPaymentId())
        ));

        return PaymentResponse.from(payment);
    }

    public List<PaymentResponse> getMyPayments(UUID userId) {
        Member member = getMemberFromUser(userId);
        return paymentRepository.findByMemberIdOrderByCreatedAtDesc(member.getId())
                .stream().map(PaymentResponse::from).toList();
    }

    public List<InvoiceResponse> getMyInvoices(UUID userId) {
        Member member = getMemberFromUser(userId);
        return invoiceService.getMemberInvoices(member.getId());
    }

    private Member getMemberFromUser(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getMemberId() == null) {
            throw new BusinessException("No member profile linked to this account");
        }
        return memberRepository.findById(user.getMemberId())
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));
    }
}
