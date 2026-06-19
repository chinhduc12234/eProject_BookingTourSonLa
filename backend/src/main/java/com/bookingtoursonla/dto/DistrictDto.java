package com.bookingtoursonla.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DistrictDto {

    private Long id;

    @NotBlank(message = "T\u00ean huy\u1ec7n kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")
    @Size(min = 2, max = 100, message = "T\u00ean huy\u1ec7n ph\u1ea3i t\u1eeb 2 \u0111\u1ebfn 100 k\u00fd t\u1ef1")
    private String name;

    @NotNull(message = "Vui l\u00f2ng ch\u1ecdn t\u1ec9nh")
    private Long provinceId;

    private String provinceName;
}
