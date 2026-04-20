package com.fitnessclub.payment.repository;

import com.fitnessclub.payment.entity.Payment;
import com.fitnessclub.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    List<Payment> findByMemberIdOrderByCreatedAtDesc(UUID memberId);

    List<Payment> findByStatus(PaymentStatus status);
}
