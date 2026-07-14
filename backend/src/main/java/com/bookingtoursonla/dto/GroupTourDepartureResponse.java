package com.bookingtoursonla.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import lombok.Data;

@Data
public class GroupTourDepartureResponse {

    private Long departureId;

    private Long tourId;

    private String tourName;

    private LocalDate departureDate;

    private LocalTime departureTime;

    private String capacityStatus;

    private String groupStatus;

    private Integer maxPeople;

    private Integer occupiedPeople;

    private Integer availableSeats;

    private Integer bookingCount;

    private Integer pendingBookingCount;

    private Integer confirmedBookingCount;

    private Long assignedStaffId;

    private String assignedStaffName;

    private String assignedStaffEmail;

    private String assignedStaffPhone;

    private List<BookingResponse> bookings;
}
