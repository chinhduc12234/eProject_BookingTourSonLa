package com.bookingtoursonla.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import lombok.Data;

@Data
public class BookingDetailResponse {

    private Long id;

    private String bookingCode;

    private Long userId;

    private Long tourId;

    private Long departureId;

    private String status;

    private String paymentStatus;

    private String bookingType;

    private String customerName;

    private String email;

    private String phone;

    private String pickupAddress;

    private String organizationName;

    private String contactPerson;

    private String tourName;

    private String tourThumbnail;

    private LocalDate departureDate;

    private LocalTime departureTime;

    private Integer adultCount;

    private Integer childCount;

    private Integer totalPeople;

    private BigDecimal adultPrice;

    private BigDecimal childPrice;

    private BigDecimal totalPrice;

    private String note;

    private String specialRequest;

    private LocalDateTime bookedAt;

    private LocalDateTime confirmedAt;

    private LocalDateTime cancelledAt;

    private List<BookingCustomerResponse> customers;

    private List<BookingScheduleDayResponse> scheduleDays;
}
