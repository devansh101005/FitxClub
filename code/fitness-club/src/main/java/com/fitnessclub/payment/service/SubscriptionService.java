package com.fitnessclub.payment.service;

import com.fitnessclub.membership.entity.AccessLevel;
import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.entity.MembershipStatus;
import com.fitnessclub.membership.entity.MembershipType;
import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.notification.event.NotificationEvent;
import com.fitnessclub.notification.event.NotificationType;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionService.class);

    private final MemberRepository memberRepository;
    private final ApplicationEventPublisher eventPublisher;

    public SubscriptionService(MemberRepository memberRepository,
                               ApplicationEventPublisher eventPublisher) {
        this.memberRepository = memberRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void renewMembership(UUID memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        LocalDate newStart = LocalDate.now();
        // If membership hasn't expired yet, extend from current expiry
        if (member.getExpiryDate() != null && member.getExpiryDate().isAfter(newStart)) {
            newStart = member.getExpiryDate();
        }

        LocalDate newExpiry = calculateExpiry(newStart, member.getMembershipType());

        member.setStartDate(LocalDate.now());
        member.setExpiryDate(newExpiry);
        member.setStatus(MembershipStatus.ACTIVE);
        memberRepository.save(member);

        log.info("Membership renewed for member {} until {}", member.getMemberId(), newExpiry);
    }

    @Transactional
    public void applyUpgrade(UUID memberId, String description) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        // Parse upgrade details from description: "Membership UPGRADE to QUARTERLY / ALL_FACILITIES"
        if (description != null && description.contains("UPGRADE to")) {
            String details = description.substring(description.indexOf("UPGRADE to") + 11).trim();
            String[] parts = details.split("\\s*/\\s*");
            if (parts.length >= 1) {
                try { member.setMembershipType(MembershipType.valueOf(parts[0].trim())); } catch (Exception ignored) {}
            }
            if (parts.length >= 2) {
                try { member.setAccessLevel(AccessLevel.valueOf(parts[1].trim())); } catch (Exception ignored) {}
            }
        }

        // Recalculate expiry based on new type
        LocalDate newExpiry = calculateExpiry(member.getStartDate(), member.getMembershipType());
        member.setExpiryDate(newExpiry);
        member.setStatus(MembershipStatus.ACTIVE);
        memberRepository.save(member);

        log.info("Membership upgraded for member {} to {} / {}", member.getMemberId(),
                member.getMembershipType(), member.getAccessLevel());
    }

    // Runs daily at 2 AM - auto-expire memberships
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void expireOverdueMemberships() {
        List<Member> activeMembers = memberRepository.findAll().stream()
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                .filter(m -> m.getExpiryDate().isBefore(LocalDate.now()))
                .toList();

        for (Member member : activeMembers) {
            member.setStatus(MembershipStatus.EXPIRED);
            memberRepository.save(member);
            log.info("Membership expired for member {}", member.getMemberId());
        }
    }

    // Runs daily at 9 AM - send renewal reminders 7 days before expiry
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void sendRenewalReminders() {
        LocalDate reminderDate = LocalDate.now().plusDays(7);

        List<Member> expiringMembers = memberRepository.findAll().stream()
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                .filter(m -> m.getExpiryDate().equals(reminderDate))
                .toList();

        for (Member member : expiringMembers) {
            eventPublisher.publishEvent(new NotificationEvent(
                    this, member.getId(), NotificationType.RENEWAL_REMINDER,
                    Map.of("memberName", member.getFirstName(),
                           "expiryDate", member.getExpiryDate().toString(),
                           "membershipType", member.getMembershipType().name())
            ));
            log.info("Renewal reminder sent to member {}", member.getMemberId());
        }
    }

    private LocalDate calculateExpiry(LocalDate start, MembershipType type) {
        return switch (type) {
            case MONTHLY -> start.plusMonths(1);
            case QUARTERLY -> start.plusMonths(3);
            case ANNUAL -> start.plusYears(1);
        };
    }
}
