package com.fitnessclub.access.service;

import com.fitnessclub.access.dto.AccessResponse;
import com.fitnessclub.access.dto.ScanRequest;
import com.fitnessclub.access.entity.AccessLog;
import com.fitnessclub.access.entity.AccessStatus;
import com.fitnessclub.access.repository.AccessLogRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.facility.entity.Facility;
import com.fitnessclub.facility.entity.FacilityType;
import com.fitnessclub.facility.service.FacilityService;
import com.fitnessclub.membership.entity.AccessLevel;
import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.entity.MembershipStatus;
import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.membership.service.QrCodeService;
import com.fitnessclub.notification.event.NotificationEvent;
import com.fitnessclub.notification.event.NotificationType;
import io.jsonwebtoken.Claims;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

@Service
public class AccessControlService {

    private final AccessLogRepository accessLogRepository;
    private final MemberRepository memberRepository;
    private final QrCodeService qrCodeService;
    private final FacilityService facilityService;
    private final ApplicationEventPublisher eventPublisher;

    private static final Map<FacilityType, Set<AccessLevel>> ACCESS_RULES = Map.of(
            FacilityType.GYM, Set.of(AccessLevel.GYM_ONLY, AccessLevel.GYM_POOL, AccessLevel.ALL_FACILITIES),
            FacilityType.POOL, Set.of(AccessLevel.GYM_POOL, AccessLevel.ALL_FACILITIES),
            FacilityType.YOGA_STUDIO, Set.of(AccessLevel.ALL_FACILITIES),
            FacilityType.BADMINTON_COURT, Set.of(AccessLevel.ALL_FACILITIES),
            FacilityType.SQUASH_COURT, Set.of(AccessLevel.ALL_FACILITIES),
            FacilityType.CAFE, Set.of(AccessLevel.GYM_ONLY, AccessLevel.GYM_POOL, AccessLevel.ALL_FACILITIES)
    );

    public AccessControlService(AccessLogRepository accessLogRepository,
                                 MemberRepository memberRepository,
                                 QrCodeService qrCodeService,
                                 FacilityService facilityService,
                                 ApplicationEventPublisher eventPublisher) {
        this.accessLogRepository = accessLogRepository;
        this.memberRepository = memberRepository;
        this.qrCodeService = qrCodeService;
        this.facilityService = facilityService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public AccessResponse scan(ScanRequest request) {
        String direction = request.getDirection() != null
                ? request.getDirection().toUpperCase()
                : "ENTRY";
        Facility facility = facilityService.findFacility(request.getFacilityId());

        String memberId;
        LocalDate expiryDate;
        Member member;

        if (request.getQrPayload() != null && !request.getQrPayload().isBlank()) {
            Claims claims;
            try {
                claims = qrCodeService.validateQrPayload(request.getQrPayload());
            } catch (Exception e) {
                throw new BusinessException("Invalid QR code", HttpStatus.UNAUTHORIZED);
            }
            memberId = claims.getSubject();
            expiryDate = LocalDate.parse(claims.get("expiry", String.class));
            member = memberRepository.findByMemberId(memberId)
                    .orElseThrow(() -> new BusinessException("Member not found", HttpStatus.NOT_FOUND));
        } else if (request.getMemberId() != null && !request.getMemberId().isBlank()) {
            member = memberRepository.findByMemberId(request.getMemberId())
                    .orElseThrow(() -> new BusinessException("Member not found", HttpStatus.NOT_FOUND));
            memberId = member.getMemberId();
            expiryDate = member.getExpiryDate();
        } else {
            throw new BusinessException("Either qrPayload or memberId is required", HttpStatus.BAD_REQUEST);
        }

        if ("EXIT".equals(direction)) {
            return handleExit(member, facility);
        }

        // --- ENTRY validation chain ---

        // 1. Check membership is active
        if (member.getStatus() != MembershipStatus.ACTIVE) {
            return logAndRespond(member, facility, AccessStatus.DENIED_INACTIVE,
                    "Membership is not active. Current status: " + member.getStatus());
        }

        // 2. Check not expired
        if (expiryDate.isBefore(LocalDate.now())) {
            return logAndRespond(member, facility, AccessStatus.DENIED_EXPIRED,
                    "Membership has expired on " + expiryDate);
        }

        // 3. Check access level permits this facility
        Set<AccessLevel> allowedLevels = ACCESS_RULES.getOrDefault(facility.getFacilityType(), Set.of());
        if (!allowedLevels.contains(member.getAccessLevel())) {
            return logAndRespond(member, facility, AccessStatus.DENIED_ACCESS_LEVEL,
                    "Your access level (" + member.getAccessLevel() + ") does not permit entry to " + facility.getName());
        }

        // 4. Check facility is open
        if (!facility.isOpen()) {
            return logAndRespond(member, facility, AccessStatus.DENIED_CLOSED,
                    facility.getName() + " is currently closed");
        }

        // 5. Check capacity
        if (facility.getCurrentOccupancy() >= facility.getMaxCapacity()) {
            return logAndRespond(member, facility, AccessStatus.DENIED_CAPACITY,
                    facility.getName() + " is at full capacity (" + facility.getMaxCapacity() + ")");
        }

        // All checks passed - grant entry
        int priorOccupancy = facility.getCurrentOccupancy();
        facilityService.incrementOccupancy(facility.getId());

        AccessLog log = new AccessLog();
        log.setMemberId(member.getId());
        log.setFacilityId(facility.getId());
        log.setEntryTime(Instant.now());
        log.setAccessStatus(AccessStatus.GRANTED);
        accessLogRepository.save(log);

        return new AccessResponse(AccessStatus.GRANTED, facility.getName(),
                priorOccupancy + 1, "Access granted. Welcome to " + facility.getName());
    }

    private AccessResponse handleExit(Member member, Facility facility) {
        AccessLog openLog = accessLogRepository
                .findTopByMemberIdAndFacilityIdAndAccessStatusAndExitTimeIsNullOrderByEntryTimeDesc(
                        member.getId(), facility.getId(), AccessStatus.GRANTED)
                .orElseThrow(() -> new BusinessException("No open entry record found for this facility"));

        openLog.setExitTime(Instant.now());
        accessLogRepository.save(openLog);

        int priorOccupancy = facility.getCurrentOccupancy();
        facilityService.decrementOccupancy(facility.getId());

        return new AccessResponse(AccessStatus.GRANTED, facility.getName(),
                Math.max(0, priorOccupancy - 1), "Exit recorded. Goodbye!");
    }

    private AccessResponse logAndRespond(Member member, Facility facility, AccessStatus status, String message) {
        AccessLog log = new AccessLog();
        log.setMemberId(member.getId());
        log.setFacilityId(facility.getId());
        log.setEntryTime(Instant.now());
        log.setAccessStatus(status);
        accessLogRepository.save(log);

        // Publish access denied notification
        eventPublisher.publishEvent(new NotificationEvent(
                this, member.getId(), NotificationType.ACCESS_DENIED,
                Map.of("facility", facility.getName(), "reason", message)
        ));

        return new AccessResponse(status, facility.getName(), facility.getCurrentOccupancy(), message);
    }
}
