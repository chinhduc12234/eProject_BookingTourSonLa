package com.bookingtoursonla.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookingtoursonla.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByIdAndDeletedAtIsNull(Long id);

    List<Booking> findByUserIdAndDeletedAtIsNullOrderByBookedAtDesc(Long userId);

    long countByBookedAtBetween(LocalDateTime start, LocalDateTime end);

    boolean existsByBookingCode(String bookingCode);
}
