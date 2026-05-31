package com.bookingtoursonla.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookingtoursonla.entity.BookingScheduleDay;

public interface BookingScheduleDayRepository extends JpaRepository<BookingScheduleDay, Long> {

    List<BookingScheduleDay> findByBookingIdOrderByDayNumberAsc(Long bookingId);
}
