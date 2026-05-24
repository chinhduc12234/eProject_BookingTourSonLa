package com.bookingtoursonla.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class BookingCustomerResponse {

    private Long id;

    private String customerType;

    private String fullName;

    private String gender;

    private LocalDate dateOfBirth;

    private String identityNumber;

    private String email;

    private String phone;

    private String address;

    private String emergencyContact;

    private Boolean groupLeader;

    private String healthNote;
}
