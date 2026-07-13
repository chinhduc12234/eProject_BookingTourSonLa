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

    private Long totalBookings;

    private Long activeBookings;

    private Long cancelledBookings;

    private Long customerCount;

    private Long fullPaymentCount;

    private Long depositPaymentCount;

    private Long unpaidCount;

    private Long pendingReviewCount;

    private Integer fullPaymentPercent;

    private Integer depositPaymentPercent;

    private Long pendingBookings;

    private Long confirmedBookings;

    private Long inProgressTours;

    private Long completedTours;

    private Integer completionRate;

    private List<BreakdownItem> statusBreakdown;

    private List<BreakdownItem> paymentBreakdown;

    private List<TopTourStat> topTours;

    private List<RecentBookingStat> recentBookings;

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

        private String status;

        private String paymentStatus;

        private String paymentPlan;

        private LocalDateTime bookedAt;

        private LocalDate departureDate;
    }
}
