package com.bookingtoursonla.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.bookingtoursonla.entity.enums.TourStatus;

import lombok.Data;

@Data
public class PublicTourDto {

    private Long id;

    private String tourCode;

    private String title;

    private String slug;

    private String thumbnail;

    private String shortDescription;

    private Integer durationDays;

    private Integer durationNights;

    private String departureLocation;

    private Integer maxPeople;

    private BigDecimal price;

    private TourStatus status;

    private LocalDate firstDepartureDate;

    private BigDecimal lowestAdultPrice;

    private BigDecimal lowestChildPrice;

    private Integer availableSeats;

    private Integer departureCount;

    private List<TourDepartureDto> departures;
}
