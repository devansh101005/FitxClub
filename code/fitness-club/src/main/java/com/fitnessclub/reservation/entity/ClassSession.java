package com.fitnessclub.reservation.entity;

import com.fitnessclub.common.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "class_session")
public class ClassSession extends BaseEntity {

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private int capacity;

    @Column(name = "trainer_id")
    private UUID trainerId;

    @Column(name = "facility_id")
    private UUID facilityId;

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public UUID getTrainerId() { return trainerId; }
    public void setTrainerId(UUID trainerId) { this.trainerId = trainerId; }
    public UUID getFacilityId() { return facilityId; }
    public void setFacilityId(UUID facilityId) { this.facilityId = facilityId; }
}
