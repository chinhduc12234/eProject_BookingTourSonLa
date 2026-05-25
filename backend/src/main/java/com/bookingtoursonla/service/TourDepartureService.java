package com.bookingtoursonla.service;

import java.util.List;

import com.bookingtoursonla.dto.TourDepartureDto;
import com.bookingtoursonla.dto.TourDepartureRequest;

public interface TourDepartureService {

    List<TourDepartureDto> getByTourId(Long tourId);

    TourDepartureDto create(Long tourId, TourDepartureRequest request);

    TourDepartureDto update(Long id, TourDepartureRequest request);

    void delete(Long id);

    void syncAll(Long tourId, List<TourDepartureRequest> requests);
}
