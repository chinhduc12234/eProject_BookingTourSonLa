package com.bookingtoursonla.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.bookingtoursonla.entity.TourDay;

import jakarta.transaction.Transactional;

public interface TourDayRepository extends JpaRepository<TourDay, Long> {

    List<TourDay> findByTourIdOrderByDayNumberAsc(Long tourId);

    Optional<TourDay> findByIdAndTourId(Long id, Long tourId);

    @Modifying
    @Transactional
    void deleteByTourId(Long tourId);
}