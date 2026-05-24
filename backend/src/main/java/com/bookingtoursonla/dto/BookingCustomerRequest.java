package com.bookingtoursonla.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookingCustomerRequest {

    private String customerType;

    @NotBlank(message = "Tên khách đi cùng không được để trống")
    private String fullName;

    private String gender;

    private LocalDate dateOfBirth;

    private String identityNumber;

    private String email;

    private String phone;

    private String address;

    private String emergencyContact;

    private String healthNote;
}
