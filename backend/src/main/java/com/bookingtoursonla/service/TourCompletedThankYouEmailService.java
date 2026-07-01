package com.bookingtoursonla.service;

import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.BRAND_NAME;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.HOTLINE;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.SUPPORT_EMAIL;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.escape;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.fallback;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatCurrency;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatDate;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.hasText;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.logoUrl;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.multiline;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.plain;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.renderItinerary;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.tourImageUrl;
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
import com.bookingtoursonla.entity.BookingScheduleActivity;
import com.bookingtoursonla.entity.BookingScheduleDay;
import com.bookingtoursonla.exception.EmailDeliveryException;
import com.bookingtoursonla.repository.BookingRepository;
import com.bookingtoursonla.repository.BookingScheduleActivityRepository;
import com.bookingtoursonla.repository.BookingScheduleDayRepository;

@Service
public class TourCompletedThankYouEmailService {

    private static final Logger log = LoggerFactory.getLogger(TourCompletedThankYouEmailService.class);
    private static final String EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

    private final BookingRepository bookingRepository;
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
    private final String feedbackUrl;

    public TourCompletedThankYouEmailService(
            BookingRepository bookingRepository,
            BookingScheduleDayRepository bookingScheduleDayRepository,
            BookingScheduleActivityRepository bookingScheduleActivityRepository,
            RestClient.Builder restClientBuilder,
            @Value("${app.email.emailjs.tour-completed.enabled:false}") boolean enabled,
            @Value("${app.email.emailjs.tour-completed.service-id:}") String serviceId,
            @Value("${app.email.emailjs.tour-completed.template-id:}") String templateId,
            @Value("${app.email.emailjs.tour-completed.public-key:}") String publicKey,
            @Value("${app.email.emailjs.tour-completed.private-key:}") String privateKey,
            @Value("${app.public-url:http://localhost:5173}") String publicUrl,
            @Value("${app.asset-public-url:http://localhost:8080}") String assetPublicUrl,
            @Value("${app.feedback-url:}") String feedbackUrl) {

        this.bookingRepository = bookingRepository;
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
        this.feedbackUrl = isBlank(feedbackUrl)
                ? this.publicUrl + "/lien-he"
                : feedbackUrl.trim();

        log.info(
                "Tour completed thank-you email via EmailJS is {}",
                enabled ? "ENABLED" : "DISABLED");
    }

    public void sendTourCompletedThankYou(
            Long bookingId,
            String employeeName) {

        if (!enabled) {
            log.debug("Tour completed thank-you email is disabled");
            return;
        }

        validateConfiguration();

        Booking booking = bookingRepository
                .findForConfirmationEmail(bookingId)
                .orElseThrow(() -> new IllegalStateException("Booking không tồn tại để gửi email cảm ơn"));
        List<BookingScheduleDay> scheduleDays = bookingScheduleDayRepository
                .findByBookingIdOrderByDayNumberAsc(bookingId);
        Map<Long, List<BookingScheduleActivity>> activitiesByDayId = loadActivitiesByDayId(scheduleDays);

        String bookingUrl = publicUrl + "/tai-khoan/booking/" + booking.getId();
        String reviewUrl = feedbackUrl
                + (feedbackUrl.contains("?") ? "&" : "?")
                + "booking=" + booking.getBookingCode();
        String subject = "[" + BRAND_NAME + "] Cảm ơn bạn đã đồng hành cùng chúng tôi - "
                + booking.getBookingCode();
        String emailHtml = CustomerEmailTemplateSupport.compactFallbackEmailHtml(
                booking,
                "Cảm ơn bạn vì chuyến đi vừa qua",
                "Tour đã được hướng dẫn viên ghi nhận hoàn thành. Tây Bắc Travel rất mong nhận được đánh giá của bạn sau chuyến đi.",
                reviewUrl,
                "Đánh giá tour ngay",
                publicUrl,
                assetPublicUrl);
        String emailText = buildPlainTextFallback(booking, bookingUrl, reviewUrl);

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
        addTemplateParams(
                templateParams,
                booking,
                scheduleDays,
                activitiesByDayId,
                bookingUrl,
                reviewUrl,
                employeeName);

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
                    "EmailJS từ chối email cảm ơn sau tour cho booking {} (HTTP {}): {}",
                    booking.getBookingCode(),
                    ex.getStatusCode().value(),
                    providerMessage);
            throw new EmailDeliveryException(
                    buildUserFacingError(ex.getStatusCode().value(), providerMessage),
                    ex);
        } catch (Exception ex) {
            log.error(
                    "Không thể kết nối EmailJS để gửi email cảm ơn sau tour {}: {}",
                    booking.getBookingCode(),
                    ex.getMessage());
            throw new EmailDeliveryException(
                    "Chưa thể kết nối dịch vụ gửi email cảm ơn sau tour. Vui lòng thử lại sau.",
                    ex);
        }

        log.info(
                "Tour completed thank-you email sent for booking {} to {}",
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
                    "Thiếu cấu hình EmailJS tour completed: service ID, template ID hoặc public key");
        }
    }

    private String buildEmailHtml(
            Booking booking,
            List<BookingScheduleDay> scheduleDays,
            Map<Long, List<BookingScheduleActivity>> activitiesByDayId,
            String bookingUrl,
            String reviewUrl,
            String employeeName) {

        var departure = booking.getTourDeparture();
        var tour = departure.getTour();
        String safeLogoUrl = escape(logoUrl(publicUrl));
        String safeHeroImageUrl = escape(tourImageUrl(tour, assetPublicUrl, publicUrl));

        StringBuilder html = new StringBuilder(36000);
        html.append("""
                <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0">
                  Cảm ơn bạn đã đồng hành cùng Tây Bắc Travel. Chúng tôi rất mong nhận được đánh giá sau chuyến đi.
                </div>
                <div style="margin:0;padding:28px 10px;background:#edf4ec;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;font-size:14px;line-height:1.65">
                  <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 20px 70px rgba(15,35,27,.16)">
                    <div style="height:8px;background:linear-gradient(90deg,#0b7a4b,#a5c978,#d7a653)"></div>
                    <div style="padding:22px 30px;background:#ffffff;border-bottom:1px solid #e3ece0">
                      <table role="presentation" style="width:100%%;border-collapse:collapse">
                        <tr>
                          <td style="vertical-align:middle">
                            <img src="%s" width="78" alt="Tây Bắc Travel" style="display:block;width:78px;height:78px;object-fit:contain" />
                          </td>
                          <td style="vertical-align:middle;text-align:right">
                            <div style="font-size:11px;font-weight:900;letter-spacing:2.4px;color:#0f6b43;text-transform:uppercase">%s</div>
                            <div style="margin-top:6px;color:#64746a">Cảm ơn và đánh giá sau chuyến tour</div>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="background:#10231b;color:#ffffff">
                      <img src="%s" width="760" alt="Kỷ niệm hành trình Sơn La" style="display:block;width:100%%;max-height:280px;object-fit:cover;background:#f7faf6" />
                      <div style="padding:32px;background:linear-gradient(135deg,#10231b,#16452f 58%%,#7a5b2a)">
                        <div style="font-size:12px;font-weight:900;letter-spacing:2.2px;color:#c9f8cc;text-transform:uppercase">Hành trình đã hoàn thành</div>
                        <div style="margin-top:8px;font-size:29px;line-height:1.25;font-weight:900">Cảm ơn %s vì đã cùng chúng tôi đi qua một hành trình đẹp</div>
                        <p style="margin:15px 0 0;color:#e8f5e8;font-size:15px">
                          Tour <strong>%s</strong> đã được hướng dẫn viên ghi nhận hoàn thành. Tây Bắc Travel rất trân trọng sự tin tưởng của bạn, từ lúc đặt tour, chuẩn bị hành lý, khởi hành, trải nghiệm từng điểm đến cho đến khi chuyến đi khép lại.
                        </p>
                      </div>
                    </div>

                    <div style="padding:30px 32px">
                      <div style="padding:22px;border:1px solid #dfe8de;border-radius:18px;background:linear-gradient(135deg,#f7fbf4,#fffaf0)">
                        <div style="font-size:11px;font-weight:900;letter-spacing:1.7px;color:#0f6b43;text-transform:uppercase">Tổng kết chuyến đi</div>
                        <div style="margin-top:7px;font-size:22px;line-height:1.35;font-weight:900;color:#10231b">%s</div>
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
                safeHeroImageUrl,
                escape(booking.getFullName()),
                escape(tour.getTitle()),
                escape(tour.getTitle()),
                metricCell("Mã booking", booking.getBookingCode()),
                metricCell("Ngày khởi hành", formatDate(departure.getDepartureDate())),
                metricCell("Thời lượng", value(tour.getDurationDays()) + " ngày " + value(tour.getDurationNights()) + " đêm"),
                metricCell("Hướng dẫn viên ghi nhận", fallback(employeeName))));

        html.append("""
                      <div style="margin-top:28px;padding:22px;border-radius:18px;background:#fff8ed;border:1px solid #f1dfc3;color:#4b3925">
                        <div style="font-size:20px;font-weight:900;color:#2f2418">Lời cảm ơn từ Tây Bắc Travel</div>
                        <p style="margin:10px 0 0">
                          Cảm ơn bạn đã dành thời gian, niềm tin và sự đồng hành cho chuyến tour vừa qua. Mỗi hành trình đến Sơn La và vùng Tây Bắc không chỉ là những điểm đến trên lịch trình, mà còn là những buổi sáng trong lành, những cung đường núi, những bữa ăn địa phương, những câu chuyện văn hóa và khoảnh khắc đoàn cùng nhau lưu giữ kỷ niệm.
                        </p>
                        <p style="margin:10px 0 0">
                          Đội ngũ của chúng tôi luôn mong muốn mỗi khách hàng rời chuyến đi với cảm giác được chăm sóc chu đáo, được lắng nghe và có thêm một trải nghiệm đáng nhớ. Nếu trong quá trình di chuyển có điều gì chưa thật trọn vẹn, đánh giá của bạn sẽ giúp chúng tôi cải thiện cụ thể hơn cho các đoàn sau.
                        </p>
                      </div>

                      <div style="margin-top:28px;font-size:18px;font-weight:900;color:#0f241b">Bạn có thể đánh giá những nội dung nào?</div>
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
                reviewTopicCell("Lịch trình", "Các điểm đến, thời gian tham quan, nhịp di chuyển và sự phù hợp với mong đợi."),
                reviewTopicCell("Hướng dẫn viên", "Thái độ hỗ trợ, khả năng thuyết minh, xử lý tình huống và chăm sóc đoàn."),
                reviewTopicCell("Dịch vụ đi kèm", "Phương tiện, bữa ăn, lưu trú, điểm đón trả và các hỗ trợ trong chuyến đi."),
                reviewTopicCell("Cảm nhận chung", "Điều bạn hài lòng nhất, điều cần cải thiện và gợi ý cho Tây Bắc Travel.")));

        html.append("""
                      <div style="margin-top:30px;text-align:center;padding:24px;border-radius:20px;background:#10231b;color:#ffffff">
                        <div style="font-size:20px;font-weight:900">Gửi đánh giá sau chuyến đi</div>
                        <div style="margin-top:8px;color:#dcebdd">Chỉ vài phút phản hồi của bạn sẽ giúp chúng tôi phục vụ tốt hơn và xây dựng những hành trình Sơn La chỉn chu hơn.</div>
                        <div style="margin-top:18px">
                          <a href="%s" target="_blank" style="display:inline-block;padding:14px 24px;border-radius:14px;background:#8ecb79;color:#10231b;text-decoration:none;font-weight:900">Đánh giá tour ngay</a>
                        </div>
                      </div>

                      <div style="margin-top:16px;text-align:center">
                        <a href="%s" target="_blank" style="color:#0f6b43;text-decoration:none;font-weight:900">Xem lại chi tiết booking</a>
                      </div>
                """.formatted(escape(reviewUrl), escape(bookingUrl)));

        html.append("""
                      <div style="margin-top:30px">
                        <div style="font-size:18px;font-weight:900;color:#0f241b">Nhật ký hoạt động của chuyến tour</div>
                        <div style="margin-top:4px;color:#64746a">Dưới đây là lịch trình được ghi nhận trong quá trình hướng dẫn. Một số hoạt động có thể được điều chỉnh theo thời tiết, tình hình giao thông hoặc nhu cầu thực tế của đoàn.</div>
                """)
                .append(renderItinerary(scheduleDays, activitiesByDayId, true))
                .append("""
                      </div>
                """);

        html.append("""
                      <div style="margin-top:28px;padding:18px 20px;border-radius:18px;background:#f5faf1;border:1px solid #dbe8d7;color:#4b5b52">
                        <div style="font-size:16px;font-weight:900;color:#10231b">Hẹn gặp lại bạn ở những cung đường tiếp theo</div>
                        <p style="margin:8px 0 0">
                          Tây Bắc Travel hy vọng tiếp tục được đồng hành cùng bạn, gia đình và bạn bè trong những hành trình khám phá Mộc Châu, Tà Xùa, Sơn La và các điểm đến Tây Bắc khác. Chúc bạn luôn giữ được thật nhiều kỷ niệm đẹp sau chuyến đi này.
                        </p>
                      </div>
                    </div>

                    <div style="padding:22px 32px;background:#f7faf6;color:#64746a;font-size:12px;text-align:center;border-top:1px solid #e5ece2">
                      <img src="%s" width="72" alt="Tây Bắc Travel" style="display:block;width:72px;height:72px;object-fit:contain;margin:0 auto 10px" />
                      <strong style="color:#10231b">%s</strong><br />
                      Hotline: %s · Email: %s<br />
                      Email này được gửi đến <strong>%s</strong> sau khi booking <strong>%s</strong> được hướng dẫn viên xác nhận hoàn thành.
                    </div>
                  </div>
                </div>
                """.formatted(
                safeLogoUrl,
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
            List<BookingScheduleDay> scheduleDays,
            Map<Long, List<BookingScheduleActivity>> activitiesByDayId,
            String bookingUrl,
            String reviewUrl,
            String employeeName) {

        var departure = booking.getTourDeparture();
        var tour = departure.getTour();

        params.put("brand_name", BRAND_NAME);
        params.put("brand_logo_url", logoUrl(publicUrl));
        params.put("logo_url", logoUrl(publicUrl));
        params.put("tour_image_url", tourImageUrl(tour, assetPublicUrl, publicUrl));
        params.put("customer_name", plain(booking.getFullName()));
        params.put("customer_email", plain(booking.getEmail()));
        params.put("email", plain(booking.getEmail()));
        params.put("customer_phone", plain(booking.getPhone()));
        params.put("tour_name", plain(tour.getTitle()));
        params.put("departure_date", formatDate(departure.getDepartureDate()));
        params.put("duration", value(tour.getDurationDays()) + " ngày "
                + value(tour.getDurationNights()) + " đêm");
        params.put("total_people", value(booking.getTotalPeople()));
        params.put("total_price", formatCurrency(booking.getTotalPrice()));
        params.put("employee_name", fallback(employeeName));
        params.put("booking_url", bookingUrl);
        params.put("review_url", reviewUrl);
        params.put("feedback_url", reviewUrl);
        params.put(
                "itinerary_summary",
                CustomerEmailTemplateSupport.scheduleSummary(scheduleDays, activitiesByDayId));
    }

    private String buildPlainTextFallback(
            Booking booking,
            String bookingUrl,
            String reviewUrl) {

        var departure = booking.getTourDeparture();
        var tour = departure.getTour();

        return """
                TÂY BẮC TRAVEL - CẢM ƠN BẠN SAU CHUYẾN TOUR

                Mã booking: %s
                Khách hàng: %s
                Tour: %s
                Ngày khởi hành: %s

                Cảm ơn bạn đã đồng hành cùng Tây Bắc Travel. Chúng tôi rất mong nhận được đánh giá của bạn sau chuyến đi để tiếp tục cải thiện dịch vụ.

                Gửi đánh giá: %s
                Xem booking: %s
                """.formatted(
                plain(booking.getBookingCode()),
                plain(booking.getFullName()),
                plain(tour.getTitle()),
                formatDate(departure.getDepartureDate()),
                reviewUrl,
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

    private String reviewTopicCell(String title, String body) {
        return """
                <td style="width:50%%;padding:7px;vertical-align:top">
                  <div style="min-height:112px;padding:15px;border-radius:16px;background:#ffffff;border:1px solid #e2e8df">
                    <div style="font-size:15px;font-weight:900;color:#10231b">%s</div>
                    <div style="margin-top:6px;color:#58695f">%s</div>
                  </div>
                </td>
                """.formatted(escape(title), escape(body));
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
                    + "Vui lòng kiểm tra EMAILJS_TOUR_COMPLETED_PUBLIC_KEY.";
        }

        if (normalized.contains("service") && normalized.contains("not found")) {
            return "Không tìm thấy Email Service cảm ơn sau tour trên EmailJS. "
                    + "Vui lòng kiểm tra EMAILJS_TOUR_COMPLETED_SERVICE_ID.";
        }

        if (normalized.contains("template") && normalized.contains("not found")) {
            return "Không tìm thấy template cảm ơn sau tour trên EmailJS. "
                    + "Vui lòng kiểm tra EMAILJS_TOUR_COMPLETED_TEMPLATE_ID.";
        }

        if (normalized.contains("non-browser environments")
                || normalized.contains("non-browser applications")) {
            return "EmailJS đang chặn gửi từ backend. Vui lòng bật Allow EmailJS API for non-browser applications.";
        }

        if (status == 401 || status == 403) {
            return "EmailJS từ chối thông tin xác thực email cảm ơn sau tour. "
                    + "Vui lòng kiểm tra Public Key và Private Key.";
        }

        if (status == 429) {
            return "EmailJS đang giới hạn số lần gửi. Vui lòng chờ ít phút rồi thử lại.";
        }

        return "EmailJS chưa thể gửi email cảm ơn sau tour (HTTP " + status
                + "). Vui lòng kiểm tra cấu hình dịch vụ.";
    }
}
