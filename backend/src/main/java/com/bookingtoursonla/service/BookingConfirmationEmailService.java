package com.bookingtoursonla.service;

import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.BRAND_NAME;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.bookingStatusLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.bookingTypeLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.customerTypeLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.fallback;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatCurrency;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatDate;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatOptionalTime;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.paymentMethodLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.paymentStatusLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.plain;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.value;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.BookingCustomer;
import com.bookingtoursonla.entity.BookingScheduleActivity;
import com.bookingtoursonla.entity.BookingScheduleDay;
import com.bookingtoursonla.exception.EmailDeliveryException;
import com.bookingtoursonla.repository.BookingCustomerRepository;
import com.bookingtoursonla.repository.BookingRepository;
import com.bookingtoursonla.repository.BookingScheduleActivityRepository;
import com.bookingtoursonla.repository.BookingScheduleDayRepository;

@Service
public class BookingConfirmationEmailService {

    private static final Logger log = LoggerFactory.getLogger(BookingConfirmationEmailService.class);
    private static final String EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

    private final BookingRepository bookingRepository;
    private final BookingCustomerRepository bookingCustomerRepository;
    private final BookingScheduleDayRepository bookingScheduleDayRepository;
    private final BookingScheduleActivityRepository bookingScheduleActivityRepository;
    private final BookingEmailTemplateBuilder templateBuilder;
    private final RestClient restClient;
    private final boolean enabled;
    private final String serviceId;
    private final String templateId;
    private final String publicKey;
    private final String privateKey;
    private final String publicUrl;
    private final String assetPublicUrl;

    public BookingConfirmationEmailService(
            BookingRepository bookingRepository,
            BookingCustomerRepository bookingCustomerRepository,
            BookingScheduleDayRepository bookingScheduleDayRepository,
            BookingScheduleActivityRepository bookingScheduleActivityRepository,
            BookingEmailTemplateBuilder templateBuilder,
            RestClient.Builder restClientBuilder,
            @Value("${app.email.emailjs.enabled:false}") boolean enabled,
            @Value("${app.email.emailjs.service-id:}") String serviceId,
            @Value("${app.email.emailjs.template-id:}") String templateId,
            @Value("${app.email.emailjs.public-key:}") String publicKey,
            @Value("${app.email.emailjs.private-key:}") String privateKey,
            @Value("${app.public-url:http://localhost:5173}") String publicUrl,
            @Value("${app.asset-public-url:http://localhost:8080}") String assetPublicUrl) {

        this.bookingRepository = bookingRepository;
        this.bookingCustomerRepository = bookingCustomerRepository;
        this.bookingScheduleDayRepository = bookingScheduleDayRepository;
        this.bookingScheduleActivityRepository = bookingScheduleActivityRepository;
        this.templateBuilder = templateBuilder;
        this.restClient = restClientBuilder.build();
        this.enabled = enabled;
        this.serviceId = serviceId;
        this.templateId = templateId;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.publicUrl = CustomerEmailTemplateSupport.stripTrailingSlash(publicUrl, "http://localhost:5173");
        this.assetPublicUrl = CustomerEmailTemplateSupport.stripTrailingSlash(assetPublicUrl, "http://localhost:8080");

        log.info(
                "Email xác nhận booking qua EmailJS đang {}",
                enabled ? "BẬT" : "TẮT");
    }

    public void sendBookingConfirmation(Long bookingId) {

        if (!enabled) {
            log.debug("Booking confirmation email is disabled");
            return;
        }

        validateConfiguration();

        Booking booking = bookingRepository
                .findForConfirmationEmail(bookingId)
                .orElseThrow(() -> new IllegalStateException("Booking không tồn tại để gửi email"));
        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(bookingId);
        List<BookingScheduleDay> scheduleDays = bookingScheduleDayRepository
                .findByBookingIdOrderByDayNumberAsc(bookingId);
        Map<Long, List<BookingScheduleActivity>> activitiesByDayId = loadActivitiesByDayId(scheduleDays);

        String bookingUrl = publicUrl + "/tai-khoan/booking/" + booking.getId();
        String subject = "[" + BRAND_NAME + "] Xác nhận đặt tour " + booking.getBookingCode();
        String emailHtml = CustomerEmailTemplateSupport.compactFallbackEmailHtml(
                booking,
                "Đặt tour thành công",
                "Tây Bắc Travel đã ghi nhận yêu cầu đặt tour của bạn. Vui lòng kiểm tra lại thông tin hành trình và danh sách khách trong tài khoản.",
                bookingUrl,
                "Xem chi tiết đặt tour",
                publicUrl,
                assetPublicUrl);
        String emailText = buildPlainTextFallback(booking, bookingUrl);

        Map<String, Object> templateParams = new LinkedHashMap<>();
        templateParams.put("to_email", booking.getEmail());
        templateParams.put("to", booking.getEmail());
        templateParams.put("to_name", booking.getFullName());
        templateParams.put("name", booking.getFullName());
        templateParams.put("from_name", BRAND_NAME);
        templateParams.put("reply_to", booking.getEmail());
        templateParams.put("subject", subject);
        templateParams.put("booking_code", booking.getBookingCode());
        templateParams.put("message", emailText);
        templateParams.put("email_text", emailText);
        addStaticTemplateParams(
                templateParams,
                booking,
                customers,
                bookingUrl,
                scheduleDays,
                activitiesByDayId);
        templateParams.put("order_id", booking.getBookingCode());
        templateParams.put("email", booking.getEmail());
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("service_id", serviceId);
        request.put("template_id", templateId);
        request.put("user_id", publicKey);
        if (!isBlank(privateKey)) {
            request.put("accessToken", privateKey);
        }
        request.put("template_params", templateParams);

        try {
            restClient.post()
                    .uri(EMAILJS_SEND_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            String providerMessage = sanitizeProviderMessage(ex.getResponseBodyAsString());
            log.error(
                    "EmailJS từ chối yêu cầu gửi booking {} (HTTP {}): {}",
                    booking.getBookingCode(),
                    ex.getStatusCode().value(),
                    providerMessage);
            throw new EmailDeliveryException(
                    buildUserFacingError(ex.getStatusCode().value(), providerMessage),
                    ex);
        } catch (Exception ex) {
            log.error(
                    "Không thể kết nối EmailJS để gửi booking {}: {}",
                    booking.getBookingCode(),
                    ex.getMessage());
            throw new EmailDeliveryException(
                    "Chưa thể kết nối dịch vụ gửi email. Vui lòng thử lại sau.",
                    ex);
        }

        log.info(
                "Booking confirmation email sent for booking {} to {}",
                booking.getBookingCode(),
                maskEmail(booking.getEmail()));
    }

    private Map<Long, List<BookingScheduleActivity>> loadActivitiesByDayId(
            List<BookingScheduleDay> scheduleDays) {

        List<Long> dayIds = scheduleDays.stream()
                .map(BookingScheduleDay::getId)
                .filter(id -> id != null)
                .toList();
        if (dayIds.isEmpty()) {
            return Map.of();
        }

        return bookingScheduleActivityRepository.findByScheduleDayIds(dayIds)
                .stream()
                .collect(Collectors.groupingBy(
                        activity -> activity.getBookingScheduleDay().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));
    }

    private void validateConfiguration() {

        if (isBlank(serviceId) || isBlank(templateId) || isBlank(publicKey)) {
            throw new IllegalStateException(
                    "Thiếu cấu hình EmailJS: service ID, template ID hoặc public key");
        }
    }

    private String buildPlainTextFallback(Booking booking, String bookingUrl) {

        var departure = booking.getTourDeparture();
        var tour = departure.getTour();

        return """
                TÂY BẮC TRAVEL - XÁC NHẬN ĐẶT TOUR

                Mã booking: %s
                Khách hàng: %s
                Email: %s
                Số điện thoại: %s
                Tour: %s
                Ngày khởi hành: %s
                Giờ khởi hành: %s
                Tổng số khách: %s
                Tổng giá tour: %s
                Trạng thái booking: %s
                Trạng thái thanh toán: %s

                Xem chi tiết: %s
                """.formatted(
                plain(booking.getBookingCode()),
                plain(booking.getFullName()),
                plain(booking.getEmail()),
                plain(booking.getPhone()),
                plain(tour.getTitle()),
                formatDate(departure.getDepartureDate()),
                departure.getDepartureTime() != null
                        ? formatOptionalTime(departure.getDepartureTime())
                        : "Đang cập nhật",
                value(booking.getTotalPeople()),
                formatCurrency(booking.getTotalPrice()),
                bookingStatusLabel(booking),
                paymentStatusLabel(booking),
                bookingUrl);
    }

    private void addStaticTemplateParams(
            Map<String, Object> params,
            Booking booking,
            List<BookingCustomer> customers,
            String bookingUrl,
            List<BookingScheduleDay> scheduleDays,
            Map<Long, List<BookingScheduleActivity>> activitiesByDayId) {

        var departure = booking.getTourDeparture();
        var tour = departure.getTour();

        params.put("brand_name", BRAND_NAME);
        params.put("brand_logo_url", CustomerEmailTemplateSupport.logoUrl(publicUrl));
        params.put("logo_url", CustomerEmailTemplateSupport.logoUrl(publicUrl));
        params.put("tour_image_url", CustomerEmailTemplateSupport.tourImageUrl(tour, assetPublicUrl, publicUrl));
        params.put("customer_name", plain(booking.getFullName()));
        params.put("customer_phone", plain(booking.getPhone()));
        params.put("customer_email", plain(booking.getEmail()));
        params.put("pickup_address", fallback(booking.getPickupAddress()));
        params.put("tour_name", plain(tour.getTitle()));
        params.put("departure_date", formatDate(departure.getDepartureDate()));
        params.put(
                "departure_time",
                departure.getDepartureTime() != null
                        ? formatOptionalTime(departure.getDepartureTime())
                        : "Đang cập nhật");
        params.put(
                "duration",
                value(tour.getDurationDays()) + " ngày "
                        + value(tour.getDurationNights()) + " đêm");
        params.put("departure_location", fallback(tour.getDepartureLocation()));
        params.put("booking_type", bookingTypeLabel(booking));
        params.put("booking_status", bookingStatusLabel(booking));
        params.put("payment_status", paymentStatusLabel(booking));
        params.put("payment_method", paymentMethodLabel(booking.getPaymentMethod()));
        params.put("adult_count", value(booking.getAdultCount()));
        params.put("child_count", value(booking.getChildCount()));
        params.put("total_people", value(booking.getTotalPeople()));
        params.put("adult_price", formatCurrency(booking.getAdultPriceSnapshot()));
        params.put("child_price", formatCurrency(booking.getChildPriceSnapshot()));
        params.put("total_price", formatCurrency(booking.getTotalPrice()));
        params.put("paid_amount", formatCurrency(booking.getPaidAmount()));
        params.put("remaining_amount", formatCurrency(booking.getRemainingAmount()));
        params.put("note", fallback(booking.getNote()));
        params.put("special_request", fallback(booking.getSpecialRequest()));
        params.put("booking_url", bookingUrl);
        params.put("passenger_summary", buildPassengerSummary(customers));
        params.put(
                "itinerary_summary",
                CustomerEmailTemplateSupport.scheduleSummary(scheduleDays, activitiesByDayId));
    }

    private String buildPassengerSummary(List<BookingCustomer> customers) {

        if (customers == null || customers.isEmpty()) {
            return "Thông tin hành khách đang được cập nhật.";
        }

        return customers.stream()
                .limit(CustomerEmailTemplateSupport.MAX_CUSTOMERS_IN_EMAIL)
                .map(customer -> "- "
                        + fallback(customer.getFullName())
                        + " - "
                        + customerTypeLabel(customer)
                        + (Boolean.TRUE.equals(customer.getGroupLeader())
                                ? " (Trưởng đoàn)"
                                : ""))
                .collect(Collectors.joining("\n"));
    }

    private String maskEmail(String email) {

        if (isBlank(email) || !email.contains("@")) {
            return "***";
        }

        String[] parts = email.split("@", 2);
        String name = parts[0];
        String visible = name.length() <= 2 ? name.substring(0, 1) : name.substring(0, 2);

        return visible + "***@" + parts[1];
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String sanitizeProviderMessage(String value) {

        if (isBlank(value)) {
            return "Không có nội dung phản hồi";
        }

        return value.replaceAll("[\\r\\n]+", " ").trim();
    }

    private String buildUserFacingError(int status, String providerMessage) {

        String normalized = providerMessage.toLowerCase();

        if (normalized.contains("account not found")) {
            return "EmailJS không nhận diện được tài khoản từ Public Key hiện tại. "
                    + "Vui lòng tạo hoặc sao chép lại Public Key trong EmailJS Account > General, "
                    + "cập nhật EMAILJS_PUBLIC_KEY rồi khởi động lại backend.";
        }

        if (normalized.contains("service") && normalized.contains("not found")) {
            return "Không tìm thấy Email Service trên EmailJS. "
                    + "Vui lòng kiểm tra EMAILJS_SERVICE_ID và trạng thái kết nối dịch vụ email.";
        }

        if (normalized.contains("template") && normalized.contains("not found")) {
            return "Không tìm thấy mẫu email trên EmailJS. "
                    + "Vui lòng kiểm tra EMAILJS_TEMPLATE_ID.";
        }

        if (normalized.contains("non-browser environments")
                || normalized.contains("non-browser applications")) {
            return "Cặp khóa EmailJS hợp lệ nhưng tài khoản đang chặn gửi từ backend. "
                    + "Vui lòng mở EmailJS Dashboard > Account > Security và bật "
                    + "\"Allow EmailJS API for non-browser applications\", sau đó thử lại.";
        }

        if (status == 401 || status == 403) {
            return "EmailJS từ chối thông tin xác thực. "
                    + "Vui lòng kiểm tra Public Key và Private Key trong cấu hình backend.";
        }

        if (status == 429) {
            return "EmailJS đang giới hạn số lần gửi. Vui lòng chờ ít phút rồi thử lại.";
        }

        return "EmailJS chưa thể gửi email xác nhận (HTTP " + status
                + "). Vui lòng kiểm tra cấu hình dịch vụ và thử lại.";
    }
}
