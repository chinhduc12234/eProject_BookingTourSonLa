package com.bookingtoursonla.dto;

import lombok.Data;

@Data
public class PayBookingRequest {

    private String paymentType;

    private String paymentMethod;

    private String remainingPaymentMethod;
}
