package com.bookingtoursonla.dto;

import com.bookingtoursonla.entity.User;

public class UserProfileResponse {

    private Long id;

    private String fullName;

    private String email;

    private String phone;

    private String role;

    public UserProfileResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole().getName().name();
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

    public String getRole() {
        return role;
    }
}