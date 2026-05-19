package com.bookingtoursonla.dto;

import java.time.LocalTime;

import lombok.Data;

@Data
public class TourActivityRequest {

    private String title;

    private String description;

    private LocalTime startTime;

    private LocalTime endTime;

    private Long locationId;

    private Integer sortOrder;
}