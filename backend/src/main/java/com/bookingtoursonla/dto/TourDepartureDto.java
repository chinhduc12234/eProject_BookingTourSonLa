package com.bookingtoursonla.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.bookingtoursonla.entity.enums.DepartureStatus;

import lombok.Data;

@Data
public class TourDepartureDto {

    private Long id;

    private LocalDate departureDate;

    private LocalDateTime bookingDeadline;

    private LocalTime departureTime;

    private Integer maxPeople;

    private Integer currentPeople;

    private Integer reservedPeople;

    private BigDecimal adultPrice;

    private BigDecimal childPrice;

    private Boolean isPrivateDeparture;

    private DepartureStatus status;
}