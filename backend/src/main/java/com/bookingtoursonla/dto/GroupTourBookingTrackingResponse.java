package com.bookingtoursonla.dto;

import lombok.Data;

@Data
public class GroupTourBookingTrackingResponse {
    private Long bookingId;
    private String bookingCode;
    private String customerName;
    private String status;
    private Integer totalActivities;
    private Integer completedActivities;
    private Integer progressPercent;
    private Boolean needsReview;
}
