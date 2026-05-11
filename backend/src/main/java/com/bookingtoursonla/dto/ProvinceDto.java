package com.bookingtoursonla.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProvinceDto {

    private Long id;

    @NotBlank(message = "Province name is required")

    @Size(min = 2, max = 100, message = "Province name must be between 2 and 100 characters")
    private String name;
}