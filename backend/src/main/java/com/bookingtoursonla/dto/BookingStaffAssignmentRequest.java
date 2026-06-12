package com.bookingtoursonla.dto;

import lombok.Data;

@Data
public class BookingStaffAssignmentRequest {

    private Long employeeId;

    private String roleInTrip;

    private String note;
}
