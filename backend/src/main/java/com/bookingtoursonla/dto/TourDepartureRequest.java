package com.bookingtoursonla.dto;

import java.time.LocalDate;

import com.bookingtoursonla.entity.enums.DepartureStatus;

import lombok.Data;

@Data
public class TourDepartureRequest {

    private LocalDate departureDate;

    private Integer maxPeople;

    private Integer currentPeople;

    private DepartureStatus status;
}