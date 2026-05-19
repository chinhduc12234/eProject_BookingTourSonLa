package com.bookingtoursonla.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookingtoursonla.entity.TourImage;

public interface TourImageRepository
        extends JpaRepository<TourImage, Long> {

    List<TourImage> findByTourIdOrderBySortOrderAsc(Long tourId);

    void deleteByTourId(Long tourId);

    Optional<TourImage> findByIdAndTourId(
            Long id,
            Long tourId);

    Optional<TourImage> findByTourIdAndIsThumbnailTrue(Long tourId);
}