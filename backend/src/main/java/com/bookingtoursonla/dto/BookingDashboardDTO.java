package com.bookingtoursonla.dto;

import com.bookingtoursonla.entity.enums.BookingStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.bookingtoursonla.entity.enums.BookingType;

@Getter
@Setter
@NoArgsConstructor
@Builder
public class BookingDashboardDTO {
    private Long id;
    private String bookingCode;
    private String customer;     // Lấy từ user.fullName của team bạn
    private String phone;        // Lấy từ b.phone
    private String tourName;     // Lấy từ tourDeparture.tour.title
    private LocalDateTime date;  // Lấy từ b.bookedAt
    private Integer slots;       // Lấy từ b.totalPeople
    private BigDecimal totalPrice;
    private BookingStatus status;
    private Long departureId;
    private LocalDate departureDate;
    private LocalTime departureTime;
    private BookingType bookingType;
    private Boolean privateDeparture;
    private Integer adultCount;
    private Integer childCount;

    
    public BookingDashboardDTO(Long id, String bookingCode, String customer, String phone, 
                               String tourName, LocalDateTime date, Integer slots, 
                               BigDecimal totalPrice, BookingStatus status) {
        this.id = id;
        this.bookingCode = bookingCode;
        this.customer = customer;
        this.phone = phone;
        this.tourName = tourName;
        this.date = date;
        this.slots = slots;
        this.totalPrice = totalPrice;
        this.status = status;
    }

    public BookingDashboardDTO(Long id, String bookingCode, String customer, String phone,
                               String tourName, LocalDateTime date, Integer slots,
                               BigDecimal totalPrice, BookingStatus status, Long departureId,
                               LocalDate departureDate, LocalTime departureTime,
                               BookingType bookingType, Boolean privateDeparture,
                               Integer adultCount, Integer childCount) {
        this(id, bookingCode, customer, phone, tourName, date, slots, totalPrice, status);
        this.departureId = departureId;
        this.departureDate = departureDate;
        this.departureTime = departureTime;
        this.bookingType = bookingType;
        this.privateDeparture = privateDeparture;
        this.adultCount = adultCount;
        this.childCount = childCount;
    }
}
