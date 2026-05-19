package com.bookingtoursonla.controller;

import org.springframework.data.domain.Page;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookingtoursonla.dto.CreateTourRequest;
import com.bookingtoursonla.dto.TourDto;
import com.bookingtoursonla.dto.UpdateTourRequest;
import com.bookingtoursonla.service.TourService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/tours")
@Validated
public class TourController {

    private final TourService tourService;

    public TourController(
            TourService tourService) {

        this.tourService = tourService;
    }

    @GetMapping
    public Page<TourDto> getAll(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "6") int size,

            @RequestParam(defaultValue = "") String keyword,

            @RequestParam(required = false) String status,

            @RequestParam(defaultValue = "title") String sortBy,

            @RequestParam(defaultValue = "asc") String direction) {

        return tourService.getAll(
                page,
                size,
                keyword,
                status,
                sortBy,
                direction);
    }

    @GetMapping("/{id}")
    public TourDto getById(
            @PathVariable Long id) {

        return tourService.getById(id);
    }

    @PostMapping
    public TourDto create(
            @Valid @RequestBody CreateTourRequest request) {

        return tourService.create(request);
    }

    @PutMapping("/{id}")
    public TourDto update(
            @PathVariable Long id,

            @Valid @RequestBody UpdateTourRequest request) {

        return tourService.update(
                id,
                request);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id) {

        tourService.delete(id);
    }
}