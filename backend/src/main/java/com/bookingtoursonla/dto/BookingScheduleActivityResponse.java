package com.bookingtoursonla.dto;

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
}
