package com.fitnessclub.access.repository;

import com.fitnessclub.access.entity.AccessLog;
import com.fitnessclub.access.entity.AccessStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, UUID> {

    Optional<AccessLog> findTopByMemberIdAndFacilityIdAndAccessStatusAndExitTimeIsNullOrderByEntryTimeDesc(
            UUID memberId, UUID facilityId, AccessStatus status);
}
