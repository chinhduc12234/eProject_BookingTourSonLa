package com.bookingtoursonla.service;

import org.springframework.data.domain.Page;

import com.bookingtoursonla.dto.PublicTourDto;
import com.bookingtoursonla.dto.TourDetailResponse;

public interface PublicTourService {

    Page<PublicTourDto> getOpenTours(int page, int size, String keyword);

    TourDetailResponse getOpenTourDetail(Long id);
}
