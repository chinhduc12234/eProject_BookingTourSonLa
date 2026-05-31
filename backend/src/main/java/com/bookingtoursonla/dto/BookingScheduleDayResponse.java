package com.bookingtoursonla.dto;

import java.util.List;

import lombok.Data;

@Data
public class BookingScheduleDayResponse {

    private Long id;

    private Integer dayNumber;

    private String title;

    private String description;

    private List<BookingScheduleActivityResponse> activities;
}
