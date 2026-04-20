package com.fitnessclub.staff.dto;

import com.fitnessclub.staff.entity.PTSessionStatus;
import com.fitnessclub.staff.entity.PersonalTrainingSession;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class PTSessionResponse {

    private UUID id;
    private UUID trainerId;
    private String trainerName;
    private UUID memberId;
    private String memberName;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private PTSessionStatus status;
    private String notes;

    public static PTSessionResponse from(PersonalTrainingSession session) {
        PTSessionResponse r = new PTSessionResponse();
        r.id = session.getId();
        r.trainerId = session.getTrainerId();
        r.memberId = session.getMemberId();
        r.sessionDate = session.getSessionDate();
        r.startTime = session.getStartTime();
        r.endTime = session.getEndTime();
        r.status = session.getStatus();
        r.notes = session.getNotes();
        return r;
    }

    public void setTrainerName(String trainerName) { this.trainerName = trainerName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }

    public UUID getId() { return id; }
    public UUID getTrainerId() { return trainerId; }
    public String getTrainerName() { return trainerName; }
    public UUID getMemberId() { return memberId; }
    public String getMemberName() { return memberName; }
    public LocalDate getSessionDate() { return sessionDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public PTSessionStatus getStatus() { return status; }
    public String getNotes() { return notes; }
}
