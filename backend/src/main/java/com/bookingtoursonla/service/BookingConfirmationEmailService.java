package com.bookingtoursonla.service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.HtmlUtils;

import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.BookingCustomer;
import com.bookingtoursonla.exception.EmailDeliveryException;
import com.bookingtoursonla.repository.BookingCustomerRepository;
import com.bookingtoursonla.repository.BookingRepository;

@Service
public class BookingConfirmationEmailService {

    private static final Logger log = LoggerFactory.getLogger(BookingConfirmationEmailService.class);
    private static final String EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";
    private static final Locale VIETNAMESE = Locale.forLanguageTag("vi-VN");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final BookingRepository bookingRepository;
    private final BookingCustomerRepository bookingCustomerRepository;
    private final BookingEmailTemplateBuilder templateBuilder;
    private final RestClient restClient;
    private final boolean enabled;
    private final String serviceId;
    private final String templateId;
    private final String publicKey;
    private final String privateKey;
    private final String publicUrl;

    public BookingConfirmationEmailService(
            BookingRepository bookingRepository,
            BookingCustomerRepository bookingCustomerRepository,
            BookingEmailTemplateBuilder templateBuilder,
            RestClient.Builder restClientBuilder,
            @Value("${app.email.emailjs.enabled:false}") boolean enabled,
            @Value("${app.email.emailjs.service-id:}") String serviceId,
            @Value("${app.email.emailjs.template-id:}") String templateId,
            @Value("${app.email.emailjs.public-key:}") String publicKey,
            @Value("${app.email.emailjs.private-key:}") String privateKey,
            @Value("${app.public-url:http://localhost:5173}") String publicUrl) {

        this.bookingRepository = bookingRepository;
        this.bookingCustomerRepository = bookingCustomerRepository;
        this.templateBuilder = templateBuilder;
        this.restClient = restClientBuilder.build();
        this.enabled = enabled;
        this.serviceId = serviceId;
        this.templateId = templateId;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.publicUrl = stripTrailingSlash(publicUrl);

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
        String bookingUrl = publicUrl + "/tai-khoan/booking/" + booking.getId();
        String subject = "[Tây Bắc Travel] Xác nhận đặt tour " + booking.getBookingCode();
        String emailHtml = templateBuilder.build(booking, customers, bookingUrl);
        String emailText = buildPlainTextFallback(booking, bookingUrl);

        Map<String, Object> templateParams = new LinkedHashMap<>();
        templateParams.put("to_email", booking.getEmail());
        templateParams.put("to_name", booking.getFullName());
        templateParams.put("subject", subject);
        templateParams.put("booking_code", booking.getBookingCode());
        templateParams.put("email_html", emailHtml);
        templateParams.put("email_html}", emailHtml);
        templateParams.put("message_html", emailHtml);
        templateParams.put("message", emailText);
        templateParams.put("email_text", emailText);
        addStaticTemplateParams(templateParams, booking, customers, bookingUrl);
        templateParams.put("order_id", booking.getBookingCode());
        templateParams.put("email", booking.getEmail());
        templateParams.put(
                "orders",
                List.of(Map.of(
                        "name", booking.getTourDeparture().getTour().getTitle(),
                        "units", booking.getTotalPeople(),
                        "price", booking.getTotalPrice())));
        templateParams.put(
                "cost",
                Map.of(
                        "shipping", 0,
                        "tax", 0,
                        "total", booking.getTotalPrice()));

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

    private void validateConfiguration() {

        if (isBlank(serviceId) || isBlank(templateId) || isBlank(publicKey)) {
            throw new IllegalStateException(
                    "Thiếu cấu hình EmailJS: service ID, template ID hoặc public key");
        }
    }

    private String stripTrailingSlash(String value) {

        String normalized = isBlank(value) ? "http://localhost:5173" : value.trim();

        return normalized.replaceAll("/+$", "");
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

    private String buildPlainTextFallback(Booking booking, String bookingUrl) {

        return """
                TÂY BẮC TRAVEL - XÁC NHẬN ĐẶT TOUR

                Mã booking: %s
                Khách hàng: %s
                Email: %s
                Số điện thoại: %s
                Tour: %s
                Ngày khởi hành: %s
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
                plain(booking.getTourDeparture().getTour().getTitle()),
                booking.getTourDeparture().getDepartureDate(),
                booking.getTotalPeople(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getPaymentStatus(),
                bookingUrl);
    }

    private String plain(String value) {
        return HtmlUtils.htmlUnescape(value == null ? "" : value.trim());
    }

    private void addStaticTemplateParams(
            Map<String, Object> params,
            Booking booking,
            List<BookingCustomer> customers,
            String bookingUrl) {

        var departure = booking.getTourDeparture();
        var tour = departure.getTour();

        params.put("brand_name", "Tây Bắc Travel");
        params.put("customer_name", plain(booking.getFullName()));
        params.put("customer_phone", plain(booking.getPhone()));
        params.put("customer_email", plain(booking.getEmail()));
        params.put("pickup_address", fallback(booking.getPickupAddress()));
        params.put("tour_name", plain(tour.getTitle()));
        params.put(
                "departure_date",
                departure.getDepartureDate() != null
                        ? DATE_FORMAT.format(departure.getDepartureDate())
                        : "Đang cập nhật");
        params.put(
                "departure_time",
                departure.getDepartureTime() != null
                        ? TIME_FORMAT.format(departure.getDepartureTime())
                        : "Đang cập nhật");
        params.put(
                "duration",
                value(tour.getDurationDays()) + " ngày "
                        + value(tour.getDurationNights()) + " đêm");
        params.put("departure_location", fallback(tour.getDepartureLocation()));
        params.put("booking_type", bookingTypeLabel(booking));
        params.put("booking_status", bookingStatusLabel(booking));
        params.put("payment_status", paymentStatusLabel(booking));
        params.put("payment_method", fallback(booking.getPaymentMethod()));
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
    }

    private String buildPassengerSummary(List<BookingCustomer> customers) {

        if (customers == null || customers.isEmpty()) {
            return "Thông tin hành khách đang được cập nhật.";
        }

        return customers.stream()
                .limit(20)
                .map(customer -> "• "
                        + fallback(customer.getFullName())
                        + " — "
                        + (customer.getCustomerType() != null
                                ? customer.getCustomerType().name()
                                : "Hành khách")
                        + (Boolean.TRUE.equals(customer.getGroupLeader())
                                ? " (Trưởng đoàn)"
                                : ""))
                .collect(Collectors.joining("\n"));
    }

    private String bookingTypeLabel(Booking booking) {
        if (booking.getBookingType() == null) {
            return "Cá nhân";
        }

        return switch (booking.getBookingType()) {
            case GROUP -> "Theo đoàn";
            case PRIVATE -> "Tour riêng";
            default -> "Cá nhân";
        };
    }

    private String bookingStatusLabel(Booking booking) {
        if (booking.getStatus() == null) {
            return "Đang xử lý";
        }

        return switch (booking.getStatus()) {
            case CONFIRMED -> "Đã xác nhận";
            case CANCELLED -> "Đã hủy";
            case IN_PROGRESS -> "Đang diễn ra";
            case COMPLETED -> "Đã hoàn thành";
            default -> "Đang chờ xác nhận";
        };
    }

    private String paymentStatusLabel(Booking booking) {
        if (booking.getPaymentStatus() == null) {
            return "Chưa thanh toán";
        }

        return switch (booking.getPaymentStatus()) {
            case PAID -> "Đã thanh toán toàn bộ";
            case PARTIAL -> "Đã đặt cọc";
            case PENDING_REVIEW -> "Đang chờ xác nhận thanh toán";
            case REFUNDED -> "Đã hoàn tiền";
            case PARTIALLY_REFUNDED -> "Đã hoàn một phần";
            case FORFEITED -> "Khoản thanh toán không được hoàn";
            case FAILED -> "Thanh toán chưa thành công";
            default -> "Chưa thanh toán";
        };
    }

    private String formatCurrency(BigDecimal amount) {
        NumberFormat format = NumberFormat.getNumberInstance(VIETNAMESE);
        format.setMaximumFractionDigits(0);
        return format.format(amount != null ? amount : BigDecimal.ZERO) + " đ";
    }

    private String fallback(String value) {
        return value == null || value.isBlank() ? "Không có" : plain(value);
    }

    private int value(Integer number) {
        return number != null ? number : 0;
    }
}
