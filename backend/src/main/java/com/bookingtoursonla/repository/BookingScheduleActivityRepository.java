package com.bookingtoursonla.repository;

import java.util.List;

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
}
