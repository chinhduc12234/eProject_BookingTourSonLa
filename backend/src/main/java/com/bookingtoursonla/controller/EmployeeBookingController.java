package com.bookingtoursonla.controller;

import com.bookingtoursonla.dto.BookingDashboardDTO;
import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeBookingController {

    private final BookingRepository bookingRepository;

   
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDashboardDTO>> getEmployeeBookings() {
        return ResponseEntity.ok(bookingRepository.findDashboardBookings());
    }

    // API 2: Lấy số liệu thống kê thật từ CSDL truyền lên các thẻ (Cards) giao diện
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<BookingDashboardDTO> allBookings = bookingRepository.findDashboardBookings();
        
        long totalBookings = allBookings.size();
        long pendingBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count();
        BigDecimal totalRevenue = bookingRepository.calculateTotalConfirmedRevenue();
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
            @RequestParam BookingStatus status) {
        
        Booking booking = bookingRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt tour hợp lệ"));
        
        booking.setStatus(status);
        bookingRepository.save(booking);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái đơn đặt tour thành công!");
        return ResponseEntity.ok(response);
    }
}