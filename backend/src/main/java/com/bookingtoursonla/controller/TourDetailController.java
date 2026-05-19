package com.bookingtoursonla.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookingtoursonla.dto.TourDetailResponse;
import com.bookingtoursonla.service.TourDetailService;

@RestController
@RequestMapping("/api/admin/tours")
public class TourDetailController {

    private final TourDetailService tourDetailService;

    public TourDetailController(TourDetailService tourDetailService) {
        this.tourDetailService = tourDetailService;
    }

    @GetMapping("/{id}/detail")
    public TourDetailResponse getDetail(@PathVariable Long id) {
        return tourDetailService.getDetail(id);
    }
}