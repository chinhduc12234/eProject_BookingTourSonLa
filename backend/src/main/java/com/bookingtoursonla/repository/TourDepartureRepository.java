package com.bookingtoursonla.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookingtoursonla.entity.TourDeparture;

import jakarta.persistence.LockModeType;

public interface TourDepartureRepository extends JpaRepository<TourDeparture, Long> {

    @Query("SELECT d FROM TourDeparture d WHERE d.tour.id = :tourId AND d.deletedAt IS NULL ORDER BY d.departureDate ASC")
    List<TourDeparture> findByTourIdOrderByDepartureDateAsc(@Param("tourId") Long tourId);

    @Query("SELECT d FROM TourDeparture d WHERE d.tour.id IN :tourIds AND d.deletedAt IS NULL ORDER BY d.departureDate ASC")
    List<TourDeparture> findByTourIdInOrderByDepartureDateAsc(@Param("tourIds") List<Long> tourIds);

    @Query("SELECT d FROM TourDeparture d WHERE d.tour.id = :tourId AND d.departureDate = :departureDate AND d.deletedAt IS NULL")
    Optional<TourDeparture> findByTourIdAndDepartureDate(
            @Param("tourId") Long tourId,
            @Param("departureDate") LocalDate departureDate);

    @Query("SELECT d FROM TourDeparture d JOIN FETCH d.tour WHERE d.tour.id = :tourId AND d.departureDate = :departureDate")
    Optional<TourDeparture> findAnyByTourIdAndDepartureDate(
            @Param("tourId") Long tourId,
            @Param("departureDate") LocalDate departureDate);

    @Query("SELECT d FROM TourDeparture d JOIN FETCH d.tour WHERE d.tour.id = :tourId")
    List<TourDeparture> findAllByTourIdIncludingDeleted(@Param("tourId") Long tourId);

    @Query("SELECT COUNT(d) > 0 FROM TourDeparture d WHERE d.tour.id = :tourId AND d.departureDate = :departureDate AND d.deletedAt IS NULL")
    boolean existsByTourIdAndDepartureDate(
            @Param("tourId") Long tourId,
            @Param("departureDate") LocalDate departureDate);

    @Query("SELECT COUNT(d) > 0 FROM TourDeparture d WHERE d.tour.id = :tourId AND d.departureDate = :departureDate AND d.id <> :id")
    boolean existsByTourIdAndDepartureDateAndIdNot(
            @Param("tourId") Long tourId,
            @Param("departureDate") LocalDate departureDate,
            @Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM TourDeparture d JOIN FETCH d.tour WHERE d.id = :id AND d.deletedAt IS NULL")
    Optional<TourDeparture> findByIdForUpdate(@Param("id") Long id);
}
