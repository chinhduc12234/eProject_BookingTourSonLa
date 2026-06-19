package com.bookingtoursonla.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BookingStaffAssignmentRequest {

    private Long employeeId;

    @Size(max = 30, message = "Vai tr\u00f2 nh\u00e2n vi\u00ean trong tour kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 30 k\u00fd t\u1ef1")
    private String roleInTrip;

    @Size(max = 1000, message = "Ghi ch\u00fa ph\u00e2n c\u00f4ng kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 1000 k\u00fd t\u1ef1")
    private String note;
}
