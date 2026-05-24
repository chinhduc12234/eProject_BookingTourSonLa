package com.bookingtoursonla.service;

import java.util.List;

import com.bookingtoursonla.dto.BookingDetailResponse;
import com.bookingtoursonla.dto.BookingResponse;
import com.bookingtoursonla.dto.CreateBookingRequest;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request, String authenticatedEmail);

    List<BookingResponse> getMyBookings(String authenticatedEmail);

    BookingDetailResponse getBookingDetail(Long id, String authenticatedEmail);
}
