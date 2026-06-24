package com.bookingtoursonla.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.web.util.HtmlUtils;

import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.BookingCustomer;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourDeparture;
import com.bookingtoursonla.entity.enums.BookingCustomerType;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.entity.enums.BookingType;
import com.bookingtoursonla.entity.enums.PaymentStatus;

class BookingEmailTemplateBuilderTest {

    private final BookingEmailTemplateBuilder builder = new BookingEmailTemplateBuilder();

    @Test
    void buildsDetailedVietnameseEmailAndEscapesCustomerInput() {

        Tour tour = new Tour();
        tour.setTitle("Mộc Châu mùa hoa");
        tour.setDurationDays(3);
        tour.setDurationNights(2);
        tour.setDepartureLocation("Sài Gòn");

        TourDeparture departure = new TourDeparture();
        departure.setTour(tour);
        departure.setDepartureDate(LocalDate.of(2026, 12, 12));
        departure.setDepartureTime(LocalTime.of(6, 30));

        Booking booking = new Booking();
        booking.setId(88L);
        booking.setBookingCode("BK-2026-00088");
        booking.setTourDeparture(departure);
        booking.setBookingType(BookingType.INDIVIDUAL);
        booking.setFullName("Nguyễn <script>alert(1)</script>");
        booking.setEmail("customer@example.com");
        booking.setPhone("0900000000");
        booking.setPickupAddress("Quận 1, TP.HCM");
        booking.setAdultCount(2);
        booking.setChildCount(1);
        booking.setAdultPriceSnapshot(new BigDecimal("2500000"));
        booking.setChildPriceSnapshot(new BigDecimal("1800000"));
        booking.setTotalPrice(new BigDecimal("6800000"));
        booking.setPaidAmount(new BigDecimal("2040000"));
        booking.setRemainingAmount(new BigDecimal("4760000"));
        booking.setPaymentStatus(PaymentStatus.PARTIAL);
        booking.setStatus(BookingStatus.PENDING);
        booking.setSpecialRequest("Ăn chay");

        BookingCustomer leader = new BookingCustomer();
        leader.setFullName("Nguyễn Văn A");
        leader.setCustomerType(BookingCustomerType.ADULT);
        leader.setGroupLeader(true);
        leader.setPhone("0900000000");

        String html = builder.build(
                booking,
                List.of(leader),
                "http://localhost:5173/tai-khoan/booking/88");

        assertTrue(html.contains("Đặt tour thành công"));
        assertTrue(html.contains(HtmlUtils.htmlEscape("Mộc Châu mùa hoa")));
        assertTrue(html.contains("6.800.000 đ"));
        assertTrue(html.contains(HtmlUtils.htmlEscape("Đã đặt cọc")));
        assertTrue(html.contains(HtmlUtils.htmlEscape("Nguyễn Văn A")));
        assertTrue(html.contains("&lt;script&gt;alert(1)&lt;/script&gt;"));
        assertFalse(html.contains("<script>alert(1)</script>"));
    }
}
