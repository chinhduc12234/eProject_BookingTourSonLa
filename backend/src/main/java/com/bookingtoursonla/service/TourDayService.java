package com.bookingtoursonla.service;

import java.util.List;

import com.bookingtoursonla.dto.TourDayDto;
import com.bookingtoursonla.dto.TourDayRequest;

public interface TourDayService {

    List<TourDayDto> getByTourId(Long tourId);

    TourDayDto create(Long tourId, TourDayRequest request);

    TourDayDto update(Long tourId, Long dayId, TourDayRequest request);

    void delete(Long tourId, Long dayId);

    void replaceAll(Long tourId, List<TourDayRequest> requests);
}