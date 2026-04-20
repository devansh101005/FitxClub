package com.fitnessclub.staff.dto;

import com.fitnessclub.staff.entity.Staff;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class TrainerProfileResponse {

    private UUID id;
    private String name;
    private String email;
    private String specialization;
    private String bio;
    private String certifications;
    private BigDecimal hourlyRate;
    private List<AvailabilitySlot> availability;

    public static TrainerProfileResponse from(Staff staff) {
        TrainerProfileResponse r = new TrainerProfileResponse();
        r.id = staff.getId();
        r.name = staff.getName();
        r.email = staff.getEmail();
        r.specialization = staff.getSpecialization();
        r.bio = staff.getBio();
        r.certifications = staff.getCertifications();
        r.hourlyRate = staff.getHourlyRate();
        return r;
    }

    public void setAvailability(List<AvailabilitySlot> availability) { this.availability = availability; }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getSpecialization() { return specialization; }
    public String getBio() { return bio; }
    public String getCertifications() { return certifications; }
    public BigDecimal getHourlyRate() { return hourlyRate; }
    public List<AvailabilitySlot> getAvailability() { return availability; }
}
