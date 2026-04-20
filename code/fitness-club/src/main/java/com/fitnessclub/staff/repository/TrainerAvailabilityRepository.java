package com.fitnessclub.staff.repository;

import com.fitnessclub.staff.entity.TrainerAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrainerAvailabilityRepository extends JpaRepository<TrainerAvailability, UUID> {

    List<TrainerAvailability> findByTrainerIdOrderByDayOfWeekAscStartTimeAsc(UUID trainerId);

    List<TrainerAvailability> findByTrainerIdAndDayOfWeek(UUID trainerId, DayOfWeek dayOfWeek);

    void deleteByTrainerIdAndId(UUID trainerId, UUID id);
}
