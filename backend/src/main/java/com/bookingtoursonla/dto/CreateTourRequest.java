package com.bookingtoursonla.dto;

import java.math.BigDecimal;

import com.bookingtoursonla.entity.enums.TourStatus;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTourRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String thumbnail;

    private String shortDescription;

    private String description;

    @NotNull(message = "Duration days is required")
    @Min(value = 1)
    private Integer durationDays;

    @NotNull(message = "Duration nights is required")
    @Min(value = 0)
    private Integer durationNights;

    private String departureLocation;

    @NotNull(message = "Max people is required")
    @Min(value = 1)
    private Integer maxPeople;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    private TourStatus status = TourStatus.DRAFT;
}