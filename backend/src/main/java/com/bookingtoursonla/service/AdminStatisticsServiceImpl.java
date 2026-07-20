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
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookingtoursonla.dto.AdminStatisticsResponse;
import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.BookingEmployee;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourDeparture;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.entity.enums.BookingType;
import com.bookingtoursonla.entity.enums.PaymentStatus;
import com.bookingtoursonla.repository.BookingRepository;
import com.bookingtoursonla.repository.BookingEmployeeRepository;
import com.bookingtoursonla.repository.UserRepository;

@Service
public class AdminStatisticsServiceImpl implements AdminStatisticsService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private static final Map<BookingStatus, String> BOOKING_STATUS_LABELS = Map.of(
            BookingStatus.PENDING, "Chờ xác nhận",
            BookingStatus.CONFIRMED, "Đã xác nhận",
            BookingStatus.IN_PROGRESS, "Đang chạy",
            BookingStatus.COMPLETED, "Hoàn thành",
            BookingStatus.CANCELLED, "Đã hủy");

    private static final Map<String, String> PAYMENT_LABELS = Map.of(
            "FULL", "Đã thanh toán đủ",
            "DEPOSIT", "Đã đặt cọc",
            "PENDING_REVIEW", "Chờ kiểm tra",
            "UNPAID", "Chưa thanh toán",
            "REFUNDED", "Đã hoàn tiền");

    private final BookingRepository bookingRepository;

    private final BookingEmployeeRepository bookingEmployeeRepository;

    private final UserRepository userRepository;

    public AdminStatisticsServiceImpl(
            BookingRepository bookingRepository,
            BookingEmployeeRepository bookingEmployeeRepository,
            UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingEmployeeRepository = bookingEmployeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatisticsResponse getMonthlyStatistics(int year, int month) {

        YearMonth selectedMonth = YearMonth.of(year, month);
        LocalDate periodStart = selectedMonth.atDay(1);
        LocalDate periodEnd = selectedMonth.plusMonths(1).atDay(1);
        LocalDateTime bookedStart = periodStart.atStartOfDay();
        LocalDateTime bookedEnd = periodEnd.atStartOfDay();

        // Đơn phát sinh được lọc theo bookedAt; lịch khởi hành được lọc theo departureDate.
        List<Booking> monthlyBookings = bookingRepository.findStatisticsBookings(bookedStart, bookedEnd);
        List<Booking> activeBookings = monthlyBookings.stream()
                .filter(booking -> !isCancelled(booking))
                .toList();
        List<Booking> cancelledBookings = monthlyBookings.stream()
                .filter(this::isCancelled)
                .toList();

        List<Long> monthlyBookingIds = monthlyBookings.stream()
                .map(Booking::getId)
                .filter(id -> id != null)
                .toList();
        List<BookingEmployee> assignments = monthlyBookingIds.isEmpty()
                ? List.of()
                : bookingEmployeeRepository.findStatisticsAssignments(monthlyBookingIds);
        Map<Long, List<BookingEmployee>> assignmentsByBooking = assignments.stream()
                .collect(Collectors.groupingBy(
                        assignment -> assignment.getBooking().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));
        List<User> staff = userRepository.findAllActiveStaff();

        BigDecimal totalBookingValue = sum(activeBookings, Booking::getTotalPrice);
        BigDecimal receivedRevenue = sum(activeBookings, this::recognizedPaymentAmount);
        BigDecimal remainingRevenue = sum(activeBookings, this::outstandingAmount);
        BigDecimal cancelledBookingValue = sum(cancelledBookings, Booking::getTotalPrice);
        BigDecimal pendingReviewAmount = sum(
                activeBookings.stream()
                        .filter(booking -> booking.getPaymentStatus() == PaymentStatus.PENDING_REVIEW)
                        .toList(),
                Booking::getPaidAmount);
        BigDecimal refundedAmount = sum(monthlyBookings, Booking::getRefundedAmount);

        long totalBookings = monthlyBookings.size();
        long activeBookingCount = activeBookings.size();
        long cancelledBookingCount = cancelledBookings.size();
        long customerCount = activeBookings.stream().mapToLong(this::totalPeople).sum();
        long cancelledCustomerCount = cancelledBookings.stream().mapToLong(this::totalPeople).sum();

        long fullPaymentCount = activeBookings.stream().filter(this::isFullPayment).count();
        long depositPaymentCount = activeBookings.stream().filter(this::isDepositPayment).count();

        // Một departure có thể có nhiều booking, vì vậy phải loại trùng trước khi đếm tiến độ tour.
        List<TourDeparture> departures = uniqueDepartures(
                bookingRepository.findStatisticsDepartures(periodStart, periodEnd).stream()
                        .filter(booking -> !isCancelled(booking))
                        .toList());
        long upcomingTours = departures.stream().filter(departure -> departureProgress(departure) == DepartureProgress.UPCOMING)
                .count();
        long inProgressTours = departures.stream()
                .filter(departure -> departureProgress(departure) == DepartureProgress.IN_PROGRESS)
                .count();
        long completedTours = departures.stream()
                .filter(departure -> departureProgress(departure) == DepartureProgress.COMPLETED)
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
        response.setCancelledBookingValue(cancelledBookingValue);
        response.setPendingReviewAmount(pendingReviewAmount);
        response.setRefundedAmount(refundedAmount);
        response.setTotalBookings(totalBookings);
        response.setActiveBookings(activeBookingCount);
        response.setCancelledBookings(cancelledBookingCount);
        response.setCustomerCount(customerCount);
        response.setCancelledCustomerCount(cancelledCustomerCount);
        response.setFullPaymentCount(fullPaymentCount);
        response.setDepositPaymentCount(depositPaymentCount);
        response.setUnpaidCount(activeBookings.stream().filter(this::isUnpaid).count());
        response.setPendingReviewCount(activeBookings.stream().filter(this::isPendingReview).count());
        response.setFullPaymentPercent(percent(fullPaymentCount, activeBookingCount));
        response.setDepositPaymentPercent(percent(depositPaymentCount, activeBookingCount));
        response.setPendingBookings(countStatus(monthlyBookings, BookingStatus.PENDING));
        response.setConfirmedBookings(countStatus(monthlyBookings, BookingStatus.CONFIRMED));
        response.setTotalDepartures((long) departures.size());
        response.setUpcomingTours(upcomingTours);
        response.setInProgressTours(inProgressTours);
        response.setCompletedTours(completedTours);
        response.setCompletionRate(percent(completedTours, departures.size()));
        response.setStatusBreakdown(buildStatusBreakdown(monthlyBookings));
        response.setPaymentBreakdown(buildPaymentBreakdown(activeBookings));
        response.setTopTours(buildTopTours(activeBookings, receivedRevenue));
        response.setRecentBookings(buildRecentBookings(monthlyBookings));
        response.setManagementQueues(buildManagementQueues(monthlyBookings, assignmentsByBooking));
        List<AdminStatisticsResponse.EmployeeStat> employeeStats = buildEmployeeStats(staff, assignments);
        long assignedStaffCount = employeeStats.stream()
                .filter(item -> item.getAssignedBookingCount() != null && item.getAssignedBookingCount() > 0)
                .count();
        long runningStaffCount = employeeStats.stream()
                .filter(item -> item.getRunningBookingCount() != null && item.getRunningBookingCount() > 0)
                .count();
        response.setTotalStaffCount((long) staff.size());
        response.setAssignedStaffCount(assignedStaffCount);
        response.setRunningStaffCount(runningStaffCount);
        response.setUnassignedStaffCount(Math.max(0, staff.size() - assignedStaffCount));
        response.setAssignedBookingCount(activeBookings.stream()
                .filter(booking -> !assignmentsFor(booking, assignmentsByBooking).isEmpty())
                .count());
        response.setUnassignedBookingCount(activeBookings.stream()
                .filter(booking -> assignmentsFor(booking, assignmentsByBooking).isEmpty())
                .count());
        response.setEmployeeStats(employeeStats);

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
                        sum(bookings.stream()
                                .filter(booking -> booking.getStatus() == status)
                                .toList(), Booking::getTotalPrice)))
                .toList();
    }

    private List<AdminStatisticsResponse.BreakdownItem> buildPaymentBreakdown(List<Booking> activeBookings) {

        long total = activeBookings.size();
        long full = activeBookings.stream().filter(this::isFullPayment).count();
        long deposit = activeBookings.stream().filter(this::isDepositPayment).count();
        long pendingReview = activeBookings.stream().filter(this::isPendingReview).count();
        long unpaid = activeBookings.stream().filter(this::isUnpaid).count();
        long refunded = activeBookings.stream().filter(this::isRefunded).count();

        return List.of(
                breakdownItem("FULL", PAYMENT_LABELS.get("FULL"), full, total, sumByPayment(activeBookings, "FULL")),
                breakdownItem("DEPOSIT", PAYMENT_LABELS.get("DEPOSIT"), deposit, total,
                        sumByPayment(activeBookings, "DEPOSIT")),
                breakdownItem("PENDING_REVIEW", PAYMENT_LABELS.get("PENDING_REVIEW"), pendingReview, total,
                        sum(activeBookings.stream().filter(this::isPendingReview).toList(), Booking::getPaidAmount)),
                breakdownItem("UNPAID", PAYMENT_LABELS.get("UNPAID"), unpaid, total, ZERO),
                breakdownItem("REFUNDED", PAYMENT_LABELS.get("REFUNDED"), refunded, total,
                        sum(activeBookings.stream().filter(this::isRefunded).toList(), Booking::getRefundedAmount)));
    }

    private List<AdminStatisticsResponse.TopTourStat> buildTopTours(
            List<Booking> activeBookings,
            BigDecimal receivedRevenue) {

        Map<Long, List<Booking>> byTour = activeBookings.stream()
                .filter(booking -> booking.getTourDeparture() != null
                        && booking.getTourDeparture().getTour() != null)
                .collect(Collectors.groupingBy(
                        booking -> booking.getTourDeparture().getTour().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        return byTour.values().stream()
                .map(bookings -> {
                    Booking first = bookings.getFirst();
                    Tour tour = first.getTourDeparture().getTour();
                    BigDecimal revenue = sum(bookings, this::recognizedPaymentAmount);

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

        return monthlyBookings.stream()
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
                    item.setPrivateDeparture(
                            departure != null && Boolean.TRUE.equals(departure.getIsPrivateDeparture()));
                    item.setTotalPeople(booking.getTotalPeople());
                    item.setTotalPrice(valueOrZero(booking.getTotalPrice()));
                    item.setPaidAmount(valueOrZero(booking.getPaidAmount()));
                    item.setRemainingAmount(outstandingAmount(booking));
                    item.setRefundedAmount(valueOrZero(booking.getRefundedAmount()));
                    item.setStatus(booking.getStatus() != null ? booking.getStatus().name() : null);
                    item.setPaymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus().name() : null);
                    item.setPaymentPlan(booking.getPaymentPlan());
                    item.setBookedAt(booking.getBookedAt());
                    item.setDepartureDate(departure != null ? departure.getDepartureDate() : null);
                    return item;
                })
                .toList();
    }

    private List<AdminStatisticsResponse.ManagementQueue> buildManagementQueues(
            List<Booking> bookings,
            Map<Long, List<BookingEmployee>> assignmentsByBooking) {

        long total = bookings.size();

        return List.of(
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                BookingStatus.IN_PROGRESS,
                BookingStatus.COMPLETED,
                BookingStatus.CANCELLED)
                .stream()
                .map(status -> {
                    List<Booking> matchingBookings = bookings.stream()
                            .filter(booking -> booking.getStatus() == status)
                            .sorted(Comparator.comparing(
                                    (Booking booking) -> booking.getTourDeparture() != null
                                            ? booking.getTourDeparture().getDepartureDate()
                                            : null,
                                    Comparator.nullsLast(Comparator.naturalOrder())))
                            .toList();

                    AdminStatisticsResponse.ManagementQueue queue =
                            new AdminStatisticsResponse.ManagementQueue();
                    queue.setKey(status.name());
                    queue.setLabel(BOOKING_STATUS_LABELS.get(status));
                    queue.setCount((long) matchingBookings.size());
                    queue.setPercent(percent(matchingBookings.size(), total));
                    queue.setCustomerCount(matchingBookings.stream().mapToLong(this::totalPeople).sum());
                    queue.setTotalValue(sum(matchingBookings, Booking::getTotalPrice));
                    queue.setItems(matchingBookings.stream()
                            .limit(20)
                            .map(booking -> toManagementItem(
                                    booking,
                                    assignmentsFor(booking, assignmentsByBooking)))
                            .toList());
                    return queue;
                })
                .toList();
    }

    private AdminStatisticsResponse.TourManagementItem toManagementItem(
            Booking booking,
            List<BookingEmployee> assignments) {

        TourDeparture departure = booking.getTourDeparture();
        Tour tour = departure != null ? departure.getTour() : null;

        AdminStatisticsResponse.TourManagementItem item =
                new AdminStatisticsResponse.TourManagementItem();
        item.setBookingId(booking.getId());
        item.setBookingCode(booking.getBookingCode());
        item.setTourId(tour != null ? tour.getId() : null);
        item.setTourName(tour != null ? tour.getTitle() : "Tour chưa cập nhật");
        item.setDepartureId(departure != null ? departure.getId() : null);
        item.setDepartureDate(departure != null ? departure.getDepartureDate() : null);
        item.setCustomerName(booking.getFullName());
        item.setTotalPeople(booking.getTotalPeople());
        item.setTotalPrice(valueOrZero(booking.getTotalPrice()));
        item.setStatus(booking.getStatus() != null ? booking.getStatus().name() : null);
        item.setPrivateDeparture(
                booking.getBookingType() == BookingType.PRIVATE
                        || departure != null && Boolean.TRUE.equals(departure.getIsPrivateDeparture()));
        item.setAssignedStaffCount((long) assignments.size());
        item.setAssignedStaffNames(assignments.stream()
                .map(BookingEmployee::getEmployee)
                .filter(employee -> employee != null)
                .map(User::getFullName)
                .distinct()
                .toList());
        return item;
    }

    private List<AdminStatisticsResponse.EmployeeStat> buildEmployeeStats(
            List<User> staff,
            List<BookingEmployee> assignments) {

        Map<Long, List<BookingEmployee>> assignmentsByEmployee = assignments.stream()
                .collect(Collectors.groupingBy(
                        assignment -> assignment.getEmployee().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        return staff.stream()
                .map(employee -> {
                    List<Booking> assignedBookings = assignmentsByEmployee
                            .getOrDefault(employee.getId(), List.of())
                            .stream()
                            .map(BookingEmployee::getBooking)
                            .filter(booking -> booking != null && !isCancelled(booking))
                            .collect(Collectors.toMap(
                                    Booking::getId,
                                    Function.identity(),
                                    (first, ignored) -> first,
                                    LinkedHashMap::new))
                            .values()
                            .stream()
                            .toList();

                    AdminStatisticsResponse.EmployeeStat item =
                            new AdminStatisticsResponse.EmployeeStat();
                    item.setEmployeeId(employee.getId());
                    item.setFullName(employee.getFullName());
                    item.setEmail(employee.getEmail());
                    item.setPhone(employee.getPhone());
                    item.setActive(Boolean.TRUE.equals(employee.getIsActive()));
                    item.setAssignedBookingCount((long) assignedBookings.size());
                    item.setRunningBookingCount(assignedBookings.stream()
                            .filter(booking -> booking.getStatus() == BookingStatus.IN_PROGRESS)
                            .count());
                    item.setUpcomingBookingCount(assignedBookings.stream()
                            .filter(booking -> booking.getStatus() == BookingStatus.PENDING
                                    || booking.getStatus() == BookingStatus.CONFIRMED)
                            .count());
                    item.setCompletedBookingCount(assignedBookings.stream()
                            .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED)
                            .count());
                    item.setAssignedTourNames(assignedBookings.stream()
                            .map(Booking::getTourDeparture)
                            .filter(departure -> departure != null && departure.getTour() != null)
                            .map(departure -> departure.getTour().getTitle())
                            .distinct()
                            .toList());
                    item.setRunningTourNames(assignedBookings.stream()
                            .filter(booking -> booking.getStatus() == BookingStatus.IN_PROGRESS)
                            .map(Booking::getTourDeparture)
                            .filter(departure -> departure != null && departure.getTour() != null)
                            .map(departure -> departure.getTour().getTitle())
                            .distinct()
                            .toList());
                    return item;
                })
                .toList();
    }

    private List<BookingEmployee> assignmentsFor(
            Booking booking,
            Map<Long, List<BookingEmployee>> assignmentsByBooking) {

        return assignmentsByBooking.getOrDefault(booking.getId(), List.of());
    }

    private List<TourDeparture> uniqueDepartures(List<Booking> bookings) {

        return bookings.stream()
                .map(Booking::getTourDeparture)
                .filter(departure -> departure != null && departure.getId() != null)
                .collect(Collectors.toMap(
                        TourDeparture::getId,
                        Function.identity(),
                        (first, ignored) -> first,
                        LinkedHashMap::new))
                .values()
                .stream()
                .toList();
    }

    private DepartureProgress departureProgress(TourDeparture departure) {

        LocalDate departureDate = departure.getDepartureDate();
        if (departureDate == null) {
            return DepartureProgress.UPCOMING;
        }

        LocalDate today = LocalDate.now();
        int durationDays = departure.getTour() != null && departure.getTour().getDurationDays() != null
                ? Math.max(departure.getTour().getDurationDays(), 1)
                : 1;
        LocalDate endDateExclusive = departureDate.plusDays(durationDays);

        if (today.isBefore(departureDate)) {
            return DepartureProgress.UPCOMING;
        }
        if (today.isBefore(endDateExclusive)) {
            return DepartureProgress.IN_PROGRESS;
        }
        return DepartureProgress.COMPLETED;
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
        item.setAmount(valueOrZero(amount));
        return item;
    }

    private long countStatus(List<Booking> bookings, BookingStatus status) {

        return bookings.stream().filter(booking -> booking.getStatus() == status).count();
    }

    private BigDecimal sumByPayment(List<Booking> bookings, String paymentPlan) {

        return sum(bookings.stream()
                .filter(booking -> paymentPlan.equalsIgnoreCase(booking.getPaymentPlan()))
                .toList(), this::recognizedPaymentAmount);
    }

    private BigDecimal sum(List<Booking> bookings, Function<Booking, BigDecimal> extractor) {

        return bookings.stream()
                .map(extractor)
                .map(this::valueOrZero)
                .reduce(ZERO, BigDecimal::add);
    }

    private boolean isCancelled(Booking booking) {

        return booking != null && booking.getStatus() == BookingStatus.CANCELLED;
    }

    private boolean isFullPayment(Booking booking) {

        return "FULL".equalsIgnoreCase(booking.getPaymentPlan())
                && hasRecognizedPayment(booking);
    }

    private boolean isDepositPayment(Booking booking) {

        return "DEPOSIT".equalsIgnoreCase(booking.getPaymentPlan())
                && hasRecognizedPayment(booking);
    }

    private boolean isPendingReview(Booking booking) {

        return booking.getPaymentStatus() == PaymentStatus.PENDING_REVIEW;
    }

    private boolean isRefunded(Booking booking) {

        return booking.getPaymentStatus() == PaymentStatus.REFUNDED
                || booking.getPaymentStatus() == PaymentStatus.PARTIALLY_REFUNDED;
    }

    private boolean isUnpaid(Booking booking) {

        return !isPendingReview(booking)
                && !isRefunded(booking)
                && recognizedPaymentAmount(booking).compareTo(ZERO) <= 0;
    }

    private boolean hasRecognizedPayment(Booking booking) {

        return recognizedPaymentAmount(booking).compareTo(ZERO) > 0;
    }

    /** Chỉ tính tiền đã được xác nhận; giao dịch pending không làm tăng doanh thu. */
    private BigDecimal recognizedPaymentAmount(Booking booking) {

        if (booking == null || booking.getPaymentStatus() == null) {
            return ZERO;
        }

        boolean recognized = switch (booking.getPaymentStatus()) {
            case PAID, PARTIAL, PARTIALLY_REFUNDED, FORFEITED -> true;
            default -> false;
        };
        if (!recognized) {
            return ZERO;
        }

        return valueOrZero(booking.getPaidAmount())
                .subtract(valueOrZero(booking.getRefundedAmount()))
                .max(ZERO);
    }

    private BigDecimal outstandingAmount(Booking booking) {

        return valueOrZero(booking.getTotalPrice())
                .subtract(recognizedPaymentAmount(booking))
                .max(ZERO);
    }

    private long totalPeople(Booking booking) {

        return booking == null || booking.getTotalPeople() == null ? 0L : booking.getTotalPeople();
    }

    private BigDecimal divideMoney(BigDecimal value, long divisor) {

        if (divisor <= 0) {
            return ZERO;
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

        if (total == null || total.compareTo(ZERO) <= 0) {
            return 0;
        }
        return valueOrZero(value)
                .multiply(BigDecimal.valueOf(100))
                .divide(total, 0, RoundingMode.HALF_UP)
                .intValue();
    }

    private BigDecimal valueOrZero(BigDecimal value) {

        return value == null ? ZERO : value;
    }

    private enum DepartureProgress {
        UPCOMING,
        IN_PROGRESS,
        COMPLETED
    }
}
