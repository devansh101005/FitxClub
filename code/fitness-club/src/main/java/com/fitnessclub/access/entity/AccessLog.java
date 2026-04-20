package com.fitnessclub.access.entity;

import com.fitnessclub.common.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "access_log")
public class AccessLog extends BaseEntity {

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "facility_id", nullable = false)
    private UUID facilityId;

    @Column(name = "entry_time", nullable = false)
    private Instant entryTime;

    @Column(name = "exit_time")
    private Instant exitTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_status", nullable = false)
    private AccessStatus accessStatus;

    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }
    public UUID getFacilityId() { return facilityId; }
    public void setFacilityId(UUID facilityId) { this.facilityId = facilityId; }
    public Instant getEntryTime() { return entryTime; }
    public void setEntryTime(Instant entryTime) { this.entryTime = entryTime; }
    public Instant getExitTime() { return exitTime; }
    public void setExitTime(Instant exitTime) { this.exitTime = exitTime; }
    public AccessStatus getAccessStatus() { return accessStatus; }
    public void setAccessStatus(AccessStatus accessStatus) { this.accessStatus = accessStatus; }
}
