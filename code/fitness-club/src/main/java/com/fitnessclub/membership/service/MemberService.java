package com.fitnessclub.membership.service;

import com.fitnessclub.auth.entity.Role;
import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.membership.dto.MemberResponse;
import com.fitnessclub.membership.dto.RegisterRequest;
import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.entity.MembershipStatus;
import com.fitnessclub.membership.entity.MembershipType;
import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.notification.event.NotificationEvent;
import com.fitnessclub.notification.event.NotificationType;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final UserAccountRepository userAccountRepository;
    private final QrCodeService qrCodeService;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final AtomicLong memberCounter = new AtomicLong(1000);

    public MemberService(MemberRepository memberRepository,
                         UserAccountRepository userAccountRepository,
                         QrCodeService qrCodeService,
                         PasswordEncoder passwordEncoder,
                         ApplicationEventPublisher eventPublisher) {
        this.memberRepository = memberRepository;
        this.userAccountRepository = userAccountRepository;
        this.qrCodeService = qrCodeService;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public MemberResponse register(RegisterRequest request) {
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already registered");
        }

        String memberId = generateMemberId();
        LocalDate startDate = LocalDate.now();
        LocalDate expiryDate = calculateExpiryDate(startDate, request.getMembershipType());

        // Create member
        Member member = new Member();
        member.setMemberId(memberId);
        member.setFirstName(request.getFirstName());
        member.setLastName(request.getLastName());
        member.setEmail(request.getEmail());
        member.setPhone(request.getPhone());
        member.setMembershipType(request.getMembershipType());
        member.setAccessLevel(request.getAccessLevel());
        member.setStatus(MembershipStatus.ACTIVE);
        member.setStartDate(startDate);
        member.setExpiryDate(expiryDate);

        // Generate QR code
        String qrCode = qrCodeService.generateQrCode(memberId, expiryDate);
        member.setQrCode(qrCode);

        member = memberRepository.save(member);

        // Create linked user account
        UserAccount userAccount = new UserAccount();
        userAccount.setEmail(request.getEmail());
        userAccount.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userAccount.setRole(Role.MEMBER);
        userAccount.setMemberId(member.getId());
        userAccountRepository.save(userAccount);

        // Publish notification event
        eventPublisher.publishEvent(new NotificationEvent(
                this,
                member.getId(),
                NotificationType.REGISTRATION_CONFIRM,
                Map.of(
                        "name", member.getFirstName() + " " + member.getLastName(),
                        "memberId", memberId,
                        "expiryDate", expiryDate.toString()
                )
        ));

        return MemberResponse.from(member);
    }

    public MemberResponse getProfile(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getMemberId() == null) {
            throw new BusinessException("No member profile linked to this account");
        }

        Member member = memberRepository.findById(user.getMemberId())
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        return MemberResponse.from(member);
    }

    public MemberResponse getMemberById(UUID memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));
        return MemberResponse.from(member);
    }

    public List<MemberResponse> listAll() {
        return memberRepository.findAll().stream()
                .map(MemberResponse::from)
                .toList();
    }

    private String generateMemberId() {
        return "FC-" + memberCounter.incrementAndGet();
    }

    private LocalDate calculateExpiryDate(LocalDate startDate, MembershipType type) {
        return switch (type) {
            case MONTHLY -> startDate.plusMonths(1);
            case QUARTERLY -> startDate.plusMonths(3);
            case ANNUAL -> startDate.plusYears(1);
        };
    }
}
