package com.bookingtoursonla.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookingtoursonla.entity.TourDeparture;

public interface TourDepartureRepository extends JpaRepository<TourDeparture, Long> {

    List<TourDeparture> findByTourIdOrderByDepartureDateAsc(Long tourId);

    Optional<TourDeparture> findByTourIdAndDepartureDate(Long tourId, LocalDate departureDate);

    boolean existsByTourIdAndDepartureDate(Long tourId, LocalDate departureDate);

    /**
     * Xóa theo tour.id — dùng JPQL + flush để tránh INSERT chạy trước DELETE trong cùng transaction
     * (lỗi duplicate key với UK tour_id + departure_date).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM TourDeparture d WHERE d.tour.id = :tourId")
    int deleteAllByTour_Id(@Param("tourId") Long tourId);
}