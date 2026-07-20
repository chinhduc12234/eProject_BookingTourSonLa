package com.bookingtoursonla.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class AdminStatisticsResponse {

    private Integer year;

    private Integer month;

    private LocalDate periodStart;

    private LocalDate periodEnd;

    private BigDecimal receivedRevenue;

    private BigDecimal totalBookingValue;

    private BigDecimal remainingRevenue;

    private BigDecimal averageBookingValue;

    /** Giá trị đơn đã bị hủy trong kỳ, dùng để đối soát với tổng đơn phát sinh. */
    private BigDecimal cancelledBookingValue;

    /** Tổng tiền đang chờ xác nhận thanh toán. Không cộng vào doanh thu đã ghi nhận. */
    private BigDecimal pendingReviewAmount;

    /** Tổng tiền đã hoàn cho các booking phát sinh trong kỳ. */
    private BigDecimal refundedAmount;

    private Long totalBookings;

    private Long activeBookings;

    private Long cancelledBookings;

    private Long customerCount;

    private Long cancelledCustomerCount;

    private Long fullPaymentCount;

    private Long depositPaymentCount;

    private Long unpaidCount;

    private Long pendingReviewCount;

    private Integer fullPaymentPercent;

    private Integer depositPaymentPercent;

    private Long pendingBookings;

    private Long confirmedBookings;

    private Long totalDepartures;

    private Long upcomingTours;

    private Long inProgressTours;

    private Long completedTours;

    private Integer completionRate;

    private List<BreakdownItem> statusBreakdown;

    private List<BreakdownItem> paymentBreakdown;

    private List<TopTourStat> topTours;

    private List<RecentBookingStat> recentBookings;

    /** Các hàng đợi điều hành theo trạng thái booking để admin mở nhanh danh sách cần xử lý. */
    private List<ManagementQueue> managementQueues;

    private Long totalStaffCount;

    private Long assignedStaffCount;

    private Long runningStaffCount;

    private Long unassignedStaffCount;

    private Long assignedBookingCount;

    private Long unassignedBookingCount;

    private List<EmployeeStat> employeeStats;

    @Data
    public static class BreakdownItem {

        private String key;

        private String label;

        private Long count;

        private Integer percent;

        private BigDecimal amount;
    }

    @Data
    public static class TopTourStat {

        private Long tourId;

        private String tourName;

        private Long bookingCount;

        private Long customerCount;

        private BigDecimal revenue;

        private Integer percent;
    }

    @Data
    public static class RecentBookingStat {

        private Long id;

        private String bookingCode;

        private String customerName;

        private String tourName;

        private Boolean privateDeparture;

        private Integer totalPeople;

        private BigDecimal totalPrice;

        private BigDecimal paidAmount;

        private BigDecimal remainingAmount;

        private BigDecimal refundedAmount;

        private String status;

        private String paymentStatus;

        private String paymentPlan;

        private LocalDateTime bookedAt;

        private LocalDate departureDate;
    }

    @Data
    public static class ManagementQueue {

        private String key;

        private String label;

        private Long count;

        private Integer percent;

        private Long customerCount;

        private BigDecimal totalValue;

        private List<TourManagementItem> items;
    }

    @Data
    public static class TourManagementItem {

        private Long bookingId;

        private String bookingCode;

        private Long tourId;

        private String tourName;

        private Long departureId;

        private LocalDate departureDate;

        private String customerName;

        private Integer totalPeople;

        private BigDecimal totalPrice;

        private String status;

        private Boolean privateDeparture;

        private Long assignedStaffCount;

        private List<String> assignedStaffNames;
    }

    @Data
    public static class EmployeeStat {

        private Long employeeId;

        private String fullName;

        private String email;

        private String phone;

        private Boolean active;

        private Long assignedBookingCount;

        private Long runningBookingCount;

        private Long upcomingBookingCount;

        private Long completedBookingCount;

        private List<String> assignedTourNames;

        private List<String> runningTourNames;
    }
}
