package com.bookingtoursonla.service;

import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.BRAND_NAME;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.HOTLINE;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.SUPPORT_EMAIL;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.escape;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.fallback;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatCurrency;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatDate;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatOptionalTime;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.hasText;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.logoUrl;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.multiline;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.paymentMethodLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.paymentStatusLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.plain;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.renderItinerary;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.tourImageUrl;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.value;

import java.math.BigDecimal;
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
public class AdminBookingConfirmationEmailService {

    private static final Logger log = LoggerFactory.getLogger(AdminBookingConfirmationEmailService.class);
    private static final String EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

    private final BookingRepository bookingRepository;
    private final BookingCustomerRepository bookingCustomerRepository;
    private final BookingScheduleDayRepository bookingScheduleDayRepository;
    private final BookingScheduleActivityRepository bookingScheduleActivityRepository;
    private final RestClient restClient;
    private final boolean enabled;
    private final String serviceId;
    private final String templateId;
    private final String publicKey;
    private final String privateKey;
    private final String publicUrl;
    private final String assetPublicUrl;

    public AdminBookingConfirmationEmailService(
            BookingRepository bookingRepository,
            BookingCustomerRepository bookingCustomerRepository,
            BookingScheduleDayRepository bookingScheduleDayRepository,
            BookingScheduleActivityRepository bookingScheduleActivityRepository,
            RestClient.Builder restClientBuilder,
            @Value("${app.email.emailjs.admin-confirm.enabled:false}") boolean enabled,
            @Value("${app.email.emailjs.admin-confirm.service-id:}") String serviceId,
            @Value("${app.email.emailjs.admin-confirm.template-id:}") String templateId,
            @Value("${app.email.emailjs.admin-confirm.public-key:}") String publicKey,
            @Value("${app.email.emailjs.admin-confirm.private-key:}") String privateKey,
            @Value("${app.public-url:http://localhost:5173}") String publicUrl,
            @Value("${app.asset-public-url:http://localhost:8080}") String assetPublicUrl) {

        this.bookingRepository = bookingRepository;
        this.bookingCustomerRepository = bookingCustomerRepository;
        this.bookingScheduleDayRepository = bookingScheduleDayRepository;
        this.bookingScheduleActivityRepository = bookingScheduleActivityRepository;
        this.restClient = restClientBuilder.build();
        this.enabled = enabled;
        this.serviceId = serviceId;
        this.templateId = templateId;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.publicUrl = CustomerEmailTemplateSupport.stripTrailingSlash(publicUrl, "http://localhost:5173");
        this.assetPublicUrl = CustomerEmailTemplateSupport.stripTrailingSlash(assetPublicUrl, "http://localhost:8080");

        log.info(
                "Admin booking confirmation email via EmailJS is {}",
                enabled ? "ENABLED" : "DISABLED");
    }

    public void sendAdminConfirmation(Long bookingId) {

        if (!enabled) {
            log.debug("Admin booking confirmation email is disabled");
            return;
        }

        validateConfiguration();

        Booking booking = bookingRepository
                .findForConfirmationEmail(bookingId)
                .orElseThrow(() -> new IllegalStateException("Booking không tồn tại để gửi email xác nhận"));
        List<BookingCustomer> customers = bookingCustomerRepository
                .findByBookingIdOrderByIdAsc(bookingId);
        List<BookingScheduleDay> scheduleDays = bookingScheduleDayRepository
                .findByBookingIdOrderByDayNumberAsc(bookingId);

        String bookingUrl = publicUrl + "/tai-khoan/booking/" + booking.getId();
        String subject = "[" + BRAND_NAME + "] Tour của bạn đã được xác nhận - "
                + booking.getBookingCode();
        String emailHtml = CustomerEmailTemplateSupport.compactFallbackEmailHtml(
                booking,
                "Tour của bạn đã được xác nhận",
                "Admin Tây Bắc Travel đã xác nhận booking của bạn. Hãy kiểm tra thông tin tour, điểm đón và chuẩn bị sẵn sàng cho ngày khởi hành.",
                bookingUrl,
                "Xem chi tiết booking",
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
        templateParams.put("email_html", emailHtml);
        templateParams.put("email_html}", emailHtml);
        templateParams.put("message_html", emailHtml);
        templateParams.put("message", emailText);
        templateParams.put("email_text", emailText);
        addTemplateParams(templateParams, booking, customers, scheduleDays, bookingUrl);

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
                    "EmailJS từ chối email admin xác nhận cho booking {} (HTTP {}): {}",
                    booking.getBookingCode(),
                    ex.getStatusCode().value(),
                    providerMessage);
            throw new EmailDeliveryException(
                    buildUserFacingError(ex.getStatusCode().value(), providerMessage),
                    ex);
        } catch (Exception ex) {
            log.error(
                    "Cannot connect to EmailJS to send admin confirmation for booking {}: {}",
                    booking.getBookingCode(),
                    ex.getMessage());
            throw new EmailDeliveryException(
                    "Chưa thể kết nối dịch vụ gửi email xác nhận tour. Vui lòng thử lại sau.",
                    ex);
        }

        log.info(
                "Admin confirmation email sent for booking {} to {}",
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
                    "Thiếu cấu hình EmailJS admin confirm: service ID, template ID hoặc public key");
        }
    }

    private String buildEmailHtml(
            Booking booking,
            List<BookingCustomer> customers,
            List<BookingScheduleDay> scheduleDays,
            Map<Long, List<BookingScheduleActivity>> activitiesByDayId,
            String bookingUrl) {

        var departure = booking.getTourDeparture();
        var tour = departure.getTour();
        String safeBookingUrl = escape(bookingUrl);
        String safeLogoUrl = escape(logoUrl(publicUrl));
        String safeHeroImageUrl = escape(tourImageUrl(tour, assetPublicUrl, publicUrl));
        String departureLabel = formatDate(departure.getDepartureDate())
                + (departure.getDepartureTime() != null
                        ? " lúc " + formatOptionalTime(departure.getDepartureTime())
                        : "");

        StringBuilder html = new StringBuilder(36000);
        html.append("""
                <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0">
                  Tour của bạn đã được admin Tây Bắc Travel xác nhận. Hãy kiểm tra lịch trình và chuẩn bị trước ngày khởi hành.
                </div>
                <div style="margin:0;padding:28px 10px;background:#eef5ec;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;font-size:14px;line-height:1.65">
                  <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 20px 70px rgba(15,35,27,.16)">
                    <div style="height:8px;background:linear-gradient(90deg,#0f6b43,#9acb7d,#d2a04d)"></div>
                    <div style="padding:22px 30px;background:#ffffff;border-bottom:1px solid #e3ece0">
                      <table role="presentation" style="width:100%%;border-collapse:collapse">
                        <tr>
                          <td style="vertical-align:middle">
                            <img src="%s" width="72" alt="Tây Bắc Travel" style="display:block;width:72px;height:72px;object-fit:contain" />
                          </td>
                          <td style="vertical-align:middle;text-align:right">
                            <div style="font-size:11px;font-weight:900;letter-spacing:2.4px;color:#0f6b43;text-transform:uppercase">%s</div>
                            <div style="margin-top:5px;display:inline-block;padding:8px 13px;border-radius:999px;background:#eef8ea;color:#174d34;font-size:12px;font-weight:900;border:1px solid #cfe4ca">%s</div>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="background:#10231b;color:#ffffff">
                      <img src="%s" width="760" alt="Cảnh sắc Sơn La" style="display:block;width:100%%;max-height:270px;object-fit:cover;background:#f7faf6" />
                      <div style="padding:30px 32px 32px;background:linear-gradient(135deg,#10231b,#19432d 60%%,#7a5b2a)">
                        <div style="font-size:12px;font-weight:900;letter-spacing:2.2px;color:#c9f8cc;text-transform:uppercase">Tour đã được xác nhận</div>
                        <div style="margin-top:8px;font-size:29px;line-height:1.25;font-weight:900">%s, hành trình của bạn đã sẵn sàng</div>
                        <p style="margin:14px 0 0;color:#e8f5e8;font-size:15px">
                          Admin Tây Bắc Travel đã kiểm tra và xác nhận booking <strong>%s</strong>. Từ thời điểm này, đội ngũ điều hành sẽ chuẩn bị lịch trình, điều phối hướng dẫn viên và các dịch vụ cần thiết để chuyến đi của bạn diễn ra trọn vẹn.
                        </p>
                      </div>
                    </div>

                    <div style="padding:30px 32px">
                      <div style="padding:20px;border:1px solid #dfe8de;border-radius:18px;background:linear-gradient(135deg,#f7fbf4,#fffaf0)">
                        <div style="font-size:11px;font-weight:900;letter-spacing:1.7px;color:#0f6b43;text-transform:uppercase">Thông tin hành trình</div>
                        <div style="margin-top:7px;font-size:23px;line-height:1.35;font-weight:900;color:#10231b">%s</div>
                        <table role="presentation" style="width:100%%;margin-top:16px;border-collapse:collapse">
                          <tr>
                            %s
                            %s
                          </tr>
                          <tr>
                            %s
                            %s
                          </tr>
                        </table>
                      </div>
                """.formatted(
                safeLogoUrl,
                escape(BRAND_NAME),
                escape("Mã booking: " + booking.getBookingCode()),
                safeHeroImageUrl,
                escape(booking.getFullName()),
                escape(booking.getBookingCode()),
                escape(tour.getTitle()),
                metricCell("Ngày khởi hành", departureLabel),
                metricCell("Thời lượng", value(tour.getDurationDays()) + " ngày " + value(tour.getDurationNights()) + " đêm"),
                metricCell("Điểm khởi hành", fallback(tour.getDepartureLocation())),
                metricCell("Tổng số khách", value(booking.getTotalPeople()) + " khách")));

        html.append("""
                      <div style="margin-top:26px;font-size:18px;font-weight:900;color:#0f241b">Các bước chuẩn bị trước chuyến đi</div>
                      <table role="presentation" style="width:100%%;margin-top:12px;border-collapse:collapse">
                        <tr>
                          %s
                          %s
                        </tr>
                        <tr>
                          %s
                          %s
                        </tr>
                      </table>
                """.formatted(
                checklistCell("Kiểm tra thông tin", "Đối chiếu họ tên, số điện thoại, email và danh sách hành khách trong booking."),
                checklistCell("Chuẩn bị giấy tờ", "Mang giấy tờ tùy thân cần thiết cho người lớn, trẻ em và các giấy tờ ưu tiên nếu có."),
                checklistCell("Sắp xếp điểm đón", "Có mặt đúng giờ tại điểm đón hoặc chủ động báo lại nếu cần thay đổi địa điểm."),
                checklistCell("Hoàn tất thanh toán", "Theo dõi khoản còn lại và phương thức thanh toán đã chọn để không ảnh hưởng lịch khởi hành.")));

        html.append("""
                      <div style="margin-top:26px;font-size:18px;font-weight:900;color:#0f241b">Thông tin liên hệ</div>
                      <table role="presentation" style="width:100%;margin-top:12px;border-collapse:separate;border-spacing:0;border:1px solid #e2e8df;border-radius:16px;overflow:hidden">
                """)
                .append(infoRow("Khách hàng", booking.getFullName(), false))
                .append(infoRow("Email", booking.getEmail(), true))
                .append(infoRow("Số điện thoại", booking.getPhone(), false))
                .append(infoRow("Điểm đón", fallback(booking.getPickupAddress()), true))
                .append(infoRow("Trạng thái booking", "Đã xác nhận", false))
                .append(infoRow("Trạng thái thanh toán", paymentStatusLabel(booking), true))
                .append("""
                      </table>

                      <div style="margin-top:28px;padding:22px;border-radius:18px;background:#10231b;color:#ffffff">
                        <div style="font-size:18px;font-weight:900">Chi phí booking</div>
                        <table role="presentation" style="width:100%;margin-top:12px;border-collapse:collapse">
                """)
                .append(priceRow("Người lớn", value(booking.getAdultCount()), booking.getAdultPriceSnapshot()))
                .append(priceRow("Trẻ em / em bé", value(booking.getChildCount()), booking.getChildPriceSnapshot()))
                .append(totalRow("Tổng giá tour", formatCurrency(booking.getTotalPrice())))
                .append(totalRow("Đã thanh toán", formatCurrency(booking.getPaidAmount())))
                .append(totalRow("Còn lại", formatCurrency(booking.getRemainingAmount())))
                .append("""
                        </table>
                        <div style="margin-top:12px;color:#dfeee2">Phương thức thanh toán: <strong>%s</strong></div>
                      </div>
                """.formatted(escape(paymentMethodLabel(booking.getPaymentMethod()))));

        html.append("""
                      <div style="margin-top:28px;padding:18px 20px;border-left:5px solid #0f6b43;border-radius:6px 16px 16px 6px;background:#f4faf1;color:#40524a">
                        <div style="font-size:16px;font-weight:900;color:#10231b">Hành khách tham gia</div>
                        <div style="margin-top:8px">%s</div>
                      </div>
                """.formatted(multiline(buildPassengerSummary(customers))));

        html.append("""
                      <div style="margin-top:28px">
                        <div style="font-size:18px;font-weight:900;color:#0f241b">Lịch trình đã xác nhận</div>
                        <div style="margin-top:4px;color:#64746a">Đội ngũ điều hành sẽ bám theo lịch trình dưới đây. Nếu cần điều chỉnh vì thời tiết hoặc điều kiện thực tế, hướng dẫn viên sẽ thông báo cho đoàn.</div>
                """)
                .append(renderItinerary(scheduleDays, activitiesByDayId, false))
                .append("""
                      </div>
                """);

        if (hasText(booking.getSpecialRequest()) || hasText(booking.getNote())) {
            html.append("""
                    <div style="margin-top:28px;padding:18px 20px;border-radius:16px;background:#fff8ed;border:1px solid #f0dfc1;color:#4b3925">
                      <div style="font-size:16px;font-weight:900;color:#2f2418">Ghi chú của booking</div>
                    """);
            if (hasText(booking.getNote())) {
                html.append("<div style=\"margin-top:8px\"><strong>Ghi chú:</strong> ")
                        .append(multiline(booking.getNote()))
                        .append("</div>");
            }
            if (hasText(booking.getSpecialRequest())) {
                html.append("<div style=\"margin-top:8px\"><strong>Yêu cầu đặc biệt:</strong> ")
                        .append(multiline(booking.getSpecialRequest()))
                        .append("</div>");
            }
            html.append("</div>");
        }

        html.append("""
                      <div style="margin-top:30px;text-align:center">
                        <a href="%s" target="_blank" style="display:inline-block;padding:14px 24px;border-radius:14px;background:#0f6b43;color:#ffffff;text-decoration:none;font-weight:900">Xem chi tiết booking</a>
                      </div>

                      <div style="margin-top:22px;color:#64746a;font-size:12px;text-align:center">
                        Nếu cần thay đổi thông tin điểm đón, số điện thoại hoặc yêu cầu đặc biệt, vui lòng liên hệ %s trước ngày khởi hành.
                      </div>
                    </div>

                    <div style="padding:22px 32px;background:#f7faf6;color:#64746a;font-size:12px;text-align:center;border-top:1px solid #e5ece2">
                      <strong style="color:#10231b">%s</strong><br />
                      Hotline: %s · Email: %s<br />
                      Email này được gửi đến <strong>%s</strong> vì booking <strong>%s</strong> đã được admin xác nhận.
                    </div>
                  </div>
                </div>
                """.formatted(
                safeBookingUrl,
                escape(BRAND_NAME),
                escape(BRAND_NAME),
                escape(HOTLINE),
                escape(SUPPORT_EMAIL),
                escape(booking.getEmail()),
                escape(booking.getBookingCode())));

        return html.toString();
    }

    private void addTemplateParams(
            Map<String, Object> params,
            Booking booking,
            List<BookingCustomer> customers,
            List<BookingScheduleDay> scheduleDays,
            String bookingUrl) {

        var departure = booking.getTourDeparture();
        var tour = departure.getTour();

        params.put("brand_name", BRAND_NAME);
        params.put("brand_logo_url", logoUrl(publicUrl));
        params.put("logo_url", logoUrl(publicUrl));
        params.put("tour_image_url", tourImageUrl(tour, assetPublicUrl, publicUrl));
        params.put("customer_name", plain(booking.getFullName()));
        params.put("customer_phone", plain(booking.getPhone()));
        params.put("customer_email", plain(booking.getEmail()));
        params.put("email", plain(booking.getEmail()));
        params.put("tour_name", plain(tour.getTitle()));
        params.put("departure_date", formatDate(departure.getDepartureDate()));
        params.put(
                "departure_time",
                departure.getDepartureTime() != null
                        ? formatOptionalTime(departure.getDepartureTime())
                        : "Đang cập nhật");
        params.put("departure_location", fallback(tour.getDepartureLocation()));
        params.put("pickup_address", fallback(booking.getPickupAddress()));
        params.put("booking_status", "Đã xác nhận");
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
        params.put("booking_url", bookingUrl);
        params.put("passenger_summary", buildPassengerSummary(customers));
        params.put("itinerary_summary", CustomerEmailTemplateSupport.scheduleSummary(scheduleDays));
    }

    private String buildPlainTextFallback(Booking booking, String bookingUrl) {

        var departure = booking.getTourDeparture();
        var tour = departure.getTour();

        return """
                TÂY BẮC TRAVEL - TOUR ĐÃ ĐƯỢC ADMIN XÁC NHẬN

                Mã booking: %s
                Khách hàng: %s
                Email: %s
                Số điện thoại: %s
                Tour: %s
                Ngày khởi hành: %s
                Giờ khởi hành: %s
                Tổng số khách: %s
                Tổng giá tour: %s
                Trạng thái: Đã xác nhận

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
                bookingUrl);
    }

    private String metricCell(String label, String value) {
        return """
                <td style="width:50%%;padding:8px 10px 8px 0;vertical-align:top">
                  <div style="padding:13px 14px;border-radius:14px;background:#ffffff;border:1px solid #e4ece2">
                    <div style="font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#65756b">%s</div>
                    <div style="margin-top:4px;font-size:15px;font-weight:900;color:#10231b">%s</div>
                  </div>
                </td>
                """.formatted(escape(label), escape(value));
    }

    private String checklistCell(String title, String body) {
        return """
                <td style="width:50%%;padding:7px;vertical-align:top">
                  <div style="min-height:92px;padding:15px;border-radius:16px;background:#ffffff;border:1px solid #e2e8df">
                    <div style="font-size:15px;font-weight:900;color:#10231b">%s</div>
                    <div style="margin-top:6px;color:#58695f">%s</div>
                  </div>
                </td>
                """.formatted(escape(title), escape(body));
    }

    private String infoRow(String label, String value, boolean alternate) {
        return """
                <tr style="background:%s">
                  <td style="width:38%%;padding:11px 13px;color:#64746a;border-bottom:1px solid #edf2ea">%s</td>
                  <td style="padding:11px 13px;font-weight:800;color:#1f2937;border-bottom:1px solid #edf2ea">%s</td>
                </tr>
                """.formatted(
                alternate ? "#fafcf8" : "#ffffff",
                escape(label),
                escape(value));
    }

    private String priceRow(String label, int count, BigDecimal price) {
        return """
                <tr>
                  <td style="padding:7px 0;color:#d8e7db">%s</td>
                  <td style="padding:7px 0;text-align:right;font-weight:800">%s x %s</td>
                </tr>
                """.formatted(escape(label), count, escape(formatCurrency(price)));
    }

    private String totalRow(String label, String value) {
        return """
                <tr>
                  <td style="padding:11px 0 5px;border-top:1px solid rgba(255,255,255,.16);font-weight:900">%s</td>
                  <td style="padding:11px 0 5px;border-top:1px solid rgba(255,255,255,.16);text-align:right;font-size:18px;font-weight:900;color:#f3d6a5">%s</td>
                </tr>
                """.formatted(escape(label), escape(value));
    }

    private String buildPassengerSummary(List<BookingCustomer> customers) {

        if (customers == null || customers.isEmpty()) {
            return "Thông tin hành khách đang được cập nhật.";
        }

        return customers.stream()
                .limit(CustomerEmailTemplateSupport.MAX_CUSTOMERS_IN_EMAIL)
                .map(customer -> "- "
                        + fallback(customer.getFullName())
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
                    + "Vui lòng kiểm tra EMAILJS_ADMIN_CONFIRM_PUBLIC_KEY.";
        }

        if (normalized.contains("service") && normalized.contains("not found")) {
            return "Không tìm thấy Email Service admin confirm trên EmailJS. "
                    + "Vui lòng kiểm tra EMAILJS_ADMIN_CONFIRM_SERVICE_ID.";
        }

        if (normalized.contains("template") && normalized.contains("not found")) {
            return "Không tìm thấy template admin confirm trên EmailJS. "
                    + "Vui lòng kiểm tra EMAILJS_ADMIN_CONFIRM_TEMPLATE_ID.";
        }

        if (normalized.contains("non-browser environments")
                || normalized.contains("non-browser applications")) {
            return "EmailJS đang chặn gửi từ backend. Vui lòng bật Allow EmailJS API for non-browser applications.";
        }

        if (status == 401 || status == 403) {
            return "EmailJS từ chối thông tin xác thực admin confirm. "
                    + "Vui lòng kiểm tra Public Key và Private Key.";
        }

        if (status == 429) {
            return "EmailJS đang giới hạn số lần gửi. Vui lòng chờ ít phút rồi thử lại.";
        }

        return "EmailJS chưa thể gửi email admin confirm (HTTP " + status
                + "). Vui lòng kiểm tra cấu hình dịch vụ.";
    }
}
