package com.bookingtoursonla.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.bookingtoursonla.entity.User;

public class UserProfileResponse {

    private Long id;

    private String fullName;

    private String email;

    private String phone;

    private String avatar;

    private String gender;

    private LocalDate dateOfBirth;

    private String address;

    private String role;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String token;

    public UserProfileResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.avatar = user.getAvatar();
        this.gender = user.getGender() != null ? user.getGender().name() : null;
        this.dateOfBirth = user.getDateOfBirth();
        this.address = user.getAddress();
        this.role = user.getRole().getName().name();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getAvatar() {
        return avatar;
    }

    public String getGender() {
        return gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getAddress() {
        return address;
    }

    public String getRole() {
        return role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
