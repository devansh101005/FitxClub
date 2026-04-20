package com.fitnessclub.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public class RevenueStats {

    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal weeklyRevenue;
    private long totalPayments;
    private long successfulPayments;
    private long failedPayments;
    private List<MonthlyRevenue> monthlyBreakdown;

    public record MonthlyRevenue(String month, BigDecimal amount, long count) {}

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public BigDecimal getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(BigDecimal monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
    public BigDecimal getWeeklyRevenue() { return weeklyRevenue; }
    public void setWeeklyRevenue(BigDecimal weeklyRevenue) { this.weeklyRevenue = weeklyRevenue; }
    public long getTotalPayments() { return totalPayments; }
    public void setTotalPayments(long totalPayments) { this.totalPayments = totalPayments; }
    public long getSuccessfulPayments() { return successfulPayments; }
    public void setSuccessfulPayments(long successfulPayments) { this.successfulPayments = successfulPayments; }
    public long getFailedPayments() { return failedPayments; }
    public void setFailedPayments(long failedPayments) { this.failedPayments = failedPayments; }
    public List<MonthlyRevenue> getMonthlyBreakdown() { return monthlyBreakdown; }
    public void setMonthlyBreakdown(List<MonthlyRevenue> monthlyBreakdown) { this.monthlyBreakdown = monthlyBreakdown; }
}
