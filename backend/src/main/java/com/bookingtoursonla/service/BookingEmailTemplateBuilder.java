package com.bookingtoursonla.service;

import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.BRAND_NAME;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.HOTLINE;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.MAX_CUSTOMERS_IN_EMAIL;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.SUPPORT_EMAIL;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.bookingStatusLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.bookingTypeLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.customerTypeLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.escape;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.fallback;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatCurrency;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatDate;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatDateTime;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.formatOptionalTime;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.hasText;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.logoUrl;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.multiline;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.paymentMethodLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.paymentStatusLabel;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.renderItinerary;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.tourImageUrl;
import static com.bookingtoursonla.service.CustomerEmailTemplateSupport.value;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.bookingtoursonla.entity.Booking;
import com.bookingtoursonla.entity.BookingCustomer;
import com.bookingtoursonla.entity.BookingScheduleActivity;
import com.bookingtoursonla.entity.BookingScheduleDay;
import com.bookingtoursonla.entity.Tour;
import com.bookingtoursonla.entity.TourDeparture;

@Component
public class BookingEmailTemplateBuilder {

    public String build(
            Booking booking,
            List<BookingCustomer> customers,
            String bookingUrl) {

        return build(
                booking,
                customers,
                List.of(),
                Map.of(),
                bookingUrl,
                "http://localhost:5173",
                "http://localhost:8080");
    }

    public String build(
            Booking booking,
            List<BookingCustomer> customers,
            List<BookingScheduleDay> scheduleDays,
            Map<Long, List<BookingScheduleActivity>> activitiesByDayId,
            String bookingUrl,
            String publicUrl,
            String assetPublicUrl) {

        TourDeparture departure = booking.getTourDeparture();
        Tour tour = departure.getTour();
        String safeBookingUrl = escape(bookingUrl);
        String safeLogoUrl = escape(logoUrl(publicUrl));
        String safeHeroImageUrl = escape(tourImageUrl(tour, assetPublicUrl, publicUrl));
        String departureLabel = formatDate(departure.getDepartureDate())
                + (departure.getDepartureTime() != null
                        ? " lúc " + formatOptionalTime(departure.getDepartureTime())
                        : "");

        StringBuilder html = new StringBuilder(42000);
        html.append("""
                <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0">
                  Tây Bắc Travel đã ghi nhận đặt tour của bạn. Kiểm tra lịch trình, hành khách và thanh toán trong email này.
                </div>
                <div style="margin:0;padding:28px 10px;background:#edf4ec;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;font-size:14px;line-height:1.65">
                  <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 20px 70px rgba(15,35,27,.16)">
                    <div style="height:8px;background:linear-gradient(90deg,#0f5132,#8bbf72,#c99245)"></div>
                    <div style="padding:22px 28px;background:#ffffff;border-bottom:1px solid #e4ece2">
                      <table role="presentation" style="width:100%%;border-collapse:collapse">
                        <tr>
                          <td style="vertical-align:middle">
                            <table role="presentation" style="border-collapse:collapse">
                              <tr>
                                <td style="width:62px;vertical-align:middle">
                                  <img src="%s" width="54" alt="Tây Bắc Travel" style="display:block;width:54px;height:54px;border-radius:16px;object-fit:cover;border:1px solid #dfe8de" />
                                </td>
                                <td style="vertical-align:middle">
                                  <div style="font-size:11px;font-weight:900;letter-spacing:2.6px;color:#0f6b43;text-transform:uppercase">%s</div>
                                  <div style="margin-top:2px;font-size:13px;color:#617066">Khám phá Tây Bắc - trọn vẹn trải nghiệm</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="vertical-align:middle;text-align:right">
                            <span style="display:inline-block;padding:8px 12px;border-radius:999px;background:#f0f7ec;color:#174d34;font-size:12px;font-weight:900;border:1px solid #cfe1c9">Mã: %s</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="background:#10231b;color:#ffffff">
                      <img src="%s" width="760" alt="Hình ảnh hành trình Sơn La" style="display:block;width:100%%;max-height:280px;object-fit:cover;background:#f7faf6" />
                      <div style="padding:30px 32px 32px;background:linear-gradient(135deg,#10231b,#173d2b 58%%,#6f5228)">
                        <div style="font-size:12px;font-weight:900;letter-spacing:2.2px;color:#bdf0bc;text-transform:uppercase">Đặt tour thành công</div>
                        <div style="margin-top:8px;font-size:28px;line-height:1.25;font-weight:900">Cảm ơn %s đã chọn hành trình Sơn La cùng %s</div>
                        <p style="margin:14px 0 0;color:#e7f3e7;font-size:15px">
                          Yêu cầu đặt tour của bạn đã được hệ thống ghi nhận. Email này tổng hợp đầy đủ thông tin tour, lịch trình từng ngày, danh sách hành khách và tình trạng thanh toán để bạn tiện kiểm tra trước khi đội ngũ điều hành xác nhận lần cuối.
                        </p>
                        <div style="margin-top:18px">
                          %s
                          %s
                          %s
                        </div>
                      </div>
                    </div>

                    <div style="padding:30px 32px">
                """.formatted(
                safeLogoUrl,
                escape(BRAND_NAME),
                escape(booking.getBookingCode()),
                safeHeroImageUrl,
                escape(booking.getFullName()),
                escape(BRAND_NAME),
                heroPill("Tour", tour.getTitle()),
                heroPill("Khởi hành", departureLabel),
                heroPill("Số khách", value(booking.getTotalPeople()) + " khách")));

        html.append("""
                      <div style="font-size:18px;font-weight:900;color:#0f241b">Thông tin tour đã đặt</div>
                      <div style="margin-top:12px;padding:20px;border:1px solid #dfe8de;border-radius:18px;background:linear-gradient(135deg,#f7fbf4,#fffaf0)">
                        <div style="font-size:23px;line-height:1.35;font-weight:900;color:#10231b">%s</div>
                """.formatted(escape(tour.getTitle())));

        if (hasText(tour.getShortDescription())) {
            html.append("<div style=\"margin-top:8px;color:#53645b\">")
                    .append(multiline(tour.getShortDescription()))
                    .append("</div>");
        }

        html.append("""
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
                metricCell("Thời lượng", value(tour.getDurationDays()) + " ngày " + value(tour.getDurationNights()) + " đêm"),
                metricCell("Khởi hành", fallback(tour.getDepartureLocation())),
                metricCell("Ngày đi", departureLabel),
                metricCell("Hình thức", bookingTypeLabel(booking))));

        html.append("""
                      <div style="margin-top:26px;font-size:18px;font-weight:900;color:#0f241b">Thông tin người đặt</div>
                      <table role="presentation" style="width:100%;margin-top:12px;border-collapse:separate;border-spacing:0;border:1px solid #e2e8df;border-radius:16px;overflow:hidden">
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

                      <div style="margin-top:28px">
                        <div style="font-size:18px;font-weight:900;color:#0f241b">Lịch trình chi tiết</div>
                        <div style="margin-top:4px;color:#64746a">Các hoạt động bên dưới là lịch trình snapshot tại thời điểm đặt tour, giúp bạn dễ kiểm tra từng ngày của chuyến đi.</div>
                """)
                .append(renderItinerary(scheduleDays, activitiesByDayId, false))
                .append("""
                      </div>
                """);

        html.append(renderServiceSection(tour));

        html.append("""
                      <div style="margin-top:28px;font-size:18px;font-weight:900;color:#0f241b">Danh sách hành khách</div>
                      <div style="margin-top:12px;overflow-x:auto;border:1px solid #e2e8df;border-radius:16px">
                        <table role="presentation" style="width:100%;min-width:620px;border-collapse:collapse">
                          <thead>
                            <tr style="background:#f2f7ef;color:#56665d;text-align:left">
                              <th style="padding:12px;font-size:11px;text-transform:uppercase;letter-spacing:1px">Hành khách</th>
                              <th style="padding:12px;font-size:11px;text-transform:uppercase;letter-spacing:1px">Phân loại</th>
                              <th style="padding:12px;font-size:11px;text-transform:uppercase;letter-spacing:1px">Ngày sinh</th>
                              <th style="padding:12px;font-size:11px;text-transform:uppercase;letter-spacing:1px">Liên hệ</th>
                            </tr>
                          </thead>
                          <tbody>
                """);

        List<BookingCustomer> visibleCustomers = customers == null
                ? List.of()
                : customers.stream().limit(MAX_CUSTOMERS_IN_EMAIL).toList();
        if (visibleCustomers.isEmpty()) {
            html.append("""
                    <tr>
                      <td colspan="4" style="padding:14px;color:#64746a;text-align:center">Thông tin hành khách đang được cập nhật.</td>
                    </tr>
                    """);
        } else {
            for (int index = 0; index < visibleCustomers.size(); index++) {
                html.append(customerRow(visibleCustomers.get(index), index));
            }
        }

        if (customers != null && customers.size() > MAX_CUSTOMERS_IN_EMAIL) {
            html.append("""
                    <tr>
                      <td colspan="4" style="padding:12px;color:#64746a;background:#fafcf8;text-align:center">
                    """)
                    .append("Và ").append(customers.size() - MAX_CUSTOMERS_IN_EMAIL)
                    .append(" hành khách khác. Vui lòng xem đầy đủ trong tài khoản.")
                    .append("</td></tr>");
        }

        html.append("""
                          </tbody>
                        </table>
                      </div>

                      <div style="margin-top:28px;padding:22px;border-radius:18px;background:#10231b;color:#ffffff">
                        <div style="font-size:18px;font-weight:900">Thanh toán và chi phí</div>
                        <table role="presentation" style="width:100%%;margin-top:12px;border-collapse:collapse">
                """)
                .append(priceRow("Người lớn", value(booking.getAdultCount()), booking.getAdultPriceSnapshot()))
                .append(priceRow("Trẻ em / em bé", value(booking.getChildCount()), booking.getChildPriceSnapshot()))
                .append(totalRow("Tổng giá tour", formatCurrency(booking.getTotalPrice())))
                .append("""
                        </table>
                        <div style="margin-top:16px;padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12)">
                          <div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#cfe7d2;font-weight:900">Tình trạng thanh toán</div>
                          <div style="margin-top:5px;font-size:17px;font-weight:900;color:#f3d6a5">%s</div>
                          <div style="margin-top:9px;color:#edf6ee">
                            Đã thanh toán: <strong>%s</strong><br />
                            Còn lại: <strong>%s</strong><br />
                            Phương thức: <strong>%s</strong>
                          </div>
                        </div>
                      </div>
                """.formatted(
                escape(paymentStatusLabel(booking)),
                escape(formatCurrency(booking.getPaidAmount())),
                escape(formatCurrency(booking.getRemainingAmount())),
                escape(paymentMethodLabel(booking.getPaymentMethod()))));

        html.append(renderNoteSection(booking));

        html.append("""
                      <div style="margin-top:30px;padding:20px;border-radius:18px;background:#f5faf1;border:1px solid #dbe8d7">
                        <div style="font-size:17px;font-weight:900;color:#10231b">Trước ngày khởi hành, bạn vui lòng kiểm tra lại</div>
                        <table role="presentation" style="width:100%%;margin-top:12px;border-collapse:collapse">
                          <tr>
                            <td style="vertical-align:top;width:50%%;padding:6px 10px 6px 0;color:#4e5f55">Thông tin cá nhân và giấy tờ tùy thân của từng hành khách.</td>
                            <td style="vertical-align:top;width:50%%;padding:6px 0 6px 10px;color:#4e5f55">Điểm đón, thời gian có mặt và số điện thoại liên hệ.</td>
                          </tr>
                          <tr>
                            <td style="vertical-align:top;width:50%%;padding:6px 10px 6px 0;color:#4e5f55">Yêu cầu ăn uống, sức khỏe, trẻ em hoặc người lớn tuổi đi cùng.</td>
                            <td style="vertical-align:top;width:50%%;padding:6px 0 6px 10px;color:#4e5f55">Các khoản thanh toán còn lại nếu booking chưa hoàn tất chi phí.</td>
                          </tr>
                        </table>
                      </div>

                      <div style="margin-top:30px;text-align:center">
                        <a href="%s" target="_blank" style="display:inline-block;padding:14px 24px;border-radius:14px;background:#0f6b43;color:#ffffff;text-decoration:none;font-weight:900">
                          Xem chi tiết đặt tour
                        </a>
                      </div>

                      <div style="margin-top:22px;color:#64746a;font-size:12px;text-align:center">
                        Nếu thông tin có sai sót, bạn chỉ cần phản hồi email này hoặc liên hệ hotline %s để đội ngũ %s hỗ trợ điều chỉnh.
                      </div>
                    </div>

                    <div style="padding:22px 32px;background:#f7faf6;color:#64746a;font-size:12px;text-align:center;border-top:1px solid #e5ece2">
                      <img src="%s" width="72" alt="Tây Bắc Travel" style="display:block;width:72px;height:72px;object-fit:contain;margin:0 auto 10px" />
                      <strong style="color:#10231b">%s</strong><br />
                      Hotline: %s · Email: %s<br />
                      Email này được gửi đến <strong>%s</strong> vì bạn vừa đặt tour tại %s.
                    </div>
                  </div>
                </div>
                """.formatted(
                safeBookingUrl,
                escape(HOTLINE),
                escape(BRAND_NAME),
                safeLogoUrl,
                escape(BRAND_NAME),
                escape(HOTLINE),
                escape(SUPPORT_EMAIL),
                escape(booking.getEmail()),
                escape(BRAND_NAME)));

        return html.toString();
    }

    private String renderServiceSection(Tour tour) {
        if (!hasText(tour.getDescription())
                && !hasText(tour.getIncludedServices())
                && !hasText(tour.getExcludedServices())) {
            return "";
        }

        StringBuilder html = new StringBuilder(8000);
        html.append("""
                <div style="margin-top:28px;font-size:18px;font-weight:900;color:#0f241b">Dịch vụ và lưu ý của tour</div>
                <div style="margin-top:12px;border:1px solid #e2e8df;border-radius:18px;overflow:hidden">
                """);
        if (hasText(tour.getDescription())) {
            html.append(servicePanel("Mô tả hành trình", tour.getDescription(), "#f7fbf4"));
        }
        if (hasText(tour.getIncludedServices())) {
            html.append(servicePanel("Dịch vụ bao gồm", tour.getIncludedServices(), "#ffffff"));
        }
        if (hasText(tour.getExcludedServices())) {
            html.append(servicePanel("Dịch vụ chưa bao gồm", tour.getExcludedServices(), "#fff9ef"));
        }
        html.append("</div>");
        return html.toString();
    }

    private String renderNoteSection(Booking booking) {
        if (!hasText(booking.getNote()) && !hasText(booking.getSpecialRequest())) {
            return "";
        }

        StringBuilder html = new StringBuilder(2200);
        html.append("""
                <div style="margin-top:28px;padding:18px 20px;border-left:5px solid #c99245;border-radius:6px 16px 16px 6px;background:#fff8ed;color:#4b3925">
                  <div style="font-size:16px;font-weight:900;color:#2f2418">Ghi chú và yêu cầu riêng</div>
                """);
        if (hasText(booking.getNote())) {
            html.append("<div style=\"margin-top:9px\"><strong>Ghi chú của khách:</strong> ")
                    .append(multiline(booking.getNote()))
                    .append("</div>");
        }
        if (hasText(booking.getSpecialRequest())) {
            html.append("<div style=\"margin-top:9px\"><strong>Yêu cầu đặc biệt:</strong> ")
                    .append(multiline(booking.getSpecialRequest()))
                    .append("</div>");
        }
        html.append("</div>");
        return html.toString();
    }

    private String heroPill(String label, String value) {
        return """
                <span style="display:inline-block;margin:0 8px 8px 0;padding:9px 12px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);color:#ffffff;font-size:12px">
                  <strong style="color:#c9f8cc">%s:</strong> %s
                </span>
                """.formatted(escape(label), escape(value));
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

    private String servicePanel(String title, String content, String background) {
        return """
                <div style="padding:16px 18px;background:%s;border-bottom:1px solid #e2e8df">
                  <div style="font-size:15px;font-weight:900;color:#10231b">%s</div>
                  <div style="margin-top:7px;color:#516258">%s</div>
                </div>
                """.formatted(background, escape(title), multiline(content));
    }

    private String infoRow(String label, String value, boolean alternate) {
        if (!hasText(value)) {
            return "";
        }

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

    private String customerRow(BookingCustomer customer, int index) {
        String background = index % 2 == 0 ? "#ffffff" : "#fafcf8";
        String contact = hasText(customer.getPhone()) ? customer.getPhone() : customer.getEmail();

        return """
                <tr style="background:%s;border-top:1px solid #edf2ea">
                  <td style="padding:12px;font-weight:900;color:#1f2937">%s%s</td>
                  <td style="padding:12px;color:#52645a">%s</td>
                  <td style="padding:12px;color:#52645a">%s</td>
                  <td style="padding:12px;color:#52645a">%s</td>
                </tr>
                """.formatted(
                background,
                escape(customer.getFullName()),
                Boolean.TRUE.equals(customer.getGroupLeader())
                        ? " <span style=\"color:#0f6b43;font-size:11px;font-weight:900\">(Trưởng đoàn)</span>"
                        : "",
                escape(customerTypeLabel(customer)),
                escape(formatDate(customer.getDateOfBirth())),
                escape(hasText(contact) ? contact : "Không có"));
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
                  <td style="padding:13px 0 5px;border-top:1px solid rgba(255,255,255,.16);font-size:16px;font-weight:900">%s</td>
                  <td style="padding:13px 0 5px;border-top:1px solid rgba(255,255,255,.16);text-align:right;font-size:22px;font-weight:900;color:#f3d6a5">%s</td>
                </tr>
                """.formatted(escape(label), escape(value));
    }
}
