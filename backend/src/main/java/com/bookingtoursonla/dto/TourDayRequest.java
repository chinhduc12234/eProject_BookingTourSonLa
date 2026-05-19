package com.bookingtoursonla.dto;

import lombok.Data;

@Data
public class TourDayRequest {

    private Integer dayNumber;

    private String title;

    private String description;
}