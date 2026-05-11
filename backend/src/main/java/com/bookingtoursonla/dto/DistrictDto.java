package com.bookingtoursonla.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DistrictDto {

    private Long id;

    @NotBlank(message = "District name is required")
    @Size(min = 2, max = 100, message = "District name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Province is required")
    private Long provinceId;

    private String provinceName;
}