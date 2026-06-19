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

import com.bookingtoursonla.dto.TourActivityDto;
import com.bookingtoursonla.dto.TourActivityRequest;
import com.bookingtoursonla.service.TourActivityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class TourActivityController {

    private final TourActivityService tourActivityService;

    public TourActivityController(TourActivityService tourActivityService) {
        this.tourActivityService = tourActivityService;
    }

    @GetMapping("/tour-days/{tourDayId}/activities")
    public List<TourActivityDto> getByDay(@PathVariable Long tourDayId) {
        return tourActivityService.getByTourDay(tourDayId);
    }

    @PostMapping("/tour-days/{tourDayId}/activities")
    public TourActivityDto create(
            @PathVariable Long tourDayId,
            @Valid @RequestBody TourActivityRequest request) {
        return tourActivityService.create(tourDayId, request);
    }

    @PutMapping("/tour-activities/{id}")
    public TourActivityDto update(
            @PathVariable Long id,
            @Valid @RequestBody TourActivityRequest request) {
        return tourActivityService.update(id, request);
    }

    @DeleteMapping("/tour-activities/{id}")
    public void delete(@PathVariable Long id) {
        tourActivityService.delete(id);
    }

    @PutMapping("/tour-days/{tourDayId}/activities/replace")
    public void replaceAll(
            @PathVariable Long tourDayId,
            @Valid @RequestBody List<@Valid TourActivityRequest> requests) {
        tourActivityService.replaceAll(tourDayId, requests);
    }
}
