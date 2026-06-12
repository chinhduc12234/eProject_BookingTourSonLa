package com.bookingtoursonla.dto;

import java.util.List;

import lombok.Data;

@Data
public class UpdateBookingAdminRequest {

    private String status;

    private String paymentStatus;

    private Long assignedStaffId;

    private List<Long> assignedStaffIds;

    private List<BookingStaffAssignmentRequest> assignedStaffMembers;

    private Boolean confirm;

    private Boolean confirmPayment;

    private String internalNote;
}
