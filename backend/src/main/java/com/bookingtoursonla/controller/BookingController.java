package com.bookingtoursonla.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookingtoursonla.dto.BookingDetailResponse;
import com.bookingtoursonla.dto.BookingResponse;
import com.bookingtoursonla.dto.CancelBookingRequest;
import com.bookingtoursonla.dto.CreateBookingRequest;
import com.bookingtoursonla.dto.PayBookingRequest;
import com.bookingtoursonla.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingResponse create(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication) {

        return bookingService.createBooking(
                request,
                authentication != null ? authentication.getName() : null);
    }

    @GetMapping("/my")
    public List<BookingResponse> getMyBookings(Authentication authentication) {

        return bookingService.getMyBookings(
                authentication != null ? authentication.getName() : null);
    }

    @GetMapping("/{id}")
    public BookingDetailResponse getDetail(
            @PathVariable Long id,
            Authentication authentication) {

        return bookingService.getBookingDetail(
                id,
                authentication != null ? authentication.getName() : null);
    }

    @PostMapping("/{id}/resend-confirmation-email")
    public Map<String, String> resendConfirmationEmail(
            @PathVariable Long id,
            Authentication authentication) {

        bookingService.resendBookingConfirmation(
                id,
                authentication != null ? authentication.getName() : null);

        return Map.of(
                "message",
                "Đã gửi lại email xác nhận đến địa chỉ email của tài khoản");
    }

    @PostMapping("/{id}/pay")
    public BookingDetailResponse pay(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) PayBookingRequest request,
            Authentication authentication) {

        return bookingService.payBooking(
                id,
                request,
                authentication != null ? authentication.getName() : null);
    }

    @PostMapping("/{id}/cancel")
    public BookingDetailResponse cancel(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CancelBookingRequest request,
            Authentication authentication) {

        return bookingService.cancelBooking(
                id,
                request,
                authentication != null ? authentication.getName() : null);
    }
}
