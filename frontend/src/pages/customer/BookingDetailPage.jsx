import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  Banknote,
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
  QrCode,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { cancelBooking, getBookingDetail, payBooking } from "../../api/bookingApi";
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

const paymentPlanText = {
  FULL: "Thanh toán 100%",
  DEPOSIT: "Đặt cọc 30%",
};

const remainingMethodText = {
  CASH_ON_DEPARTURE: "Tiền mặt khi khởi hành",
  BANK_TRANSFER_LATER: "Chuyển khoản phần còn lại",
  BANK_TRANSFER_QR: "Chuyển khoản QR",
};

const bankInfo = {
  bankId: "970422",
  bankName: "MB Bank",
  accountNo: "0123456789",
  accountName: "TAY BAC TRAVEL",
};

const buildBankQrUrl = ({ amount, bookingCode, paymentType }) => {
  const safeAmount = Math.max(0, Math.round(Number(amount || 0)));
  const addInfo = encodeURIComponent(`${bookingCode || "BOOKING"} ${paymentType}`);
  const accountName = encodeURIComponent(bankInfo.accountName);

  return `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-compact2.png?amount=${safeAmount}&addInfo=${addInfo}&accountName=${accountName}`;
};

const finalPaymentStatuses = [
  "PAID",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "FORFEITED",
];

const pendingReviewPaymentStatuses = ["PENDING_REVIEW"];

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState("FULL");
  const [remainingMethod, setRemainingMethod] = useState("CASH_ON_DEPARTURE");

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

  useEffect(() => {
    if (!booking) return;

    if (booking.paymentStatus === "PARTIAL") {
      setPaymentChoice("REMAINING");
    } else if (
      booking.paymentStatus === "PENDING_REVIEW" &&
      booking.paymentPlan === "DEPOSIT" &&
      Number(booking.remainingAmount || 0) === 0
    ) {
      setPaymentChoice("REMAINING");
    } else if (booking.paymentPlan === "DEPOSIT") {
      setPaymentChoice("DEPOSIT");
    } else {
      setPaymentChoice("FULL");
    }

    setRemainingMethod(booking.remainingPaymentMethod || "CASH_ON_DEPARTURE");
  }, [booking?.id, booking?.paymentPlan, booking?.paymentStatus, booking?.remainingPaymentMethod]);

  const statusMeta = getMeta(bookingStatusMeta, booking?.status);
  const paymentMeta = getMeta(paymentStatusMeta, booking?.paymentStatus);
  const selectedStatusIndex = bookingSteps.findIndex(
    (step) => step.key === booking?.status,
  );

  const totalAmount = Number(booking?.totalPrice || 0);
  const depositAmount = Number(
    booking?.depositAmount ?? Math.round(totalAmount * 0.3),
  );
  const paidAmount = Number(booking?.paidAmount || 0);
  const remainingAmount = Number(
    booking?.remainingAmount ?? Math.max(totalAmount - paidAmount, 0),
  );
  const refundedAmount = Number(booking?.refundedAmount || 0);
  const forfeitedDepositAmount = Number(booking?.forfeitedDepositAmount || 0);
  const selectedPaymentAmount =
    paymentChoice === "DEPOSIT"
      ? depositAmount
      : paymentChoice === "REMAINING"
        ? remainingAmount
        : totalAmount;
  const selectedPaymentType =
    paymentChoice === "DEPOSIT"
      ? "DEPOSIT"
      : paymentChoice === "REMAINING"
        ? "REMAINING"
        : "FULL";
  const isPaymentPendingReview = pendingReviewPaymentStatuses.includes(
    booking?.paymentStatus,
  );
  const canPay =
    booking &&
    booking.status !== "CANCELLED" &&
    !isPaymentPendingReview &&
    !finalPaymentStatuses.includes(booking.paymentStatus);
  const canCancel =
    booking &&
    !isPaymentPendingReview &&
    !["CANCELLED", "COMPLETED"].includes(booking.status);
  const hasGroup = Number(booking?.totalPeople || 0) > 1;

  const handlePay = async (paymentType = selectedPaymentType) => {
    if (!booking) return;

    try {
      setPaying(true);
      const response = await payBooking(booking.id, {
        paymentType,
        paymentMethod: "BANK_TRANSFER_QR",
        remainingPaymentMethod: remainingMethod,
      });

      setBooking(response.data);
      toast.success("Đã gửi xác nhận thanh toán, vui lòng chờ admin duyệt");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể thanh toán booking");
    } finally {
      setPaying(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    const confirmed = window.confirm(
      "Bạn chắc chắn muốn hủy đặt lịch này? Hệ thống sẽ áp dụng chính sách hoàn tiền theo ngày khởi hành.",
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      const response = await cancelBooking(booking.id, {
        reason: "Khách yêu cầu hủy đặt lịch trên website",
      });

      setBooking(response.data);
      toast.success("Đã hủy đặt lịch và cập nhật chính sách thanh toán");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể hủy đặt lịch");
    } finally {
      setCancelling(false);
    }
  };

  const renderTransferPanel = ({ amount, paymentType, title, description }) => (
    <div className="rounded-xl border border-white/10 bg-[#020617]/40 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7FB77E]/15 text-[#9de09c]">
          <QrCode size={19} />
        </span>
        <div>
          <div className="font-black text-white">{title}</div>
          <p className="text-xs font-semibold text-slate-400">{description}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
        <div className="rounded-xl bg-white p-3">
          <img
            src={buildBankQrUrl({
              amount,
              bookingCode: booking?.bookingCode,
              paymentType,
            })}
            alt="QR thanh toán ngân hàng"
            className="aspect-square w-full object-contain"
          />
        </div>

        <div className="grid gap-2 text-sm text-slate-300">
          <PaymentRow label="Ngân hàng" value={bankInfo.bankName} />
          <PaymentRow label="Số tài khoản" value={bankInfo.accountNo} />
          <PaymentRow label="Chủ tài khoản" value={bankInfo.accountName} />
          <PaymentRow
            label="Nội dung"
            value={`${booking?.bookingCode || ""} ${paymentType}`}
          />
          <div className="mt-2 rounded-xl border border-[#d4a878]/25 bg-[#d4a878]/10 p-3">
            <div className="text-xs font-bold text-[#f3d7b0]">Số tiền cần chuyển</div>
            <div className="mt-1 text-xl font-black text-white">
              {formatCurrency(amount)}
            </div>
          </div>
        </div>
      </div>
    </div>
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
        <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
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
                  <div className="font-black">Đặt lịch đã hủy</div>
                  <p className="mt-1 text-sm text-rose-100/80">
                    {booking.refundPolicyNote ||
                      "Hệ thống đã áp dụng chính sách hoàn tiền theo ngày khởi hành."}
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
                  <CreditCard size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Thanh toán
                  </h2>
                  <p className="text-sm text-slate-400">
                    Gửi xác nhận chuyển khoản để admin kiểm tra trước khi chốt trạng thái.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <PaymentRow label="Trạng thái" value={<StatusPill meta={paymentMeta} />} />
                <PaymentRow label="Tổng tiền" value={formatCurrency(totalAmount)} />
                <PaymentRow label="Đã ghi nhận" value={formatCurrency(paidAmount)} />
                <PaymentRow label="Còn lại" value={formatCurrency(remainingAmount)} />
                <PaymentRow label="Tiền cọc 30%" value={formatCurrency(depositAmount)} />
                {booking.paymentPlan && (
                  <PaymentRow
                    label="Gói thanh toán"
                    value={paymentPlanText[booking.paymentPlan] || booking.paymentPlan}
                  />
                )}
                {booking.remainingPaymentMethod && (
                  <PaymentRow
                    label="Phần còn lại"
                    value={
                      remainingMethodText[booking.remainingPaymentMethod] ||
                      booking.remainingPaymentMethod
                    }
                  />
                )}
                <PaymentRow
                  label="Hạn thanh toán"
                  value={formatDateTime(booking.paymentDeadline)}
                />
                {booking.paidAt && (
                  <PaymentRow
                    label="Thanh toán lúc"
                    value={formatDateTime(booking.paidAt)}
                  />
                )}
                {refundedAmount > 0 && (
                  <PaymentRow label="Đã hoàn" value={formatCurrency(refundedAmount)} />
                )}
                {forfeitedDepositAmount > 0 && (
                  <PaymentRow
                    label="Cọc đã giữ"
                    value={formatCurrency(forfeitedDepositAmount)}
                  />
                )}
              </div>

              {booking.paymentReference && (
                <div className="mt-4 rounded-xl border border-white/10 bg-[#020617]/40 p-3">
                  <div className="text-xs font-bold text-slate-400">Mã giao dịch</div>
                  <div className="mt-1 break-all font-black text-white">
                    {booking.paymentReference}
                  </div>
                </div>
              )}

              {["UNPAID", "FAILED"].includes(booking.paymentStatus) && canPay && (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        key: "FULL",
                        Icon: ReceiptText,
                        title: "Trả đủ 100%",
                        amount: totalAmount,
                        note: "Gửi xác nhận thanh toán toàn bộ tour qua QR.",
                      },
                      {
                        key: "DEPOSIT",
                        Icon: Banknote,
                        title: "Đặt cọc 30%",
                        amount: depositAmount,
                        note: "Gửi xác nhận cọc 30%, admin duyệt trước khi chốt giữ chỗ.",
                      },
                    ].map(({ key, Icon, title, amount, note }) => {
                      const active = paymentChoice === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPaymentChoice(key)}
                          className={[
                            "rounded-xl border p-4 text-left transition",
                            active
                              ? "border-[#7FB77E]/60 bg-[#7FB77E]/15"
                              : "border-white/10 bg-white/[0.03] hover:border-white/25",
                          ].join(" ")}
                        >
                          <Icon size={20} className="text-[#9de09c]" />
                          <div className="mt-3 font-black text-white">{title}</div>
                          <div className="mt-1 text-lg font-black text-[#d4a878]">
                            {formatCurrency(amount)}
                          </div>
                          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
                            {note}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {paymentChoice === "DEPOSIT" && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-sm font-black text-white">
                        Cách thanh toán 70% còn lại
                      </div>
                      <div className="mt-3 grid gap-2">
                        {["CASH_ON_DEPARTURE", "BANK_TRANSFER_LATER"].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setRemainingMethod(method)}
                            className={[
                              "flex min-h-11 items-center justify-between rounded-xl border px-3 text-left text-sm font-bold transition",
                              remainingMethod === method
                                ? "border-[#7FB77E]/60 bg-[#7FB77E]/15 text-white"
                                : "border-white/10 bg-[#020617]/30 text-slate-300 hover:border-white/25",
                            ].join(" ")}
                          >
                            <span>{remainingMethodText[method]}</span>
                            {remainingMethod === method && <CheckCircle2 size={17} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {renderTransferPanel({
                    amount: selectedPaymentAmount,
                    paymentType: selectedPaymentType,
                    title:
                      paymentChoice === "DEPOSIT"
                        ? "QR đặt cọc tour"
                        : "QR thanh toán toàn bộ tour",
                    description:
                      paymentChoice === "DEPOSIT"
                        ? "Sau khi gửi xác nhận cọc, booking sẽ chuyển sang trạng thái Xét duyệt."
                        : "Sau khi gửi xác nhận, admin sẽ kiểm tra trước khi chuyển sang Đã thanh toán.",
                  })}

                  <button
                    type="button"
                    onClick={() => handlePay(selectedPaymentType)}
                    disabled={paying}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7FB77E] px-5 text-sm font-black text-[#020617] transition hover:bg-[#9de09c] disabled:opacity-60"
                  >
                    {paying ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CreditCard size={18} />
                    )}
                    {paymentChoice === "DEPOSIT"
                      ? "Gửi xác nhận đặt cọc 30%"
                      : "Gửi xác nhận thanh toán 100%"}
                  </button>
                </div>
              )}

              {booking.paymentStatus === "PENDING_REVIEW" && (
                <div className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
                  <div className="font-black text-white">
                    {remainingAmount > 0
                      ? "Yêu cầu thanh toán đang chờ xét duyệt"
                      : "Yêu cầu thanh toán đủ đang chờ xét duyệt"}
                  </div>
                  <p className="mt-1">
                    Hệ thống đã ghi nhận xác nhận chuyển khoản{" "}
                    <b>{formatCurrency(paidAmount)}</b>. Admin sẽ kiểm tra giao dịch
                    trước khi cập nhật trạng thái thành{" "}
                    <b>{remainingAmount > 0 ? "Đã cọc" : "Đã thanh toán"}</b>.
                    Bạn có thể hủy đặt lịch sau khi admin xử lý yêu cầu thanh toán này.
                  </p>
                </div>
              )}

              {booking.paymentStatus === "PARTIAL" && canPay && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-sky-300/20 bg-sky-300/10 p-4 text-sm leading-6 text-sky-100">
                    Booking đã giữ chỗ bằng tiền cọc. Phần còn lại là{" "}
                    <b>{formatCurrency(remainingAmount)}</b> và có thể thanh toán
                    tiền mặt khi khởi hành hoặc chuyển khoản trước bằng QR.
                  </div>

                  {renderTransferPanel({
                    amount: remainingAmount,
                    paymentType: "REMAINING",
                    title: "QR thanh toán phần còn lại",
                    description: "Gửi xác nhận khi khách đã chuyển khoản phần còn lại trước ngày đi.",
                  })}

                  <button
                    type="button"
                    onClick={() => handlePay("REMAINING")}
                    disabled={paying || remainingAmount <= 0}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7FB77E] px-5 text-sm font-black text-[#020617] transition hover:bg-[#9de09c] disabled:opacity-60"
                  >
                    {paying ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CreditCard size={18} />
                    )}
                    Gửi xác nhận thanh toán phần còn lại
                  </button>
                </div>
              )}

              {finalPaymentStatuses.includes(booking.paymentStatus) && (
                <div className="mt-5 rounded-xl border border-white/10 bg-[#020617]/40 p-4 text-sm leading-6 text-slate-300">
                  <div className="font-black text-white">
                    {booking.paymentStatus === "PAID"
                      ? "Booking đã thanh toán đủ"
                      : "Trạng thái thanh toán đã được chốt"}
                  </div>
                  <p className="mt-1">
                    {booking.refundPolicyNote ||
                      "Mọi thay đổi thanh toán tiếp theo sẽ do bộ phận điều hành xử lý."}
                  </p>
                </div>
              )}

              <div className="mt-5 rounded-xl border border-[#d4a878]/20 bg-[#d4a878]/10 p-4 text-sm leading-6 text-[#f3d7b0]">
                <div className="flex items-start gap-2">
                  <RefreshCcw size={18} className="mt-0.5 shrink-0" />
                  <p>
                    {booking.refundPolicyNote ||
                      "Hủy trước ngày khởi hành được hoàn số tiền đã thanh toán. Hủy từ ngày khởi hành trở đi sẽ mất cọc 30%, phần đã thanh toán vượt quá cọc sẽ được hoàn lại."}
                  </p>
                </div>
              </div>

              {canCancel && (
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-300/30 bg-rose-300/10 px-5 text-sm font-black text-rose-100 transition hover:bg-rose-300/20 disabled:opacity-60"
                >
                  {cancelling ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <XCircle size={18} />
                  )}
                  Hủy Đặt Lịch
                </button>
              )}
            </div>

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
                      {booking.contactPerson ? ` - ${booking.contactPerson}` : ""}
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
                          {customer.groupLeader && hasGroup ? "Trưởng đoàn" : "Hành khách"}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-1 text-sm text-slate-400 sm:grid-cols-2">
                        <span>{customerTypeText[customer.customerType] || "Hành khách"}</span>
                        <span>{customer.phone || "Chưa có SĐT"}</span>
                        <span className="break-all sm:col-span-2">
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

function PaymentRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <b className="text-right text-white">{value}</b>
    </div>
  );
}
