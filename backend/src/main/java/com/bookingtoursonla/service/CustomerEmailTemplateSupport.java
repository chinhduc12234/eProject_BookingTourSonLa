package com.bookingtoursonla.service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.web.util.HtmlUtils;

import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.BookingCustomer;
import com.bookingtoursonla.entity.BookingScheduleActivity;
import com.bookingtoursonla.entity.BookingScheduleDay;
import com.bookingtoursonla.entity.Tour;

final class CustomerEmailTemplateSupport {

    static final String BRAND_NAME = "Tây Bắc Travel";
    static final String SUPPORT_EMAIL = "support@taybactravel.vn";
    static final String HOTLINE = "1900 6868";
    static final int MAX_CUSTOMERS_IN_EMAIL = 24;

    private static final Locale VIETNAMESE = Locale.forLanguageTag("vi-VN");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm, dd/MM/yyyy");

    private CustomerEmailTemplateSupport() {
    }

    static String escape(String value) {
        return HtmlUtils.htmlEscape(value == null ? "" : value.trim());
    }

    static String plain(String value) {
        return HtmlUtils.htmlUnescape(value == null ? "" : value.trim());
    }

    static String fallback(String value) {
        return hasText(value) ? plain(value) : "Đang cập nhật";
    }

    static String multiline(String value) {
        return escape(value).replace("\r\n", "<br />").replace("\n", "<br />");
    }

    static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    static int value(Integer number) {
        return number != null ? number : 0;
    }

    static String formatCurrency(BigDecimal value) {
        NumberFormat format = NumberFormat.getNumberInstance(VIETNAMESE);
        format.setMaximumFractionDigits(0);
        return format.format(value != null ? value : BigDecimal.ZERO) + " đ";
    }

    static String formatDate(LocalDate value) {
        return value != null ? DATE_FORMAT.format(value) : "Đang cập nhật";
    }

    static String formatTime(LocalTime value) {
        return value != null ? TIME_FORMAT.format(value) : "Đang cập nhật";
    }

    static String formatOptionalTime(LocalTime value) {
        return value != null ? TIME_FORMAT.format(value) : "";
    }

    static String formatDateTime(LocalDateTime value) {
        return value != null ? DATE_TIME_FORMAT.format(value) : "Đang cập nhật";
    }

    static String stripTrailingSlash(String value, String fallback) {
        String normalized = hasText(value) ? value.trim() : fallback;
        return normalized.replaceAll("/+$", "");
    }

    static String logoUrl(String publicUrl) {
        return absoluteUrl("/logo-tay-bac-travel.png", publicUrl);
    }

    static String tourImageUrl(Tour tour, String assetPublicUrl, String publicUrl) {
        if (tour != null && hasText(tour.getThumbnail())) {
            return absoluteUrl(tour.getThumbnail(), assetPublicUrl);
        }
        return logoUrl(publicUrl);
    }

    static String absoluteUrl(String rawUrl, String baseUrl) {
        if (!hasText(rawUrl)) {
            return "";
        }

        String value = rawUrl.trim();
        if (value.matches("(?i)^(https?:|data:|blob:).*")) {
            return value;
        }
        if (value.startsWith("//")) {
            return "https:" + value;
        }

        String base = stripTrailingSlash(baseUrl, "http://localhost:5173");
        if (value.startsWith("/")) {
            return base + value;
        }
        return base + "/" + value;
    }

    static String bookingTypeLabel(Booking booking) {
        if (booking == null || booking.getBookingType() == null) {
            return "Cá nhân";
        }

        return switch (booking.getBookingType()) {
            case GROUP -> "Theo đoàn";
            case PRIVATE -> "Tour riêng";
            default -> "Cá nhân";
        };
    }

    static String bookingStatusLabel(Booking booking) {
        if (booking == null || booking.getStatus() == null) {
            return "Đang chờ xác nhận";
        }

        return switch (booking.getStatus()) {
            case CONFIRMED -> "Đã xác nhận";
            case CANCELLED -> "Đã hủy";
            case IN_PROGRESS -> "Đang diễn ra";
            case COMPLETED -> "Đã hoàn thành";
            default -> "Đang chờ xác nhận";
        };
    }

    static String paymentStatusLabel(Booking booking) {
        if (booking == null || booking.getPaymentStatus() == null) {
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

    static String paymentMethodLabel(String value) {
        if ("BANK_TRANSFER_QR".equalsIgnoreCase(value)) {
            return "Chuyển khoản ngân hàng / VietQR";
        }
        if ("CASH_ON_DEPARTURE".equalsIgnoreCase(value)) {
            return "Thanh toán khi khởi hành";
        }
        return hasText(value) ? plain(value) : "Đang cập nhật";
    }

    static String customerTypeLabel(BookingCustomer customer) {
        if (customer == null || customer.getCustomerType() == null) {
            return "Hành khách";
        }

        return switch (customer.getCustomerType()) {
            case CHILD -> "Trẻ em";
            case INFANT -> "Em bé";
            default -> "Người lớn";
        };
    }

    static String scheduleSummary(List<BookingScheduleDay> days) {
        if (days == null || days.isEmpty()) {
            return "Lịch trình chi tiết đang được đội ngũ điều hành cập nhật.";
        }

        StringBuilder summary = new StringBuilder();
        for (BookingScheduleDay day : days) {
            if (!summary.isEmpty()) {
                summary.append("\n");
            }
            summary.append("Ngày ")
                    .append(value(day.getDayNumber()))
                    .append(": ")
                    .append(fallback(day.getTitle()));
        }
        return summary.toString();
    }

    static String renderItinerary(
            List<BookingScheduleDay> days,
            Map<Long, List<BookingScheduleActivity>> activitiesByDayId,
            boolean showActivityStatus) {

        if (days == null || days.isEmpty()) {
            return """
                    <div style="margin-top:14px;padding:16px;border:1px dashed #cbd8cb;border-radius:14px;background:#fbfdf8;color:#5f6f66">
                      Lịch trình chi tiết đang được đội ngũ điều hành cập nhật. Khi có thay đổi, Tây Bắc Travel sẽ thông báo lại cho bạn sớm nhất.
                    </div>
                    """;
        }

        StringBuilder html = new StringBuilder(12000);
        html.append("<div style=\"margin-top:14px\">");
        for (BookingScheduleDay day : days) {
            Long dayId = day.getId();
            List<BookingScheduleActivity> activities = activitiesByDayId != null && dayId != null
                    ? activitiesByDayId.getOrDefault(dayId, List.of())
                    : List.of();

            html.append("""
                    <div style="margin-top:12px;border:1px solid #dfe8de;border-radius:18px;overflow:hidden;background:#ffffff">
                      <div style="padding:16px 18px;background:#f5faf2;border-bottom:1px solid #dfe8de">
                        <div style="display:inline-block;padding:5px 10px;border-radius:999px;background:#123326;color:#c9f8cc;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase">
                    """)
                    .append("Ngày ").append(value(day.getDayNumber()))
                    .append("""
                        </div>
                        <div style="margin-top:10px;font-size:18px;line-height:1.35;font-weight:900;color:#0f241b">
                    """)
                    .append(escape(fallback(day.getTitle())))
                    .append("""
                        </div>
                    """);

            if (hasText(day.getDescription())) {
                html.append("<div style=\"margin-top:6px;color:#58695f\">")
                        .append(multiline(day.getDescription()))
                        .append("</div>");
            }

            html.append("</div><div style=\"padding:12px 18px 16px\">");
            if (activities.isEmpty()) {
                html.append("""
                        <div style="padding:12px;border-radius:12px;background:#fafcf8;color:#6b7280">
                          Hoạt động trong ngày này đang được cập nhật chi tiết.
                        </div>
                        """);
            } else {
                for (BookingScheduleActivity activity : activities) {
                    html.append(activityItem(activity, showActivityStatus));
                }
            }
            html.append("</div></div>");
        }
        html.append("</div>");
        return html.toString();
    }

    static String compactFallbackEmailHtml(
            Booking booking,
            String heading,
            String intro,
            String actionUrl,
            String actionLabel,
            String publicUrl,
            String assetPublicUrl) {

        var departure = booking.getTourDeparture();
        var tour = departure.getTour();
        String safeLogoUrl = escape(logoUrl(publicUrl));
        String safeImageUrl = escape(tourImageUrl(tour, assetPublicUrl, publicUrl));

        return """
                <div style="margin:0;padding:24px 10px;background:#edf4ec;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
                  <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfe8de">
                    <div style="height:7px;background:#0f6b43"></div>
                    <div style="padding:22px 26px;text-align:center">
                      <img src="%s" width="78" alt="Tây Bắc Travel" style="width:78px;height:78px;object-fit:contain" />
                      <div style="margin-top:8px;font-size:12px;font-weight:800;letter-spacing:2px;color:#0f6b43;text-transform:uppercase">%s</div>
                      <h1 style="margin:12px 0 0;font-size:24px;line-height:1.25;color:#10231b">%s</h1>
                      <p style="margin:12px 0 0;color:#52645a">%s</p>
                    </div>
                    <img src="%s" width="680" alt="Hành trình Sơn La" style="display:block;width:100%%;max-height:230px;object-fit:cover;background:#f7faf6" />
                    <div style="padding:24px 26px">
                      <div style="padding:18px;border-radius:14px;background:#f7fbf4;border:1px solid #dfe8de">
                        <div style="font-size:20px;font-weight:800;color:#10231b">%s</div>
                        <table role="presentation" style="width:100%%;margin-top:12px;border-collapse:collapse">
                          <tr><td style="padding:7px 0;color:#64746a">Mã booking</td><td style="padding:7px 0;text-align:right;font-weight:800">%s</td></tr>
                          <tr><td style="padding:7px 0;color:#64746a">Khách hàng</td><td style="padding:7px 0;text-align:right;font-weight:800">%s</td></tr>
                          <tr><td style="padding:7px 0;color:#64746a">Ngày khởi hành</td><td style="padding:7px 0;text-align:right;font-weight:800">%s</td></tr>
                          <tr><td style="padding:7px 0;color:#64746a">Tổng số khách</td><td style="padding:7px 0;text-align:right;font-weight:800">%s khách</td></tr>
                          <tr><td style="padding:7px 0;color:#64746a">Tổng chi phí</td><td style="padding:7px 0;text-align:right;font-weight:800">%s</td></tr>
                        </table>
                      </div>
                      <div style="margin-top:22px;text-align:center">
                        <a href="%s" target="_blank" style="display:inline-block;padding:13px 22px;border-radius:12px;background:#0f6b43;color:#ffffff;text-decoration:none;font-weight:800">%s</a>
                      </div>
                      <p style="margin:20px 0 0;color:#64746a;font-size:12px;text-align:center">Hotline: %s · Email: %s</p>
                    </div>
                  </div>
                </div>
                """.formatted(
                safeLogoUrl,
                escape(BRAND_NAME),
                escape(heading),
                escape(intro),
                safeImageUrl,
                escape(tour.getTitle()),
                escape(booking.getBookingCode()),
                escape(booking.getFullName()),
                escape(formatDate(departure.getDepartureDate())),
                value(booking.getTotalPeople()),
                escape(formatCurrency(booking.getTotalPrice())),
                escape(actionUrl),
                escape(actionLabel),
                escape(HOTLINE),
                escape(SUPPORT_EMAIL));
    }

    static String activityItem(BookingScheduleActivity activity, boolean showActivityStatus) {
        String timeRange = activityTimeRange(activity);
        String location = fallback(activity != null ? activity.getActualLocation() : null);
        String status = showActivityStatus ? activityStatusLabel(activity) : "";

        StringBuilder html = new StringBuilder(1400);
        html.append("""
                <div style="padding:12px 0;border-bottom:1px solid #eef2ec">
                  <table role="presentation" style="width:100%;border-collapse:collapse">
                    <tr>
                      <td style="width:92px;vertical-align:top">
                        <div style="display:inline-block;padding:6px 8px;border-radius:10px;background:#ecf7e9;color:#286b43;font-size:12px;font-weight:900;text-align:center">
                """)
                .append(escape(timeRange))
                .append("""
                        </div>
                      </td>
                      <td style="vertical-align:top">
                        <div style="font-size:15px;font-weight:900;color:#17231d">
                """)
                .append(escape(activity != null ? fallback(activity.getTitle()) : "Hoạt động"))
                .append("""
                        </div>
                        <div style="margin-top:4px;color:#64746a;font-size:13px">
                """)
                .append(escape(location))
                .append("</div>");

        if (activity != null && hasText(activity.getDescription())) {
            html.append("<div style=\"margin-top:6px;color:#4b5a51\">")
                    .append(multiline(activity.getDescription()))
                    .append("</div>");
        }

        if (showActivityStatus && hasText(status)) {
            html.append("<div style=\"margin-top:7px;font-size:12px;color:#7a5a22;font-weight:800\">")
                    .append(escape(status))
                    .append("</div>");
        }

        if (activity != null && hasText(activity.getActualNote())) {
            html.append("<div style=\"margin-top:7px;padding:8px 10px;border-radius:10px;background:#fff9ed;color:#6b4b19;font-size:12px\">Ghi chú thực tế: ")
                    .append(multiline(activity.getActualNote()))
                    .append("</div>");
        }

        html.append("""
                      </td>
                    </tr>
                  </table>
                </div>
                """);
        return html.toString();
    }

    static String activityTimeRange(BookingScheduleActivity activity) {
        if (activity == null) {
            return "Trong ngày";
        }

        String start = formatOptionalTime(activity.getStartTime());
        String end = formatOptionalTime(activity.getEndTime());
        if (hasText(start) && hasText(end)) {
            return start + " - " + end;
        }
        if (hasText(start)) {
            return start;
        }
        if (hasText(end)) {
            return end;
        }
        return "Trong ngày";
    }

    static String activityStatusLabel(BookingScheduleActivity activity) {
        if (activity == null || activity.getStatus() == null) {
            return "";
        }

        return switch (activity.getStatus()) {
            case DONE -> "Đã hoàn thành";
            case SKIPPED -> "Đã bỏ qua theo thực tế chuyến đi";
            case CHANGED -> "Đã điều chỉnh trong quá trình hướng dẫn";
            default -> "Theo lịch trình";
        };
    }
}
