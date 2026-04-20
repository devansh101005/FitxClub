package com.fitnessclub.membership.dto;

import com.fitnessclub.membership.entity.*;
import java.time.LocalDate;
import java.util.UUID;

public class MemberResponse {

    private UUID id;
    private String memberId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private MembershipType membershipType;
    private AccessLevel accessLevel;
    private MembershipStatus status;
    private LocalDate startDate;
    private LocalDate expiryDate;
    private String qrCode;

    public static MemberResponse from(Member member) {
        MemberResponse dto = new MemberResponse();
        dto.id = member.getId();
        dto.memberId = member.getMemberId();
        dto.firstName = member.getFirstName();
        dto.lastName = member.getLastName();
        dto.email = member.getEmail();
        dto.phone = member.getPhone();
        dto.membershipType = member.getMembershipType();
        dto.accessLevel = member.getAccessLevel();
        dto.status = member.getStatus();
        dto.startDate = member.getStartDate();
        dto.expiryDate = member.getExpiryDate();
        dto.qrCode = member.getQrCode();
        return dto;
    }

    public UUID getId() { return id; }
    public String getMemberId() { return memberId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public MembershipType getMembershipType() { return membershipType; }
    public AccessLevel getAccessLevel() { return accessLevel; }
    public MembershipStatus getStatus() { return status; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public String getQrCode() { return qrCode; }
}
