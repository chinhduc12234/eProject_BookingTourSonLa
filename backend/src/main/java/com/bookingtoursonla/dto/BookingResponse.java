package com.bookingtoursonla.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class BookingResponse {

    private Long id;

    private String bookingCode;

    private String status;

    private String paymentStatus;

    private BigDecimal totalPrice;

    private String customerName;

    private String email;

    private String phone;

    private Long tourId;

    private Long departureId;

    private String tourName;

    private LocalDate departureDate;

    private Integer adultCount;

    private Integer childCount;

    private Integer totalPeople;

    private LocalDateTime bookedAt;
}
