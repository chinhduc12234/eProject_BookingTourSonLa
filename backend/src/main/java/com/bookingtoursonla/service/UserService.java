package com.bookingtoursonla.service;

import org.springframework.data.domain.Page;

import com.bookingtoursonla.dto.CreateStaffRequest;
import com.bookingtoursonla.dto.StaffResponse;
import com.bookingtoursonla.dto.UpdateStaffRequest;
import com.bookingtoursonla.dto.UpdateUserProfileRequest;
import com.bookingtoursonla.dto.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

        Page<StaffResponse> getAllStaff(
                        int page,
                        int size,
                        String keyword,
                        String gender,
                        Boolean isActive,
                        String sortBy,
                        String direction);

        StaffResponse createStaff(
                        CreateStaffRequest request);

        StaffResponse updateStaff(
                        Long id,
                        UpdateStaffRequest request);

        void deleteStaff(
                        Long id);

        StaffResponse getStaffById(
                        Long id);

        UserProfileResponse getCurrentUser(
                        String email);

        UserProfileResponse updateCurrentUser(
                        String email,
                        UpdateUserProfileRequest request);

        UserProfileResponse updateCurrentUserAvatar(
                        String email,
                        MultipartFile file);
}
