package com.bookingtoursonla.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LocationDto {

    private Long id;

    @NotBlank(message = "Location name is required")
    @Size(min = 2, max = 255)
    private String name;

    private String description;

    private String address;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String image;

    private Boolean active;

    @NotNull(message = "District is required")
    private Long districtId;

    private String districtName;

    private Long provinceId;

    private String provinceName;
}