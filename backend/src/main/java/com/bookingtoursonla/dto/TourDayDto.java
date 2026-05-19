package com.bookingtoursonla.dto;

import java.util.List;

import lombok.Data;

@Data
public class TourDayDto {

    private Long id;

    private Integer dayNumber;

    private String title;

    private String description;

    private List<TourActivityDto> activities;
}