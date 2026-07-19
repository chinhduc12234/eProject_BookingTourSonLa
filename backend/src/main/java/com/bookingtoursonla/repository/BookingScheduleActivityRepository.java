package com.bookingtoursonla.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
            LEFT JOIN FETCH a.updatedByEmployee
            WHERE d.booking.id = :bookingId
            ORDER BY d.dayNumber ASC, a.startTime ASC, a.id ASC
            """)
    List<BookingScheduleActivity> findByBookingId(
            @Param("bookingId") Long bookingId);

    @Query("""
            SELECT a FROM BookingScheduleActivity a
            JOIN FETCH a.bookingScheduleDay d
            JOIN FETCH d.booking b
            WHERE b.tourDeparture.id = :departureId
              AND b.deletedAt IS NULL
              AND b.status <> com.bookingtoursonla.entity.enums.BookingStatus.CANCELLED
              AND b.bookingType <> com.bookingtoursonla.entity.enums.BookingType.PRIVATE
              AND (b.tourDeparture.isPrivateDeparture = false OR b.tourDeparture.isPrivateDeparture IS NULL)
              AND d.dayNumber = :dayNumber
              AND a.title = :title
              AND ((:startTime IS NULL AND a.startTime IS NULL) OR a.startTime = :startTime)
            ORDER BY b.id ASC, a.id ASC
            """)
    List<BookingScheduleActivity> findActiveGroupActivitiesByDepartureAndSnapshotKey(
            @Param("departureId") Long departureId,
            @Param("dayNumber") Integer dayNumber,
            @Param("title") String title,
            @Param("startTime") LocalTime startTime);

    @Modifying
    @Query("""
            UPDATE BookingScheduleActivity a
            SET a.originalActivity = NULL
            WHERE a.originalActivity.id IN :activityIds
            """)
    int clearOriginalActivityReferences(
            @Param("activityIds") List<Long> activityIds);
}
