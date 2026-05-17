package com.fitnessclub.payment.repository;

import com.fitnessclub.payment.entity.Invoice;
import com.fitnessclub.payment.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    List<Invoice> findByMemberIdOrderByCreatedAtDesc(UUID memberId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByPaymentId(UUID paymentId);

    List<Invoice> findByStatus(InvoiceStatus status);

    @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) FROM invoice WHERE invoice_number ~ '^INV-[0-9]+$'", nativeQuery = true)
    int findMaxInvoiceSequence();
}
