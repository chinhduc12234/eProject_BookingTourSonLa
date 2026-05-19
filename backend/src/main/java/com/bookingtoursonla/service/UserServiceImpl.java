package com.bookingtoursonla.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bookingtoursonla.dto.CreateStaffRequest;
import com.bookingtoursonla.dto.StaffResponse;
import com.bookingtoursonla.dto.UpdateStaffRequest;
import com.bookingtoursonla.entity.Role;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.Gender;
import com.bookingtoursonla.entity.enums.RoleName;
import com.bookingtoursonla.repository.RoleRepository;
import com.bookingtoursonla.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Page<StaffResponse> getAllStaff(
            int page,
            int size,
            String keyword,
            String gender,
            Boolean isActive,
            String sortBy,
            String direction) {

        String sortField = switch (sortBy) {
            case "email" -> "email";
            case "phone" -> "phone";
            case "dateOfBirth" -> "dateOfBirth";
            case "createdAt" -> "createdAt";
            default -> "fullName";
        };

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortField).descending()
                : Sort.by(sortField).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasGender = gender != null && !gender.trim().isEmpty();
        Gender genderEnum = hasGender ? Gender.valueOf(gender.toUpperCase()) : null;

        Page<User> staffUsers;

        if (hasKeyword && hasGender && isActive != null) {
            staffUsers = userRepository.findStaffByKeywordAndGenderAndIsActive(
                    keyword.trim(), genderEnum, isActive, pageable);
        } else if (hasKeyword && hasGender) {
            staffUsers = userRepository.findStaffByKeywordAndGender(
                    keyword.trim(), genderEnum, pageable);
        } else if (hasKeyword && isActive != null) {
            staffUsers = userRepository.findStaffByKeywordAndIsActive(
                    keyword.trim(), isActive, pageable);
        } else if (hasKeyword) {
            staffUsers = userRepository.findStaffByKeyword(
                    keyword.trim(), pageable);
        } else if (hasGender && isActive != null) {
            staffUsers = userRepository.findAllStaffByGenderAndIsActive(
                    genderEnum, isActive, pageable);
        } else if (hasGender) {
            staffUsers = userRepository.findAllStaffByGender(
                    genderEnum, pageable);
        } else if (isActive != null) {
            staffUsers = userRepository.findAllStaffByIsActive(
                    isActive, pageable);
        } else {
            staffUsers = userRepository.findAllStaff(pageable);
        }

        return staffUsers.map(StaffResponse::new);
    }

    @Override
    public StaffResponse createStaff(CreateStaffRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone already exists");
        }

        Role employeeRole = roleRepository
                .findByName(RoleName.EMPLOYEE)
                .orElseThrow(() -> new RuntimeException("EMPLOYEE role not found"));

        User staff = new User();
        staff.setFullName(request.getFullName());
        staff.setEmail(request.getEmail());
        staff.setPhone(request.getPhone());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setAvatar(request.getAvatar());
        staff.setGender(request.getGender() != null ? request.getGender() : Gender.OTHER);
        staff.setDateOfBirth(request.getDateOfBirth());
        staff.setRole(employeeRole);
        staff.setIsActive(true);

        userRepository.save(staff);

        return new StaffResponse(staff);
    }

    @Override
    public StaffResponse updateStaff(Long id, UpdateStaffRequest request) {
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (!RoleName.EMPLOYEE.equals(staff.getRole().getName())) {
            throw new RuntimeException("User is not a staff member");
        }

        if (request.getFullName() != null) {
            staff.setFullName(request.getFullName());
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!staff.getEmail().equals(request.getEmail()) &&
                    userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            staff.setEmail(request.getEmail());
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            if (!staff.getPhone().equals(request.getPhone()) &&
                    userRepository.existsByPhone(request.getPhone())) {
                throw new RuntimeException("Phone already exists");
            }
            staff.setPhone(request.getPhone());
        }

        if (request.getAvatar() != null) {
            staff.setAvatar(request.getAvatar());
        }

        if (request.getGender() != null) {
            staff.setGender(request.getGender());
        }

        if (request.getDateOfBirth() != null) {
            staff.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getIsActive() != null) {
            staff.setIsActive(request.getIsActive());
        }

        userRepository.save(staff);

        return new StaffResponse(staff);
    }

    @Override
    public void deleteStaff(Long id) {
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (!RoleName.EMPLOYEE.equals(staff.getRole().getName())) {
            throw new RuntimeException("User is not a staff member");
        }

        staff.setDeletedAt(LocalDateTime.now());
        userRepository.save(staff);
    }

    @Override
    public StaffResponse getStaffById(Long id) {
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (!RoleName.EMPLOYEE.equals(staff.getRole().getName())) {
            throw new RuntimeException("User is not a staff member");
        }

        return new StaffResponse(staff);
    }

    @Override
    public StaffResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new StaffResponse(user);
    }
}
