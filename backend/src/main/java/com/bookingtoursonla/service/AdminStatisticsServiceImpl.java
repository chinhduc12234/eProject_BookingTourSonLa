package com.bookingtoursonla.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookingtoursonla.dto.AdminStatisticsResponse;
import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourDeparture;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.entity.enums.PaymentStatus;
import com.bookingtoursonla.repository.BookingRepository;

@Service
public class AdminStatisticsServiceImpl implements AdminStatisticsService {

    private static final Map<BookingStatus, String> BOOKING_STATUS_LABELS = Map.of(
            BookingStatus.PENDING, "Chờ xác nhận",
            BookingStatus.CONFIRMED, "Đã xác nhận",
            BookingStatus.IN_PROGRESS, "Đang chạy",
            BookingStatus.COMPLETED, "Hoàn thành",
            BookingStatus.CANCELLED, "Đã hủy");

    private static final Map<String, String> PAYMENT_PLAN_LABELS = Map.of(
            "FULL", "Thanh toán toàn bộ",
            "DEPOSIT", "Thanh toán đặt cọc",
            "UNPAID", "Chưa thanh toán",
            "PENDING_REVIEW", "Chờ kiểm tra");

    private final BookingRepository bookingRepository;

    public AdminStatisticsServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatisticsResponse getMonthlyStatistics(int year, int month) {

        YearMonth selectedMonth = YearMonth.of(year, month);
        LocalDate periodStart = selectedMonth.atDay(1);
        LocalDate periodEnd = selectedMonth.plusMonths(1).atDay(1);
        LocalDateTime bookedStart = periodStart.atStartOfDay();
        LocalDateTime bookedEnd = periodEnd.atStartOfDay();

        List<Booking> monthlyBookings = bookingRepository.findStatisticsBookings(bookedStart, bookedEnd);
        List<Booking> monthlyDepartures = bookingRepository.findStatisticsDepartures(periodStart, periodEnd);
        List<Booking> activeBookings = monthlyBookings
                .stream()
                .filter(Predicate.not(this::isCancelled))
                .toList();

        BigDecimal totalBookingValue = sum(activeBookings, Booking::getTotalPrice);
        BigDecimal receivedRevenue = sum(activeBookings.stream().filter(this::hasRecognizedPayment).toList(),
                Booking::getPaidAmount);
        BigDecimal remainingRevenue = sum(activeBookings, Booking::getRemainingAmount);

        long fullPaymentCount = activeBookings.stream().filter(this::isFullPayment).count();
        long depositPaymentCount = activeBookings.stream().filter(this::isDepositPayment).count();
        long paidPlanTotal = fullPaymentCount + depositPaymentCount;

        long totalBookings = monthlyBookings.size();
        long activeBookingCount = activeBookings.size();
        long cancelledBookings = totalBookings - activeBookingCount;
        long customerCount = activeBookings.stream().mapToLong(this::totalPeople).sum();

        long inProgressTours = monthlyDepartures.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.IN_PROGRESS)
                .count();
        long completedTours = monthlyDepartures.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED)
                .count();

        AdminStatisticsResponse response = new AdminStatisticsResponse();
        response.setYear(selectedMonth.getYear());
        response.setMonth(selectedMonth.getMonthValue());
        response.setPeriodStart(periodStart);
        response.setPeriodEnd(periodEnd.minusDays(1));
        response.setReceivedRevenue(receivedRevenue);
        response.setTotalBookingValue(totalBookingValue);
        response.setRemainingRevenue(remainingRevenue);
        response.setAverageBookingValue(divideMoney(totalBookingValue, activeBookingCount));
        response.setTotalBookings(totalBookings);
        response.setActiveBookings(activeBookingCount);
        response.setCancelledBookings(cancelledBookings);
        response.setCustomerCount(customerCount);
        response.setFullPaymentCount(fullPaymentCount);
        response.setDepositPaymentCount(depositPaymentCount);
        response.setUnpaidCount(activeBookings.stream().filter(this::isUnpaid).count());
        response.setPendingReviewCount(activeBookings.stream()
                .filter(booking -> booking.getPaymentStatus() == PaymentStatus.PENDING_REVIEW)
                .count());
        response.setFullPaymentPercent(percent(fullPaymentCount, paidPlanTotal));
        response.setDepositPaymentPercent(percent(depositPaymentCount, paidPlanTotal));
        response.setPendingBookings(countStatus(monthlyBookings, BookingStatus.PENDING));
        response.setConfirmedBookings(countStatus(monthlyBookings, BookingStatus.CONFIRMED));
        response.setInProgressTours(inProgressTours);
        response.setCompletedTours(completedTours);
        response.setCompletionRate(percent(completedTours, completedTours + inProgressTours));
        response.setStatusBreakdown(buildStatusBreakdown(monthlyBookings));
        response.setPaymentBreakdown(buildPaymentBreakdown(activeBookings));
        response.setTopTours(buildTopTours(activeBookings, receivedRevenue));
        response.setRecentBookings(buildRecentBookings(monthlyBookings));

        return response;
    }

    private List<AdminStatisticsResponse.BreakdownItem> buildStatusBreakdown(List<Booking> bookings) {

        long total = bookings.size();

        return List.of(
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                BookingStatus.IN_PROGRESS,
                BookingStatus.COMPLETED,
                BookingStatus.CANCELLED)
                .stream()
                .map(status -> breakdownItem(
                        status.name(),
                        BOOKING_STATUS_LABELS.get(status),
                        countStatus(bookings, status),
                        total,
                        BigDecimal.ZERO))
                .toList();
    }

    private List<AdminStatisticsResponse.BreakdownItem> buildPaymentBreakdown(List<Booking> activeBookings) {

        long full = activeBookings.stream().filter(this::isFullPayment).count();
        long deposit = activeBookings.stream().filter(this::isDepositPayment).count();
        long pendingReview = activeBookings.stream()
                .filter(booking -> booking.getPaymentStatus() == PaymentStatus.PENDING_REVIEW)
                .count();
        long unpaid = activeBookings.stream().filter(this::isUnpaid).count();
        long total = activeBookings.size();

        return List.of(
                breakdownItem("FULL", PAYMENT_PLAN_LABELS.get("FULL"), full, total, sumByPlan(activeBookings, "FULL")),
                breakdownItem("DEPOSIT", PAYMENT_PLAN_LABELS.get("DEPOSIT"), deposit, total,
                        sumByPlan(activeBookings, "DEPOSIT")),
                breakdownItem("PENDING_REVIEW", PAYMENT_PLAN_LABELS.get("PENDING_REVIEW"), pendingReview, total,
                        BigDecimal.ZERO),
                breakdownItem("UNPAID", PAYMENT_PLAN_LABELS.get("UNPAID"), unpaid, total, BigDecimal.ZERO));
    }

    private List<AdminStatisticsResponse.TopTourStat> buildTopTours(
            List<Booking> activeBookings,
            BigDecimal receivedRevenue) {

        Map<Long, List<Booking>> byTour = activeBookings
                .stream()
                .filter(booking -> booking.getTourDeparture() != null
                        && booking.getTourDeparture().getTour() != null)
                .collect(Collectors.groupingBy(
                        booking -> booking.getTourDeparture().getTour().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        return byTour.values()
                .stream()
                .map(bookings -> {
                    Booking first = bookings.getFirst();
                    Tour tour = first.getTourDeparture().getTour();
                    BigDecimal revenue = sum(bookings.stream().filter(this::hasRecognizedPayment).toList(),
                            Booking::getPaidAmount);

                    AdminStatisticsResponse.TopTourStat item = new AdminStatisticsResponse.TopTourStat();
                    item.setTourId(tour.getId());
                    item.setTourName(tour.getTitle());
                    item.setBookingCount((long) bookings.size());
                    item.setCustomerCount(bookings.stream().mapToLong(this::totalPeople).sum());
                    item.setRevenue(revenue);
                    item.setPercent(percent(revenue, receivedRevenue));

                    return item;
                })
                .sorted(Comparator.comparing(AdminStatisticsResponse.TopTourStat::getRevenue).reversed())
                .limit(6)
                .toList();
    }

    private List<AdminStatisticsResponse.RecentBookingStat> buildRecentBookings(List<Booking> monthlyBookings) {

        return monthlyBookings
                .stream()
                .sorted(Comparator.comparing(Booking::getBookedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .map(booking -> {
                    TourDeparture departure = booking.getTourDeparture();
                    Tour tour = departure != null ? departure.getTour() : null;

                    AdminStatisticsResponse.RecentBookingStat item =
                            new AdminStatisticsResponse.RecentBookingStat();
                    item.setId(booking.getId());
                    item.setBookingCode(booking.getBookingCode());
                    item.setCustomerName(booking.getFullName());
                    item.setTourName(tour != null ? tour.getTitle() : "Tour chưa cập nhật");
                    item.setTotalPeople(booking.getTotalPeople());
                    item.setTotalPrice(valueOrZero(booking.getTotalPrice()));
                    item.setPaidAmount(valueOrZero(booking.getPaidAmount()));
                    item.setStatus(booking.getStatus() != null ? booking.getStatus().name() : null);
                    item.setPaymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus().name() : null);
                    item.setPaymentPlan(booking.getPaymentPlan());
                    item.setBookedAt(booking.getBookedAt());
                    item.setDepartureDate(departure != null ? departure.getDepartureDate() : null);

                    return item;
                })
                .toList();
    }

    private AdminStatisticsResponse.BreakdownItem breakdownItem(
            String key,
            String label,
            long count,
            long total,
            BigDecimal amount) {

        AdminStatisticsResponse.BreakdownItem item = new AdminStatisticsResponse.BreakdownItem();
        item.setKey(key);
        item.setLabel(label);
        item.setCount(count);
        item.setPercent(percent(count, total));
        item.setAmount(amount);

        return item;
    }

    private long countStatus(List<Booking> bookings, BookingStatus status) {

        return bookings.stream().filter(booking -> booking.getStatus() == status).count();
    }

    private BigDecimal sumByPlan(List<Booking> bookings, String paymentPlan) {

        return sum(
                bookings.stream()
                        .filter(booking -> paymentPlan.equalsIgnoreCase(booking.getPaymentPlan()))
                        .filter(this::hasRecognizedPayment)
                        .toList(),
                Booking::getPaidAmount);
    }

    private BigDecimal sum(List<Booking> bookings, java.util.function.Function<Booking, BigDecimal> extractor) {

        return bookings
                .stream()
                .map(extractor)
                .map(this::valueOrZero)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean isCancelled(Booking booking) {

        return booking.getStatus() == BookingStatus.CANCELLED;
    }

    private boolean isFullPayment(Booking booking) {

        return "FULL".equalsIgnoreCase(booking.getPaymentPlan()) && hasRecognizedPayment(booking);
    }

    private boolean isDepositPayment(Booking booking) {

        return "DEPOSIT".equalsIgnoreCase(booking.getPaymentPlan()) && hasRecognizedPayment(booking);
    }

    private boolean isUnpaid(Booking booking) {

        return booking.getPaymentStatus() == PaymentStatus.UNPAID
                || booking.getPaymentStatus() == PaymentStatus.FAILED
                || valueOrZero(booking.getPaidAmount()).compareTo(BigDecimal.ZERO) <= 0;
    }

    private boolean hasRecognizedPayment(Booking booking) {

        if (booking.getPaymentStatus() == null) {
            return false;
        }

        return switch (booking.getPaymentStatus()) {
            case PAID, PARTIAL, PENDING_REVIEW -> valueOrZero(booking.getPaidAmount()).compareTo(BigDecimal.ZERO) > 0;
            default -> false;
        };
    }

    private long totalPeople(Booking booking) {

        return booking.getTotalPeople() == null ? 0L : booking.getTotalPeople();
    }

    private BigDecimal divideMoney(BigDecimal value, long divisor) {

        if (divisor <= 0) {
            return BigDecimal.ZERO;
        }

        return valueOrZero(value).divide(BigDecimal.valueOf(divisor), 0, RoundingMode.HALF_UP);
    }

    private Integer percent(long value, long total) {

        if (total <= 0) {
            return 0;
        }

        return BigDecimal.valueOf(value)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), 0, RoundingMode.HALF_UP)
                .intValue();
    }

    private Integer percent(BigDecimal value, BigDecimal total) {

        if (total == null || total.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }

        return valueOrZero(value)
                .multiply(BigDecimal.valueOf(100))
                .divide(total, 0, RoundingMode.HALF_UP)
                .intValue();
    }

    private BigDecimal valueOrZero(BigDecimal value) {

        return value == null ? BigDecimal.ZERO : value;
    }
}
