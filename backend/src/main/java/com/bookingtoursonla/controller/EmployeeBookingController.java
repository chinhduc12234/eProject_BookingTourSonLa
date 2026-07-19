package com.bookingtoursonla.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookingtoursonla.dto.BookingDetailResponse;
import com.bookingtoursonla.dto.BookingDashboardDTO;
import com.bookingtoursonla.dto.UpdateBookingScheduleActivityRequest;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.entity.enums.RoleName;
import com.bookingtoursonla.repository.BookingEmployeeRepository;
import com.bookingtoursonla.repository.UserRepository;
import com.bookingtoursonla.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeBookingController {

    private final BookingEmployeeRepository bookingEmployeeRepository;

    private final UserRepository userRepository;

    private final BookingService bookingService;

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDashboardDTO>> getEmployeeBookings(
            Authentication authentication) {

        Long staffId = currentEmployeeId(authentication);

        return ResponseEntity.ok(
                bookingEmployeeRepository.findDashboardBookingsByEmployeeId(staffId));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingDetailResponse> getEmployeeBookingDetail(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                bookingService.getEmployeeBookingDetail(
                        id,
                        authentication != null ? authentication.getName() : null));
    }

    @PutMapping("/bookings/{bookingId}/schedule-activities/{activityId}")
    public ResponseEntity<BookingDetailResponse> updateScheduleActivity(
            @PathVariable Long bookingId,
            @PathVariable Long activityId,
            @Valid @RequestBody UpdateBookingScheduleActivityRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                bookingService.updateEmployeeScheduleActivity(
                        bookingId,
                        activityId,
                        request,
                        authentication != null ? authentication.getName() : null));
    }

    @PostMapping("/bookings/{bookingId}/schedule-activities/{activityId}/report-image")
    public ResponseEntity<Map<String, String>> uploadScheduleActivityReportImage(
            @PathVariable Long bookingId,
            @PathVariable Long activityId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String url = bookingService.uploadScheduleActivityReportImage(
                bookingId,
                activityId,
                file,
                authentication != null ? authentication.getName() : null);

        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            Authentication authentication) {

        Long staffId = currentEmployeeId(authentication);
        List<BookingDashboardDTO> allBookings =
                bookingEmployeeRepository.findDashboardBookingsByEmployeeId(staffId);

        Map<String, List<BookingDashboardDTO>> operationGroups = allBookings.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        this::operationGroupKey,
                        LinkedHashMap::new,
                        java.util.stream.Collectors.toList()));

        long totalBookings = operationGroups.size();
        long confirmedBookings = operationGroups.values()
                .stream()
                .filter(group -> group.stream().anyMatch(booking ->
                        booking.getStatus() == BookingStatus.PENDING
                                || booking.getStatus() == BookingStatus.CONFIRMED
                                || booking.getStatus() == BookingStatus.IN_PROGRESS))
                .count();

        long completedBookings = operationGroups.values()
                .stream()
                .filter(group -> !group.isEmpty() && group.stream().allMatch(booking ->
                        booking.getStatus() == BookingStatus.COMPLETED
                                || booking.getStatus() == BookingStatus.CANCELLED))
                .count();

        BigDecimal totalRevenue =
                bookingEmployeeRepository.calculateTotalConfirmedRevenueByEmployeeId(staffId);

        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("pendingBookings", confirmedBookings);
        stats.put("confirmedBookings", confirmedBookings);
        stats.put("completedBookings", completedBookings);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }

    private String operationGroupKey(BookingDashboardDTO booking) {
        boolean isPrivate = Boolean.TRUE.equals(booking.getPrivateDeparture())
                || booking.getBookingType() == com.bookingtoursonla.entity.enums.BookingType.PRIVATE;

        return !isPrivate && booking.getDepartureId() != null
                ? "departure-" + booking.getDepartureId()
                : "booking-" + booking.getId();
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<BookingDetailResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            Authentication authentication) {

        if (status != BookingStatus.COMPLETED) {
            throw new RuntimeException("Nhân viên chỉ được đánh dấu tour hoàn thành từ timeline");
        }

        return ResponseEntity.ok(
                bookingService.completeEmployeeBooking(
                        id,
                        authentication != null ? authentication.getName() : null));
    }

    @PutMapping("/bookings/{id}/complete")
    public ResponseEntity<BookingDetailResponse> completeBooking(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                bookingService.completeEmployeeBooking(
                        id,
                        authentication != null ? authentication.getName() : null));
    }

    private Long currentEmployeeId(Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Bạn cần đăng nhập bằng tài khoản nhân viên");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

        if (user.getRole() == null || !RoleName.EMPLOYEE.equals(user.getRole().getName())) {
            throw new RuntimeException("Tài khoản này không phải nhân viên");
        }

        return user.getId();
    }
}
