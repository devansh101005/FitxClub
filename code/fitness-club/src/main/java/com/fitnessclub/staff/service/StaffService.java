package com.fitnessclub.staff.service;

import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.staff.dto.*;
import com.fitnessclub.staff.entity.Staff;
import com.fitnessclub.staff.entity.TrainerAvailability;
import com.fitnessclub.staff.repository.StaffRepository;
import com.fitnessclub.staff.repository.TrainerAvailabilityRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class StaffService {

    private final StaffRepository staffRepository;
    private final TrainerAvailabilityRepository availabilityRepository;
    private final UserAccountRepository userAccountRepository;

    public StaffService(StaffRepository staffRepository,
                        TrainerAvailabilityRepository availabilityRepository,
                        UserAccountRepository userAccountRepository) {
        this.staffRepository = staffRepository;
        this.availabilityRepository = availabilityRepository;
        this.userAccountRepository = userAccountRepository;
    }

    public List<TrainerProfileResponse> getAllTrainers() {
        List<Staff> trainers = staffRepository.findByRole("TRAINER");
        return trainers.stream().map(this::toProfileWithAvailability).toList();
    }

    public TrainerProfileResponse getTrainerProfile(UUID trainerId) {
        Staff trainer = staffRepository.findById(trainerId)
                .orElseThrow(() -> new EntityNotFoundException("Trainer not found"));
        return toProfileWithAvailability(trainer);
    }

    public TrainerProfileResponse getMyProfile(UUID userId) {
        Staff trainer = getTrainerFromUser(userId);
        return toProfileWithAvailability(trainer);
    }

    @Transactional
    public TrainerProfileResponse updateMyProfile(UUID userId, UpdateTrainerProfileRequest request) {
        Staff trainer = getTrainerFromUser(userId);

        if (request.getSpecialization() != null) trainer.setSpecialization(request.getSpecialization());
        if (request.getBio() != null) trainer.setBio(request.getBio());
        if (request.getCertifications() != null) trainer.setCertifications(request.getCertifications());
        if (request.getHourlyRate() != null) trainer.setHourlyRate(request.getHourlyRate());

        trainer = staffRepository.save(trainer);
        return toProfileWithAvailability(trainer);
    }

    @Transactional
    public AvailabilitySlot addAvailability(UUID userId, AddAvailabilityRequest request) {
        Staff trainer = getTrainerFromUser(userId);

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BusinessException("End time must be after start time");
        }

        TrainerAvailability availability = new TrainerAvailability();
        availability.setTrainerId(trainer.getId());
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability = availabilityRepository.save(availability);

        return AvailabilitySlot.from(availability);
    }

    @Transactional
    public void removeAvailability(UUID userId, UUID slotId) {
        Staff trainer = getTrainerFromUser(userId);
        availabilityRepository.deleteByTrainerIdAndId(trainer.getId(), slotId);
    }

    private Staff getTrainerFromUser(UUID userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getStaffId() == null) {
            throw new BusinessException("No staff profile linked to this account");
        }
        return staffRepository.findById(user.getStaffId())
                .orElseThrow(() -> new EntityNotFoundException("Staff profile not found"));
    }

    private TrainerProfileResponse toProfileWithAvailability(Staff trainer) {
        TrainerProfileResponse response = TrainerProfileResponse.from(trainer);
        List<AvailabilitySlot> slots = availabilityRepository
                .findByTrainerIdOrderByDayOfWeekAscStartTimeAsc(trainer.getId())
                .stream().map(AvailabilitySlot::from).toList();
        response.setAvailability(slots);
        return response;
    }
}
