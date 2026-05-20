package com.bookingtoursonla.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bookingtoursonla.entity.enums.TourStatus;

import lombok.Data;

@Data
public class TourDto {

    private Long id;

    private String tourCode;

    private String title;

    private String slug;

    private String thumbnail;

    private String shortDescription;

    private String description;

    private String includedServices;

    private String excludedServices;

    private Integer durationDays;

    private Integer durationNights;

    private String departureLocation;

    private Integer maxPeople;

    private BigDecimal price;

    private TourStatus status;

    private Long createdBy;

    private String createdByName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}