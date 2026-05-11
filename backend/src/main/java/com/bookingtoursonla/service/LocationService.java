package com.bookingtoursonla.service;

import org.springframework.data.domain.Page;

import com.bookingtoursonla.dto.LocationDto;

public interface LocationService {

    Page<LocationDto> getAll(
            int page,
            int size,
            String keyword,
            Long districtId,
            Long provinceId,
            String sortBy,
            String direction);

    LocationDto create(LocationDto dto);

    LocationDto update(Long id, LocationDto dto);

    void delete(Long id);
}