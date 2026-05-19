package com.bookingtoursonla.service;

import java.util.List;

import com.bookingtoursonla.dto.TourActivityDto;
import com.bookingtoursonla.dto.TourActivityRequest;

public interface TourActivityService {

    List<TourActivityDto> getByTourDay(Long tourDayId);

    TourActivityDto create(Long tourDayId, TourActivityRequest request);

    TourActivityDto update(Long id, TourActivityRequest request);

    void delete(Long id);

    void replaceAll(Long tourDayId, List<TourActivityRequest> requests);
}