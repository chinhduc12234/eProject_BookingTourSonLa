package com.bookingtoursonla.service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.BookingCustomer;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourDeparture;

@Component
public class BookingEmailTemplateBuilder {

    private static final Locale VIETNAMESE = Locale.forLanguageTag("vi-VN");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm, dd/MM/yyyy");
    private static final int MAX_CUSTOMERS_IN_EMAIL = 20;

    public String build(
            Booking booking,
            List<BookingCustomer> customers,
            String bookingUrl) {

        TourDeparture departure = booking.getTourDeparture();
        Tour tour = departure.getTour();
        String safeBookingUrl = escape(bookingUrl);
        String paymentColor = booking.getRemainingAmount() != null
                && booking.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0
                        ? "#A67C52"
                        : "#4f8f4d";

        StringBuilder html = new StringBuilder(24000);

        html.append("""
                <div style="margin:0;padding:24px 10px;background:#f2f5f1;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;font-size:14px;line-height:1.65">
                  <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 60px rgba(15,23,42,.12)">
                    <div style="height:7px;background:linear-gradient(90deg,#7FB77E,#A67C52)"></div>
                    <div style="padding:28px 30px;background:#07120f;color:#ffffff">
                      <table role="presentation" style="width:100%;border-collapse:collapse">
                        <tr>
                          <td style="vertical-align:middle">
                            <div style="font-size:11px;font-weight:800;letter-spacing:2.6px;color:#9de09c;text-transform:uppercase">Tây Bắc Travel</div>
                            <div style="margin-top:5px;font-size:25px;line-height:1.25;font-weight:800">Đặt tour thành công</div>
                          </td>
                          <td style="vertical-align:middle;text-align:right">
                            <span style="display:inline-block;padding:8px 12px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(255,255,255,.08);font-size:12px;font-weight:800">""")
                .append(escape(booking.getBookingCode()))
                .append("""
                            </span>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:18px 0 0;color:#dbe7df;font-size:15px">Xin chào <strong style="color:#ffffff">""")
                .append(escape(booking.getFullName()))
                .append("""
                        </strong>, yêu cầu đặt tour của bạn đã được hệ thống ghi nhận. Dưới đây là toàn bộ thông tin để bạn tiện kiểm tra.</p>
                    </div>

                    <div style="padding:26px 30px">
                      <div style="padding:18px;border:1px solid #dce8db;border-radius:16px;background:linear-gradient(135deg,#f3faf2,#fffaf4)">
                        <div style="font-size:11px;font-weight:800;letter-spacing:1.8px;color:#4f8f4d;text-transform:uppercase">Hành trình đã chọn</div>
                        <div style="margin-top:6px;font-size:21px;line-height:1.4;font-weight:800;color:#102019">""")
                .append(escape(tour.getTitle()))
                .append("""
                        </div>
                        <div style="margin-top:12px;color:#52615a">""")
                .append(iconLine("📅", formatDate(departure.getDepartureDate())
                        + (departure.getDepartureTime() != null ? " lúc " + formatTime(departure.getDepartureTime()) : "")))
                .append(iconLine("⏱", value(tour.getDurationDays()) + " ngày "
                        + value(tour.getDurationNights()) + " đêm"))
                .append(iconLine("📍", defaultText(tour.getDepartureLocation(), "Đang cập nhật")))
                .append("""
                        </div>
                      </div>

                      <div style="margin-top:24px;font-size:16px;font-weight:800;color:#102019">Thông tin người đặt</div>
                      <table role="presentation" style="width:100%;margin-top:10px;border-collapse:separate;border-spacing:0;border:1px solid #e5e9e6;border-radius:14px;overflow:hidden">
                """)
                .append(infoRow("Họ và tên", booking.getFullName(), false))
                .append(infoRow("Email", booking.getEmail(), true))
                .append(infoRow("Số điện thoại", booking.getPhone(), false))
                .append(infoRow("Thời điểm đặt", formatDateTime(booking.getBookedAt()), true))
                .append(infoRow("Trạng thái đặt tour", bookingStatusLabel(booking), false))
                .append(infoRow("Hình thức đặt", bookingTypeLabel(booking), true))
                .append(infoRow("Đoàn / tổ chức", booking.getOrganizationName(), false))
                .append(infoRow("Người đại diện", booking.getContactPerson(), true))
                .append(infoRow("Điểm đón", booking.getPickupAddress(), false))
                .append("""
                      </table>
                """);

        if (hasText(tour.getShortDescription())
                || hasText(tour.getIncludedServices())
                || hasText(tour.getExcludedServices())) {
            html.append("""
                    <div style="margin-top:24px;font-size:16px;font-weight:800;color:#102019">Thông tin dịch vụ tour</div>
                    <div style="margin-top:10px;padding:16px 18px;border:1px solid #e5e9e6;border-radius:14px;background:#fafcf9">
                    """);
            if (hasText(tour.getShortDescription())) {
                html.append("<div style=\"color:#52615a\">")
                        .append(multiline(tour.getShortDescription()))
                        .append("</div>");
            }
            if (hasText(tour.getIncludedServices())) {
                html.append("<div style=\"margin-top:12px\"><strong style=\"color:#4f8f4d\">Bao gồm:</strong> ")
                        .append(multiline(tour.getIncludedServices()))
                        .append("</div>");
            }
            if (hasText(tour.getExcludedServices())) {
                html.append("<div style=\"margin-top:10px\"><strong style=\"color:#A67C52\">Chưa bao gồm:</strong> ")
                        .append(multiline(tour.getExcludedServices()))
                        .append("</div>");
            }
            html.append("</div>");
        }

        html.append("""

                      <div style="margin-top:24px;font-size:16px;font-weight:800;color:#102019">Hành khách</div>
                      <div style="margin-top:10px;overflow-x:auto;border:1px solid #e5e9e6;border-radius:14px">
                        <table role="presentation" style="width:100%;min-width:560px;border-collapse:collapse">
                          <thead>
                            <tr style="background:#f3f7f2;color:#52615a;text-align:left">
                              <th style="padding:11px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px">Hành khách</th>
                              <th style="padding:11px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px">Phân loại</th>
                              <th style="padding:11px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px">Ngày sinh</th>
                              <th style="padding:11px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px">Liên hệ</th>
                            </tr>
                          </thead>
                          <tbody>
                """);

        List<BookingCustomer> visibleCustomers = customers.stream()
                .limit(MAX_CUSTOMERS_IN_EMAIL)
                .toList();

        for (int index = 0; index < visibleCustomers.size(); index++) {
            html.append(customerRow(visibleCustomers.get(index), index));
        }

        if (customers.size() > MAX_CUSTOMERS_IN_EMAIL) {
            html.append("""
                    <tr>
                      <td colspan="4" style="padding:12px;color:#64748b;background:#fafcf9;text-align:center">
                    """)
                    .append("Và ").append(customers.size() - MAX_CUSTOMERS_IN_EMAIL)
                    .append(" hành khách khác. Vui lòng xem đầy đủ trong tài khoản.")
                    .append("</td></tr>");
        }

        html.append("""
                          </tbody>
                        </table>
                      </div>

                      <div style="margin-top:24px;padding:20px;border-radius:16px;background:#07120f;color:#ffffff">
                        <table role="presentation" style="width:100%;border-collapse:collapse">
                          <tr>
                            <td style="padding:5px 0;color:#cbd5e1">Người lớn</td>
                            <td style="padding:5px 0;text-align:right;font-weight:700">""")
                .append(value(booking.getAdultCount())).append(" × ")
                .append(formatCurrency(booking.getAdultPriceSnapshot()))
                .append("""
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:5px 0;color:#cbd5e1">Trẻ em / em bé</td>
                            <td style="padding:5px 0;text-align:right;font-weight:700">""")
                .append(value(booking.getChildCount())).append(" × ")
                .append(formatCurrency(booking.getChildPriceSnapshot()))
                .append("""
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:12px 0 5px;border-top:1px solid rgba(255,255,255,.16);font-size:16px;font-weight:800">Tổng giá tour</td>
                            <td style="padding:12px 0 5px;border-top:1px solid rgba(255,255,255,.16);text-align:right;font-size:21px;font-weight:900;color:#f3d7b0">""")
                .append(formatCurrency(booking.getTotalPrice()))
                .append("""
                            </td>
                          </tr>
                        </table>
                        <div style="margin-top:14px;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.08)">
                          <div style="font-size:11px;letter-spacing:1.3px;text-transform:uppercase;color:#cbd5e1;font-weight:800">Thanh toán</div>
                          <div style="margin-top:5px;font-size:15px;font-weight:800;color:""")
                .append(paymentColor)
                .append("\">")
                .append(escape(paymentStatusLabel(booking)))
                .append("</div>")
                .append("""
                          <div style="margin-top:8px;color:#dbe7df">
                            Đã thanh toán: <strong style="color:#ffffff">""")
                .append(formatCurrency(booking.getPaidAmount()))
                .append("""
                            </strong><br />
                            Còn lại: <strong style="color:#ffffff">""")
                .append(formatCurrency(booking.getRemainingAmount()))
                .append("""
                            </strong><br />
                            Phương thức: <strong style="color:#ffffff">""")
                .append(escape(paymentMethodLabel(booking.getPaymentMethod())))
                .append("""
                            </strong>
                          </div>
                        </div>
                      </div>
                """);

        if (hasText(booking.getNote()) || hasText(booking.getSpecialRequest())) {
            html.append("""
                    <div style="margin-top:24px;padding:16px 18px;border-left:4px solid #A67C52;border-radius:4px 14px 14px 4px;background:#fff8ef">
                      <div style="font-size:14px;font-weight:800;color:#7a5431">Ghi chú và yêu cầu</div>
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
                      <div style="margin-top:26px;text-align:center">
                        <a href=""")
                .append("\"").append(safeBookingUrl).append("\"")
                .append("""
                           target="_blank"
                           style="display:inline-block;padding:13px 22px;border-radius:12px;background:#7FB77E;color:#07120f;text-decoration:none;font-weight:900">
                          Xem chi tiết đặt tour
                        </a>
                      </div>

                      <div style="margin-top:26px;padding-top:20px;border-top:1px solid #e5e9e6;color:#64748b;font-size:12px">
                        <strong style="color:#334155">Lưu ý:</strong> Hãy kiểm tra kỹ ngày khởi hành, điểm đón và thông tin hành khách.
                        Giấy tờ định danh và dữ liệu sức khỏe nhạy cảm không được hiển thị đầy đủ trong email; bạn có thể kiểm tra trong tài khoản hoặc liên hệ tư vấn viên.
                      </div>
                    </div>

                    <div style="padding:20px 30px;background:#f7faf6;color:#64748b;font-size:12px;text-align:center">
                      Email này được gửi đến <strong>""")
                .append(escape(booking.getEmail()))
                .append("""
                      </strong> vì bạn vừa đặt tour tại Tây Bắc Travel.<br />
                      Hotline: 1900 6868 · support@taybactravel.vn
                    </div>
                  </div>
                </div>
                """);

        return html.toString();
    }

    private String customerRow(BookingCustomer customer, int index) {

        String background = index % 2 == 0 ? "#ffffff" : "#fafcf9";
        String contact = hasText(customer.getPhone())
                ? customer.getPhone()
                : customer.getEmail();

        return """
                <tr style="background:%s;border-top:1px solid #edf0ee">
                  <td style="padding:12px;font-weight:800;color:#1f2937">%s%s</td>
                  <td style="padding:12px;color:#52615a">%s</td>
                  <td style="padding:12px;color:#52615a">%s</td>
                  <td style="padding:12px;color:#52615a">%s</td>
                </tr>
                """.formatted(
                background,
                escape(customer.getFullName()),
                Boolean.TRUE.equals(customer.getGroupLeader())
                        ? " <span style=\"color:#4f8f4d;font-size:11px\">(Trưởng đoàn)</span>"
                        : "",
                escape(customerTypeLabel(customer)),
                escape(formatDate(customer.getDateOfBirth())),
                escape(defaultText(contact, "Không có")));
    }

    private String infoRow(String label, String value, boolean alternate) {

        if (!hasText(value)) {
            return "";
        }

        return """
                <tr style="background:%s">
                  <td style="width:38%%;padding:10px 12px;color:#64748b;border-bottom:1px solid #edf0ee">%s</td>
                  <td style="padding:10px 12px;font-weight:700;color:#1f2937;border-bottom:1px solid #edf0ee">%s</td>
                </tr>
                """.formatted(
                alternate ? "#fafcf9" : "#ffffff",
                escape(label),
                escape(value));
    }

    private String iconLine(String icon, String text) {

        return """
                <div style="margin-top:5px"><span style="display:inline-block;width:24px">%s</span>%s</div>
                """.formatted(icon, escape(text));
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

    private String paymentStatusLabel(Booking booking) {

        if (booking.getPaymentStatus() == null) {
            return "Chưa thanh toán";
        }

        return switch (booking.getPaymentStatus()) {
            case PAID -> "Đã thanh toán toàn bộ";
            case PARTIAL -> "Đã đặt cọc, thanh toán phần còn lại khi khởi hành";
            case PENDING_REVIEW -> "Đang chờ xác nhận thanh toán";
            case REFUNDED -> "Đã hoàn tiền";
            case PARTIALLY_REFUNDED -> "Đã hoàn một phần";
            case FORFEITED -> "Khoản thanh toán không được hoàn";
            case FAILED -> "Thanh toán chưa thành công";
            default -> "Chưa thanh toán";
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

    private String paymentMethodLabel(String value) {

        if ("BANK_TRANSFER_QR".equalsIgnoreCase(value)) {
            return "Chuyển khoản ngân hàng / VietQR";
        }
        if ("CASH_ON_DEPARTURE".equalsIgnoreCase(value)) {
            return "Thanh toán khi khởi hành";
        }

        return defaultText(value, "Đang cập nhật");
    }

    private String customerTypeLabel(BookingCustomer customer) {

        if (customer.getCustomerType() == null) {
            return "Hành khách";
        }

        return switch (customer.getCustomerType()) {
            case CHILD -> "Trẻ em";
            case INFANT -> "Em bé";
            default -> "Người lớn";
        };
    }

    private String formatCurrency(BigDecimal value) {

        NumberFormat format = NumberFormat.getNumberInstance(VIETNAMESE);
        format.setMaximumFractionDigits(0);

        return format.format(value != null ? value : BigDecimal.ZERO) + " đ";
    }

    private String formatDate(LocalDate value) {
        return value != null ? DATE_FORMAT.format(value) : "Đang cập nhật";
    }

    private String formatTime(LocalTime value) {
        return value != null ? TIME_FORMAT.format(value) : "";
    }

    private String formatDateTime(LocalDateTime value) {
        return value != null ? DATE_TIME_FORMAT.format(value) : "Đang cập nhật";
    }

    private String multiline(String value) {
        return escape(value).replace("\r\n", "<br />").replace("\n", "<br />");
    }

    private String escape(String value) {
        return HtmlUtils.htmlEscape(defaultText(value, ""));
    }

    private String defaultText(String value, String fallback) {
        return hasText(value) ? value.trim() : fallback;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private int value(Integer number) {
        return number != null ? number : 0;
    }
}
