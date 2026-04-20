package com.fitnessclub.staff.repository;

import com.fitnessclub.staff.entity.PTSessionStatus;
import com.fitnessclub.staff.entity.PersonalTrainingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PersonalTrainingSessionRepository extends JpaRepository<PersonalTrainingSession, UUID> {

    List<PersonalTrainingSession> findByTrainerIdAndSessionDateGreaterThanEqualOrderBySessionDateAscStartTimeAsc(
            UUID trainerId, LocalDate date);

    List<PersonalTrainingSession> findByMemberIdAndSessionDateGreaterThanEqualOrderBySessionDateAscStartTimeAsc(
            UUID memberId, LocalDate date);

    List<PersonalTrainingSession> findByTrainerIdAndStatusOrderBySessionDateAscStartTimeAsc(
            UUID trainerId, PTSessionStatus status);

    @Query("SELECT pts FROM PersonalTrainingSession pts " +
           "WHERE pts.trainerId = :trainerId " +
           "AND pts.sessionDate = :date " +
           "AND pts.status IN ('REQUESTED', 'CONFIRMED') " +
           "AND pts.startTime < :endTime " +
           "AND pts.endTime > :startTime")
    List<PersonalTrainingSession> findConflictingTrainerSessions(
            @Param("trainerId") UUID trainerId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("SELECT pts FROM PersonalTrainingSession pts " +
           "WHERE pts.memberId = :memberId " +
           "AND pts.sessionDate = :date " +
           "AND pts.status IN ('REQUESTED', 'CONFIRMED') " +
           "AND pts.startTime < :endTime " +
           "AND pts.endTime > :startTime")
    List<PersonalTrainingSession> findConflictingMemberSessions(
            @Param("memberId") UUID memberId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}
