package com.fitnessclub.staff.dto;

import com.fitnessclub.staff.entity.TrainerAvailability;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public class AvailabilitySlot {

    private UUID id;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;

    public static AvailabilitySlot from(TrainerAvailability a) {
        AvailabilitySlot s = new AvailabilitySlot();
        s.id = a.getId();
        s.dayOfWeek = a.getDayOfWeek();
        s.startTime = a.getStartTime();
        s.endTime = a.getEndTime();
        return s;
    }

    public UUID getId() { return id; }
    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
}
