package com.bookingtoursonla.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookingtoursonla.dto.BookingDetailResponse;
import com.bookingtoursonla.dto.BookingResponse;
import com.bookingtoursonla.dto.UpdateBookingAdminRequest;
import com.bookingtoursonla.service.BookingService;

@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public Page<BookingResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String paymentStatus) {

        return bookingService.getAdminBookings(
                page,
                size,
                keyword,
                status,
                paymentStatus);
    }

    @GetMapping("/{id}")
    public BookingDetailResponse getDetail(@PathVariable Long id) {
        return bookingService.getAdminBookingDetail(id);
    }

    @PutMapping("/{id}")
    public BookingDetailResponse update(
            @PathVariable Long id,
            @RequestBody UpdateBookingAdminRequest request,
            Authentication authentication) {

        return bookingService.updateAdminBooking(
                id,
                request,
                authentication != null ? authentication.getName() : null);
    }
}
