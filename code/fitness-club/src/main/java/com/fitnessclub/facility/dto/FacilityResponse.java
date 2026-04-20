package com.fitnessclub.facility.dto;

import com.fitnessclub.facility.entity.Facility;
import com.fitnessclub.facility.entity.FacilityType;

import java.util.UUID;

public class FacilityResponse {

    private UUID id;
    private String name;
    private FacilityType facilityType;
    private int maxCapacity;
    private int currentOccupancy;
    private boolean open;
    private double occupancyPercentage;

    public static FacilityResponse from(Facility facility) {
        FacilityResponse r = new FacilityResponse();
        r.id = facility.getId();
        r.name = facility.getName();
        r.facilityType = facility.getFacilityType();
        r.maxCapacity = facility.getMaxCapacity();
        r.currentOccupancy = facility.getCurrentOccupancy();
        r.open = facility.isOpen();
        r.occupancyPercentage = facility.getMaxCapacity() > 0
                ? (facility.getCurrentOccupancy() * 100.0 / facility.getMaxCapacity())
                : 0;
        return r;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public FacilityType getFacilityType() { return facilityType; }
    public int getMaxCapacity() { return maxCapacity; }
    public int getCurrentOccupancy() { return currentOccupancy; }
    public boolean isOpen() { return open; }
    public double getOccupancyPercentage() { return occupancyPercentage; }
}
