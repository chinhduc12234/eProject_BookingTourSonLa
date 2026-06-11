package com.bookingtoursonla.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class BookingStaffAssignmentResponse {

    private Long id;

    private Long employeeId;

    private String fullName;

    private String email;

    private String phone;

    private String roleInTrip;

    private String note;

    private String assignmentStatus;

    private LocalDateTime assignedAt;

    private LocalDateTime acceptedAt;
}
