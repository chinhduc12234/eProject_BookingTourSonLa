package com.bookingtoursonla.dto;

import java.math.BigDecimal;

import com.bookingtoursonla.entity.enums.TourStatus;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTourRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String slug;

    private String thumbnail;

    private String shortDescription;

    private String description;

    private String includedServices;

    private String excludedServices;

    @NotNull
    @Min(1)
    private Integer durationDays;

    @NotNull
    @Min(0)
    private Integer durationNights;

    private String departureLocation;

    @NotNull
    @Min(1)
    private Integer maxPeople;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    private TourStatus status;
}