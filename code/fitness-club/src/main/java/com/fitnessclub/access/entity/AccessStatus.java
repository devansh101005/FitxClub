package com.fitnessclub.access.entity;

public enum AccessStatus {
    GRANTED,
    DENIED_EXPIRED,
    DENIED_CAPACITY,
    DENIED_CLOSED,
    DENIED_ACCESS_LEVEL,
    DENIED_INACTIVE
}
