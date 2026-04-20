package com.fitnessclub.reservation.repository;

import com.fitnessclub.reservation.entity.Booking;
import com.fitnessclub.reservation.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    int countByClassSessionIdAndStatus(UUID classSessionId, BookingStatus status);

    List<Booking> findByMemberIdAndSlotDateGreaterThanEqualOrderBySlotDateAscStartTimeAsc(
            UUID memberId, LocalDate date);

    List<Booking> findByClassSessionIdAndStatusOrderByCreatedAtAsc(UUID classSessionId, BookingStatus status);

    Optional<Booking> findFirstByClassSessionIdAndStatusOrderByCreatedAtAsc(UUID classSessionId, BookingStatus status);

    boolean existsByMemberIdAndClassSessionIdAndStatusIn(UUID memberId, UUID classSessionId, List<BookingStatus> statuses);

    boolean existsByMemberIdAndFacilityIdAndSlotDateAndStartTimeAndStatusIn(
            UUID memberId, UUID facilityId, LocalDate slotDate, java.time.LocalTime startTime, List<BookingStatus> statuses);

    int countByFacilityIdAndSlotDateAndStartTimeAndStatus(
            UUID facilityId, LocalDate slotDate, java.time.LocalTime startTime, BookingStatus status);

    List<Booking> findByClassSessionIdAndStatus(UUID classSessionId, BookingStatus status);
}
