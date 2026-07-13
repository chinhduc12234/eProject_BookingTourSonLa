package com.bookingtoursonla.service;

import com.bookingtoursonla.dto.AdminStatisticsResponse;

public interface AdminStatisticsService {

    AdminStatisticsResponse getMonthlyStatistics(int year, int month);
}
