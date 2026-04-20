package com.fitnessclub.staff.dto;

import java.math.BigDecimal;

public class UpdateTrainerProfileRequest {

    private String specialization;
    private String bio;
    private String certifications;
    private BigDecimal hourlyRate;

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }
    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }
}
