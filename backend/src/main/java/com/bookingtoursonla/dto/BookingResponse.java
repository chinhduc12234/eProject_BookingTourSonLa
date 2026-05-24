package com.bookingtoursonla.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class BookingResponse {

    private Long id;

    private String bookingCode;

    private String status;

    private String paymentStatus;

    private BigDecimal totalPrice;

    private String customerName;

    private String tourName;

    private LocalDate departureDate;

    private Integer adultCount;

    private Integer childCount;
}
