package com.bookingtoursonla.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CancelBookingRequest {

    @Size(max = 1000, message = "L\u00fd do h\u1ee7y kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 1000 k\u00fd t\u1ef1")
    private String reason;
}
