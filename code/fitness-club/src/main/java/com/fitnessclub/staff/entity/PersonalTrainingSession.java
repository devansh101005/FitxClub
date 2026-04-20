package com.fitnessclub.staff.entity;

import com.fitnessclub.common.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "personal_training_session")
public class PersonalTrainingSession extends BaseEntity {

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PTSessionStatus status = PTSessionStatus.REQUESTED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public UUID getTrainerId() { return trainerId; }
    public void setTrainerId(UUID trainerId) { this.trainerId = trainerId; }
    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }
    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public PTSessionStatus getStatus() { return status; }
    public void setStatus(PTSessionStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
