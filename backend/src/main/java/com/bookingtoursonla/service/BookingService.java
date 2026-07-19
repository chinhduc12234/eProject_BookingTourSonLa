package com.bookingtoursonla.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.bookingtoursonla.dto.BookingDetailResponse;
import com.bookingtoursonla.dto.BookingResponse;
import com.bookingtoursonla.dto.CancelBookingRequest;
import com.bookingtoursonla.dto.CreateBookingRequest;
import com.bookingtoursonla.dto.GroupTourDepartureResponse;
import com.bookingtoursonla.dto.GroupTourTrackingResponse;
import com.bookingtoursonla.dto.PayBookingRequest;
import com.bookingtoursonla.dto.UpdateBookingScheduleActivityRequest;
import com.bookingtoursonla.dto.UpdateBookingAdminRequest;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request, String authenticatedEmail);

    List<BookingResponse> getMyBookings(String authenticatedEmail);

    BookingDetailResponse getBookingDetail(Long id, String authenticatedEmail);

    void resendBookingConfirmation(Long id, String authenticatedEmail);

    BookingDetailResponse payBooking(
            Long id,
            PayBookingRequest request,
            String authenticatedEmail);

    BookingDetailResponse cancelBooking(
            Long id,
            CancelBookingRequest request,
            String authenticatedEmail);

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

    Page<GroupTourDepartureResponse> getAdminGroupTours(
            int page,
            int size,
            String keyword);

    GroupTourDepartureResponse getAdminGroupTourDetail(Long departureId);

    GroupTourTrackingResponse getAdminGroupTourTracking(Long departureId);

    GroupTourDepartureResponse assignGroupTourStaff(
            Long departureId,
            Long employeeId);

    GroupTourDepartureResponse confirmGroupTour(
            Long departureId,
            String adminEmail);

    BookingDetailResponse getEmployeeBookingDetail(
            Long id,
            String employeeEmail);

    BookingDetailResponse updateEmployeeScheduleActivity(
            Long bookingId,
            Long activityId,
            UpdateBookingScheduleActivityRequest request,
            String employeeEmail);

    BookingDetailResponse completeEmployeeBooking(
            Long bookingId,
            String employeeEmail);

    String uploadScheduleActivityReportImage(
            Long bookingId,
            Long activityId,
            MultipartFile file,
            String employeeEmail);
}
