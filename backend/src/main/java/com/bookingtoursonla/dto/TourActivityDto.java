package com.bookingtoursonla.dto;

import lombok.Data;

@Data
public class TourActivityDto {

    private Long id;

    private Long locationId;

    private String locationName;

    private String title;

    private String description;

    private String startTime;

    private String endTime;

    private Integer sortOrder;
}