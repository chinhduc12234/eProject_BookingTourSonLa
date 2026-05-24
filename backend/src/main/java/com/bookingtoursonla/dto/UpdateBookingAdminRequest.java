package com.bookingtoursonla.dto;

import lombok.Data;

@Data
public class UpdateBookingAdminRequest {

    private String status;

    private String paymentStatus;

    private String internalNote;
}
