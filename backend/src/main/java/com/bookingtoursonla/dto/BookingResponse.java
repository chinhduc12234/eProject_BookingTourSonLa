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

    private String bookingType;

    private LocalDateTime paymentDeadline;

    private LocalDateTime paidAt;

    private BigDecimal paidAmount;

    private BigDecimal depositAmount;

    private BigDecimal remainingAmount;

    private BigDecimal refundedAmount;

    private LocalDateTime refundedAt;

    private String paymentPlan;

    private String paymentMethod;

    private String remainingPaymentMethod;

    private String paymentReference;

    private BigDecimal totalPrice;

    private String customerName;

    private String email;

    private String phone;

    private String organizationName;

    private String contactPerson;

    private Long tourId;

    private Long departureId;

    private String tourName;

    private Long assignedStaffId;

    private String assignedStaffName;

    private String assignedStaffEmail;

    private String assignedStaffPhone;

    private LocalDate departureDate;

    private Integer adultCount;

    private Integer childCount;

    private Integer totalPeople;

    private LocalDateTime bookedAt;
}
