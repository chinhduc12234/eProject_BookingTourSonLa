package com.bookingtoursonla.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookingtoursonla.dto.CreateStaffRequest;
import com.bookingtoursonla.dto.StaffResponse;
import com.bookingtoursonla.dto.UpdateStaffRequest;
import com.bookingtoursonla.dto.UpdateUserProfileRequest;
import com.bookingtoursonla.dto.UserProfileResponse;
import com.bookingtoursonla.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserProfileResponse getCurrentUser(
            Authentication authentication) {

        return userService.getCurrentUser(authentication.getName());
    }

    @PutMapping("/me")
    public UserProfileResponse updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UpdateUserProfileRequest request) {

        return userService.updateCurrentUser(
                authentication.getName(),
                request);
    }

    @PostMapping("/me/avatar")
    public UserProfileResponse updateCurrentUserAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {

        return userService.updateCurrentUserAvatar(
                authentication.getName(),
                file);
    }

    @GetMapping("/admin/staff")
    public ResponseEntity<Page<StaffResponse>> getAllStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Page<StaffResponse> staffList = userService.getAllStaff(
                page, size, keyword, gender, isActive, sortBy, direction);

        return ResponseEntity.ok(staffList);
    }

    @GetMapping("/admin/staff/{id}")
    public ResponseEntity<StaffResponse> getStaffById(
            @PathVariable Long id) {

        StaffResponse staff = userService.getStaffById(id);

        return ResponseEntity.ok(staff);
    }

    @PostMapping("/admin/staff")
    public ResponseEntity<StaffResponse> createStaff(
            @Valid @RequestBody CreateStaffRequest request) {

        StaffResponse staff = userService.createStaff(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(staff);
    }

    @PutMapping("/admin/staff/{id}")
    public ResponseEntity<StaffResponse> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStaffRequest request) {

        StaffResponse staff = userService.updateStaff(id, request);

        return ResponseEntity.ok(staff);
    }

    @DeleteMapping("/admin/staff/{id}")
    public ResponseEntity<Void> deleteStaff(
            @PathVariable Long id) {

        userService.deleteStaff(id);

        return ResponseEntity.noContent().build();
    }
}
