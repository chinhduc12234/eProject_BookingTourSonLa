package com.bookingtoursonla.service;

import com.bookingtoursonla.dto.TourDetailResponse;

public interface TourDetailService {
    TourDetailResponse getDetail(Long tourId);
}