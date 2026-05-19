package com.bookingtoursonla.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookingtoursonla.dto.TourDayDto;
import com.bookingtoursonla.dto.TourDayRequest;
import com.bookingtoursonla.service.TourDayService;

@RestController
@RequestMapping("/api/admin/tours")
public class TourDayController {

    private final TourDayService tourDayService;

    public TourDayController(TourDayService tourDayService) {
        this.tourDayService = tourDayService;
    }

    @GetMapping("/{tourId}/days")
    public List<TourDayDto> getDays(@PathVariable Long tourId) {
        return tourDayService.getByTourId(tourId);
    }

    @PostMapping("/{tourId}/days")
    public TourDayDto create(
            @PathVariable Long tourId,
            @RequestBody TourDayRequest request) {
        return tourDayService.create(tourId, request);
    }

    @PutMapping("/{tourId}/days/{dayId}")
    public TourDayDto update(
            @PathVariable Long tourId,
            @PathVariable Long dayId,
            @RequestBody TourDayRequest request) {
        return tourDayService.update(tourId, dayId, request);
    }

    @DeleteMapping("/{tourId}/days/{dayId}")
    public void delete(
            @PathVariable Long tourId,
            @PathVariable Long dayId) {
        tourDayService.delete(tourId, dayId);
    }

    @PutMapping("/{tourId}/days/replace")
    public void replaceAll(
            @PathVariable Long tourId,
            @RequestBody List<TourDayRequest> requests) {
        tourDayService.replaceAll(tourId, requests);
    }
}