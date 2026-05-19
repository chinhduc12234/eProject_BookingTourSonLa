package com.bookingtoursonla.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.enums.TourStatus;

public interface TourRepository
        extends JpaRepository<Tour, Long> {

    Page<Tour> findByDeletedAtIsNull(
            Pageable pageable);

    Page<Tour> findByDeletedAtIsNullAndTitleContainingIgnoreCase(
            String keyword,
            Pageable pageable);

    Page<Tour> findByDeletedAtIsNullAndStatus(
            TourStatus status,
            Pageable pageable);

    Page<Tour> findByDeletedAtIsNullAndTitleContainingIgnoreCaseAndStatus(
            String keyword,
            TourStatus status,
            Pageable pageable);

    Optional<Tour> findByIdAndDeletedAtIsNull(
            Long id);

    boolean existsByTourCode(
            String tourCode);

    boolean existsBySlug(
            String slug);

    boolean existsBySlugAndIdNot(
            String slug,
            Long id);

    boolean existsByTourCodeAndIdNot(
            String tourCode,
            Long id);
}