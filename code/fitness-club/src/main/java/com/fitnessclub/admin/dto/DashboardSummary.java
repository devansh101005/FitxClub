package com.fitnessclub.admin.dto;

import java.math.BigDecimal;

public class DashboardSummary {

    private long totalMembers;
    private long activeMembers;
    private long totalBookingsToday;
    private long totalCheckInsToday;
    private BigDecimal revenueThisMonth;
    private long pendingPTRequests;
    private long expiringMembershipsIn7Days;
    private long openFacilities;
    private long totalFacilities;

    public long getTotalMembers() { return totalMembers; }
    public void setTotalMembers(long totalMembers) { this.totalMembers = totalMembers; }
    public long getActiveMembers() { return activeMembers; }
    public void setActiveMembers(long activeMembers) { this.activeMembers = activeMembers; }
    public long getTotalBookingsToday() { return totalBookingsToday; }
    public void setTotalBookingsToday(long totalBookingsToday) { this.totalBookingsToday = totalBookingsToday; }
    public long getTotalCheckInsToday() { return totalCheckInsToday; }
    public void setTotalCheckInsToday(long totalCheckInsToday) { this.totalCheckInsToday = totalCheckInsToday; }
    public BigDecimal getRevenueThisMonth() { return revenueThisMonth; }
    public void setRevenueThisMonth(BigDecimal revenueThisMonth) { this.revenueThisMonth = revenueThisMonth; }
    public long getPendingPTRequests() { return pendingPTRequests; }
    public void setPendingPTRequests(long pendingPTRequests) { this.pendingPTRequests = pendingPTRequests; }
    public long getExpiringMembershipsIn7Days() { return expiringMembershipsIn7Days; }
    public void setExpiringMembershipsIn7Days(long expiringMembershipsIn7Days) { this.expiringMembershipsIn7Days = expiringMembershipsIn7Days; }
    public long getOpenFacilities() { return openFacilities; }
    public void setOpenFacilities(long openFacilities) { this.openFacilities = openFacilities; }
    public long getTotalFacilities() { return totalFacilities; }
    public void setTotalFacilities(long totalFacilities) { this.totalFacilities = totalFacilities; }
}
