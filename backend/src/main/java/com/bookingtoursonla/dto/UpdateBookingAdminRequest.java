package com.bookingtoursonla.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateBookingAdminRequest {

    @Size(max = 30, message = "Tr\u1ea1ng th\u00e1i booking kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 30 k\u00fd t\u1ef1")
    private String status;

    @Size(max = 30, message = "Tr\u1ea1ng th\u00e1i thanh to\u00e1n kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 30 k\u00fd t\u1ef1")
    private String paymentStatus;

    private Long assignedStaffId;

    private List<Long> assignedStaffIds;

    @Valid
    private List<BookingStaffAssignmentRequest> assignedStaffMembers;

    private Boolean confirm;

    private Boolean confirmPayment;

    @Size(max = 2000, message = "Ghi ch\u00fa n\u1ed9i b\u1ed9 kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 2000 k\u00fd t\u1ef1")
    private String internalNote;
}
