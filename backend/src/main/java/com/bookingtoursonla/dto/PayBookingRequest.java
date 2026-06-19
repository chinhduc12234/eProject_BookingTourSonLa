package com.bookingtoursonla.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PayBookingRequest {

    @Size(max = 30, message = "Lo\u1ea1i thanh to\u00e1n kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 30 k\u00fd t\u1ef1")
    private String paymentType;

    @Size(max = 50, message = "Ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 50 k\u00fd t\u1ef1")
    private String paymentMethod;

    @Size(max = 50, message = "Ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n ph\u1ea7n c\u00f2n l\u1ea1i kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 50 k\u00fd t\u1ef1")
    private String remainingPaymentMethod;
}
