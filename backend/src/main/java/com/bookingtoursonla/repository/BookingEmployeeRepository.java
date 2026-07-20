package com.bookingtoursonla.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookingtoursonla.dto.BookingDashboardDTO;
import com.bookingtoursonla.entity.BookingEmployee;

public interface BookingEmployeeRepository extends JpaRepository<BookingEmployee, Long> {

    @Query("""
            SELECT be FROM BookingEmployee be
            JOIN FETCH be.employee
            WHERE be.booking.id = :bookingId
            ORDER BY be.id ASC
            """)
    List<BookingEmployee> findWithEmployeeByBookingIdOrderByIdAsc(
            @Param("bookingId") Long bookingId);

    @Query("""
            SELECT be FROM BookingEmployee be
            JOIN FETCH be.employee
            JOIN FETCH be.booking b
            JOIN FETCH b.tourDeparture d
            JOIN FETCH d.tour
            WHERE b.deletedAt IS NULL
              AND b.id IN :bookingIds
            ORDER BY be.id ASC
            """)
    List<BookingEmployee> findStatisticsAssignments(
            @Param("bookingIds") List<Long> bookingIds);

    @Query("""
            SELECT be FROM BookingEmployee be
            JOIN FETCH be.employee
            JOIN be.booking b
            JOIN b.tourDeparture d
            WHERE b.deletedAt IS NULL
              AND b.status <> com.bookingtoursonla.entity.enums.BookingStatus.CANCELLED
              AND d.id = :departureId
              AND b.bookingType <> com.bookingtoursonla.entity.enums.BookingType.PRIVATE
              AND (d.isPrivateDeparture = false OR d.isPrivateDeparture IS NULL)
            ORDER BY be.assignedAt DESC, be.id DESC
            """)
    List<BookingEmployee> findGroupAssignmentsByDepartureId(
            @Param("departureId") Long departureId);

    @Query("""
            SELECT CASE WHEN COUNT(be) > 0 THEN true ELSE false END
            FROM BookingEmployee be
            WHERE be.booking.id = :bookingId
            """)
    boolean existsByBookingId(@Param("bookingId") Long bookingId);

    @Query("""
            SELECT CASE WHEN COUNT(be) > 0 THEN true ELSE false END
            FROM BookingEmployee be
            WHERE be.booking.id = :bookingId
              AND be.employee.id = :employeeId
            """)
    boolean existsByBookingIdAndEmployeeId(
            @Param("bookingId") Long bookingId,
            @Param("employeeId") Long employeeId);

    @Modifying
    @Query("DELETE FROM BookingEmployee be WHERE be.booking.id = :bookingId")
    void deleteByBookingId(@Param("bookingId") Long bookingId);

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
                b.status,
                d.id,
                d.departureDate,
                d.departureTime,
                b.bookingType,
                d.isPrivateDeparture,
                b.adultCount,
                b.childCount
            )
            FROM BookingEmployee be
            JOIN be.booking b
            JOIN b.tourDeparture d
            JOIN d.tour t
            WHERE b.deletedAt IS NULL
              AND be.employee.id = :staffId
            ORDER BY b.bookedAt DESC
            """)
    List<BookingDashboardDTO> findDashboardBookingsByEmployeeId(
            @Param("staffId") Long staffId);

    @Query("""
            SELECT SUM(b.totalPrice)
            FROM BookingEmployee be
            JOIN be.booking b
            WHERE b.deletedAt IS NULL
              AND be.employee.id = :staffId
              AND b.status = com.bookingtoursonla.entity.enums.BookingStatus.CONFIRMED
            """)
    BigDecimal calculateTotalConfirmedRevenueByEmployeeId(
            @Param("staffId") Long staffId);
}
