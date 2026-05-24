package com.bookingtoursonla.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.entity.enums.PaymentStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByIdAndDeletedAtIsNull(Long id);

    List<Booking> findByUserIdAndDeletedAtIsNullOrderByBookedAtDesc(Long userId);

    @Query("""
            SELECT b FROM Booking b
            JOIN b.tourDeparture d
            JOIN d.tour t
            WHERE b.deletedAt IS NULL
              AND (:status IS NULL OR b.status = :status)
              AND (:paymentStatus IS NULL OR b.paymentStatus = :paymentStatus)
              AND (
                :keyword IS NULL
                OR LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(b.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(b.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(b.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            """)
    Page<Booking> searchAdminBookings(
            @Param("keyword") String keyword,
            @Param("status") BookingStatus status,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            Pageable pageable);

    long countByBookedAtBetween(LocalDateTime start, LocalDateTime end);

    boolean existsByBookingCode(String bookingCode);
}
