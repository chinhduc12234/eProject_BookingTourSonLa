package com.bookingtoursonla.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookingtoursonla.dto.BookingCustomerRequest;
import com.bookingtoursonla.dto.BookingCustomerResponse;
import com.bookingtoursonla.dto.BookingDetailResponse;
import com.bookingtoursonla.dto.BookingResponse;
import com.bookingtoursonla.dto.BookingScheduleActivityResponse;
import com.bookingtoursonla.dto.BookingScheduleDayResponse;
import com.bookingtoursonla.dto.CancelBookingRequest;
import com.bookingtoursonla.dto.CreateBookingRequest;
import com.bookingtoursonla.dto.PayBookingRequest;
import com.bookingtoursonla.dto.UpdateBookingAdminRequest;
import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.BookingCustomer;
import com.bookingtoursonla.entity.BookingScheduleActivity;
import com.bookingtoursonla.entity.BookingScheduleDay;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourActivity;
import com.bookingtoursonla.entity.TourDay;
import com.bookingtoursonla.entity.TourDeparture;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.BookingCustomerType;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.entity.enums.BookingType;
import com.bookingtoursonla.entity.enums.DepartureStatus;
import com.bookingtoursonla.entity.enums.Gender;
import com.bookingtoursonla.entity.enums.PaymentStatus;
import com.bookingtoursonla.entity.enums.RoleName;
import com.bookingtoursonla.entity.enums.TourStatus;
import com.bookingtoursonla.repository.BookingCustomerRepository;
import com.bookingtoursonla.repository.BookingRepository;
import com.bookingtoursonla.repository.BookingScheduleActivityRepository;
import com.bookingtoursonla.repository.BookingScheduleDayRepository;
import com.bookingtoursonla.repository.TourActivityRepository;
import com.bookingtoursonla.repository.TourDayRepository;
import com.bookingtoursonla.repository.TourDepartureRepository;
import com.bookingtoursonla.repository.UserRepository;

@Service
public class BookingServiceImpl implements BookingService {

    private static final DateTimeFormatter BOOKING_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMdd");

    private static final BigDecimal DEPOSIT_RATE = new BigDecimal("0.30");

    private final BookingRepository bookingRepository;

    private final BookingCustomerRepository bookingCustomerRepository;

    private final BookingScheduleDayRepository bookingScheduleDayRepository;

    private final BookingScheduleActivityRepository bookingScheduleActivityRepository;

    private final TourDepartureRepository tourDepartureRepository;

    private final TourDayRepository tourDayRepository;

    private final TourActivityRepository tourActivityRepository;

    private final UserRepository userRepository;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            BookingCustomerRepository bookingCustomerRepository,
            BookingScheduleDayRepository bookingScheduleDayRepository,
            BookingScheduleActivityRepository bookingScheduleActivityRepository,
            TourDepartureRepository tourDepartureRepository,
            TourDayRepository tourDayRepository,
            TourActivityRepository tourActivityRepository,
            UserRepository userRepository) {

        this.bookingRepository = bookingRepository;
        this.bookingCustomerRepository = bookingCustomerRepository;
        this.bookingScheduleDayRepository = bookingScheduleDayRepository;
        this.bookingScheduleActivityRepository = bookingScheduleActivityRepository;
        this.tourDepartureRepository = tourDepartureRepository;
        this.tourDayRepository = tourDayRepository;
        this.tourActivityRepository = tourActivityRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(
            CreateBookingRequest request,
            String authenticatedEmail) {

        User user = requireAuthenticatedUser(authenticatedEmail);
        ensureCustomer(user);

        int adultCount = valueOrZero(request.getAdultCount());
        int childCount = valueOrZero(request.getChildCount());
        int totalPeople = adultCount + childCount;

        if (adultCount <= 0) {
            throw new RuntimeException("Booking phải có ít nhất 1 người lớn làm trưởng đoàn");
        }

        if (childCount < 0) {
            throw new RuntimeException("Số trẻ em không hợp lệ");
        }

        validateCustomerManifest(request, adultCount, childCount);

        TourDeparture departure = tourDepartureRepository
                .findByIdForUpdate(request.getDepartureId())
                .orElseThrow(() -> new RuntimeException("Lịch khởi hành không tồn tại"));

        Tour tour = departure.getTour();

        validateBookableDeparture(tour, departure, totalPeople);

        BigDecimal adultPrice = departure.getAdultPrice() != null
                ? departure.getAdultPrice()
                : tour.getPrice();

        BigDecimal childPrice = departure.getChildPrice() != null
                ? departure.getChildPrice()
                : adultPrice;

        BigDecimal totalPrice = adultPrice
                .multiply(BigDecimal.valueOf(adultCount))
                .add(childPrice.multiply(BigDecimal.valueOf(childCount)));

        BookingType bookingType = parseBookingType(request.getBookingType());
        validateBookingTypeInfo(bookingType, request);

        Booking booking = new Booking();

        booking.setBookingCode(generateBookingCode());
        booking.setUser(user);
        booking.setTourDeparture(departure);
        booking.setBookingType(bookingType);
        booking.setOrganizationName(trimToNull(request.getOrganizationName()));
        booking.setContactPerson(trimToNull(request.getContactPerson()));
        booking.setFullName(request.getFullName().trim());
        booking.setEmail(request.getEmail().trim());
        booking.setPhone(request.getPhone().trim());
        booking.setPickupAddress(trimToNull(request.getPickupAddress()));
        booking.setAdultCount(adultCount);
        booking.setChildCount(childCount);
        booking.setTotalPeople(totalPeople);
        booking.setAdultPriceSnapshot(adultPrice);
        booking.setChildPriceSnapshot(childPrice);
        booking.setTotalPrice(totalPrice);
        booking.setNote(trimToNull(request.getNote()));
        booking.setSpecialRequest(trimToNull(request.getSpecialRequest()));
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentStatus(PaymentStatus.UNPAID);
        booking.setPaymentDeadline(LocalDateTime.now().plusHours(24));
        booking.setDepositAmount(calculateDepositAmount(totalPrice));
        booking.setPaidAmount(BigDecimal.ZERO);
        booking.setRemainingAmount(totalPrice);
        booking.setRefundedAmount(BigDecimal.ZERO);

        departure.setReservedPeople(valueOrZero(departure.getReservedPeople()) + totalPeople);
        tourDepartureRepository.save(departure);

        Booking saved = bookingRepository.save(booking);

        saveBookingCustomers(saved, request);
        snapshotBookingSchedule(saved, tour);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String authenticatedEmail) {

        User user = requireAuthenticatedUser(authenticatedEmail);

        return bookingRepository
                .findByUserIdAndDeletedAtIsNullOrderByBookedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingDetail(
            Long id,
            String authenticatedEmail) {

        Booking booking = bookingRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        User user = requireAuthenticatedUser(authenticatedEmail);

        if (booking.getUser() == null || !booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xem booking này");
        }

        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(booking.getId());

        return mapToDetailResponse(booking, customers);
    }

    @Override
    @Transactional
    public BookingDetailResponse payBooking(
            Long id,
            PayBookingRequest request,
            String authenticatedEmail) {

        Booking booking = bookingRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        User user = requireAuthenticatedUser(authenticatedEmail);

        if (booking.getUser() == null || !booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền thanh toán booking này");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Đặt lịch đã hủy nên không thể thanh toán");
        }

        applyPayment(booking, request);

        Booking saved = bookingRepository.save(booking);

        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(saved.getId());

        return mapToDetailResponse(saved, customers);
    }

    @Override
    @Transactional
    public BookingDetailResponse cancelBooking(
            Long id,
            CancelBookingRequest request,
            String authenticatedEmail) {

        Booking booking = bookingRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        User user = requireAuthenticatedUser(authenticatedEmail);

        if (booking.getUser() == null || !booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy đặt lịch này");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking đã được hủy trước đó");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Booking đã hoàn thành nên không thể hủy");
        }

        if (booking.getPaymentStatus() == PaymentStatus.PENDING_REVIEW) {
            throw new RuntimeException("Thanh toán đang chờ xét duyệt, vui lòng chờ admin xử lý trước khi hủy đặt lịch");
        }

        applyBookingStatusTransition(booking, BookingStatus.CANCELLED, null);
        applyCancellationPaymentPolicy(booking);

        String reason = request != null ? trimToNull(request.getReason()) : null;
        if (reason != null) {
            String currentNote = trimToNull(booking.getInternalNote());
            booking.setInternalNote(
                    currentNote == null
                            ? "Khách hủy: " + reason
                            : currentNote + "\nKhách hủy: " + reason);
        }

        Booking saved = bookingRepository.save(booking);

        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(saved.getId());

        return mapToDetailResponse(saved, customers);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getAdminBookings(
            int page,
            int size,
            String keyword,
            String status,
            String paymentStatus) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("bookedAt").descending());

        BookingStatus bookingStatus = parseNullableBookingStatus(status);
        PaymentStatus payStatus = parseNullablePaymentStatus(paymentStatus);
        String normalizedKeyword = isBlank(keyword) ? null : keyword.trim();

        return bookingRepository
                .searchAdminBookings(
                        normalizedKeyword,
                        bookingStatus,
                        payStatus,
                        pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDetailResponse getAdminBookingDetail(Long id) {

        Booking booking = bookingRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(booking.getId());

        return mapToDetailResponse(booking, customers);
    }

    @Override
    @Transactional
    public BookingDetailResponse updateAdminBooking(
            Long id,
            UpdateBookingAdminRequest request,
            String adminEmail) {

        if (request == null) {
            request = new UpdateBookingAdminRequest();
        }

        Booking booking = bookingRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        if (request.getAssignedStaffId() != null) {
            User assignedStaff = requireActiveStaff(request.getAssignedStaffId());
            booking.setAssignedStaff(assignedStaff);
            booking.setAssignedAt(LocalDateTime.now());
        }

        if (request.getInternalNote() != null) {
            booking.setInternalNote(trimToNull(request.getInternalNote()));
        }

        PaymentStatus nextPaymentStatus = parseNullablePaymentStatus(request.getPaymentStatus());
        if (nextPaymentStatus != null) {
            applyAdminPaymentStatus(booking, nextPaymentStatus);
        }

        if (Boolean.TRUE.equals(request.getConfirmPayment())) {
            if (booking.getStatus() == BookingStatus.CANCELLED) {
                throw new RuntimeException("Đặt lịch đã hủy nên không thể duyệt thanh toán");
            }

            approvePendingPayment(booking);
        }

        if (Boolean.TRUE.equals(request.getConfirm())) {
            if (booking.getStatus() == BookingStatus.CANCELLED) {
                throw new RuntimeException("Đặt lịch đã hủy nên không thể xác nhận");
            }

            if (booking.getAssignedStaff() == null) {
                throw new RuntimeException("Vui lòng gán nhân viên phụ trách trước khi xác nhận tour");
            }

            if (booking.getStatus() != BookingStatus.CONFIRMED) {
                applyBookingStatusTransition(booking, BookingStatus.CONFIRMED, adminEmail);
            }
        }

        Booking saved = bookingRepository.save(booking);

        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(saved.getId());

        return mapToDetailResponse(saved, customers);
    }

    private void applyPayment(
            Booking booking,
            PayBookingRequest request) {

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Đặt lịch đã hủy nên không thể thanh toán");
        }

        ensurePaymentDefaults(booking);

        String paymentType = normalizePaymentType(request);

        if ("FULL".equals(paymentType)) {
            ensureCanCreatePaymentRequest(booking);
            booking.setPaymentPlan("FULL");
            booking.setPaymentMethod("BANK_TRANSFER_QR");
            booking.setRemainingPaymentMethod(null);
            booking.setPaidAmount(booking.getTotalPrice());
            booking.setRemainingAmount(BigDecimal.ZERO);
            booking.setPaymentStatus(PaymentStatus.PENDING_REVIEW);
            booking.setPaidAt(LocalDateTime.now());
            booking.setPaymentReference(generatePaymentReference(booking, "FULL"));
            return;
        }

        if ("DEPOSIT".equals(paymentType)) {
            ensureCanCreatePaymentRequest(booking);
            if (booking.getPaymentStatus() != PaymentStatus.UNPAID
                    && booking.getPaymentStatus() != PaymentStatus.FAILED) {
                throw new RuntimeException("Booking này đã có giao dịch thanh toán");
            }

            BigDecimal depositAmount = calculateDepositAmount(booking.getTotalPrice());

            booking.setPaymentPlan("DEPOSIT");
            booking.setPaymentMethod("BANK_TRANSFER_QR");
            booking.setRemainingPaymentMethod(resolveRemainingPaymentMethod(request));
            booking.setDepositAmount(depositAmount);
            booking.setPaidAmount(depositAmount);
            booking.setRemainingAmount(nonNegative(booking.getTotalPrice().subtract(depositAmount)));
            booking.setPaymentStatus(PaymentStatus.PENDING_REVIEW);
            booking.setPaidAt(LocalDateTime.now());
            booking.setPaymentReference(generatePaymentReference(booking, "DEP"));
            return;
        }

        if ("REMAINING".equals(paymentType)) {
            if (booking.getPaymentStatus() != PaymentStatus.PARTIAL) {
                throw new RuntimeException("Chỉ booking đã đặt cọc mới được thanh toán phần còn lại");
            }

            booking.setPaymentPlan("DEPOSIT");
            booking.setRemainingPaymentMethod("BANK_TRANSFER_QR");
            booking.setPaidAmount(booking.getTotalPrice());
            booking.setRemainingAmount(BigDecimal.ZERO);
            booking.setPaymentStatus(PaymentStatus.PENDING_REVIEW);
            booking.setPaidAt(LocalDateTime.now());
            booking.setPaymentReference(generatePaymentReference(booking, "REM"));
            return;
        }

        throw new RuntimeException("Phương thức thanh toán không hợp lệ");
    }

    private void ensureCanCreatePaymentRequest(Booking booking) {

        if (booking.getPaymentStatus() == PaymentStatus.PENDING_REVIEW) {
            throw new RuntimeException("Booking này đang chờ admin xét duyệt thanh toán");
        }

        if (booking.getPaymentStatus() != PaymentStatus.UNPAID
                && booking.getPaymentStatus() != PaymentStatus.FAILED) {
            throw new RuntimeException("Booking này đã có giao dịch thanh toán");
        }
    }

    private void applyAdminPaymentStatus(
            Booking booking,
            PaymentStatus nextPaymentStatus) {

        if (nextPaymentStatus == PaymentStatus.FAILED
                || nextPaymentStatus == PaymentStatus.UNPAID) {
            resetPendingPayment(booking, nextPaymentStatus);
            return;
        }

        if (nextPaymentStatus == PaymentStatus.PAID
                || nextPaymentStatus == PaymentStatus.PARTIAL) {
            throw new RuntimeException("Vui lòng dùng nút xác nhận thanh toán để chốt giao dịch");
        }

        throw new RuntimeException("Trạng thái thanh toán không thể cập nhật thủ công");
    }

    private void resetPendingPayment(
            Booking booking,
            PaymentStatus nextPaymentStatus) {

        ensurePaymentDefaults(booking);

        if (booking.getPaymentStatus() != PaymentStatus.PENDING_REVIEW
                && booking.getPaymentStatus() != PaymentStatus.FAILED) {
            throw new RuntimeException("Chỉ giao dịch đang xét duyệt mới có thể từ chối");
        }

        BigDecimal totalPrice = booking.getTotalPrice() != null
                ? booking.getTotalPrice()
                : BigDecimal.ZERO;

        booking.setPaymentStatus(nextPaymentStatus);
        booking.setPaymentPlan(null);
        booking.setPaymentMethod(null);
        booking.setRemainingPaymentMethod(null);
        booking.setPaidAt(null);
        booking.setPaidAmount(BigDecimal.ZERO);
        booking.setRemainingAmount(totalPrice);
        booking.setPaymentReference(null);
    }

    private void approvePendingPayment(Booking booking) {

        ensurePaymentDefaults(booking);

        if (booking.getPaymentStatus() != PaymentStatus.PENDING_REVIEW) {
            throw new RuntimeException("Booking này không có giao dịch đang chờ xét duyệt");
        }

        BigDecimal paidAmount = nonNegative(booking.getPaidAmount());

        if (paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Booking chưa có số tiền chờ duyệt để xác nhận");
        }

        BigDecimal totalPrice = booking.getTotalPrice() != null
                ? booking.getTotalPrice()
                : BigDecimal.ZERO;

        if (paidAmount.compareTo(totalPrice) >= 0) {
            booking.setPaidAmount(totalPrice);
            booking.setRemainingAmount(BigDecimal.ZERO);
            booking.setPaymentStatus(PaymentStatus.PAID);
            return;
        }

        booking.setRemainingAmount(nonNegative(totalPrice.subtract(paidAmount)));
        booking.setPaymentStatus(PaymentStatus.PARTIAL);
    }

    private void applyCancellationPaymentPolicy(Booking booking) {

        ensurePaymentDefaults(booking);

        BigDecimal paidAmount = booking.getPaidAmount();
        BigDecimal depositAmount = booking.getDepositAmount();
        boolean beforeDeparture = isBeforeDepartureDate(booking);

        if (paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            booking.setPaymentStatus(PaymentStatus.UNPAID);
            booking.setRefundedAmount(BigDecimal.ZERO);
            booking.setRemainingAmount(BigDecimal.ZERO);
            return;
        }

        if (beforeDeparture) {
            booking.setRefundedAmount(paidAmount);
            booking.setRefundedAt(LocalDateTime.now());
            booking.setRemainingAmount(BigDecimal.ZERO);
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
            return;
        }

        BigDecimal forfeitedDeposit = paidAmount.min(depositAmount);
        BigDecimal refundAmount = nonNegative(paidAmount.subtract(forfeitedDeposit));

        booking.setRefundedAmount(refundAmount);
        booking.setRefundedAt(refundAmount.compareTo(BigDecimal.ZERO) > 0 ? LocalDateTime.now() : null);
        booking.setRemainingAmount(BigDecimal.ZERO);
        booking.setPaymentStatus(
                refundAmount.compareTo(BigDecimal.ZERO) > 0
                        ? PaymentStatus.PARTIALLY_REFUNDED
                        : PaymentStatus.FORFEITED);
    }

    private void validateCustomerManifest(
            CreateBookingRequest request,
            int adultCount,
            int childCount) {

        List<BookingCustomerRequest> customers = request.getCustomers() == null
                ? List.of()
                : request.getCustomers()
                        .stream()
                        .filter(customer -> !isBlank(customer.getFullName()))
                        .toList();

        int expectedAdultCompanions = Math.max(0, adultCount - 1);
        int expectedChildren = childCount;
        int expectedCompanions = expectedAdultCompanions + expectedChildren;

        if (customers.size() != expectedCompanions) {
            throw new RuntimeException(
                    "Danh sách khách đi cùng phải khớp số người đã chọn: "
                            + expectedAdultCompanions
                            + " người lớn đi cùng và "
                            + expectedChildren
                            + " trẻ em/em bé");
        }

        long adultCompanions = customers
                .stream()
                .map(customer -> parseCustomerType(customer.getCustomerType()))
                .filter(type -> type == BookingCustomerType.ADULT)
                .count();

        long childCompanions = customers
                .stream()
                .map(customer -> parseCustomerType(customer.getCustomerType()))
                .filter(this::isChildSeatType)
                .count();

        if (adultCompanions != expectedAdultCompanions
                || childCompanions != expectedChildren) {
            throw new RuntimeException(
                    "Loại khách đi cùng không khớp số người lớn/trẻ em đã chọn");
        }
    }

    private void validateBookingTypeInfo(
            BookingType bookingType,
            CreateBookingRequest request) {

        if ((bookingType == BookingType.GROUP || bookingType == BookingType.PRIVATE)
                && isBlank(request.getOrganizationName())) {
            throw new RuntimeException("Vui lòng nhập tên đoàn/tổ chức cho booking nhóm hoặc riêng");
        }
    }

    private void validateBookableDeparture(
            Tour tour,
            TourDeparture departure,
            int totalPeople) {

        if (tour.getDeletedAt() != null || tour.getStatus() != TourStatus.OPEN) {
            throw new RuntimeException("Tour hiện không mở bán");
        }

        if (departure.getStatus() != DepartureStatus.OPEN) {
            throw new RuntimeException("Lịch khởi hành hiện không mở đặt chỗ");
        }

        if (departure.getDepartureDate() != null
                && departure.getDepartureDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Lịch khởi hành đã qua");
        }

        if (departure.getBookingDeadline() != null
                && departure.getBookingDeadline().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Đã quá hạn đặt tour cho lịch khởi hành này");
        }

        int availableSeats = calculateAvailableSeats(departure);

        if (availableSeats < totalPeople) {
            throw new RuntimeException("Không đủ chỗ trống cho số lượng khách đã chọn");
        }
    }

    private void saveBookingCustomers(
            Booking booking,
            CreateBookingRequest request) {

        BookingCustomer leader = new BookingCustomer();

        leader.setBooking(booking);
        leader.setCustomerType(BookingCustomerType.ADULT);
        leader.setFullName(booking.getFullName());
        leader.setEmail(booking.getEmail());
        leader.setPhone(booking.getPhone());
        leader.setAddress(booking.getPickupAddress());
        leader.setGroupLeader(valueOrZero(booking.getTotalPeople()) > 1);

        bookingCustomerRepository.save(leader);

        if (request.getCustomers() == null || request.getCustomers().isEmpty()) {
            return;
        }

        List<BookingCustomer> customers = request.getCustomers()
                .stream()
                .filter(customer -> !isBlank(customer.getFullName()))
                .map(customer -> mapCustomerRequest(booking, customer))
                .toList();

        bookingCustomerRepository.saveAll(customers);
    }

    private BookingCustomer mapCustomerRequest(
            Booking booking,
            BookingCustomerRequest request) {

        BookingCustomer customer = new BookingCustomer();

        customer.setBooking(booking);
        customer.setCustomerType(parseCustomerType(request.getCustomerType()));
        customer.setFullName(request.getFullName().trim());
        customer.setGender(parseGender(request.getGender()));
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setIdentityNumber(trimToNull(request.getIdentityNumber()));
        customer.setEmail(trimToNull(request.getEmail()));
        customer.setPhone(trimToNull(request.getPhone()));
        customer.setAddress(trimToNull(request.getAddress()));
        customer.setEmergencyContact(trimToNull(request.getEmergencyContact()));
        customer.setHealthNote(trimToNull(request.getHealthNote()));
        customer.setGroupLeader(false);

        return customer;
    }

    private void snapshotBookingSchedule(
            Booking booking,
            Tour tour) {

        List<TourDay> tourDays = tourDayRepository
                .findByTourIdOrderByDayNumberAsc(tour.getId());

        if (tourDays.isEmpty()) {
            return;
        }

        List<Long> dayIds = tourDays
                .stream()
                .map(TourDay::getId)
                .toList();

        Map<Long, List<TourActivity>> activitiesByDayId = tourActivityRepository
                .findByTourDayIdInOrderBySortOrderAsc(dayIds)
                .stream()
                .collect(Collectors.groupingBy(activity -> activity.getTourDay().getId()));

        for (TourDay tourDay : tourDays) {
            BookingScheduleDay scheduleDay = new BookingScheduleDay();

            scheduleDay.setBooking(booking);
            scheduleDay.setDayNumber(tourDay.getDayNumber());
            scheduleDay.setTitle(tourDay.getTitle());
            scheduleDay.setDescription(tourDay.getDescription());

            BookingScheduleDay savedDay = bookingScheduleDayRepository.save(scheduleDay);

            List<BookingScheduleActivity> scheduleActivities = activitiesByDayId
                    .getOrDefault(tourDay.getId(), List.of())
                    .stream()
                    .map(activity -> mapScheduleActivity(savedDay, activity))
                    .toList();

            bookingScheduleActivityRepository.saveAll(scheduleActivities);
        }
    }

    private BookingScheduleActivity mapScheduleActivity(
            BookingScheduleDay scheduleDay,
            TourActivity activity) {

        BookingScheduleActivity scheduleActivity = new BookingScheduleActivity();

        scheduleActivity.setBookingScheduleDay(scheduleDay);
        scheduleActivity.setOriginalActivity(activity);
        scheduleActivity.setStartTime(activity.getStartTime());
        scheduleActivity.setEndTime(activity.getEndTime());
        scheduleActivity.setTitle(activity.getTitle());
        scheduleActivity.setDescription(activity.getDescription());

        return scheduleActivity;
    }

    private void applyBookingStatusTransition(
            Booking booking,
            BookingStatus nextStatus,
            String adminEmail) {

        BookingStatus currentStatus = booking.getStatus();
        TourDeparture departure = booking.getTourDeparture();
        int totalPeople = valueOrZero(booking.getTotalPeople());

        if (currentStatus == BookingStatus.PENDING) {
            departure.setReservedPeople(Math.max(
                    0,
                    valueOrZero(departure.getReservedPeople()) - totalPeople));
        } else if (currentStatus == BookingStatus.CONFIRMED
                || currentStatus == BookingStatus.IN_PROGRESS
                || currentStatus == BookingStatus.COMPLETED) {
            departure.setCurrentPeople(Math.max(
                    0,
                    valueOrZero(departure.getCurrentPeople()) - totalPeople));
        }

        if (nextStatus == BookingStatus.PENDING) {
            ensureCapacity(departure, totalPeople);
            departure.setReservedPeople(valueOrZero(departure.getReservedPeople()) + totalPeople);
            booking.setConfirmedAt(null);
            booking.setConfirmedBy(null);
            booking.setCancelledAt(null);
        } else if (nextStatus == BookingStatus.CONFIRMED
                || nextStatus == BookingStatus.IN_PROGRESS
                || nextStatus == BookingStatus.COMPLETED) {
            ensureCapacity(departure, totalPeople);
            departure.setCurrentPeople(valueOrZero(departure.getCurrentPeople()) + totalPeople);
            booking.setCancelledAt(null);

            if (booking.getConfirmedAt() == null) {
                booking.setConfirmedAt(LocalDateTime.now());
            }

            if (booking.getConfirmedBy() == null && !isBlank(adminEmail)) {
                userRepository
                        .findByEmail(adminEmail)
                        .ifPresent(booking::setConfirmedBy);
            }
        } else if (nextStatus == BookingStatus.CANCELLED) {
            booking.setCancelledAt(LocalDateTime.now());
        }

        booking.setStatus(nextStatus);
        tourDepartureRepository.save(departure);
    }

    private void ensureCapacity(
            TourDeparture departure,
            int totalPeople) {

        int availableSeats = calculateAvailableSeats(departure);

        if (availableSeats < totalPeople) {
            throw new RuntimeException("Không đủ chỗ trống cho trạng thái booking này");
        }
    }

    private BookingResponse mapToResponse(Booking booking) {

        ensurePaymentDefaults(booking);

        TourDeparture departure = booking.getTourDeparture();
        Tour tour = departure.getTour();

        BookingResponse response = new BookingResponse();

        response.setId(booking.getId());
        response.setBookingCode(booking.getBookingCode());
        response.setStatus(booking.getStatus().name());
        response.setPaymentStatus(booking.getPaymentStatus().name());
        response.setBookingType(booking.getBookingType().name());
        response.setPaymentDeadline(booking.getPaymentDeadline());
        response.setPaidAt(booking.getPaidAt());
        response.setPaidAmount(booking.getPaidAmount());
        response.setDepositAmount(booking.getDepositAmount());
        response.setRemainingAmount(booking.getRemainingAmount());
        response.setRefundedAmount(booking.getRefundedAmount());
        response.setRefundedAt(booking.getRefundedAt());
        response.setPaymentPlan(booking.getPaymentPlan());
        response.setPaymentMethod(booking.getPaymentMethod());
        response.setRemainingPaymentMethod(booking.getRemainingPaymentMethod());
        response.setPaymentReference(booking.getPaymentReference());
        response.setTotalPrice(booking.getTotalPrice());
        response.setCustomerName(booking.getFullName());
        response.setEmail(booking.getEmail());
        response.setPhone(booking.getPhone());
        response.setOrganizationName(booking.getOrganizationName());
        response.setContactPerson(booking.getContactPerson());
        response.setTourId(tour.getId());
        response.setDepartureId(departure.getId());
        response.setTourName(tour.getTitle());
        response.setAssignedStaffId(
                booking.getAssignedStaff() != null ? booking.getAssignedStaff().getId() : null);
        response.setAssignedStaffName(
                booking.getAssignedStaff() != null ? booking.getAssignedStaff().getFullName() : null);
        response.setAssignedStaffEmail(
                booking.getAssignedStaff() != null ? booking.getAssignedStaff().getEmail() : null);
        response.setAssignedStaffPhone(
                booking.getAssignedStaff() != null ? booking.getAssignedStaff().getPhone() : null);
        response.setDepartureDate(departure.getDepartureDate());
        response.setAdultCount(booking.getAdultCount());
        response.setChildCount(booking.getChildCount());
        response.setTotalPeople(booking.getTotalPeople());
        response.setBookedAt(booking.getBookedAt());

        return response;
    }

    private BookingDetailResponse mapToDetailResponse(
            Booking booking,
            List<BookingCustomer> customers) {

        ensurePaymentDefaults(booking);

        TourDeparture departure = booking.getTourDeparture();
        Tour tour = departure.getTour();

        BookingDetailResponse response = new BookingDetailResponse();

        response.setId(booking.getId());
        response.setBookingCode(booking.getBookingCode());
        response.setUserId(booking.getUser() != null ? booking.getUser().getId() : null);
        response.setTourId(tour.getId());
        response.setDepartureId(departure.getId());
        response.setStatus(booking.getStatus().name());
        response.setPaymentStatus(booking.getPaymentStatus().name());
        response.setBookingType(booking.getBookingType().name());
        response.setCustomerName(booking.getFullName());
        response.setEmail(booking.getEmail());
        response.setPhone(booking.getPhone());
        response.setPickupAddress(booking.getPickupAddress());
        response.setOrganizationName(booking.getOrganizationName());
        response.setContactPerson(booking.getContactPerson());
        response.setTourName(tour.getTitle());
        response.setTourThumbnail(tour.getThumbnail());
        response.setTourShortDescription(tour.getShortDescription());
        response.setTourDescription(tour.getDescription());
        response.setIncludedServices(tour.getIncludedServices());
        response.setExcludedServices(tour.getExcludedServices());
        response.setDurationDays(tour.getDurationDays());
        response.setDurationNights(tour.getDurationNights());
        response.setDepartureLocation(tour.getDepartureLocation());
        response.setDepartureDate(departure.getDepartureDate());
        response.setDepartureTime(departure.getDepartureTime());
        response.setAdultCount(booking.getAdultCount());
        response.setChildCount(booking.getChildCount());
        response.setTotalPeople(booking.getTotalPeople());
        response.setAdultPrice(booking.getAdultPriceSnapshot());
        response.setChildPrice(booking.getChildPriceSnapshot());
        response.setTotalPrice(booking.getTotalPrice());
        response.setNote(booking.getNote());
        response.setSpecialRequest(booking.getSpecialRequest());
        response.setInternalNote(booking.getInternalNote());
        response.setPaymentDeadline(booking.getPaymentDeadline());
        response.setPaidAt(booking.getPaidAt());
        response.setPaidAmount(booking.getPaidAmount());
        response.setDepositAmount(booking.getDepositAmount());
        response.setRemainingAmount(booking.getRemainingAmount());
        response.setRefundedAmount(booking.getRefundedAmount());
        response.setRefundedAt(booking.getRefundedAt());
        response.setPaymentPlan(booking.getPaymentPlan());
        response.setPaymentMethod(booking.getPaymentMethod());
        response.setRemainingPaymentMethod(booking.getRemainingPaymentMethod());
        response.setPaymentReference(booking.getPaymentReference());
        response.setRefundableBeforeDeparture(isBeforeDepartureDate(booking));
        response.setForfeitedDepositAmount(calculateForfeitedDepositAmount(booking));
        response.setRefundPolicyNote(buildRefundPolicyNote(booking));
        response.setAssignedStaffId(
                booking.getAssignedStaff() != null ? booking.getAssignedStaff().getId() : null);
        response.setAssignedStaffName(
                booking.getAssignedStaff() != null ? booking.getAssignedStaff().getFullName() : null);
        response.setAssignedStaffEmail(
                booking.getAssignedStaff() != null ? booking.getAssignedStaff().getEmail() : null);
        response.setAssignedStaffPhone(
                booking.getAssignedStaff() != null ? booking.getAssignedStaff().getPhone() : null);
        response.setConfirmedById(
                booking.getConfirmedBy() != null ? booking.getConfirmedBy().getId() : null);
        response.setConfirmedByName(
                booking.getConfirmedBy() != null ? booking.getConfirmedBy().getFullName() : null);
        response.setBookedAt(booking.getBookedAt());
        response.setConfirmedAt(booking.getConfirmedAt());
        response.setCancelledAt(booking.getCancelledAt());
        boolean hasGroup = valueOrZero(booking.getTotalPeople()) > 1;
        response.setCustomers(customers.stream()
                .map(customer -> mapCustomerResponse(customer, hasGroup))
                .toList());
        response.setScheduleDays(loadBookingSchedule(booking.getId()));

        return response;
    }

    private BookingCustomerResponse mapCustomerResponse(
            BookingCustomer customer,
            boolean hasGroup) {

        BookingCustomerResponse response = new BookingCustomerResponse();

        response.setId(customer.getId());
        response.setCustomerType(customer.getCustomerType().name());
        response.setFullName(customer.getFullName());
        response.setGender(customer.getGender().name());
        response.setDateOfBirth(customer.getDateOfBirth());
        response.setIdentityNumber(customer.getIdentityNumber());
        response.setEmail(customer.getEmail());
        response.setPhone(customer.getPhone());
        response.setAddress(customer.getAddress());
        response.setEmergencyContact(customer.getEmergencyContact());
        response.setGroupLeader(hasGroup && Boolean.TRUE.equals(customer.getGroupLeader()));
        response.setHealthNote(customer.getHealthNote());

        return response;
    }

    private List<BookingScheduleDayResponse> loadBookingSchedule(Long bookingId) {

        List<BookingScheduleDay> days = bookingScheduleDayRepository
                .findByBookingIdOrderByDayNumberAsc(bookingId);

        if (days.isEmpty()) {
            return List.of();
        }

        List<Long> dayIds = days
                .stream()
                .map(BookingScheduleDay::getId)
                .toList();

        Map<Long, List<BookingScheduleActivity>> activitiesByDayId =
                bookingScheduleActivityRepository
                        .findByScheduleDayIds(dayIds)
                        .stream()
                        .collect(Collectors.groupingBy(
                                activity -> activity.getBookingScheduleDay().getId()));

        return days
                .stream()
                .map(day -> mapScheduleDayResponse(
                        day,
                        activitiesByDayId.getOrDefault(day.getId(), List.of())))
                .toList();
    }

    private BookingScheduleDayResponse mapScheduleDayResponse(
            BookingScheduleDay day,
            List<BookingScheduleActivity> activities) {

        BookingScheduleDayResponse response = new BookingScheduleDayResponse();

        response.setId(day.getId());
        response.setDayNumber(day.getDayNumber());
        response.setTitle(day.getTitle());
        response.setDescription(day.getDescription());
        response.setActivities(activities.stream().map(this::mapScheduleActivityResponse).toList());

        return response;
    }

    private BookingScheduleActivityResponse mapScheduleActivityResponse(
            BookingScheduleActivity activity) {

        BookingScheduleActivityResponse response = new BookingScheduleActivityResponse();

        response.setId(activity.getId());
        response.setOriginalActivityId(
                activity.getOriginalActivity() != null
                        ? activity.getOriginalActivity().getId()
                        : null);
        response.setTitle(activity.getTitle());
        response.setDescription(activity.getDescription());
        response.setStartTime(activity.getStartTime());
        response.setEndTime(activity.getEndTime());
        response.setStatus(activity.getStatus().name());

        return response;
    }

    private String generateBookingCode() {

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        long sequence = bookingRepository.countByBookedAtBetween(start, end) + 1;

        String prefix = "BK" + today.format(BOOKING_DATE_FORMAT);
        String code = prefix + String.format("%04d", sequence);

        while (bookingRepository.existsByBookingCode(code)) {
            sequence++;
            code = prefix + String.format("%04d", sequence);
        }

        return code;
    }

    private String generatePaymentReference(
            Booking booking,
            String prefix) {

        return prefix + "-" + booking.getBookingCode() + "-" + System.currentTimeMillis();
    }

    private String normalizePaymentType(PayBookingRequest request) {

        String type = request != null ? trimToNull(request.getPaymentType()) : null;

        if (type == null) {
            return "FULL";
        }

        return type.trim().toUpperCase();
    }

    private String resolveRemainingPaymentMethod(PayBookingRequest request) {

        String value = request != null ? trimToNull(request.getRemainingPaymentMethod()) : null;

        if (value == null) {
            return "CASH_ON_DEPARTURE";
        }

        String normalized = value.toUpperCase();

        if (!"CASH_ON_DEPARTURE".equals(normalized)
                && !"BANK_TRANSFER_LATER".equals(normalized)) {
            throw new RuntimeException("Cách thanh toán phần còn lại không hợp lệ");
        }

        return normalized;
    }

    private void ensurePaymentDefaults(Booking booking) {

        if (booking.getPaymentStatus() == null) {
            booking.setPaymentStatus(PaymentStatus.UNPAID);
        }

        BigDecimal totalPrice = booking.getTotalPrice() != null
                ? booking.getTotalPrice()
                : BigDecimal.ZERO;

        BigDecimal depositAmount = booking.getDepositAmount() != null
                ? booking.getDepositAmount()
                : calculateDepositAmount(totalPrice);

        BigDecimal paidAmount = booking.getPaidAmount();

        if (paidAmount == null) {
            if (booking.getPaymentStatus() == PaymentStatus.PAID) {
                paidAmount = totalPrice;
            } else if (booking.getPaymentStatus() == PaymentStatus.PARTIAL) {
                paidAmount = depositAmount;
            } else if (booking.getPaymentStatus() == PaymentStatus.PENDING_REVIEW) {
                boolean awaitingFinalConfirmation =
                        "FULL".equalsIgnoreCase(booking.getPaymentPlan())
                                || (booking.getRemainingAmount() != null
                                        && booking.getRemainingAmount().compareTo(BigDecimal.ZERO) == 0);

                paidAmount = awaitingFinalConfirmation
                        ? totalPrice
                        : depositAmount;
            } else {
                paidAmount = BigDecimal.ZERO;
            }
        }

        booking.setDepositAmount(depositAmount);
        booking.setPaidAmount(paidAmount);

        if (booking.getRefundedAmount() == null) {
            booking.setRefundedAmount(BigDecimal.ZERO);
        }

        if (booking.getRemainingAmount() == null) {
            booking.setRemainingAmount(nonNegative(totalPrice.subtract(paidAmount)));
        }
    }

    private BigDecimal calculateDepositAmount(BigDecimal totalPrice) {

        if (totalPrice == null) {
            return BigDecimal.ZERO;
        }

        return totalPrice
                .multiply(DEPOSIT_RATE)
                .setScale(0, RoundingMode.HALF_UP);
    }

    private BigDecimal nonNegative(BigDecimal value) {

        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }

        return value;
    }

    private boolean isBeforeDepartureDate(Booking booking) {

        TourDeparture departure = booking.getTourDeparture();

        return departure.getDepartureDate() == null
                || LocalDate.now().isBefore(departure.getDepartureDate());
    }

    private BigDecimal calculateForfeitedDepositAmount(Booking booking) {

        ensurePaymentDefaults(booking);

        if (booking.getStatus() != BookingStatus.CANCELLED || isBeforeDepartureDate(booking)) {
            return BigDecimal.ZERO;
        }

        return booking.getPaidAmount().min(booking.getDepositAmount());
    }

    private String buildRefundPolicyNote(Booking booking) {

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            if (isBeforeDepartureDate(booking)) {
                return "Booking hủy trước ngày khởi hành nên được hoàn lại toàn bộ số tiền đã thanh toán.";
            }

            return "Booking hủy từ ngày khởi hành trở đi nên hệ thống giữ lại 30% tiền cọc, chỉ hoàn phần đã thanh toán vượt quá cọc.";
        }

        return "Hủy trước ngày khởi hành: hoàn lại toàn bộ số tiền đã thanh toán. Hủy từ ngày khởi hành trở đi: mất cọc 30%, chỉ hoàn phần đã thanh toán vượt quá cọc.";
    }

    private User requireAuthenticatedUser(String authenticatedEmail) {

        if (isBlank(authenticatedEmail)) {
            throw new RuntimeException("Bạn cần đăng nhập bằng tài khoản khách hàng");
        }

        return userRepository
                .findByEmail(authenticatedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void ensureCustomer(User user) {

        if (user.getRole() == null || !RoleName.CUSTOMER.equals(user.getRole().getName())) {
            throw new RuntimeException("Chỉ tài khoản khách hàng mới được đặt tour");
        }
    }

    private User requireActiveStaff(Long staffId) {

        User staff = userRepository
                .findById(staffId)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));

        if (staff.getDeletedAt() != null
                || staff.getRole() == null
                || !RoleName.EMPLOYEE.equals(staff.getRole().getName())) {
            throw new RuntimeException("Tài khoản được chọn không phải nhân viên");
        }

        if (!Boolean.TRUE.equals(staff.getIsActive())) {
            throw new RuntimeException("Nhân viên đã bị vô hiệu hóa");
        }

        return staff;
    }

    private BookingType parseBookingType(String value) {

        if (isBlank(value)) {
            return BookingType.INDIVIDUAL;
        }

        try {
            return BookingType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Loại booking không hợp lệ");
        }
    }

    private BookingStatus parseNullableBookingStatus(String value) {

        if (isBlank(value)) {
            return null;
        }

        try {
            return BookingStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Trạng thái booking không hợp lệ");
        }
    }

    private PaymentStatus parseNullablePaymentStatus(String value) {

        if (isBlank(value)) {
            return null;
        }

        try {
            return PaymentStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Trạng thái thanh toán không hợp lệ");
        }
    }

    private BookingCustomerType parseCustomerType(String value) {

        if (isBlank(value)) {
            return BookingCustomerType.ADULT;
        }

        try {
            return BookingCustomerType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Loại khách đi cùng không hợp lệ");
        }
    }

    private boolean isChildSeatType(BookingCustomerType type) {

        return type == BookingCustomerType.CHILD || type == BookingCustomerType.INFANT;
    }

    private Gender parseGender(String value) {

        if (isBlank(value)) {
            return Gender.OTHER;
        }

        try {
            return Gender.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return Gender.OTHER;
        }
    }

    private int calculateAvailableSeats(TourDeparture departure) {

        return Math.max(0,
                valueOrZero(departure.getMaxPeople())
                        - valueOrZero(departure.getCurrentPeople())
                        - valueOrZero(departure.getReservedPeople()));
    }

    private int valueOrZero(Integer value) {

        return value == null ? 0 : value;
    }

    private String trimToNull(String value) {

        if (isBlank(value)) {
            return null;
        }

        return value.trim();
    }

    private boolean isBlank(String value) {

        return value == null || value.trim().isEmpty();
    }
}
