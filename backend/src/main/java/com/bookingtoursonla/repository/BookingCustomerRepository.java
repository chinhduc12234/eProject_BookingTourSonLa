package com.bookingtoursonla.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookingtoursonla.entity.BookingCustomer;

public interface BookingCustomerRepository extends JpaRepository<BookingCustomer, Long> {

    List<BookingCustomer> findByBookingIdOrderByIdAsc(Long bookingId);
}
