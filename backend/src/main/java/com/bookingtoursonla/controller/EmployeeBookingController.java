package com.bookingtoursonla.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookingtoursonla.dto.BookingDashboardDTO;
import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.entity.enums.RoleName;
import com.bookingtoursonla.repository.BookingRepository;
import com.bookingtoursonla.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeBookingController {

    private final BookingRepository bookingRepository;

    private final UserRepository userRepository;

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDashboardDTO>> getEmployeeBookings(
            Authentication authentication) {

        Long staffId = currentEmployeeId(authentication);

        return ResponseEntity.ok(
                bookingRepository.findDashboardBookingsByAssignedStaffId(staffId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            Authentication authentication) {

        Long staffId = currentEmployeeId(authentication);
        List<BookingDashboardDTO> allBookings =
                bookingRepository.findDashboardBookingsByAssignedStaffId(staffId);

        long totalBookings = allBookings.size();
        long pendingBookings = allBookings
                .stream()
                .filter(booking -> booking.getStatus() == BookingStatus.PENDING)
                .count();

        BigDecimal totalRevenue =
                bookingRepository.calculateTotalConfirmedRevenueByAssignedStaffId(staffId);

        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("pendingBookings", pendingBookings);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<Map<String, String>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            Authentication authentication) {

        Long staffId = currentEmployeeId(authentication);

        Booking booking = bookingRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking hợp lệ"));

        if (booking.getAssignedStaff() == null
                || !booking.getAssignedStaff().getId().equals(staffId)) {
            throw new RuntimeException("Bạn không được phân công booking này");
        }

        booking.setStatus(status);
        bookingRepository.save(booking);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái booking thành công");
        return ResponseEntity.ok(response);
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
