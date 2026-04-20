package com.fitnessclub.reservation.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class BookClassRequest {

    @NotNull(message = "Class session ID is required")
    private UUID classSessionId;

    public UUID getClassSessionId() { return classSessionId; }
    public void setClassSessionId(UUID classSessionId) { this.classSessionId = classSessionId; }
}
