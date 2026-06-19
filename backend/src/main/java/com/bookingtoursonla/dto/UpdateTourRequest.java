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

    @NotBlank(message = "T\u00ean tour kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    private String title;

    @NotBlank(message = "Slug kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    private String slug;

    private String thumbnail;

    private String shortDescription;

    private String description;

    private String includedServices;

    private String excludedServices;

    @NotNull(message = "S\u1ed1 ng\u00e0y tour kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    @Min(value = 1, message = "S\u1ed1 ng\u00e0y tour ph\u1ea3i l\u1edbn h\u01a1n ho\u1eb7c b\u1eb1ng 1")
    private Integer durationDays;

    @NotNull(message = "S\u1ed1 \u0111\u00eam tour kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    @Min(value = 0, message = "S\u1ed1 \u0111\u00eam tour kh\u00f4ng \u0111\u01b0\u1ee3c \u00e2m")
    private Integer durationNights;

    private String departureLocation;

    @NotNull(message = "S\u1ed1 kh\u00e1ch t\u1ed1i \u0111a kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    @Min(value = 1, message = "S\u1ed1 kh\u00e1ch t\u1ed1i \u0111a ph\u1ea3i l\u1edbn h\u01a1n ho\u1eb7c b\u1eb1ng 1")
    private Integer maxPeople;

    @NotNull(message = "Gi\u00e1 tour kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    @DecimalMin(value = "0.0", inclusive = false, message = "Gi\u00e1 tour ph\u1ea3i l\u1edbn h\u01a1n 0")
    private BigDecimal price;

    private TourStatus status;
}
