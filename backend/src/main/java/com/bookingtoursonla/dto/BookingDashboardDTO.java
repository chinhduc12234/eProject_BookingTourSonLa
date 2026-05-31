package com.bookingtoursonla.dto;

import com.bookingtoursonla.entity.enums.BookingStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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
}