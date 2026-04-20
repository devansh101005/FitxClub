package com.fitnessclub.reservation.dto;

import com.fitnessclub.reservation.entity.ClassSession;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class ClassSessionResponse {

    private UUID id;
    private String className;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private int capacity;
    private int confirmedBookings;
    private UUID trainerId;
    private UUID facilityId;

    public static ClassSessionResponse from(ClassSession session, int confirmedBookings) {
        ClassSessionResponse r = new ClassSessionResponse();
        r.id = session.getId();
        r.className = session.getClassName();
        r.date = session.getDate();
        r.startTime = session.getStartTime();
        r.endTime = session.getEndTime();
        r.capacity = session.getCapacity();
        r.confirmedBookings = confirmedBookings;
        r.trainerId = session.getTrainerId();
        r.facilityId = session.getFacilityId();
        return r;
    }

    public UUID getId() { return id; }
    public String getClassName() { return className; }
    public LocalDate getDate() { return date; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public int getCapacity() { return capacity; }
    public int getConfirmedBookings() { return confirmedBookings; }
    public UUID getTrainerId() { return trainerId; }
    public UUID getFacilityId() { return facilityId; }
}
