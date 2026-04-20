package com.fitnessclub.admin.dto;

import java.util.List;

public class PeakHoursStats {

    private List<HourlyCount> hourlyDistribution;
    private List<DayOfWeekCount> dayOfWeekDistribution;
    private String peakHour;
    private String peakDay;

    public record HourlyCount(int hour, long visits) {}
    public record DayOfWeekCount(String day, long visits) {}

    public List<HourlyCount> getHourlyDistribution() { return hourlyDistribution; }
    public void setHourlyDistribution(List<HourlyCount> hourlyDistribution) { this.hourlyDistribution = hourlyDistribution; }
    public List<DayOfWeekCount> getDayOfWeekDistribution() { return dayOfWeekDistribution; }
    public void setDayOfWeekDistribution(List<DayOfWeekCount> dayOfWeekDistribution) { this.dayOfWeekDistribution = dayOfWeekDistribution; }
    public String getPeakHour() { return peakHour; }
    public void setPeakHour(String peakHour) { this.peakHour = peakHour; }
    public String getPeakDay() { return peakDay; }
    public void setPeakDay(String peakDay) { this.peakDay = peakDay; }
}
