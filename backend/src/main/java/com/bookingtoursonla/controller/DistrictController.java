package com.bookingtoursonla.controller;

import java.util.List;

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

import com.bookingtoursonla.dto.DistrictDto;
import com.bookingtoursonla.service.DistrictService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/districts")
@Validated
public class DistrictController {

    private final DistrictService districtService;

    public DistrictController(
            DistrictService districtService) {
        this.districtService = districtService;
    }

    @GetMapping
    public Page<DistrictDto> getAll(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "6") int size,

            @RequestParam(defaultValue = "") String keyword,

            @RequestParam(required = false) Long provinceId,

            @RequestParam(defaultValue = "name") String sortBy,

            @RequestParam(defaultValue = "asc") String direction) {

        return districtService.getAll(
                page,
                size,
                keyword,
                provinceId,
                sortBy,
                direction);
    }

    @GetMapping("/all")
    public List<DistrictDto> getAllNoPaging() {

        return districtService.getAllNoPaging();
    }

    @PostMapping
    public DistrictDto create(
            @Valid @RequestBody DistrictDto dto) {

        return districtService.create(dto);
    }

    @PutMapping("/{id}")
    public DistrictDto update(
            @PathVariable Long id,
            @Valid @RequestBody DistrictDto dto) {

        return districtService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {

        districtService.delete(id);
    }
}