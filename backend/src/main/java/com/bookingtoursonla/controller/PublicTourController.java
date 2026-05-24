package com.bookingtoursonla.controller;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookingtoursonla.dto.PublicTourDto;
import com.bookingtoursonla.dto.TourDetailResponse;
import com.bookingtoursonla.service.PublicTourService;

@RestController
@RequestMapping("/api/tours")
public class PublicTourController {

    private final PublicTourService publicTourService;

    public PublicTourController(PublicTourService publicTourService) {
        this.publicTourService = publicTourService;
    }

    @GetMapping
    public Page<PublicTourDto> getOpenTours(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "") String keyword) {

        return publicTourService.getOpenTours(page, size, keyword);
    }

    @GetMapping("/{id}/detail")
    public TourDetailResponse getDetail(@PathVariable Long id) {

        return publicTourService.getOpenTourDetail(id);
    }
}
