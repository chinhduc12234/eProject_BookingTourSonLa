package com.bookingtoursonla.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.bookingtoursonla.dto.BookingDetailResponse;
import com.bookingtoursonla.dto.BookingResponse;
import com.bookingtoursonla.dto.CreateBookingRequest;
import com.bookingtoursonla.dto.UpdateBookingAdminRequest;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request, String authenticatedEmail);

    List<BookingResponse> getMyBookings(String authenticatedEmail);

    BookingDetailResponse getBookingDetail(Long id, String authenticatedEmail);

    Page<BookingResponse> getAdminBookings(
            int page,
            int size,
            String keyword,
            String status,
            String paymentStatus);

    BookingDetailResponse getAdminBookingDetail(Long id);

    BookingDetailResponse updateAdminBooking(
            Long id,
            UpdateBookingAdminRequest request,
            String adminEmail);
}
