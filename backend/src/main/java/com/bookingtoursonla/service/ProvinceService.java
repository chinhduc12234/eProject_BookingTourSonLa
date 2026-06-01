package com.bookingtoursonla.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.bookingtoursonla.dto.ProvinceDto;

public interface ProvinceService {

    Page<ProvinceDto> getAll(
            int page,
            int size,
            String keyword,
            String direction);

    List<ProvinceDto> getAllNoPaging();

    ProvinceDto create(ProvinceDto dto);

    ProvinceDto update(Long id, ProvinceDto dto);

    void delete(Long id);
}
