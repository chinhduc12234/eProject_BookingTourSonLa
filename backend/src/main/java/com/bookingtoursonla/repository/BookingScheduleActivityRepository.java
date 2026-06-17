package com.bookingtoursonla.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookingtoursonla.entity.BookingScheduleActivity;

public interface BookingScheduleActivityRepository extends JpaRepository<BookingScheduleActivity, Long> {

    @Query("""
            SELECT a FROM BookingScheduleActivity a
            WHERE a.bookingScheduleDay.id IN :dayIds
            ORDER BY a.bookingScheduleDay.dayNumber ASC, a.startTime ASC, a.id ASC
            """)
    List<BookingScheduleActivity> findByScheduleDayIds(
            @Param("dayIds") List<Long> dayIds);

    @Query("""
            SELECT a FROM BookingScheduleActivity a
            JOIN FETCH a.bookingScheduleDay d
            JOIN FETCH d.booking b
            LEFT JOIN FETCH a.updatedByEmployee
            WHERE a.id = :activityId
              AND b.id = :bookingId
            """)
    Optional<BookingScheduleActivity> findByIdAndBookingId(
            @Param("activityId") Long activityId,
            @Param("bookingId") Long bookingId);

    @Query("""
            SELECT a FROM BookingScheduleActivity a
            JOIN a.bookingScheduleDay d
            WHERE d.booking.id = :bookingId
            """)
    List<BookingScheduleActivity> findByBookingId(
            @Param("bookingId") Long bookingId);
}
