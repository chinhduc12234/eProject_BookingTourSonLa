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

import com.bookingtoursonla.dto.ProvinceDto;
import com.bookingtoursonla.service.ProvinceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/provinces")
@Validated
public class ProvinceController {

    private final ProvinceService provinceService;

    public ProvinceController(ProvinceService provinceService) {
        this.provinceService = provinceService;
    }

    // ================= GET ALL PAGINATION =================

    @GetMapping
    public Page<ProvinceDto> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "asc") String direction) {

        return provinceService.getAll(page, size, keyword, direction);
    }

    // ================= GET ALL NO PAGINATION =================

    @GetMapping("/all")
    public List<ProvinceDto> getAllNoPaging() {

        return provinceService.getAllNoPaging();
    }

    // ================= CREATE =================

    @PostMapping
    public ProvinceDto create(
            @Valid @RequestBody ProvinceDto dto) {

        return provinceService.create(dto);
    }

    // ================= UPDATE =================

    @PutMapping("/{id}")
    public ProvinceDto update(
            @PathVariable Long id,
            @Valid @RequestBody ProvinceDto dto) {

        return provinceService.update(id, dto);
    }

    // ================= DELETE =================

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {

        provinceService.delete(id);
    }
}
