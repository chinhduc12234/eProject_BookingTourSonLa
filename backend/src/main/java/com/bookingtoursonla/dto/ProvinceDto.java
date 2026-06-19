package com.bookingtoursonla.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProvinceDto {

    private Long id;

    @NotBlank(message = "T\u00ean t\u1ec9nh kh\u00f4ng \u0111\u01b0\u1ee3c \u0111\u1ec3 tr\u1ed1ng")

    @Size(min = 2, max = 100, message = "T\u00ean t\u1ec9nh ph\u1ea3i t\u1eeb 2 \u0111\u1ebfn 100 k\u00fd t\u1ef1")
    private String name;
}
