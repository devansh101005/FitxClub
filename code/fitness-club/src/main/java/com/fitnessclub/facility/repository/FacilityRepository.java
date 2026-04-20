package com.fitnessclub.facility.repository;

import com.fitnessclub.facility.entity.Facility;
import com.fitnessclub.facility.entity.FacilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, UUID> {

    List<Facility> findByFacilityType(FacilityType facilityType);

    List<Facility> findByIsOpenTrue();

    @Modifying
    @Query("UPDATE Facility f SET f.currentOccupancy = f.currentOccupancy + 1 WHERE f.id = :id AND f.currentOccupancy < f.maxCapacity")
    int incrementOccupancy(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Facility f SET f.currentOccupancy = f.currentOccupancy - 1 WHERE f.id = :id AND f.currentOccupancy > 0")
    int decrementOccupancy(@Param("id") UUID id);
}
