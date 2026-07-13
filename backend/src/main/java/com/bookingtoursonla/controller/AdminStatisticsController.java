package com.bookingtoursonla.controller;

import java.time.YearMonth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookingtoursonla.dto.AdminStatisticsResponse;
import com.bookingtoursonla.service.AdminStatisticsService;

@RestController
@RequestMapping("/api/admin/statistics")
public class AdminStatisticsController {

    private final AdminStatisticsService adminStatisticsService;

    public AdminStatisticsController(AdminStatisticsService adminStatisticsService) {
        this.adminStatisticsService = adminStatisticsService;
    }

    @GetMapping
    public AdminStatisticsResponse getMonthlyStatistics(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        YearMonth selectedMonth = year == null || month == null
                ? YearMonth.now()
                : YearMonth.of(year, month);

        return adminStatisticsService.getMonthlyStatistics(
                selectedMonth.getYear(),
                selectedMonth.getMonthValue());
    }
}
