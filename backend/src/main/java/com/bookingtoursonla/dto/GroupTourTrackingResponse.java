package com.bookingtoursonla.dto;

import java.util.List;
import lombok.Data;

@Data
public class GroupTourTrackingResponse {
    private Long departureId;
    private String tourName;
    private String groupStatus;
    private Integer totalBookings;
    private Integer bookingsWithSchedule;
    private Integer completedBookings;
    private Integer needsReviewBookings;
    private Integer totalActivities;
    private Integer completedActivities;
    private Integer progressPercent;
    private List<GroupTourBookingTrackingResponse> bookings;
}
