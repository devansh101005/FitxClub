package com.fitnessclub.reservation.repository;

import com.fitnessclub.reservation.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, UUID> {

    List<ClassSession> findByDateGreaterThanEqualOrderByDateAscStartTimeAsc(LocalDate date);

    List<ClassSession> findByTrainerIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(UUID trainerId, LocalDate date);

    List<ClassSession> findByFacilityIdAndDateAndStartTimeLessThanAndEndTimeGreaterThan(
            UUID facilityId, LocalDate date, java.time.LocalTime endTime, java.time.LocalTime startTime);
}
