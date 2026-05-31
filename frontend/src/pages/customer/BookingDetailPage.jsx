import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock3,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { getBookingDetail } from "../../api/bookingApi";
import AccountShell from "./AccountShell";
import {
  bookingStatusMeta,
  bookingSteps,
  formatCurrency,
  formatDate,
  formatDateTime,
  getMeta,
  paymentStatusMeta,
  StatusPill,
} from "./accountShared";

const bookingTypeText = {
  INDIVIDUAL: "Cá nhân",
  GROUP: "Theo đoàn",
  PRIVATE: "Tour riêng",
};

const customerTypeText = {
  ADULT: "Người lớn",
  CHILD: "Trẻ em",
  INFANT: "Em bé",
};

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadBooking = async () => {
      try {
        setLoading(true);
        const response = await getBookingDetail(bookingId);
        if (mounted) setBooking(response.data);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải chi tiết booking",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBooking();

    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const statusMeta = getMeta(bookingStatusMeta, booking?.status);
  const paymentMeta = getMeta(paymentStatusMeta, booking?.paymentStatus);
  const selectedStatusIndex = bookingSteps.findIndex(
    (step) => step.key === booking?.status,
  );

  return (
    <AccountShell
      title="Chi tiết trạng thái"
      description="Theo dõi tiến độ xác nhận, thanh toán và thông tin khách đi tour."
      actions={
        <Link
          to="/tai-khoan/booking"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-black text-white transition hover:border-[#7FB77E]/40 hover:bg-[#7FB77E]/10"
        >
          <ChevronLeft size={18} />
          Lịch sử booking
        </Link>
      }
    >
      {loading ? (
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7FB77E]" />
        </div>
      ) : booking ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <section className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-bold text-[#d4a878]">
                    {booking.bookingCode}
                  </div>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    {booking.tourName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Đặt lúc {formatDateTime(booking.bookedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <StatusPill meta={statusMeta} />
                  <StatusPill meta={paymentMeta} />
                </div>
              </div>
            </div>

            {booking.status === "CANCELLED" ? (
              <div className="flex items-start gap-3 rounded-xl border border-rose-300/30 bg-rose-300/10 p-4 text-rose-100">
                <XCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-black">Booking đã hủy</div>
                  <p className="mt-1 text-sm text-rose-100/80">
                    Liên hệ bộ phận hỗ trợ nếu bạn cần kiểm tra hoàn tiền hoặc
                    đặt lại lịch khác.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-4">
                {bookingSteps.map((step, index) => {
                  const done = selectedStatusIndex >= index;

                  return (
                    <div
                      key={step.key}
                      className={[
                        "rounded-xl border p-3",
                        done
                          ? "border-[#7FB77E]/40 bg-[#7FB77E]/15"
                          : "border-white/10 bg-white/[0.03]",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-9 w-9 items-center justify-center rounded-lg",
                          done
                            ? "bg-[#7FB77E] text-[#020617]"
                            : "bg-white/[0.06] text-slate-400",
                        ].join(" ")}
                      >
                        {done ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                      </div>
                      <div
                        className={[
                          "mt-3 text-sm font-black",
                          done ? "text-white" : "text-slate-400",
                        ].join(" ")}
                      >
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  Icon: CalendarDays,
                  label: "Ngày khởi hành",
                  value: `${formatDate(booking.departureDate)} ${
                    booking.departureTime ? booking.departureTime.slice(0, 5) : ""
                  }`,
                },
                {
                  Icon: ShieldCheck,
                  label: "Loại booking",
                  value: bookingTypeText[booking.bookingType] || "Cá nhân",
                },
                {
                  Icon: Users,
                  label: "Số khách",
                  value: `${booking.totalPeople || 0} khách`,
                },
                {
                  Icon: CreditCard,
                  label: "Tổng tiền",
                  value: formatCurrency(booking.totalPrice),
                },
                {
                  Icon: Phone,
                  label: "Liên hệ",
                  value: booking.phone || "Chưa cập nhật",
                },
              ].map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <Icon size={18} className="text-[#9de09c]" />
                  <div className="mt-3 text-xs font-bold text-slate-400">
                    {label}
                  </div>
                  <div className="mt-1 font-black text-white">{value}</div>
                </div>
              ))}
            </div>

            {(booking.note || booking.specialRequest) && (
              <div className="rounded-xl border border-[#A67C52]/20 bg-[#A67C52]/[0.06] p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-[#d4a878]"
                  />
                  <div className="text-sm leading-6 text-slate-200">
                    {booking.note && (
                      <p>
                        <span className="font-black text-white">Ghi chú:</span>{" "}
                        {booking.note}
                      </p>
                    )}
                    {booking.specialRequest && (
                      <p className="mt-2">
                        <span className="font-black text-white">Yêu cầu:</span>{" "}
                        {booking.specialRequest}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {booking.scheduleDays?.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                    <ClipboardList size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Lịch trình đã chốt
                    </h2>
                    <p className="text-sm text-slate-400">
                      Lịch trình được lưu riêng cho booking này.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {booking.scheduleDays.map((day) => (
                    <div
                      key={day.id}
                      className="rounded-xl border border-white/10 bg-[#020617]/35 p-4"
                    >
                      <div className="text-xs font-black uppercase tracking-widest text-[#d4a878]">
                        Ngày {day.dayNumber}
                      </div>
                      <h3 className="mt-1 font-black text-white">{day.title}</h3>
                      {day.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {day.description}
                        </p>
                      )}

                      {day.activities?.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {day.activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                            >
                              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                                <Clock3 size={14} className="text-[#9de09c]" />
                                <span>
                                  {activity.startTime
                                    ? activity.startTime.slice(0, 5)
                                    : "Chưa rõ giờ"}
                                  {activity.endTime
                                    ? ` - ${activity.endTime.slice(0, 5)}`
                                    : ""}
                                </span>
                              </div>
                              <div className="mt-2 font-black text-white">
                                {activity.title}
                              </div>
                              {activity.description && (
                                <p className="mt-1 text-sm leading-6 text-slate-400">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Thông tin khách hàng
                  </h2>
                  <p className="text-sm text-slate-400">
                    Thông tin liên hệ cho booking này.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="flex gap-3">
                  <UserRound size={16} className="mt-0.5 shrink-0 text-[#9de09c]" />
                  <span>{booking.customerName}</span>
                </div>
                {booking.organizationName && (
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-[#d4a878]"
                    />
                    <span>
                      {booking.organizationName}
                      {booking.contactPerson ? ` · ${booking.contactPerson}` : ""}
                    </span>
                  </div>
                )}
                <div className="flex gap-3">
                  <Mail size={16} className="mt-0.5 shrink-0 text-[#d4a878]" />
                  <span className="break-all">{booking.email}</span>
                </div>
                <div className="flex gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#9de09c]" />
                  <span>{booking.pickupAddress || "Chưa có địa chỉ đón"}</span>
                </div>
              </div>
            </div>

            {booking.customers?.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-xl font-black text-white">
                  Danh sách khách đi tour
                </h2>
                <div className="mt-4 space-y-3">
                  {booking.customers.map((customer, index) => (
                    <div
                      key={customer.id || index}
                      className="rounded-xl border border-white/10 bg-[#020617]/45 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-black text-white">
                          {customer.fullName}
                        </div>
                        <span className="rounded-full bg-[#7FB77E]/15 px-3 py-1 text-xs font-bold text-[#9de09c]">
                          {customer.groupLeader
                            ? "Trưởng đoàn"
                            : customerTypeText[customer.customerType] ||
                              customer.customerType}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-1 text-sm text-slate-400 sm:grid-cols-2">
                        <span>{customer.phone || "Chưa có SĐT"}</span>
                        <span className="break-all">
                          {customer.email || "Chưa có email"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-4 text-sm font-bold text-slate-300">
            Không tìm thấy booking.
          </p>
        </div>
      )}
    </AccountShell>
  );
}
