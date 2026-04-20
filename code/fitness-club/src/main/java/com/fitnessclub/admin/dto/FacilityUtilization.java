package com.fitnessclub.admin.dto;

import java.util.List;

public class FacilityUtilization {

    private List<FacilityStat> facilities;

    public record FacilityStat(
            String name,
            String facilityType,
            int maxCapacity,
            int currentOccupancy,
            double occupancyPercentage,
            long totalVisitsToday,
            long totalVisitsThisWeek,
            long totalVisitsThisMonth
    ) {}

    public List<FacilityStat> getFacilities() { return facilities; }
    public void setFacilities(List<FacilityStat> facilities) { this.facilities = facilities; }
}
