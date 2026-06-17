package com.bookingtoursonla.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UpdateBookingScheduleActivityRequest {

    private String status;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private String actualLocation;

    private String actualNote;

    private String attachmentUrl;
}
