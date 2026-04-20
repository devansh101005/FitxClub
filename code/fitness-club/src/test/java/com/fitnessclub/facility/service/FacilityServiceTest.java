package com.fitnessclub.facility.service;

import com.fitnessclub.common.BusinessException;
import com.fitnessclub.facility.dto.FacilityResponse;
import com.fitnessclub.facility.entity.Facility;
import com.fitnessclub.facility.entity.FacilityType;
import com.fitnessclub.facility.repository.FacilityRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FacilityService Unit Tests")
class FacilityServiceTest {

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private FacilityService facilityService;

    private Facility gym;
    private Facility pool;
    private UUID gymId;
    private UUID poolId;

    @BeforeEach
    void setUp() {
        gymId = UUID.randomUUID();
        poolId = UUID.randomUUID();

        gym = new Facility();
        gym.setId(gymId);
        gym.setName("Main Gym");
        gym.setFacilityType(FacilityType.GYM);
        gym.setMaxCapacity(100);
        gym.setCurrentOccupancy(0);
        gym.setOpen(true);

        pool = new Facility();
        pool.setId(poolId);
        pool.setName("Swimming Pool");
        pool.setFacilityType(FacilityType.POOL);
        pool.setMaxCapacity(30);
        pool.setCurrentOccupancy(0);
        pool.setOpen(true);
    }

    @Test
    @DisplayName("Get all facilities returns list of facilities")
    void testGetAllFacilities() {
        // Arrange
        when(facilityRepository.findAll()).thenReturn(List.of(gym, pool));

        // Act
        List<FacilityResponse> facilities = facilityService.getAllFacilities();

        // Assert
        assertNotNull(facilities);
        assertEquals(2, facilities.size());
        verify(facilityRepository).findAll();
    }

    @Test
    @DisplayName("Get facility by ID returns correct facility")
    void testGetFacilityByIdSuccess() {
        // Arrange
        when(facilityRepository.findById(gymId)).thenReturn(Optional.of(gym));

        // Act
        FacilityResponse response = facilityService.getFacilityById(gymId);

        // Assert
        assertNotNull(response);
        assertEquals("Main Gym", response.getName());
    }

    @Test
    @DisplayName("Get facility by invalid ID throws EntityNotFoundException")
    void testGetFacilityByIdNotFound() {
        // Arrange
        UUID unknownId = UUID.randomUUID();
        when(facilityRepository.findById(unknownId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class,
                () -> facilityService.getFacilityById(unknownId));
    }

    @Test
    @DisplayName("Update facility capacity saves new capacity")
    void testUpdateCapacity() {
        // Arrange
        when(facilityRepository.findById(gymId)).thenReturn(Optional.of(gym));
        when(facilityRepository.save(any(Facility.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        FacilityResponse response = facilityService.updateCapacity(gymId, 150);

        // Assert
        assertEquals(150, gym.getMaxCapacity());
        verify(facilityRepository).save(gym);
    }

    @Test
    @DisplayName("Update facility status to closed")
    void testUpdateStatusToClosed() {
        // Arrange
        when(facilityRepository.findById(poolId)).thenReturn(Optional.of(pool));
        when(facilityRepository.save(any(Facility.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        FacilityResponse response = facilityService.updateStatus(poolId, false);

        // Assert
        assertFalse(pool.isOpen());
        verify(facilityRepository).save(pool);
    }
}
