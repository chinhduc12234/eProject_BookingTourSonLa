package com.bookingtoursonla.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LocationDto {

    private Long id;

    @NotBlank(message = "T\u00ean \u0111\u1ecba \u0111i\u1ec3m kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    @Size(min = 2, max = 255, message = "T\u00ean \u0111\u1ecba \u0111i\u1ec3m ph\u1ea3i t\u1eeb 2 \u0111\u1ebfn 255 k\u00fd t\u1ef1")
    private String name;

    private String description;

    private String address;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String image;

    private Boolean active;

    @NotNull(message = "Vui l\u00f2ng ch\u1ecdn huy\u1ec7n")
    private Long districtId;

    private String districtName;

    private Long provinceId;

    private String provinceName;
}
