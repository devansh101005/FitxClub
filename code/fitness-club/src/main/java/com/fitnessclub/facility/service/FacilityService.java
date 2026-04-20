package com.fitnessclub.facility.service;

import com.fitnessclub.common.BusinessException;
import com.fitnessclub.facility.dto.FacilityResponse;
import com.fitnessclub.facility.entity.Facility;
import com.fitnessclub.facility.repository.FacilityRepository;
import com.fitnessclub.notification.event.NotificationEvent;
import com.fitnessclub.notification.event.NotificationType;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final ApplicationEventPublisher eventPublisher;

    public FacilityService(FacilityRepository facilityRepository, ApplicationEventPublisher eventPublisher) {
        this.facilityRepository = facilityRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<FacilityResponse> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(FacilityResponse::from)
                .toList();
    }

    public FacilityResponse getFacilityById(UUID id) {
        return FacilityResponse.from(findFacility(id));
    }

    public Facility findFacility(UUID id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Facility not found"));
    }

    @Transactional
    public void incrementOccupancy(UUID facilityId) {
        int updated = facilityRepository.incrementOccupancy(facilityId);
        if (updated == 0) {
            throw new BusinessException("Facility is at full capacity");
        }
        // Check for overcrowding alert (>80%)
        Facility facility = findFacility(facilityId);
        double percentage = (facility.getCurrentOccupancy() * 100.0) / facility.getMaxCapacity();
        if (percentage > 80) {
            eventPublisher.publishEvent(new NotificationEvent(
                    this, null, NotificationType.OVERCROWDING_ALERT,
                    Map.of("facility", facility.getName(),
                           "occupancy", String.valueOf(facility.getCurrentOccupancy()),
                           "capacity", String.valueOf(facility.getMaxCapacity()))
            ));
        }
    }

    @Transactional
    public void decrementOccupancy(UUID facilityId) {
        facilityRepository.decrementOccupancy(facilityId);
    }

    @Transactional
    public FacilityResponse updateCapacity(UUID facilityId, int newCapacity) {
        Facility facility = findFacility(facilityId);
        facility.setMaxCapacity(newCapacity);
        return FacilityResponse.from(facilityRepository.save(facility));
    }

    @Transactional
    public FacilityResponse updateStatus(UUID facilityId, boolean open) {
        Facility facility = findFacility(facilityId);
        facility.setOpen(open);
        return FacilityResponse.from(facilityRepository.save(facility));
    }
}
