package com.fitnessclub.facility.entity;

import com.fitnessclub.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "facility")
public class Facility extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "facility_type", nullable = false)
    private FacilityType facilityType;

    @Column(name = "max_capacity", nullable = false)
    private int maxCapacity;

    @Column(name = "current_occupancy", nullable = false)
    private int currentOccupancy = 0;

    @Column(name = "is_open", nullable = false)
    private boolean isOpen = true;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public FacilityType getFacilityType() { return facilityType; }
    public void setFacilityType(FacilityType facilityType) { this.facilityType = facilityType; }
    public int getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }
    public int getCurrentOccupancy() { return currentOccupancy; }
    public void setCurrentOccupancy(int currentOccupancy) { this.currentOccupancy = currentOccupancy; }
    public boolean isOpen() { return isOpen; }
    public void setOpen(boolean open) { isOpen = open; }
}
