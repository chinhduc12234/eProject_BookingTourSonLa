package com.bookingtoursonla.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookingtoursonla.dto.BookingDashboardDTO;
import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.TourDeparture;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.entity.enums.PaymentStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

  Optional<Booking> findByIdAndDeletedAtIsNull(Long id);

  @Query("""
      SELECT b FROM Booking b
      JOIN FETCH b.tourDeparture d
      JOIN FETCH d.tour
      WHERE b.id = :id
        AND b.deletedAt IS NULL
      """)
  Optional<Booking> findForConfirmationEmail(@Param("id") Long id);

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

  @Query("""
      SELECT b FROM Booking b
      JOIN b.tourDeparture d
      JOIN d.tour t
      WHERE b.deletedAt IS NULL
        AND (
          b.bookingType = com.bookingtoursonla.entity.enums.BookingType.PRIVATE
          OR d.isPrivateDeparture = true
        )
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
  Page<Booking> searchAdminPrivateBookings(
      @Param("keyword") String keyword,
      @Param("status") BookingStatus status,
      @Param("paymentStatus") PaymentStatus paymentStatus,
      Pageable pageable);

  @Query(
      value = """
          SELECT DISTINCT d FROM Booking b
          JOIN b.tourDeparture d
          JOIN FETCH d.tour t
          WHERE b.deletedAt IS NULL
            AND d.deletedAt IS NULL
            AND b.bookingType <> com.bookingtoursonla.entity.enums.BookingType.PRIVATE
            AND (d.isPrivateDeparture = false OR d.isPrivateDeparture IS NULL)
            AND (
              :keyword IS NULL
              OR LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(b.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(b.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(b.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
          ORDER BY d.departureDate ASC
          """,
      countQuery = """
          SELECT COUNT(DISTINCT d.id) FROM Booking b
          JOIN b.tourDeparture d
          JOIN d.tour t
          WHERE b.deletedAt IS NULL
            AND d.deletedAt IS NULL
            AND b.bookingType <> com.bookingtoursonla.entity.enums.BookingType.PRIVATE
            AND (d.isPrivateDeparture = false OR d.isPrivateDeparture IS NULL)
            AND (
              :keyword IS NULL
              OR LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(b.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(b.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(b.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
          """)
  Page<TourDeparture> searchAdminGroupDepartures(
      @Param("keyword") String keyword,
      Pageable pageable);

  @Query("""
      SELECT b FROM Booking b
      JOIN FETCH b.tourDeparture d
      JOIN FETCH d.tour
      WHERE b.deletedAt IS NULL
        AND d.id = :departureId
        AND b.bookingType <> com.bookingtoursonla.entity.enums.BookingType.PRIVATE
        AND (d.isPrivateDeparture = false OR d.isPrivateDeparture IS NULL)
      ORDER BY b.bookedAt ASC
      """)
  List<Booking> findGroupBookingsByDepartureId(@Param("departureId") Long departureId);

  @Query("""
      SELECT b FROM Booking b
      WHERE b.deletedAt IS NULL
        AND b.tourDeparture.id = :departureId
        AND b.status <> com.bookingtoursonla.entity.enums.BookingStatus.CANCELLED
      ORDER BY b.bookedAt ASC
      """)
  List<Booking> findActiveBookingsByDepartureId(@Param("departureId") Long departureId);

  long countByBookedAtBetween(LocalDateTime start, LocalDateTime end);

  boolean existsByBookingCode(String bookingCode);

  @Query("""
          SELECT new com.bookingtoursonla.dto.BookingDashboardDTO(
              b.id,
              b.bookingCode,
              b.fullName,
              b.phone,
              t.title,
              b.bookedAt,
              b.totalPeople,
              b.totalPrice,
              b.status
          )
          FROM Booking b
          JOIN b.tourDeparture d
          JOIN d.tour t
          WHERE b.deletedAt IS NULL
          ORDER BY b.bookedAt DESC
      """)
  List<BookingDashboardDTO> findDashboardBookings();

  // 2. Tính tổng doanh thu thời gian thực từ các đơn đặt tour đã xác nhận
  // (CONFIRMED) thành công
  @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.deletedAt IS NULL AND b.status = com.bookingtoursonla.entity.enums.BookingStatus.CONFIRMED")
  java.math.BigDecimal calculateTotalConfirmedRevenue();

  @Query("""
      SELECT b FROM Booking b
      JOIN FETCH b.tourDeparture d
      JOIN FETCH d.tour
      WHERE b.deletedAt IS NULL
        AND b.bookedAt >= :start
        AND b.bookedAt < :end
      ORDER BY b.bookedAt DESC
      """)
  List<Booking> findStatisticsBookings(
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query("""
      SELECT b FROM Booking b
      JOIN FETCH b.tourDeparture d
      JOIN FETCH d.tour
      WHERE b.deletedAt IS NULL
        AND d.departureDate >= :start
        AND d.departureDate < :end
      ORDER BY d.departureDate ASC
      """)
  List<Booking> findStatisticsDepartures(
      @Param("start") java.time.LocalDate start,
      @Param("end") java.time.LocalDate end);

}
