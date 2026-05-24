package com.bookingtoursonla.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookingtoursonla.dto.BookingCustomerRequest;
import com.bookingtoursonla.dto.BookingCustomerResponse;
import com.bookingtoursonla.dto.BookingDetailResponse;
import com.bookingtoursonla.dto.BookingResponse;
import com.bookingtoursonla.dto.CreateBookingRequest;
import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.BookingCustomer;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourDeparture;
import com.bookingtoursonla.entity.User;
import com.bookingtoursonla.entity.enums.BookingCustomerType;
import com.bookingtoursonla.entity.enums.BookingStatus;
import com.bookingtoursonla.entity.enums.BookingType;
import com.bookingtoursonla.entity.enums.DepartureStatus;
import com.bookingtoursonla.entity.enums.Gender;
import com.bookingtoursonla.entity.enums.PaymentStatus;
import com.bookingtoursonla.entity.enums.TourStatus;
import com.bookingtoursonla.repository.BookingCustomerRepository;
import com.bookingtoursonla.repository.BookingRepository;
import com.bookingtoursonla.repository.TourDepartureRepository;
import com.bookingtoursonla.repository.UserRepository;

@Service
public class BookingServiceImpl implements BookingService {

    private static final DateTimeFormatter BOOKING_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMdd");

    private final BookingRepository bookingRepository;

    private final BookingCustomerRepository bookingCustomerRepository;

    private final TourDepartureRepository tourDepartureRepository;

    private final UserRepository userRepository;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            BookingCustomerRepository bookingCustomerRepository,
            TourDepartureRepository tourDepartureRepository,
            UserRepository userRepository) {

        this.bookingRepository = bookingRepository;
        this.bookingCustomerRepository = bookingCustomerRepository;
        this.tourDepartureRepository = tourDepartureRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(
            CreateBookingRequest request,
            String authenticatedEmail) {

        User user = findAuthenticatedUser(authenticatedEmail);

        int adultCount = valueOrZero(request.getAdultCount());
        int childCount = valueOrZero(request.getChildCount());
        int totalPeople = adultCount + childCount;

        if (totalPeople <= 0) {
            throw new RuntimeException("Số người lớn và trẻ em phải lớn hơn 0");
        }

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

        Booking booking = new Booking();

        booking.setBookingCode(generateBookingCode());
        booking.setUser(user);
        booking.setTourDeparture(departure);
        booking.setBookingType(parseBookingType(request.getBookingType()));
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

        departure.setReservedPeople(valueOrZero(departure.getReservedPeople()) + totalPeople);
        tourDepartureRepository.save(departure);

        Booking saved = bookingRepository.save(booking);

        saveBookingCustomers(saved, request);

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

        if (!isBlank(authenticatedEmail) && booking.getUser() != null) {
            User user = requireAuthenticatedUser(authenticatedEmail);
            if (!booking.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Bạn không có quyền xem booking này");
            }
        }

        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(booking.getId());

        return mapToDetailResponse(booking, customers);
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
        leader.setGroupLeader(true);

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

    private BookingResponse mapToResponse(Booking booking) {

        TourDeparture departure = booking.getTourDeparture();
        Tour tour = departure.getTour();

        BookingResponse response = new BookingResponse();

        response.setId(booking.getId());
        response.setBookingCode(booking.getBookingCode());
        response.setStatus(booking.getStatus().name());
        response.setPaymentStatus(booking.getPaymentStatus().name());
        response.setTotalPrice(booking.getTotalPrice());
        response.setCustomerName(booking.getFullName());
        response.setTourName(tour.getTitle());
        response.setDepartureDate(departure.getDepartureDate());
        response.setAdultCount(booking.getAdultCount());
        response.setChildCount(booking.getChildCount());

        return response;
    }

    private BookingDetailResponse mapToDetailResponse(
            Booking booking,
            List<BookingCustomer> customers) {

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
        response.setTourName(tour.getTitle());
        response.setTourThumbnail(tour.getThumbnail());
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
        response.setBookedAt(booking.getBookedAt());
        response.setCustomers(customers.stream().map(this::mapCustomerResponse).toList());

        return response;
    }

    private BookingCustomerResponse mapCustomerResponse(BookingCustomer customer) {

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
        response.setGroupLeader(customer.getGroupLeader());
        response.setHealthNote(customer.getHealthNote());

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

    private User findAuthenticatedUser(String authenticatedEmail) {

        if (isBlank(authenticatedEmail)) {
            return null;
        }

        return userRepository
                .findByEmail(authenticatedEmail)
                .orElse(null);
    }

    private User requireAuthenticatedUser(String authenticatedEmail) {

        if (isBlank(authenticatedEmail)) {
            throw new RuntimeException("Bạn cần đăng nhập để xem thông tin booking");
        }

        return userRepository
                .findByEmail(authenticatedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
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
