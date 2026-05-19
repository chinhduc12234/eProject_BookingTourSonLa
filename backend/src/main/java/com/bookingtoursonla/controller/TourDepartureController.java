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

import com.bookingtoursonla.dto.TourDepartureDto;
import com.bookingtoursonla.dto.TourDepartureRequest;
import com.bookingtoursonla.service.TourDepartureService;

@RestController
@RequestMapping("/api/admin/tours")
public class TourDepartureController {

    private final TourDepartureService service;

    public TourDepartureController(TourDepartureService service) {
        this.service = service;
    }

    @GetMapping("/{tourId}/departures")
    public List<TourDepartureDto> get(@PathVariable Long tourId) {
        return service.getByTourId(tourId);
    }

    @PostMapping("/{tourId}/departures")
    public TourDepartureDto create(
            @PathVariable Long tourId,
            @RequestBody TourDepartureRequest request) {
        return service.create(tourId, request);
    }

    @PutMapping("/departures/{id}")
    public TourDepartureDto update(
            @PathVariable Long id,
            @RequestBody TourDepartureRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/departures/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PutMapping("/{tourId}/departures/replace")
    public void replace(
            @PathVariable Long tourId,
            @RequestBody List<TourDepartureRequest> requests) {
        service.replaceAll(tourId, requests);
    }
}