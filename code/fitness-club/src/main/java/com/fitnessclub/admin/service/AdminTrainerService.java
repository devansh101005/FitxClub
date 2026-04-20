package com.fitnessclub.admin.service;

import com.fitnessclub.admin.dto.CreateTrainerRequest;
import com.fitnessclub.auth.entity.Role;
import com.fitnessclub.auth.entity.UserAccount;
import com.fitnessclub.auth.repository.UserAccountRepository;
import com.fitnessclub.common.BusinessException;
import com.fitnessclub.staff.dto.TrainerProfileResponse;
import com.fitnessclub.staff.entity.Staff;
import com.fitnessclub.staff.repository.StaffRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminTrainerService {

    private final UserAccountRepository userAccountRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminTrainerService(UserAccountRepository userAccountRepository,
                               StaffRepository staffRepository,
                               PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public TrainerProfileResponse createTrainer(CreateTrainerRequest request) {
        if (userAccountRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use", HttpStatus.CONFLICT);
        }

        // Create staff record
        Staff staff = new Staff();
        staff.setName(request.getName());
        staff.setEmail(request.getEmail());
        staff.setPhone(request.getPhone());
        staff.setRole("TRAINER");
        staff.setSpecialization(request.getSpecialization());
        staff.setBio(request.getBio());
        staff.setCertifications(request.getCertifications());
        staff.setHourlyRate(request.getHourlyRate());
        staff = staffRepository.save(staff);

        // Create user account linked to staff
        UserAccount user = new UserAccount();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.TRAINER);
        user.setStaffId(staff.getId());
        user.setActive(true);
        userAccountRepository.save(user);

        return TrainerProfileResponse.from(staff);
    }
}
