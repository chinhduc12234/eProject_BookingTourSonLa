package com.bookingtoursonla.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.bookingtoursonla.dto.DistrictDto;

public interface DistrictService {

    Page<DistrictDto> getAll(
            int page,
            int size,
            String keyword,
            Long provinceId,
            String sortBy,
            String direction);

    List<DistrictDto> getAllNoPaging();

    DistrictDto create(DistrictDto dto);

    DistrictDto update(Long id, DistrictDto dto);

    void delete(Long id);
}