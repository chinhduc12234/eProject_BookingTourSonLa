package com.bookingtoursonla.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query(
            value = """
                    SELECT t FROM Tour t
                    WHERE t.deletedAt IS NULL
                      AND t.status = com.bookingtoursonla.entity.enums.TourStatus.OPEN
                      AND (:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                      AND EXISTS (
                          SELECT d.id FROM TourDeparture d
                          WHERE d.tour = t
                            AND d.deletedAt IS NULL
                            AND d.status <> com.bookingtoursonla.entity.enums.DepartureStatus.CLOSED
                            AND d.departureDate >= :today
                            AND (d.bookingDeadline IS NULL OR d.bookingDeadline > :now)
                            AND COALESCE(d.maxPeople, 0) >
                                COALESCE(d.currentPeople, 0) + COALESCE(d.reservedPeople, 0)
                      )
                    """,
            countQuery = """
                    SELECT COUNT(t) FROM Tour t
                    WHERE t.deletedAt IS NULL
                      AND t.status = com.bookingtoursonla.entity.enums.TourStatus.OPEN
                      AND (:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                      AND EXISTS (
                          SELECT d.id FROM TourDeparture d
                          WHERE d.tour = t
                            AND d.deletedAt IS NULL
                            AND d.status <> com.bookingtoursonla.entity.enums.DepartureStatus.CLOSED
                            AND d.departureDate >= :today
                            AND (d.bookingDeadline IS NULL OR d.bookingDeadline > :now)
                            AND COALESCE(d.maxPeople, 0) >
                                COALESCE(d.currentPeople, 0) + COALESCE(d.reservedPeople, 0)
                      )
                    """)
    Page<Tour> findPublicBookableTours(
            @Param("keyword") String keyword,
            @Param("today") LocalDate today,
            @Param("now") LocalDateTime now,
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
