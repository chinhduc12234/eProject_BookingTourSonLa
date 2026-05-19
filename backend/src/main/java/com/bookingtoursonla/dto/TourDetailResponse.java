package com.bookingtoursonla.dto;

import java.util.List;

import lombok.Data;

@Data
public class TourDetailResponse {

    private TourDto tour;

    private List<TourImageDto> images;

    private List<TourDayDto> days;

    private List<TourDepartureDto> departures;
}