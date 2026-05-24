package com.bookingtoursonla.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bookingtoursonla.config.UploadPathUtils;
import com.bookingtoursonla.dto.CreateStaffRequest;
import com.bookingtoursonla.dto.StaffResponse;
import com.bookingtoursonla.dto.UpdateStaffRequest;
import com.bookingtoursonla.dto.UpdateUserProfileRequest;
import com.bookingtoursonla.dto.UserProfileResponse;
import com.bookingtoursonla.entity.Role;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.Gender;
import com.bookingtoursonla.entity.enums.RoleName;
import com.bookingtoursonla.repository.RoleRepository;
import com.bookingtoursonla.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    private static final Set<String> ALLOWED_AVATAR_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif");

    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String uploadDir;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${upload.dir:uploads}") String uploadDir) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.uploadDir = uploadDir;
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
    public UserProfileResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateCurrentUser(
            String email,
            UpdateUserProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean emailChanged = false;

        if (request.getFullName() != null) {
            String fullName = request.getFullName().trim();
            if (fullName.isEmpty()) {
                throw new RuntimeException("Họ tên không được để trống");
            }
            user.setFullName(fullName);
        }

        if (request.getEmail() != null) {
            String newEmail = request.getEmail().trim();
            if (newEmail.isEmpty()) {
                throw new RuntimeException("Email không được để trống");
            }
            if (!user.getEmail().equalsIgnoreCase(newEmail)
                    && userRepository.existsByEmail(newEmail)) {
                throw new RuntimeException("Email already exists");
            }
            emailChanged = !user.getEmail().equals(newEmail);
            user.setEmail(newEmail);
        }

        if (request.getPhone() != null) {
            String newPhone = request.getPhone().trim();
            if (newPhone.isEmpty()) {
                throw new RuntimeException("Số điện thoại không được để trống");
            }
            if (!user.getPhone().equals(newPhone)
                    && userRepository.existsByPhone(newPhone)) {
                throw new RuntimeException("Phone already exists");
            }
            user.setPhone(newPhone);
        }

        if (request.getAvatar() != null) {
            user.setAvatar(trimToNull(request.getAvatar()));
        }

        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getAddress() != null) {
            user.setAddress(trimToNull(request.getAddress()));
        }

        User saved = userRepository.save(user);
        UserProfileResponse response = new UserProfileResponse(saved);

        if (emailChanged) {
            response.setToken(jwtService.generateToken(saved.getEmail()));
        }

        return response;
    }

    @Override
    public UserProfileResponse updateCurrentUserAvatar(
            String email,
            MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ảnh avatar");
        }

        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw new RuntimeException("Ảnh avatar không được vượt quá 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_AVATAR_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Avatar chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Path avatarDir = UploadPathUtils.resolveUploadRoot(uploadDir)
                    .resolve("avatars");
            Files.createDirectories(avatarDir);

            String filename = "avatar-" + user.getId() + "-" + UUID.randomUUID()
                    + getExtension(contentType);
            Path target = avatarDir.resolve(filename).normalize();

            if (!target.startsWith(avatarDir)) {
                throw new RuntimeException("Tên file avatar không hợp lệ");
            }

            file.transferTo(target);

            deleteOldLocalAvatar(user.getAvatar(), avatarDir);

            String avatarPath = "/uploads/avatars/" + filename;
            user.setAvatar(avatarPath);

            User saved = userRepository.save(user);
            return new UserProfileResponse(saved);
        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu avatar");
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        return value.trim();
    }

    private String getExtension(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }

    private void deleteOldLocalAvatar(String avatar, Path avatarDir) {
        if (avatar == null || !avatar.startsWith("/uploads/avatars/")) {
            return;
        }

        try {
            String filename = avatar.substring(avatar.lastIndexOf("/") + 1);
            Path oldAvatar = avatarDir.resolve(filename).normalize();

            if (oldAvatar.startsWith(avatarDir)) {
                Files.deleteIfExists(oldAvatar);
            }
        } catch (IOException ignored) {
        }
    }
}
