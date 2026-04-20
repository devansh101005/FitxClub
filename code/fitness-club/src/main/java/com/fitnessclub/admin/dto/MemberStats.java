package com.fitnessclub.admin.dto;

import java.util.Map;

public class MemberStats {

    private long totalMembers;
    private long activeMembers;
    private long expiredMembers;
    private long cancelledMembers;
    private long newMembersThisMonth;
    private long expiringIn7Days;
    private Map<String, Long> membersByType;
    private Map<String, Long> membersByAccessLevel;

    public long getTotalMembers() { return totalMembers; }
    public void setTotalMembers(long totalMembers) { this.totalMembers = totalMembers; }
    public long getActiveMembers() { return activeMembers; }
    public void setActiveMembers(long activeMembers) { this.activeMembers = activeMembers; }
    public long getExpiredMembers() { return expiredMembers; }
    public void setExpiredMembers(long expiredMembers) { this.expiredMembers = expiredMembers; }
    public long getCancelledMembers() { return cancelledMembers; }
    public void setCancelledMembers(long cancelledMembers) { this.cancelledMembers = cancelledMembers; }
    public long getNewMembersThisMonth() { return newMembersThisMonth; }
    public void setNewMembersThisMonth(long newMembersThisMonth) { this.newMembersThisMonth = newMembersThisMonth; }
    public long getExpiringIn7Days() { return expiringIn7Days; }
    public void setExpiringIn7Days(long expiringIn7Days) { this.expiringIn7Days = expiringIn7Days; }
    public Map<String, Long> getMembersByType() { return membersByType; }
    public void setMembersByType(Map<String, Long> membersByType) { this.membersByType = membersByType; }
    public Map<String, Long> getMembersByAccessLevel() { return membersByAccessLevel; }
    public void setMembersByAccessLevel(Map<String, Long> membersByAccessLevel) { this.membersByAccessLevel = membersByAccessLevel; }
}
