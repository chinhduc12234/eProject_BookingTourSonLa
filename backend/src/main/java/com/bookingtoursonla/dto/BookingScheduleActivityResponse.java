package com.bookingtoursonla.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Data;

@Data
public class BookingScheduleActivityResponse {

    private Long id;

    private Long originalActivityId;

    private String title;

    private String description;

    private LocalTime startTime;

    private LocalTime endTime;

    private String status;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private String actualLocation;

    private String attachmentUrl;

    private String actualNote;

    private LocalDateTime completedAt;

    private LocalDateTime updatedAt;

    private Long updatedByEmployeeId;

    private String updatedByEmployeeName;
}
