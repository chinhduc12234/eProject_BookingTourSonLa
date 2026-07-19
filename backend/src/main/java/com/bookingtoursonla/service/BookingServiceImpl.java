package com.bookingtoursonla.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bookingtoursonla.config.UploadPathUtils;
import com.bookingtoursonla.dto.BookingCustomerRequest;
import com.bookingtoursonla.dto.BookingCustomerResponse;
import com.bookingtoursonla.dto.BookingDetailResponse;
import com.bookingtoursonla.dto.BookingResponse;
import com.bookingtoursonla.dto.BookingStaffAssignmentRequest;
import com.bookingtoursonla.dto.BookingScheduleActivityResponse;
import com.bookingtoursonla.dto.BookingScheduleDayResponse;
import com.bookingtoursonla.dto.BookingStaffAssignmentResponse;
import com.bookingtoursonla.dto.CancelBookingRequest;
import com.bookingtoursonla.dto.CreateBookingRequest;
import com.bookingtoursonla.dto.GroupTourDepartureResponse;
import com.bookingtoursonla.dto.GroupTourBookingTrackingResponse;
import com.bookingtoursonla.dto.GroupTourTrackingResponse;
import com.bookingtoursonla.dto.PayBookingRequest;
import com.bookingtoursonla.dto.TourImageDto;
import com.bookingtoursonla.dto.UpdateBookingScheduleActivityRequest;
import com.bookingtoursonla.dto.UpdateBookingAdminRequest;
import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.BookingCustomer;
import com.bookingtoursonla.entity.BookingEmployee;
import com.bookingtoursonla.entity.BookingScheduleActivity;
import com.bookingtoursonla.entity.BookingScheduleDay;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourActivity;
import com.bookingtoursonla.entity.TourDay;
import com.bookingtoursonla.entity.TourDeparture;
import com.bookingtoursonla.entity.TourImage;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.BookingCustomerType;
import com.bookingtoursonla.entity.enums.BookingScheduleActivityStatus;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.entity.enums.BookingType;
import com.bookingtoursonla.entity.enums.DepartureStatus;
import com.bookingtoursonla.entity.enums.Gender;
import com.bookingtoursonla.entity.enums.PaymentStatus;
import com.bookingtoursonla.entity.enums.RoleName;
import com.bookingtoursonla.entity.enums.TourStatus;
import com.bookingtoursonla.event.BookingAdminConfirmedEvent;
import com.bookingtoursonla.event.BookingCreatedEvent;
import com.bookingtoursonla.event.BookingEmployeeCompletedEvent;
import com.bookingtoursonla.repository.BookingCustomerRepository;
import com.bookingtoursonla.repository.BookingEmployeeRepository;
import com.bookingtoursonla.repository.BookingRepository;
import com.bookingtoursonla.repository.BookingScheduleActivityRepository;
import com.bookingtoursonla.repository.BookingScheduleDayRepository;
import com.bookingtoursonla.repository.TourActivityRepository;
import com.bookingtoursonla.repository.TourDayRepository;
import com.bookingtoursonla.repository.TourDepartureRepository;
import com.bookingtoursonla.repository.TourImageRepository;
import com.bookingtoursonla.repository.UserRepository;

@Service
public class BookingServiceImpl implements BookingService {

    private static final DateTimeFormatter BOOKING_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private static final BigDecimal DEPOSIT_RATE = new BigDecimal("0.30");

    private static final Set<String> ALLOWED_REPORT_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif");

    private static final long MAX_REPORT_IMAGE_SIZE = 10 * 1024 * 1024;

    private final BookingRepository bookingRepository;

    private final BookingCustomerRepository bookingCustomerRepository;

    private final BookingEmployeeRepository bookingEmployeeRepository;

    private final BookingScheduleDayRepository bookingScheduleDayRepository;

    private final BookingScheduleActivityRepository bookingScheduleActivityRepository;

    private final TourDepartureRepository tourDepartureRepository;

    private final TourDayRepository tourDayRepository;

    private final TourActivityRepository tourActivityRepository;

    private final TourImageRepository tourImageRepository;

    private final UserRepository userRepository;

    private final ApplicationEventPublisher eventPublisher;

    private final BookingConfirmationEmailService confirmationEmailService;

    private final String uploadDir;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            BookingCustomerRepository bookingCustomerRepository,
            BookingEmployeeRepository bookingEmployeeRepository,
            BookingScheduleDayRepository bookingScheduleDayRepository,
            BookingScheduleActivityRepository bookingScheduleActivityRepository,
            TourDepartureRepository tourDepartureRepository,
            TourDayRepository tourDayRepository,
            TourActivityRepository tourActivityRepository,
            TourImageRepository tourImageRepository,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher,
            BookingConfirmationEmailService confirmationEmailService,
            @Value("${upload.dir:uploads}") String uploadDir) {

        this.bookingRepository = bookingRepository;
        this.bookingCustomerRepository = bookingCustomerRepository;
        this.bookingEmployeeRepository = bookingEmployeeRepository;
        this.bookingScheduleDayRepository = bookingScheduleDayRepository;
        this.bookingScheduleActivityRepository = bookingScheduleActivityRepository;
        this.tourDepartureRepository = tourDepartureRepository;
        this.tourDayRepository = tourDayRepository;
        this.tourActivityRepository = tourActivityRepository;
        this.tourImageRepository = tourImageRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
        this.confirmationEmailService = confirmationEmailService;
        this.uploadDir = uploadDir;
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

        recalculateDepartureCapacity(departure);

        BookingType bookingType = parseBookingType(request.getBookingType());
        validateBookingTypeInfo(bookingType, request);

        boolean groupTourBooking = isGroupTourBooking(bookingType, departure);
        boolean groupAlreadyConfirmed = groupTourBooking
                && isGroupAlreadyConfirmed(departure.getId());

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

        Booking booking = new Booking();

        booking.setBookingCode(generateBookingCode());
        booking.setUser(user);
        booking.setTourDeparture(departure);
        booking.setBookingType(bookingType);
        booking.setOrganizationName(trimToNull(request.getOrganizationName()));
        booking.setContactPerson(trimToNull(request.getContactPerson()));
        booking.setFullName(request.getFullName().trim());
        booking.setEmail(user.getEmail().trim());
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
        booking.setStatus(null);
        applyBookingStatusTransition(
                booking,
                groupAlreadyConfirmed ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
                null);
        booking.setRefundedAmount(BigDecimal.ZERO);
        applySimulatedPayment(booking, request);

        Booking saved = bookingRepository.saveAndFlush(booking);

        if (groupTourBooking) {
            inheritGroupStaffAssignment(saved);
        }

        saveBookingCustomers(saved, request);
        snapshotBookingSchedule(saved, tour);
        autoConfirmGroupWhenFull(departure);
        eventPublisher.publishEvent(new BookingCreatedEvent(saved.getId()));

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
    public void resendBookingConfirmation(
            Long id,
            String authenticatedEmail) {

        Booking booking = bookingRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));
        User user = requireAuthenticatedUser(authenticatedEmail);

        if (booking.getUser() == null || !booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền gửi email cho booking này");
        }

        String accountEmail = user.getEmail().trim();
        booking.setEmail(accountEmail);
        bookingRepository.save(booking);

        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(booking.getId());
        customers.stream()
                .filter(customer -> Boolean.TRUE.equals(customer.getGroupLeader()))
                .forEach(customer -> customer.setEmail(accountEmail));
        bookingCustomerRepository.saveAll(customers);

        confirmationEmailService.sendBookingConfirmation(booking.getId());
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
            throw new RuntimeException(
                    "Thanh toán đang chờ xét duyệt, vui lòng chờ admin xử lý trước khi hủy đặt lịch");
        }

        recalculateDepartureCapacity(booking.getTourDeparture());
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
                .searchAdminPrivateBookings(
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

        ensurePrivateBooking(booking);

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

        ensurePrivateBooking(booking);
        recalculateDepartureCapacity(booking.getTourDeparture());

        List<BookingEmployee> currentAssignments = null;
        List<BookingStaffAssignmentRequest> assignedStaffMembers = resolveAssignedStaffAssignments(request);
        if (assignedStaffMembers != null) {
            currentAssignments = syncAssignedStaffMembers(booking, assignedStaffMembers);
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
                throw new RuntimeException("Đặt lịch đã hủy nên không thể xác nhận thanh toán");
            }

            approvePendingPayment(booking);
        }

        boolean shouldSendAdminConfirmationEmail = false;

        if (Boolean.TRUE.equals(request.getConfirm())) {
            if (booking.getStatus() == BookingStatus.CANCELLED) {
                throw new RuntimeException("Đặt lịch đã hủy nên không thể xác nhận");
            }

            if (currentAssignments == null) {
                currentAssignments = bookingEmployeeRepository
                        .findWithEmployeeByBookingIdOrderByIdAsc(booking.getId());
            }

            if (currentAssignments.isEmpty()) {
                throw new RuntimeException("Vui lòng gán nhân viên phụ trách trước khi xác nhận tour");
            }

            if (booking.getStatus() != BookingStatus.CONFIRMED) {
                applyBookingStatusTransition(booking, BookingStatus.CONFIRMED, adminEmail);
                shouldSendAdminConfirmationEmail = true;
            }
        }

        Booking saved = bookingRepository.save(booking);

        if (shouldSendAdminConfirmationEmail) {
            eventPublisher.publishEvent(new BookingAdminConfirmedEvent(saved.getId()));
        }

        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(saved.getId());

        return mapToDetailResponse(saved, customers);
    }

    @Override
    @Transactional
    public Page<GroupTourDepartureResponse> getAdminGroupTours(
            int page,
            int size,
            String keyword) {

        Pageable pageable = PageRequest.of(page, size);

        String normalizedKeyword = isBlank(keyword) ? null : keyword.trim();

        return bookingRepository
                .searchAdminGroupDepartures(normalizedKeyword, pageable)
                .map(this::mapGroupTourResponse);
    }

    @Override
    @Transactional
    public GroupTourDepartureResponse getAdminGroupTourDetail(Long departureId) {
        TourDeparture departure = tourDepartureRepository
                .findByIdForUpdate(departureId)
                .orElseThrow(() -> new RuntimeException("Lịch khởi hành không tồn tại"));
        ensureGroupDeparture(departure);
        return mapGroupTourResponse(departure);
    }

    @Override
    @Transactional
    public GroupTourTrackingResponse getAdminGroupTourTracking(Long departureId) {
        TourDeparture departure = tourDepartureRepository.findByIdForUpdate(departureId)
                .orElseThrow(() -> new RuntimeException("Lịch khởi hành không tồn tại"));
        ensureGroupDeparture(departure);

        GroupTourDepartureResponse group = mapGroupTourResponse(departure);
        List<GroupTourBookingTrackingResponse> items = group.getBookings().stream().map(booking -> {
            GroupTourBookingTrackingResponse item = new GroupTourBookingTrackingResponse();
            item.setBookingId(booking.getId());
            item.setBookingCode(booking.getBookingCode());
            item.setCustomerName(booking.getCustomerName());
            item.setStatus(booking.getStatus());
            item.setTotalActivities(valueOrZero(booking.getScheduleTotalActivities()));
            item.setCompletedActivities(valueOrZero(booking.getScheduleCompletedActivities()));
            item.setProgressPercent(valueOrZero(booking.getScheduleProgressPercent()));
            item.setNeedsReview(Boolean.TRUE.equals(booking.getScheduleNeedsReview()));
            return item;
        }).toList();

        // Các booking tour ghép đều dùng cùng một lịch trình đã đồng bộ. Chỉ lấy
        // timeline đại diện để số hoạt động/tiến độ là của cả đoàn, không bị cộng
        // lặp lại theo số lượng đơn đặt chỗ.
        List<Booking> activeBookings = loadActiveGroupBookings(departureId);
        List<BookingScheduleDayResponse> groupScheduleDays = activeBookings.isEmpty()
                ? List.of()
                : loadBookingSchedule(activeBookings.get(0));
        int totalActivities = groupScheduleDays.stream()
                .mapToInt(day -> day.getActivities().size())
                .sum();
        int completedActivities = (int) groupScheduleDays.stream()
                .flatMap(day -> day.getActivities().stream())
                .filter(activity -> "DONE".equals(activity.getStatus())
                        || "CHANGED".equals(activity.getStatus())
                        || "SKIPPED".equals(activity.getStatus()))
                .count();
        GroupTourTrackingResponse response = new GroupTourTrackingResponse();
        response.setDepartureId(group.getDepartureId());
        response.setTourName(group.getTourName());
        response.setGroupStatus(group.getGroupStatus());
        response.setTotalBookings(items.size());
        response.setBookingsWithSchedule((int) items.stream().filter(i -> valueOrZero(i.getTotalActivities()) > 0).count());
        response.setCompletedBookings((int) items.stream().filter(i -> valueOrZero(i.getTotalActivities()) > 0 && valueOrZero(i.getProgressPercent()) >= 100).count());
        response.setNeedsReviewBookings((int) items.stream().filter(i -> Boolean.TRUE.equals(i.getNeedsReview())).count());
        response.setTotalActivities(totalActivities);
        response.setCompletedActivities(completedActivities);
        response.setProgressPercent(totalActivities == 0 ? 0 : Math.round(completedActivities * 100f / totalActivities));
        response.setBookings(items);
        response.setScheduleDays(groupScheduleDays);
        return response;
    }

    @Override
    @Transactional
    public GroupTourDepartureResponse assignGroupTourStaff(
            Long departureId,
            Long employeeId) {

        TourDeparture departure = tourDepartureRepository
                .findByIdForUpdate(departureId)
                .orElseThrow(() -> new RuntimeException("Lịch khởi hành không tồn tại"));

        ensureGroupDeparture(departure);

        User employee = requireActiveStaff(employeeId);
        List<Booking> activeBookings = loadActiveGroupBookings(departureId);

        if (activeBookings.isEmpty()) {
            throw new RuntimeException("Tour ghép chưa có booking đang hoạt động để phân công");
        }

        if (activeBookings.stream().allMatch(booking -> booking.getStatus() == BookingStatus.COMPLETED)) {
            throw new RuntimeException("Không thể phân công cho đoàn đã hoàn thành");
        }

        BookingStaffAssignmentRequest assignment = new BookingStaffAssignmentRequest();
        assignment.setEmployeeId(employee.getId());
        assignment.setRoleInTrip("GUIDE");

        for (Booking booking : activeBookings) {
            syncAssignedStaffMembers(booking, List.of(assignment));
        }

        return mapGroupTourResponse(departure);
    }

    @Override
    @Transactional
    public GroupTourDepartureResponse confirmGroupTour(
            Long departureId,
            String adminEmail) {

        TourDeparture departure = tourDepartureRepository
                .findByIdForUpdate(departureId)
                .orElseThrow(() -> new RuntimeException("Lịch khởi hành không tồn tại"));

        ensureGroupDeparture(departure);
        recalculateDepartureCapacity(departure);

        List<Booking> activeBookings = loadActiveGroupBookings(departureId);

        if (activeBookings.isEmpty()) {
            throw new RuntimeException("Tour ghép chưa có booking đang hoạt động để xác nhận");
        }

        if (activeBookings.stream().anyMatch(booking ->
                booking.getStatus() == BookingStatus.IN_PROGRESS
                        || booking.getStatus() == BookingStatus.COMPLETED)) {
            throw new RuntimeException("Đoàn đã khởi hành hoặc hoàn thành, không thể xác nhận lại");
        }

        if (activeBookings.stream().noneMatch(booking -> booking.getStatus() == BookingStatus.PENDING)) {
            throw new RuntimeException("Đoàn không còn booking đang chờ xác nhận");
        }

        List<Booking> confirmedBookings = new ArrayList<>();

        for (Booking booking : activeBookings) {
            if (booking.getStatus() == BookingStatus.PENDING) {
                applyBookingStatusTransition(booking, BookingStatus.CONFIRMED, adminEmail);
                confirmedBookings.add(booking);
            }
        }

        bookingRepository.saveAll(confirmedBookings);

        // Admin xác nhận đoàn nghĩa là chốt danh sách khách cho chuyến này.
        // Đóng lịch ngay tại nguồn dữ liệu để cả API công khai lẫn API đặt tour
        // đều không thể nhận thêm booking.
        departure.setStatus(DepartureStatus.CLOSED);
        tourDepartureRepository.save(departure);

        confirmedBookings.forEach(booking ->
                eventPublisher.publishEvent(new BookingAdminConfirmedEvent(booking.getId())));

        return mapGroupTourResponse(departure);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDetailResponse getEmployeeBookingDetail(
            Long id,
            String employeeEmail) {

        User employee = requireEmployee(employeeEmail);

        Booking booking = bookingRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        ensureEmployeeAssignedToBooking(booking.getId(), employee.getId());

        return mapEmployeeBookingDetail(booking);
    }

    @Override
    @Transactional
    public BookingDetailResponse updateEmployeeScheduleActivity(
            Long bookingId,
            Long activityId,
            UpdateBookingScheduleActivityRequest request,
            String employeeEmail) {

        if (request == null) {
            request = new UpdateBookingScheduleActivityRequest();
        }

        User employee = requireEmployee(employeeEmail);

        Booking booking = bookingRepository
                .findByIdAndDeletedAtIsNull(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        ensureEmployeeAssignedToBooking(booking.getId(), employee.getId());
        ensureBookingCanReceiveScheduleUpdate(booking);

        BookingScheduleActivity activity = bookingScheduleActivityRepository
                .findByIdAndBookingId(activityId, booking.getId())
                .orElseThrow(() -> new RuntimeException("Mốc lịch trình không tồn tại trong booking này"));

        List<BookingScheduleActivity> activitiesToUpdate = isPrivateBooking(booking)
                ? List.of(activity)
                : bookingScheduleActivityRepository
                        .findActiveGroupActivitiesByDepartureAndSnapshotKey(
                                booking.getTourDeparture().getId(),
                                activity.getBookingScheduleDay().getDayNumber(),
                                activity.getTitle(),
                                activity.getStartTime());

        if (activitiesToUpdate.isEmpty()) {
            activitiesToUpdate = List.of(activity);
        }

        for (BookingScheduleActivity groupActivity : activitiesToUpdate) {
            applyScheduleActivityUpdate(groupActivity, request, employee);
        }
        bookingScheduleActivityRepository.saveAll(activitiesToUpdate);

        List<Booking> operationBookings = isPrivateBooking(booking)
                ? List.of(booking)
                : loadActiveGroupBookings(booking.getTourDeparture().getId());
        for (Booking operationBooking : operationBookings) {
            syncBookingProgressFromSchedule(operationBooking);
        }
        bookingRepository.saveAll(operationBookings);

        return mapEmployeeBookingDetail(booking);
    }

    @Override
    @Transactional
    public BookingDetailResponse completeEmployeeBooking(
            Long bookingId,
            String employeeEmail) {

        User employee = requireEmployee(employeeEmail);

        Booking booking = bookingRepository
                .findByIdAndDeletedAtIsNull(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        ensureEmployeeAssignedToBooking(booking.getId(), employee.getId());
        ensureBookingCanReceiveScheduleUpdate(booking);

        List<Booking> operationBookings = isPrivateBooking(booking)
                ? List.of(booking)
                : loadActiveGroupBookings(booking.getTourDeparture().getId());

        for (Booking operationBooking : operationBookings) {
            ensureBookingCanReceiveScheduleUpdate(operationBooking);
        }

        List<BookingScheduleActivity> activities = operationBookings.stream()
                .flatMap(operationBooking -> bookingScheduleActivityRepository
                        .findByBookingId(operationBooking.getId()).stream())
                .toList();

        if (activities.isEmpty()) {
            throw new RuntimeException("Booking chưa có lịch trình để hoàn thành");
        }

        long pendingCount = activities
                .stream()
                .filter(activity -> !isFinishedScheduleStatus(activity.getStatus()))
                .count();

        if (pendingCount > 0) {
            throw new RuntimeException("Còn " + pendingCount + " hoạt động chưa được nhân viên cập nhật");
        }

        List<Booking> completedBookings = new ArrayList<>();
        for (Booking operationBooking : operationBookings) {
            if (operationBooking.getStatus() != BookingStatus.COMPLETED) {
                applyBookingStatusTransition(operationBooking, BookingStatus.COMPLETED, null);
                completedBookings.add(operationBooking);
            }
        }

        bookingRepository.saveAll(operationBookings);
        completedBookings.forEach(completedBooking -> eventPublisher.publishEvent(
                new BookingEmployeeCompletedEvent(completedBooking.getId(), employee.getFullName())));

        return mapEmployeeBookingDetail(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public String uploadScheduleActivityReportImage(
            Long bookingId,
            Long activityId,
            MultipartFile file,
            String employeeEmail) {

        User employee = requireEmployee(employeeEmail);

        Booking booking = bookingRepository
                .findByIdAndDeletedAtIsNull(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        ensureEmployeeAssignedToBooking(booking.getId(), employee.getId());
        ensureBookingCanReceiveScheduleUpdate(booking);

        bookingScheduleActivityRepository
                .findByIdAndBookingId(activityId, booking.getId())
                .orElseThrow(() -> new RuntimeException("Mốc lịch trình không tồn tại trong booking này"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ảnh báo cáo");
        }

        if (file.getSize() > MAX_REPORT_IMAGE_SIZE) {
            throw new RuntimeException("Ảnh báo cáo không được vượt quá 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null
                || !ALLOWED_REPORT_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Ảnh báo cáo chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF");
        }

        try {
            Path reportDir = UploadPathUtils.resolveUploadRoot(uploadDir)
                    .resolve("reports");
            Files.createDirectories(reportDir);

            String filename = "report-booking-" + bookingId
                    + "-activity-" + activityId
                    + "-" + UUID.randomUUID()
                    + getReportImageExtension(contentType);
            Path target = reportDir.resolve(filename).normalize();

            if (!target.startsWith(reportDir)) {
                throw new RuntimeException("Tên file ảnh báo cáo không hợp lệ");
            }

            file.transferTo(target);

            return "/uploads/reports/" + filename;
        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu ảnh báo cáo");
        }
    }

    private void applySimulatedPayment(
            Booking booking,
            CreateBookingRequest request) {

        String paymentType = normalizeCreatePaymentType(request);
        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        BigDecimal totalPrice = booking.getTotalPrice() != null
                ? booking.getTotalPrice()
                : BigDecimal.ZERO;
        BigDecimal depositAmount = calculateDepositAmount(totalPrice);

        booking.setPaymentDeadline(null);
        booking.setDepositAmount(depositAmount);
        booking.setPaymentMethod(paymentMethod);
        booking.setPaidAt(LocalDateTime.now());

        if ("FULL".equals(paymentType)) {
            booking.setPaymentPlan("FULL");
            booking.setRemainingPaymentMethod(null);
            booking.setPaidAmount(totalPrice);
            booking.setRemainingAmount(BigDecimal.ZERO);
            booking.setPaymentStatus(PaymentStatus.PAID);
            booking.setPaymentReference(generatePaymentReference(booking, "FULL"));
            return;
        }

        if ("DEPOSIT".equals(paymentType)) {
            booking.setPaymentPlan("DEPOSIT");
            booking.setRemainingPaymentMethod(resolveRemainingPaymentMethod(request));
            booking.setPaidAmount(depositAmount);
            booking.setRemainingAmount(nonNegative(totalPrice.subtract(depositAmount)));
            booking.setPaymentStatus(PaymentStatus.PARTIAL);
            booking.setPaymentReference(generatePaymentReference(booking, "DEP"));
            return;
        }

        throw new RuntimeException("Hình thức thanh toán không hợp lệ");
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
            booking.setPaymentStatus(PaymentStatus.PAID);
            booking.setStatus(BookingStatus.PENDING);
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
            booking.setPaymentStatus(PaymentStatus.PARTIAL);
            booking.setStatus(BookingStatus.PENDING);
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
            booking.setPaymentStatus(PaymentStatus.PAID);
            booking.setPaidAt(LocalDateTime.now());
            booking.setPaymentReference(generatePaymentReference(booking, "REM"));
            return;
        }

        throw new RuntimeException("Phương thức thanh toán không hợp lệ");
    }

    private void ensureCanCreatePaymentRequest(Booking booking) {

        if (booking.getPaymentStatus() == PaymentStatus.PENDING_REVIEW) {
            throw new RuntimeException("Booking này đang được admin kiểm tra thanh toán");
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
            throw new RuntimeException("Chỉ giao dịch đang được kiểm tra mới có thể từ chối");
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
            throw new RuntimeException("Booking này không có giao dịch cần kiểm tra");
        }

        BigDecimal paidAmount = nonNegative(booking.getPaidAmount());

        if (paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Booking chưa có số tiền cần xác nhận");
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

        if (departure.getStatus() == DepartureStatus.CLOSED) {
            throw new RuntimeException("Lịch khởi hành đã đóng đặt chỗ");
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
        BookingCustomerType customerType = parseCustomerType(request.getCustomerType());

        customer.setBooking(booking);
        customer.setCustomerType(customerType);
        customer.setFullName(request.getFullName().trim());
        customer.setGender(parseGender(request.getGender()));
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setIdentityNumber(
                customerType == BookingCustomerType.ADULT
                        ? trimToNull(request.getIdentityNumber())
                        : null);
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
        scheduleActivity.setActualLocation(resolveActivityLocationName(activity));

        return scheduleActivity;
    }

    private String resolveActivityLocationName(TourActivity activity) {
        String customName = trimToNull(activity.getLocationName());
        if (customName != null) {
            return customName;
        }
        return activity.getLocation() != null ? activity.getLocation().getName() : null;
    }

    private GroupTourDepartureResponse mapGroupTourResponse(
            TourDeparture departure) {

        recalculateDepartureCapacity(departure);

        List<Booking> groupBookings = bookingRepository
                .findGroupBookingsByDepartureId(departure.getId());
        List<Booking> activeBookings = groupBookings
                .stream()
                .filter(booking -> booking.getStatus() != BookingStatus.CANCELLED)
                .toList();

        int occupiedPeople = valueOrZero(departure.getCurrentPeople())
                + valueOrZero(departure.getReservedPeople());
        int maxPeople = valueOrZero(departure.getMaxPeople());
        long pendingBookings = activeBookings
                .stream()
                .filter(booking -> booking.getStatus() == BookingStatus.PENDING)
                .count();
        long confirmedBookings = activeBookings
                .stream()
                .filter(booking -> booking.getStatus() != BookingStatus.PENDING)
                .count();

        GroupTourDepartureResponse response = new GroupTourDepartureResponse();
        response.setDepartureId(departure.getId());
        response.setTourId(departure.getTour().getId());
        response.setTourName(departure.getTour().getTitle());
        response.setDepartureDate(departure.getDepartureDate());
        response.setDepartureTime(departure.getDepartureTime());
        response.setCapacityStatus(departure.getStatus().name());
        response.setGroupStatus(resolveGroupStatus(activeBookings));
        response.setMaxPeople(maxPeople);
        response.setOccupiedPeople(occupiedPeople);
        response.setAvailableSeats(Math.max(0, maxPeople - occupiedPeople));
        response.setBookingCount(activeBookings.size());
        response.setPendingBookingCount((int) pendingBookings);
        response.setConfirmedBookingCount((int) confirmedBookings);
        response.setBookings(groupBookings.stream().map(this::mapToResponse).toList());

        List<BookingEmployee> assignments = bookingEmployeeRepository
                .findGroupAssignmentsByDepartureId(departure.getId());

        if (!assignments.isEmpty()) {
            User employee = assignments.get(0).getEmployee();
            response.setAssignedStaffId(employee.getId());
            response.setAssignedStaffName(employee.getFullName());
            response.setAssignedStaffEmail(employee.getEmail());
            response.setAssignedStaffPhone(employee.getPhone());
        }

        return response;
    }

    private String resolveGroupStatus(List<Booking> activeBookings) {

        if (activeBookings.isEmpty()) {
            return "CANCELLED";
        }

        if (activeBookings.stream().allMatch(
                booking -> booking.getStatus() == BookingStatus.COMPLETED)) {
            return "COMPLETED";
        }

        if (activeBookings.stream().anyMatch(
                booking -> booking.getStatus() == BookingStatus.IN_PROGRESS)) {
            return "IN_PROGRESS";
        }

        if (activeBookings.stream().anyMatch(
                booking -> booking.getStatus() == BookingStatus.PENDING)) {
            return "WAITING";
        }

        return "CONFIRMED";
    }

    private List<Booking> loadActiveGroupBookings(Long departureId) {
        return bookingRepository
                .findGroupBookingsByDepartureId(departureId)
                .stream()
                .filter(booking -> booking.getStatus() != BookingStatus.CANCELLED)
                .toList();
    }

    private boolean isGroupAlreadyConfirmed(Long departureId) {
        List<Booking> activeBookings = loadActiveGroupBookings(departureId);

        return !activeBookings.isEmpty()
                && activeBookings.stream().allMatch(
                        booking -> booking.getStatus() == BookingStatus.CONFIRMED);
    }

    private void inheritGroupStaffAssignment(Booking booking) {
        List<BookingEmployee> assignments = bookingEmployeeRepository
                .findGroupAssignmentsByDepartureId(booking.getTourDeparture().getId());

        if (assignments.isEmpty()) {
            return;
        }

        BookingEmployee template = assignments.get(0);
        BookingStaffAssignmentRequest assignment = new BookingStaffAssignmentRequest();
        assignment.setEmployeeId(template.getEmployee().getId());
        assignment.setRoleInTrip(template.getRoleInTrip());
        assignment.setNote(template.getNote());
        syncAssignedStaffMembers(booking, List.of(assignment));
    }

    private void autoConfirmGroupWhenFull(TourDeparture departure) {

        if (Boolean.TRUE.equals(departure.getIsPrivateDeparture())) {
            return;
        }

        int occupiedPeople = valueOrZero(departure.getCurrentPeople())
                + valueOrZero(departure.getReservedPeople());

        if (occupiedPeople < valueOrZero(departure.getMaxPeople())) {
            return;
        }

        List<Booking> newlyConfirmed = new ArrayList<>();

        for (Booking booking : loadActiveGroupBookings(departure.getId())) {
            if (booking.getStatus() == BookingStatus.PENDING) {
                applyBookingStatusTransition(booking, BookingStatus.CONFIRMED, null);
                newlyConfirmed.add(booking);
            }
        }

        bookingRepository.saveAll(newlyConfirmed);
        newlyConfirmed.forEach(booking ->
                eventPublisher.publishEvent(new BookingAdminConfirmedEvent(booking.getId())));
    }

    private void recalculateDepartureCapacity(TourDeparture departure) {
        List<Booking> activeBookings = bookingRepository
                .findActiveBookingsByDepartureId(departure.getId());

        int reservedPeople = activeBookings
                .stream()
                .filter(booking -> booking.getStatus() == BookingStatus.PENDING)
                .mapToInt(booking -> valueOrZero(booking.getTotalPeople()))
                .sum();
        int currentPeople = activeBookings
                .stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED
                        || booking.getStatus() == BookingStatus.IN_PROGRESS
                        || booking.getStatus() == BookingStatus.COMPLETED)
                .mapToInt(booking -> valueOrZero(booking.getTotalPeople()))
                .sum();

        departure.setReservedPeople(reservedPeople);
        departure.setCurrentPeople(currentPeople);

        if (departure.getStatus() != DepartureStatus.CLOSED) {
            departure.setStatus(
                    currentPeople + reservedPeople >= valueOrZero(departure.getMaxPeople())
                            ? DepartureStatus.FULL
                            : DepartureStatus.OPEN);
        }

        tourDepartureRepository.save(departure);
    }

    private boolean isGroupTourBooking(
            BookingType bookingType,
            TourDeparture departure) {
        return bookingType != BookingType.PRIVATE
                && !Boolean.TRUE.equals(departure.getIsPrivateDeparture());
    }

    private boolean isPrivateBooking(Booking booking) {
        return booking.getBookingType() == BookingType.PRIVATE
                || Boolean.TRUE.equals(booking.getTourDeparture().getIsPrivateDeparture());
    }

    private BookingDetailResponse mapEmployeeBookingDetail(Booking booking) {
        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(booking.getId());
        BookingDetailResponse response = mapToDetailResponse(booking, customers);

        if (isPrivateBooking(booking)) {
            response.setGroupTourOperation(false);
            response.setGroupBookingCount(1);
            response.setGroupTotalPeople(valueOrZero(booking.getTotalPeople()));
            return response;
        }

        List<Booking> groupBookings = loadActiveGroupBookings(booking.getTourDeparture().getId());
        response.setGroupTourOperation(true);
        response.setGroupBookingCount(groupBookings.size());
        response.setGroupTotalPeople(groupBookings.stream()
                .mapToInt(groupBooking -> valueOrZero(groupBooking.getTotalPeople()))
                .sum());
        response.setGroupBookingCodes(groupBookings.stream()
                .map(Booking::getBookingCode)
                .toList());
        response.setGroupCustomerNames(groupBookings.stream()
                .map(Booking::getFullName)
                .distinct()
                .toList());
        return response;
    }

    private void ensurePrivateBooking(Booking booking) {
        if (!isPrivateBooking(booking)) {
            throw new RuntimeException(
                    "Booking tour ghép phải được xử lý trong mục Quản lý tour ghép");
        }
    }

    private void ensureGroupDeparture(TourDeparture departure) {
        if (Boolean.TRUE.equals(departure.getIsPrivateDeparture())) {
            throw new RuntimeException("Lịch khởi hành này thuộc tour riêng");
        }
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

    private void applyScheduleActivityUpdate(
            BookingScheduleActivity activity,
            UpdateBookingScheduleActivityRequest request,
            User employee) {

        BookingScheduleActivityStatus nextStatus =
                parseScheduleActivityStatus(request.getStatus());
        BookingScheduleActivityStatus currentStatus = activity.getStatus();
        LocalDateTime actualStartTime = request.getActualStartTime();
        LocalDateTime actualEndTime = request.getActualEndTime();
        String actualNote = trimToNull(request.getActualNote());

        if (actualStartTime != null
                && actualEndTime != null
                && actualEndTime.isBefore(actualStartTime)) {
            throw new RuntimeException("Thời gian kết thúc thực tế không được trước thời gian bắt đầu");
        }

        if (nextStatus == BookingScheduleActivityStatus.CHANGED
                && (actualStartTime == null || actualNote == null)) {
            throw new RuntimeException("Khi chọn Có thay đổi, vui lòng nhập thời gian thực tế và nội dung thay đổi");
        }

        if (nextStatus == BookingScheduleActivityStatus.SKIPPED && actualNote == null) {
            throw new RuntimeException("Vui lòng nhập lý do khi bỏ qua hoạt động");
        }

        activity.setStatus(nextStatus);
        activity.setUpdatedByEmployee(employee);

        if (nextStatus == BookingScheduleActivityStatus.PENDING) {
            activity.setActualStartTime(null);
            activity.setActualEndTime(null);
            activity.setActualLocation(null);
            activity.setAttachmentUrl(null);
            activity.setActualNote(null);
            activity.setCompletedAt(null);
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        activity.setActualStartTime(actualStartTime);
        activity.setActualEndTime(
                actualEndTime != null
                        ? actualEndTime
                        : now);
        activity.setActualLocation(trimToNull(request.getActualLocation()));
        activity.setAttachmentUrl(trimToNull(request.getAttachmentUrl()));
        activity.setActualNote(actualNote);

        if (activity.getCompletedAt() == null || currentStatus != nextStatus) {
            activity.setCompletedAt(now);
        }
    }

    private void syncBookingProgressFromSchedule(Booking booking) {

        if (booking.getStatus() == BookingStatus.PENDING
                || booking.getStatus() == BookingStatus.CANCELLED
                || booking.getStatus() == BookingStatus.COMPLETED) {
            return;
        }

        List<BookingScheduleActivity> activities = bookingScheduleActivityRepository
                .findByBookingId(booking.getId());

        if (activities.isEmpty()) {
            return;
        }

        boolean hasStarted = activities
                .stream()
                .anyMatch(activity -> activity.getStatus() != BookingScheduleActivityStatus.PENDING);
        boolean allFinished = activities
                .stream()
                .allMatch(activity -> isFinishedScheduleStatus(activity.getStatus()));

        if ((hasStarted || allFinished) && booking.getStatus() != BookingStatus.IN_PROGRESS) {
            applyBookingStatusTransition(booking, BookingStatus.IN_PROGRESS, null);
            return;
        }

        if (!hasStarted && booking.getStatus() != BookingStatus.CONFIRMED) {
            applyBookingStatusTransition(booking, BookingStatus.CONFIRMED, null);
        }
    }

    private boolean isFinishedScheduleStatus(BookingScheduleActivityStatus status) {

        return status == BookingScheduleActivityStatus.DONE
                || status == BookingScheduleActivityStatus.CHANGED
                || status == BookingScheduleActivityStatus.SKIPPED;
    }

    private ScheduleReportStats buildScheduleReportStats(Booking booking) {

        List<BookingScheduleActivity> activities = bookingScheduleActivityRepository
                .findByBookingId(booking.getId());

        int total = activities.size();
        int changed = 0;
        int skipped = 0;
        int completed = 0;
        LocalDateTime lastUpdatedAt = null;
        String lastUpdatedBy = null;

        for (BookingScheduleActivity activity : activities) {
            BookingScheduleActivityStatus status = activity.getStatus();

            if (isFinishedScheduleStatus(status)) {
                completed++;
            }

            if (status == BookingScheduleActivityStatus.CHANGED) {
                changed++;
            } else if (status == BookingScheduleActivityStatus.SKIPPED) {
                skipped++;
            }

            LocalDateTime updatedAt = activity.getUpdatedAt();
            boolean employeeReported = activity.getUpdatedByEmployee() != null
                    || status != BookingScheduleActivityStatus.PENDING;

            if (employeeReported
                    && updatedAt != null
                    && (lastUpdatedAt == null || updatedAt.isAfter(lastUpdatedAt))) {
                lastUpdatedAt = updatedAt;
                lastUpdatedBy = activity.getUpdatedByEmployee() != null
                        ? activity.getUpdatedByEmployee().getFullName()
                        : null;
            }
        }

        int pending = Math.max(0, total - completed);
        int progressPercent = total > 0
                ? Math.round((completed * 100f) / total)
                : 0;
        boolean needsReview = changed > 0 || skipped > 0;

        String reportStatus;
        if (total == 0) {
            reportStatus = "EMPTY";
        } else if (needsReview) {
            reportStatus = "NEEDS_REVIEW";
        } else if (pending == 0) {
            reportStatus = "COMPLETED";
        } else if (completed > 0) {
            reportStatus = "IN_PROGRESS";
        } else {
            reportStatus = "WAITING";
        }

        return new ScheduleReportStats(
                total,
                completed,
                changed,
                skipped,
                pending,
                progressPercent,
                needsReview,
                reportStatus,
                lastUpdatedAt,
                lastUpdatedBy);
    }

    private void applyScheduleReportStats(
            BookingResponse response,
            ScheduleReportStats stats) {

        response.setScheduleTotalActivities(stats.totalActivities);
        response.setScheduleCompletedActivities(stats.completedActivities);
        response.setScheduleChangedActivities(stats.changedActivities);
        response.setScheduleSkippedActivities(stats.skippedActivities);
        response.setSchedulePendingActivities(stats.pendingActivities);
        response.setScheduleProgressPercent(stats.progressPercent);
        response.setScheduleNeedsReview(stats.needsReview);
        response.setScheduleReportStatus(stats.reportStatus);
        response.setScheduleLastUpdatedAt(stats.lastUpdatedAt);
        response.setScheduleLastUpdatedBy(stats.lastUpdatedBy);
    }

    private void applyScheduleReportStats(
            BookingDetailResponse response,
            ScheduleReportStats stats) {

        response.setScheduleTotalActivities(stats.totalActivities);
        response.setScheduleCompletedActivities(stats.completedActivities);
        response.setScheduleChangedActivities(stats.changedActivities);
        response.setScheduleSkippedActivities(stats.skippedActivities);
        response.setSchedulePendingActivities(stats.pendingActivities);
        response.setScheduleProgressPercent(stats.progressPercent);
        response.setScheduleNeedsReview(stats.needsReview);
        response.setScheduleReportStatus(stats.reportStatus);
        response.setScheduleLastUpdatedAt(stats.lastUpdatedAt);
        response.setScheduleLastUpdatedBy(stats.lastUpdatedBy);
    }

    private static class ScheduleReportStats {

        private final int totalActivities;
        private final int completedActivities;
        private final int changedActivities;
        private final int skippedActivities;
        private final int pendingActivities;
        private final int progressPercent;
        private final boolean needsReview;
        private final String reportStatus;
        private final LocalDateTime lastUpdatedAt;
        private final String lastUpdatedBy;

        private ScheduleReportStats(
                int totalActivities,
                int completedActivities,
                int changedActivities,
                int skippedActivities,
                int pendingActivities,
                int progressPercent,
                boolean needsReview,
                String reportStatus,
                LocalDateTime lastUpdatedAt,
                String lastUpdatedBy) {

            this.totalActivities = totalActivities;
            this.completedActivities = completedActivities;
            this.changedActivities = changedActivities;
            this.skippedActivities = skippedActivities;
            this.pendingActivities = pendingActivities;
            this.progressPercent = progressPercent;
            this.needsReview = needsReview;
            this.reportStatus = reportStatus;
            this.lastUpdatedAt = lastUpdatedAt;
            this.lastUpdatedBy = lastUpdatedBy;
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
        response.setPrivateDeparture(Boolean.TRUE.equals(departure.getIsPrivateDeparture()));
        response.setTourName(tour.getTitle());
        applyAssignedStaffResponse(response, loadAssignedStaffMembers(booking.getId()));
        response.setDepartureDate(departure.getDepartureDate());
        response.setAdultCount(booking.getAdultCount());
        response.setChildCount(booking.getChildCount());
        response.setTotalPeople(booking.getTotalPeople());
        response.setBookedAt(booking.getBookedAt());
        applyScheduleReportStats(response, buildScheduleReportStats(booking));

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
        response.setPrivateDeparture(Boolean.TRUE.equals(departure.getIsPrivateDeparture()));
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
        response.setTourImages(loadTourImages(tour));
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
        applyAssignedStaffResponse(response, loadAssignedStaffMembers(booking.getId()));
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
        response.setScheduleDays(loadBookingSchedule(booking));
        applyScheduleReportStats(response, buildScheduleReportStats(booking));

        return response;
    }

    private List<BookingEmployee> loadAssignedStaffMembers(Long bookingId) {

        if (bookingId == null) {
            return List.of();
        }

        return bookingEmployeeRepository.findWithEmployeeByBookingIdOrderByIdAsc(bookingId);
    }

    private void applyAssignedStaffResponse(
            BookingResponse response,
            List<BookingEmployee> assignments) {

        List<BookingStaffAssignmentResponse> staffMembers = assignments
                .stream()
                .map(this::mapAssignedStaffMember)
                .toList();

        response.setAssignedStaffMembers(staffMembers);
        applyLegacyAssignedStaffSummary(response, staffMembers);
    }

    private void applyAssignedStaffResponse(
            BookingDetailResponse response,
            List<BookingEmployee> assignments) {

        List<BookingStaffAssignmentResponse> staffMembers = assignments
                .stream()
                .map(this::mapAssignedStaffMember)
                .toList();

        response.setAssignedStaffMembers(staffMembers);
        applyLegacyAssignedStaffSummary(response, staffMembers);
    }

    private BookingStaffAssignmentResponse mapAssignedStaffMember(
            BookingEmployee assignment) {

        User employee = assignment.getEmployee();

        BookingStaffAssignmentResponse response = new BookingStaffAssignmentResponse();
        response.setId(assignment.getId());
        response.setEmployeeId(employee != null ? employee.getId() : null);
        response.setFullName(employee != null ? employee.getFullName() : null);
        response.setEmail(employee != null ? employee.getEmail() : null);
        response.setPhone(employee != null ? employee.getPhone() : null);
        response.setRoleInTrip(assignment.getRoleInTrip());
        response.setNote(assignment.getNote());
        response.setAssignmentStatus(assignment.getAssignmentStatus());
        response.setAssignedAt(assignment.getAssignedAt());
        response.setAcceptedAt(assignment.getAcceptedAt());

        return response;
    }

    private void applyLegacyAssignedStaffSummary(
            BookingResponse response,
            List<BookingStaffAssignmentResponse> staffMembers) {

        if (staffMembers == null || staffMembers.isEmpty()) {
            response.setAssignedStaffId(null);
            response.setAssignedStaffName(null);
            response.setAssignedStaffEmail(null);
            response.setAssignedStaffPhone(null);
            return;
        }

        BookingStaffAssignmentResponse first = staffMembers.get(0);
        response.setAssignedStaffId(first.getEmployeeId());
        response.setAssignedStaffEmail(first.getEmail());
        response.setAssignedStaffPhone(first.getPhone());
        response.setAssignedStaffName(staffMembers
                .stream()
                .map(BookingStaffAssignmentResponse::getFullName)
                .filter(name -> !isBlank(name))
                .collect(Collectors.joining(", ")));
    }

    private void applyLegacyAssignedStaffSummary(
            BookingDetailResponse response,
            List<BookingStaffAssignmentResponse> staffMembers) {

        if (staffMembers == null || staffMembers.isEmpty()) {
            response.setAssignedStaffId(null);
            response.setAssignedStaffName(null);
            response.setAssignedStaffEmail(null);
            response.setAssignedStaffPhone(null);
            return;
        }

        BookingStaffAssignmentResponse first = staffMembers.get(0);
        response.setAssignedStaffId(first.getEmployeeId());
        response.setAssignedStaffEmail(first.getEmail());
        response.setAssignedStaffPhone(first.getPhone());
        response.setAssignedStaffName(staffMembers
                .stream()
                .map(BookingStaffAssignmentResponse::getFullName)
                .filter(name -> !isBlank(name))
                .collect(Collectors.joining(", ")));
    }

    private List<TourImageDto> loadTourImages(Tour tour) {

        List<TourImage> images = tourImageRepository.findByTourIdOrderBySortOrderAsc(tour.getId());

        if (!images.isEmpty()) {
            return images.stream().map(this::mapTourImage).toList();
        }

        if (isBlank(tour.getThumbnail())) {
            return List.of();
        }

        TourImageDto fallback = new TourImageDto();
        fallback.setImageUrl(tour.getThumbnail());
        fallback.setIsThumbnail(true);
        fallback.setSortOrder(0);

        return List.of(fallback);
    }

    private TourImageDto mapTourImage(TourImage image) {

        TourImageDto dto = new TourImageDto();
        dto.setId(image.getId());
        dto.setImageUrl(image.getImageUrl());
        dto.setIsThumbnail(image.getIsThumbnail());
        dto.setSortOrder(image.getSortOrder());

        return dto;
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

    private List<BookingScheduleDayResponse> loadBookingSchedule(Booking booking) {

        List<BookingScheduleDay> days = bookingScheduleDayRepository
                .findByBookingIdOrderByDayNumberAsc(booking.getId());

        if (days.isEmpty()) {
            return List.of();
        }

        List<Long> dayIds = days
                .stream()
                .map(BookingScheduleDay::getId)
                .toList();

        Map<Long, List<BookingScheduleActivity>> activitiesByDayId = bookingScheduleActivityRepository
                .findByScheduleDayIds(dayIds)
                .stream()
                .collect(Collectors.groupingBy(
                        activity -> activity.getBookingScheduleDay().getId()));

        return days
                .stream()
                .map(day -> mapScheduleDayResponse(
                        day,
                        booking.getTourDeparture().getDepartureDate(),
                        activitiesByDayId.getOrDefault(day.getId(), List.of())))
                .toList();
    }

    private BookingScheduleDayResponse mapScheduleDayResponse(
            BookingScheduleDay day,
            LocalDate departureDate,
            List<BookingScheduleActivity> activities) {

        BookingScheduleDayResponse response = new BookingScheduleDayResponse();

        response.setId(day.getId());
        response.setDayNumber(day.getDayNumber());
        if (departureDate != null && day.getDayNumber() != null) {
            response.setScheduleDate(departureDate.plusDays(Math.max(0, day.getDayNumber() - 1)));
        }
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
        response.setActualStartTime(activity.getActualStartTime());
        response.setActualEndTime(activity.getActualEndTime());
        response.setActualLocation(activity.getActualLocation());
        response.setAttachmentUrl(activity.getAttachmentUrl());
        response.setActualNote(activity.getActualNote());
        response.setCompletedAt(activity.getCompletedAt());
        response.setUpdatedAt(activity.getUpdatedAt());
        response.setUpdatedByEmployeeId(
                activity.getUpdatedByEmployee() != null
                        ? activity.getUpdatedByEmployee().getId()
                        : null);
        response.setUpdatedByEmployeeName(
                activity.getUpdatedByEmployee() != null
                        ? activity.getUpdatedByEmployee().getFullName()
                        : null);

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

    private String normalizeCreatePaymentType(CreateBookingRequest request) {

        String type = request != null ? trimToNull(request.getPaymentType()) : null;

        if (type == null) {
            throw new RuntimeException("Vui lòng chọn hình thức thanh toán");
        }

        String normalized = type.trim().toUpperCase();

        if (!"FULL".equals(normalized) && !"DEPOSIT".equals(normalized)) {
            throw new RuntimeException("Hình thức thanh toán không hợp lệ");
        }

        return normalized;
    }

    private String normalizePaymentMethod(String value) {

        String normalized = isBlank(value)
                ? "BANK_TRANSFER_QR"
                : value.trim().toUpperCase();

        if (!"BANK_TRANSFER_QR".equals(normalized)) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ");
        }

        return normalized;
    }

    private String resolveRemainingPaymentMethod(PayBookingRequest request) {

        String value = request != null ? trimToNull(request.getRemainingPaymentMethod()) : null;

        return resolveRemainingPaymentMethod(value);
    }

    private String resolveRemainingPaymentMethod(CreateBookingRequest request) {

        String value = request != null ? trimToNull(request.getRemainingPaymentMethod()) : null;

        return resolveRemainingPaymentMethod(value);
    }

    private String resolveRemainingPaymentMethod(String value) {

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
                boolean awaitingFinalConfirmation = "FULL".equalsIgnoreCase(booking.getPaymentPlan())
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
                .orElseThrow(() -> new RuntimeException("Kh\u00f4ng t\u00ecm th\u1ea5y ng\u01b0\u1eddi d\u00f9ng"));
    }

    private void ensureCustomer(User user) {

        if (user.getRole() == null || !RoleName.CUSTOMER.equals(user.getRole().getName())) {
            throw new RuntimeException("Chỉ tài khoản khách hàng mới được đặt tour");
        }
    }

    private User requireEmployee(String employeeEmail) {

        if (isBlank(employeeEmail)) {
            throw new RuntimeException("Bạn cần đăng nhập bằng tài khoản nhân viên");
        }

        User employee = userRepository
                .findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

        if (employee.getRole() == null
                || !RoleName.EMPLOYEE.equals(employee.getRole().getName())
                || employee.getDeletedAt() != null) {
            throw new RuntimeException("Tài khoản này không phải nhân viên");
        }

        if (!Boolean.TRUE.equals(employee.getIsActive())) {
            throw new RuntimeException("Tài khoản nhân viên đã bị vô hiệu hóa");
        }

        return employee;
    }

    private void ensureEmployeeAssignedToBooking(
            Long bookingId,
            Long employeeId) {

        if (!bookingEmployeeRepository.existsByBookingIdAndEmployeeId(bookingId, employeeId)) {
            throw new RuntimeException("Bạn không được phân công booking này");
        }
    }

    private void ensureBookingCanReceiveScheduleUpdate(Booking booking) {

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking đã hủy nên không thể cập nhật tình trạng tour");
        }

        if (booking.getStatus() == BookingStatus.PENDING) {
            throw new RuntimeException("Booking chưa được admin xác nhận");
        }
    }

    private List<BookingStaffAssignmentRequest> resolveAssignedStaffAssignments(
            UpdateBookingAdminRequest request) {

        if (request.getAssignedStaffMembers() != null) {
            Map<Long, BookingStaffAssignmentRequest> uniqueAssignments = new LinkedHashMap<>();

            for (BookingStaffAssignmentRequest assignment : request.getAssignedStaffMembers()) {
                if (assignment == null || assignment.getEmployeeId() == null) {
                    continue;
                }

                BookingStaffAssignmentRequest normalizedAssignment = new BookingStaffAssignmentRequest();
                normalizedAssignment.setEmployeeId(assignment.getEmployeeId());
                normalizedAssignment.setRoleInTrip(assignment.getRoleInTrip());
                normalizedAssignment.setNote(assignment.getNote());
                uniqueAssignments.put(assignment.getEmployeeId(), normalizedAssignment);
            }

            return new ArrayList<>(uniqueAssignments.values());
        }

        if (request.getAssignedStaffIds() != null) {
            Set<Long> uniqueIds = new LinkedHashSet<>();
            for (Long staffId : request.getAssignedStaffIds()) {
                if (staffId != null) {
                    uniqueIds.add(staffId);
                }
            }

            return uniqueIds.stream().map(staffId -> {
                BookingStaffAssignmentRequest assignment = new BookingStaffAssignmentRequest();
                assignment.setEmployeeId(staffId);
                assignment.setRoleInTrip("GUIDE");
                return assignment;
            }).toList();
        }

        if (request.getAssignedStaffId() != null) {
            BookingStaffAssignmentRequest assignment = new BookingStaffAssignmentRequest();
            assignment.setEmployeeId(request.getAssignedStaffId());
            assignment.setRoleInTrip("GUIDE");
            return List.of(assignment);
        }

        return null;
    }

    private List<BookingEmployee> syncAssignedStaffMembers(
            Booking booking,
            List<BookingStaffAssignmentRequest> staffAssignments) {

        bookingEmployeeRepository.deleteByBookingId(booking.getId());

        if (staffAssignments == null || staffAssignments.isEmpty()) {
            return List.of();
        }

        LocalDateTime assignedAt = LocalDateTime.now();
        List<BookingEmployee> assignments = staffAssignments
                .stream()
                .map(assignment -> BookingEmployee
                        .builder()
                        .booking(booking)
                        .employee(requireActiveStaff(assignment.getEmployeeId()))
                        .roleInTrip(normalizeRoleInTrip(assignment.getRoleInTrip()))
                        .note(trimToNull(assignment.getNote()))
                        .assignmentStatus("ASSIGNED")
                        .assignedAt(assignedAt)
                        .build())
                .toList();

        return bookingEmployeeRepository.saveAll(assignments);
    }

    private String normalizeRoleInTrip(String roleInTrip) {

        if (isBlank(roleInTrip)) {
            return "GUIDE";
        }

        String normalized = roleInTrip.trim().toUpperCase();

        return switch (normalized) {
            case "GUIDE",
                    "LEAD_GUIDE",
                    "ASSISTANT_GUIDE",
                    "TOUR_COORDINATOR",
                    "SUPPORT_STAFF",
                    "DRIVER" -> normalized;
            default -> throw new RuntimeException("Vai trò nhân viên không hợp lệ");
        };
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

    private BookingScheduleActivityStatus parseScheduleActivityStatus(String value) {

        if (isBlank(value)) {
            throw new RuntimeException("Vui lòng chọn trạng thái hoạt động");
        }

        try {
            return BookingScheduleActivityStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Trạng thái hoạt động không hợp lệ");
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

    private String getReportImageExtension(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }

    private boolean isBlank(String value) {

        return value == null || value.trim().isEmpty();
    }
}
