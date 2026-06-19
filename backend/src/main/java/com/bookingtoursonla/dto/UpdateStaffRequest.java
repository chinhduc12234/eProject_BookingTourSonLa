package com.bookingtoursonla.dto;

import java.time.LocalDate;

import com.bookingtoursonla.entity.enums.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateStaffRequest {

    @NotBlank(message = "H\u1ecd t\u00ean nh\u00e2n vi\u00ean kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    @Size(min = 2, max = 255, message = "H\u1ecd t\u00ean nh\u00e2n vi\u00ean ph\u1ea3i t\u1eeb 2 \u0111\u1ebfn 255 k\u00fd t\u1ef1")
    private String fullName;

    @Email(message = "Email nh\u00e2n vi\u00ean kh\u00f4ng \u0111\u00fang \u0111\u1ecbnh d\u1ea1ng")
    private String email;

    @Pattern(regexp = "^\\d{10,20}$", message = "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i ph\u1ea3i c\u00f3 t\u1eeb 10 \u0111\u1ebfn 20 ch\u1eef s\u1ed1")
    private String phone;

    @Size(max = 500, message = "\u0110\u01b0\u1eddng d\u1eabn avatar kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 500 k\u00fd t\u1ef1")
    private String avatar;

    private Gender gender;

    private LocalDate dateOfBirth;

    private Boolean isActive;

    public UpdateStaffRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
