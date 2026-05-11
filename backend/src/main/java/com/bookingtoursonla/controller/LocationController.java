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

import com.bookingtoursonla.dto.LocationDto;
import com.bookingtoursonla.service.LocationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/locations")
@Validated
public class LocationController {

    private final LocationService locationService;

    public LocationController(
            LocationService locationService) {

        this.locationService = locationService;
    }

    @GetMapping
    public Page<LocationDto> getAll(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "6") int size,

            @RequestParam(defaultValue = "") String keyword,

            @RequestParam(required = false) Long districtId,

            @RequestParam(required = false) Long provinceId,

            @RequestParam(defaultValue = "name") String sortBy,

            @RequestParam(defaultValue = "asc") String direction) {

        return locationService.getAll(
                page,
                size,
                keyword,
                districtId,
                provinceId,
                sortBy,
                direction);
    }

    @PostMapping
    public LocationDto create(
            @Valid @RequestBody LocationDto dto) {

        return locationService.create(dto);
    }

    @PutMapping("/{id}")
    public LocationDto update(
            @PathVariable Long id,
            @Valid @RequestBody LocationDto dto) {

        return locationService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id) {

        locationService.delete(id);
    }
}