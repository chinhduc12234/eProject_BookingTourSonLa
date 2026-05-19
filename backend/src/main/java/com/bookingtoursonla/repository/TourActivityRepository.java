package com.bookingtoursonla.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookingtoursonla.entity.TourActivity;

public interface TourActivityRepository extends JpaRepository<TourActivity, Long> {

    List<TourActivity> findByTourDayIdInOrderBySortOrderAsc(List<Long> tourDayIds);

    List<TourActivity> findByTourDayIdOrderBySortOrderAsc(Long tourDayId);

    void deleteByTourDayId(Long tourDayId);
}