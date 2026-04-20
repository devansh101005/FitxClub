package com.fitnessclub.admin.service;

import com.fitnessclub.admin.dto.BulkOperationRequest;
import com.fitnessclub.admin.dto.BulkOperationResult;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.entity.MembershipStatus;
import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.notification.event.NotificationEvent;
import com.fitnessclub.notification.event.NotificationType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class BulkOperationsService {

    private static final Logger log = LoggerFactory.getLogger(BulkOperationsService.class);

    private final MemberRepository memberRepository;
    private final ApplicationEventPublisher eventPublisher;

    public BulkOperationsService(MemberRepository memberRepository,
                                  ApplicationEventPublisher eventPublisher) {
        this.memberRepository = memberRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public BulkOperationResult executeBulkAction(BulkOperationRequest request) {
        String action = request.getAction().toUpperCase();
        List<UUID> memberIds = request.getMemberIds();
        int successful = 0;
        List<UUID> failedIds = new ArrayList<>();

        for (UUID memberId : memberIds) {
            try {
                Optional<Member> optMember = memberRepository.findById(memberId);
                if (optMember.isEmpty()) {
                    failedIds.add(memberId);
                    continue;
                }
                Member member = optMember.get();

                switch (action) {
                    case "EXPIRE" -> {
                        member.setStatus(MembershipStatus.EXPIRED);
                        memberRepository.save(member);
                    }
                    case "ACTIVATE" -> {
                        member.setStatus(MembershipStatus.ACTIVE);
                        memberRepository.save(member);
                    }
                    case "CANCEL" -> {
                        member.setStatus(MembershipStatus.CANCELLED);
                        memberRepository.save(member);
                    }
                    case "NOTIFY_RENEWAL" -> {
                        eventPublisher.publishEvent(new NotificationEvent(
                                this, member.getId(), NotificationType.RENEWAL_REMINDER,
                                Map.of("memberName", member.getFirstName(),
                                       "expiryDate", member.getExpiryDate().toString(),
                                       "membershipType", member.getMembershipType().name())
                        ));
                    }
                    default -> throw new BusinessException("Unknown action: " + action);
                }
                successful++;
            } catch (Exception e) {
                log.error("Bulk action failed for member {}: {}", memberId, e.getMessage());
                failedIds.add(memberId);
            }
        }

        return new BulkOperationResult(
                memberIds.size(), successful, failedIds.size(), failedIds,
                String.format("%s completed: %d/%d successful", action, successful, memberIds.size()));
    }
}
