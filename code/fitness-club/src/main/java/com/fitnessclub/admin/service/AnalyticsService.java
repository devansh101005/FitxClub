package com.fitnessclub.admin.service;

import com.fitnessclub.access.entity.AccessLog;
import com.fitnessclub.access.entity.AccessStatus;
import com.fitnessclub.access.repository.AccessLogRepository;
import com.fitnessclub.admin.dto.*;
import com.fitnessclub.facility.entity.Facility;
import com.fitnessclub.facility.repository.FacilityRepository;
import com.fitnessclub.membership.entity.Member;
import com.fitnessclub.membership.entity.MembershipStatus;
import com.fitnessclub.membership.repository.MemberRepository;
import com.fitnessclub.payment.entity.Payment;
import com.fitnessclub.payment.entity.PaymentStatus;
import com.fitnessclub.payment.repository.PaymentRepository;
import com.fitnessclub.reservation.entity.BookingStatus;
import com.fitnessclub.reservation.repository.BookingRepository;
import com.fitnessclub.staff.entity.PTSessionStatus;
import com.fitnessclub.staff.repository.PersonalTrainingSessionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final MemberRepository memberRepository;
    private final PaymentRepository paymentRepository;
    private final FacilityRepository facilityRepository;
    private final AccessLogRepository accessLogRepository;
    private final BookingRepository bookingRepository;
    private final PersonalTrainingSessionRepository ptRepository;

    public AnalyticsService(MemberRepository memberRepository,
                            PaymentRepository paymentRepository,
                            FacilityRepository facilityRepository,
                            AccessLogRepository accessLogRepository,
                            BookingRepository bookingRepository,
                            PersonalTrainingSessionRepository ptRepository) {
        this.memberRepository = memberRepository;
        this.paymentRepository = paymentRepository;
        this.facilityRepository = facilityRepository;
        this.accessLogRepository = accessLogRepository;
        this.bookingRepository = bookingRepository;
        this.ptRepository = ptRepository;
    }

    public DashboardSummary getDashboardSummary() {
        List<Member> allMembers = memberRepository.findAll();
        List<Payment> capturedPayments = paymentRepository.findByStatus(PaymentStatus.CAPTURED);
        List<Facility> facilities = facilityRepository.findAll();
        List<AccessLog> allLogs = accessLogRepository.findAll();

        LocalDate today = LocalDate.now();
        Instant startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant startOfMonth = today.withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        DashboardSummary summary = new DashboardSummary();
        summary.setTotalMembers(allMembers.size());
        summary.setActiveMembers(allMembers.stream().filter(m -> m.getStatus() == MembershipStatus.ACTIVE).count());

        summary.setTotalBookingsToday(bookingRepository.findAll().stream()
                .filter(b -> b.getSlotDate().equals(today) && b.getStatus() == BookingStatus.CONFIRMED)
                .count());

        summary.setTotalCheckInsToday(allLogs.stream()
                .filter(l -> l.getAccessStatus() == AccessStatus.GRANTED && l.getEntryTime().isAfter(startOfDay))
                .count());

        summary.setRevenueThisMonth(capturedPayments.stream()
                .filter(p -> p.getCreatedAt().isAfter(startOfMonth))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        summary.setPendingPTRequests(ptRepository.findAll().stream()
                .filter(pt -> pt.getStatus() == PTSessionStatus.REQUESTED)
                .count());

        summary.setExpiringMembershipsIn7Days(allMembers.stream()
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                .filter(m -> !m.getExpiryDate().isAfter(today.plusDays(7)) && !m.getExpiryDate().isBefore(today))
                .count());

        summary.setOpenFacilities(facilities.stream().filter(Facility::isOpen).count());
        summary.setTotalFacilities(facilities.size());

        return summary;
    }

    public RevenueStats getRevenueStats() {
        List<Payment> allPayments = paymentRepository.findAll();
        List<Payment> captured = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.CAPTURED).toList();

        LocalDate today = LocalDate.now();
        Instant startOfMonth = today.withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant startOfWeek = today.with(java.time.DayOfWeek.MONDAY).atStartOfDay(ZoneId.systemDefault()).toInstant();

        RevenueStats stats = new RevenueStats();
        stats.setTotalRevenue(captured.stream().map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.setMonthlyRevenue(captured.stream()
                .filter(p -> p.getCreatedAt().isAfter(startOfMonth))
                .map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.setWeeklyRevenue(captured.stream()
                .filter(p -> p.getCreatedAt().isAfter(startOfWeek))
                .map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.setTotalPayments(allPayments.size());
        stats.setSuccessfulPayments(captured.size());
        stats.setFailedPayments(allPayments.stream().filter(p -> p.getStatus() == PaymentStatus.FAILED).count());

        // Monthly breakdown (last 12 months)
        List<RevenueStats.MonthlyRevenue> breakdown = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            Instant mStart = ym.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant mEnd = ym.atEndOfMonth().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
            List<Payment> monthPayments = captured.stream()
                    .filter(p -> p.getCreatedAt().isAfter(mStart) && p.getCreatedAt().isBefore(mEnd))
                    .toList();
            BigDecimal monthAmount = monthPayments.stream().map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            breakdown.add(new RevenueStats.MonthlyRevenue(ym.toString(), monthAmount, monthPayments.size()));
        }
        stats.setMonthlyBreakdown(breakdown);

        return stats;
    }

    public MemberStats getMemberStats() {
        List<Member> allMembers = memberRepository.findAll();
        LocalDate today = LocalDate.now();
        Instant startOfMonth = today.withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        MemberStats stats = new MemberStats();
        stats.setTotalMembers(allMembers.size());
        stats.setActiveMembers(allMembers.stream().filter(m -> m.getStatus() == MembershipStatus.ACTIVE).count());
        stats.setExpiredMembers(allMembers.stream().filter(m -> m.getStatus() == MembershipStatus.EXPIRED).count());
        stats.setCancelledMembers(allMembers.stream().filter(m -> m.getStatus() == MembershipStatus.CANCELLED).count());

        stats.setNewMembersThisMonth(allMembers.stream()
                .filter(m -> m.getCreatedAt().isAfter(startOfMonth))
                .count());

        stats.setExpiringIn7Days(allMembers.stream()
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                .filter(m -> !m.getExpiryDate().isAfter(today.plusDays(7)) && !m.getExpiryDate().isBefore(today))
                .count());

        stats.setMembersByType(allMembers.stream()
                .collect(Collectors.groupingBy(m -> m.getMembershipType().name(), Collectors.counting())));

        stats.setMembersByAccessLevel(allMembers.stream()
                .collect(Collectors.groupingBy(m -> m.getAccessLevel().name(), Collectors.counting())));

        return stats;
    }

    public FacilityUtilization getFacilityUtilization() {
        List<Facility> facilities = facilityRepository.findAll();
        List<AccessLog> allLogs = accessLogRepository.findAll();

        LocalDate today = LocalDate.now();
        Instant startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant startOfWeek = today.with(java.time.DayOfWeek.MONDAY).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant startOfMonth = today.withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<FacilityUtilization.FacilityStat> stats = facilities.stream().map(f -> {
            List<AccessLog> facilityLogs = allLogs.stream()
                    .filter(l -> l.getFacilityId().equals(f.getId()) && l.getAccessStatus() == AccessStatus.GRANTED)
                    .toList();

            long visitsToday = facilityLogs.stream().filter(l -> l.getEntryTime().isAfter(startOfDay)).count();
            long visitsWeek = facilityLogs.stream().filter(l -> l.getEntryTime().isAfter(startOfWeek)).count();
            long visitsMonth = facilityLogs.stream().filter(l -> l.getEntryTime().isAfter(startOfMonth)).count();

            double pct = f.getMaxCapacity() > 0 ? (f.getCurrentOccupancy() * 100.0 / f.getMaxCapacity()) : 0;

            return new FacilityUtilization.FacilityStat(
                    f.getName(), f.getFacilityType().name(), f.getMaxCapacity(),
                    f.getCurrentOccupancy(), Math.round(pct * 100.0) / 100.0,
                    visitsToday, visitsWeek, visitsMonth);
        }).toList();

        FacilityUtilization utilization = new FacilityUtilization();
        utilization.setFacilities(stats);
        return utilization;
    }

    public PeakHoursStats getPeakHours() {
        List<AccessLog> grantedLogs = accessLogRepository.findAll().stream()
                .filter(l -> l.getAccessStatus() == AccessStatus.GRANTED)
                .toList();

        // Hourly distribution
        Map<Integer, Long> hourlyMap = grantedLogs.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getEntryTime().atZone(ZoneId.systemDefault()).getHour(),
                        Collectors.counting()));

        List<PeakHoursStats.HourlyCount> hourly = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            hourly.add(new PeakHoursStats.HourlyCount(h, hourlyMap.getOrDefault(h, 0L)));
        }

        // Day-of-week distribution
        Map<DayOfWeek, Long> dowMap = grantedLogs.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getEntryTime().atZone(ZoneId.systemDefault()).getDayOfWeek(),
                        Collectors.counting()));

        List<PeakHoursStats.DayOfWeekCount> dow = new ArrayList<>();
        for (DayOfWeek d : DayOfWeek.values()) {
            dow.add(new PeakHoursStats.DayOfWeekCount(d.name(), dowMap.getOrDefault(d, 0L)));
        }

        PeakHoursStats stats = new PeakHoursStats();
        stats.setHourlyDistribution(hourly);
        stats.setDayOfWeekDistribution(dow);

        // Peak hour
        hourly.stream().max(Comparator.comparingLong(PeakHoursStats.HourlyCount::visits))
                .ifPresent(h -> stats.setPeakHour(h.hour() + ":00 - " + (h.hour() + 1) + ":00"));

        // Peak day
        dow.stream().max(Comparator.comparingLong(PeakHoursStats.DayOfWeekCount::visits))
                .ifPresent(d -> stats.setPeakDay(d.day()));

        return stats;
    }
}
