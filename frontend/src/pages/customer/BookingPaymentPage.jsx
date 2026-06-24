import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { createBooking } from "../../api/bookingApi";
import { resolveUploadedFileUrl } from "../../api/userApi";
import BookingStepBar from "../../components/BookingStepBar";
import {
  clearBookingDraft,
  getBookingDraft,
} from "../../utils/bookingDraft";
import PublicLayout from "../public/PublicLayout";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const formatDate = (value) => {
  if (!value) return "Chưa có lịch";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const bankInfo = {
  bankId: "970422",
  bankName: "MB Bank",
  accountNo: "0123456789",
  accountName: "TAY BAC TRAVEL",
};

const buildBankQrUrl = ({ amount, bookingLabel, paymentType }) => {
  const safeAmount = Math.max(0, Math.round(Number(amount || 0)));
  const addInfo = encodeURIComponent(`${bookingLabel || "BOOKING"} ${paymentType}`);
  const accountName = encodeURIComponent(bankInfo.accountName);

  return `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-compact2.png?amount=${safeAmount}&addInfo=${addInfo}&accountName=${accountName}`;
};

export default function BookingPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [draft] = useState(() => getBookingDraft());
  const missingDraft = !draft || Number(draft?.tour?.id) !== Number(id);
  const [paymentChoice, setPaymentChoice] = useState("FULL");
  const [submitting, setSubmitting] = useState(false);

  const paymentSummary = useMemo(() => {
    const totalAmount = Number(draft?.totals?.totalPrice || 0);
    const depositAmount = Math.round(totalAmount * 0.3);
    const selectedAmount =
      paymentChoice === "DEPOSIT" ? depositAmount : totalAmount;

    return {
      totalAmount,
      depositAmount,
      remainingAmount: Math.max(totalAmount - depositAmount, 0),
      selectedAmount,
    };
  }, [draft, paymentChoice]);

  const handleConfirmPayment = async () => {
    if (!draft?.payload) return;

    try {
      setSubmitting(true);

      const response = await createBooking({
        ...draft.payload,
        paymentType: paymentChoice,
        paymentMethod: "BANK_TRANSFER_QR",
        remainingPaymentMethod:
          paymentChoice === "DEPOSIT" ? "CASH_ON_DEPARTURE" : null,
      });

      clearBookingDraft();

      navigate(`/thank-you?bookingId=${response.data.id}`, {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Không thể hoàn tất thanh toán",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (missingDraft) {
    return (
      <PublicLayout>
        <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617] px-4 py-16">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-[#9de09c]" />
            <h1 className="mt-4 text-2xl font-black text-white">
              Chưa có thông tin đặt tour
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Vui lòng chọn tour, lịch khởi hành và nhập thông tin trước khi thanh toán.
            </p>
            <Link to={`/booking/${id}`} className="btn-primary mt-6 text-sm">
              Quay lại form đặt tour
            </Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const coverImage = resolveUploadedFileUrl(draft.tour?.thumbnail);
  const bookingLabel = `${draft.tour?.title || "TOUR"} ${formatDate(
    draft.departure?.departureDate,
  )}`;
  const bookingFlowSteps = [
    {
      key: "detail",
      label: "Chi tiết tour",
      description: "Xem lại lịch trình và dịch vụ",
      href: `/tours/${id}`,
    },
    {
      key: "booking",
      label: "Thông tin booking",
      description: "Quay lại sửa khách, điểm đón, ghi chú",
      href: `/booking/${id}`,
    },
    {
      key: "payment",
      label: "Thanh toán",
      description: "Chọn cọc hoặc thanh toán toàn bộ",
      href: `/booking/${id}/payment`,
    },
    {
      key: "done",
      label: "Thanh toán thành công",
      description: "Đơn đặt tour đã được ghi nhận trong lịch sử",
      disabled: true,
    },
  ];

  return (
    <PublicLayout>
      <section className="booking-flow bg-[#020617] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to={`/booking/${id}`} className="btn-outline text-sm">
            <ArrowLeft size={17} />
            Quay lại thông tin đặt tour
          </Link>

          <div className="mt-5">
            <BookingStepBar steps={bookingFlowSteps} current={2} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <section className="space-y-6">
              <div className="booking-dark-panel overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-[#7FB77E]/10">
                <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-[1fr_260px]">
                  <div>
                    <span className="section-tag">
                      <CreditCard size={12} /> Thanh toán booking
                    </span>
                    <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">
                      {draft.tour?.title}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1">
                        <MapPin size={14} className="text-[#9de09c]" />
                        {draft.tour?.departureLocation || "Sơn La"}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1">
                        <CalendarDays size={14} className="text-[#d4a878]" />
                        {formatDate(draft.departure?.departureDate)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1">
                        <Users size={14} className="text-[#9de09c]" />
                        {draft.totals?.totalPeople || 0} khách
                      </span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#020617]/50">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={draft.tour?.title}
                        className="aspect-[16/10] h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center text-sm text-slate-500">
                        Chưa có ảnh tour
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="booking-dark-panel rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                    <Banknote size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Chọn hình thức thanh toán
                    </h2>
                    <p className="text-sm text-slate-400">
                      Chọn thanh toán cọc hoặc thanh toán toàn bộ để hoàn tất booking.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      key: "FULL",
                      title: "Thanh toán full",
                      amount: paymentSummary.totalAmount,
                      description: "Thanh toán toàn bộ giá trị booking ngay ở bước này.",
                    },
                    {
                      key: "DEPOSIT",
                      title: "Thanh toán cọc",
                      amount: paymentSummary.depositAmount,
                      description: "Thanh toán cọc 30%, phần còn lại thanh toán sau.",
                    },
                  ].map((option) => {
                    const active = paymentChoice === option.key;

                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setPaymentChoice(option.key)}
                        className={[
                          "rounded-2xl border p-4 text-left transition",
                          active
                            ? "border-[#7FB77E] bg-[#7FB77E]/15 shadow-soft-green"
                            : "border-white/10 bg-[#020617]/35 hover:border-[#7FB77E]/40",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-black text-white">
                              {option.title}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {option.description}
                            </p>
                          </div>
                          <span
                            className={[
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                              active
                                ? "border-[#9de09c] bg-[#9de09c] text-[#020617]"
                                : "border-white/20 text-transparent",
                            ].join(" ")}
                          >
                            <CheckCircle2 size={16} />
                          </span>
                        </div>
                        <div className="mt-4 text-2xl font-black text-gradient-gold">
                          {formatCurrency(option.amount)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-300">
                  <PaymentLine
                    label="Người lớn"
                    value={`${draft.payload?.adultCount || 0} x ${formatCurrency(
                      draft.totals?.adultPrice,
                    )}`}
                  />
                  <PaymentLine
                    label="Trẻ em / em bé"
                    value={`${draft.payload?.childCount || 0} x ${formatCurrency(
                      draft.totals?.childPrice,
                    )}`}
                  />
                  <PaymentLine
                    label="Tổng tiền tour"
                    value={formatCurrency(paymentSummary.totalAmount)}
                    strong
                  />
                  {paymentChoice === "DEPOSIT" && (
                    <PaymentLine
                      label="Còn lại sau cọc"
                      value={formatCurrency(paymentSummary.remainingAmount)}
                    />
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="booking-dark-panel rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                    <QrCode size={21} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Mã QR thanh toán
                    </h2>
                    <p className="text-sm text-slate-400">
                      Quét QR hoặc chuyển khoản theo đúng nội dung bên dưới.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white p-3">
                  <img
                    src={buildBankQrUrl({
                      amount: paymentSummary.selectedAmount,
                      bookingLabel,
                      paymentType: paymentChoice,
                    })}
                    alt="QR thanh toán"
                    className="aspect-square w-full object-contain"
                  />
                </div>

                <div className="mt-5 grid gap-2 text-sm text-slate-300">
                  <PaymentLine label="Ngân hàng" value={bankInfo.bankName} />
                  <PaymentLine label="Số tài khoản" value={bankInfo.accountNo} />
                  <PaymentLine label="Chủ tài khoản" value={bankInfo.accountName} />
                  <PaymentLine
                    label="Nội dung"
                    value={`${paymentChoice} ${draft.tour?.id}-${draft.departure?.id}`}
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-[#d4a878]/25 bg-[#d4a878]/10 p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-[#f3d7b0]">
                    Số tiền cần thanh toán
                  </div>
                  <div className="mt-2 text-3xl font-black text-white">
                    {formatCurrency(paymentSummary.selectedAmount)}
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={submitting}
                    className="btn-primary w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    Đã chuyển khoản
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function PaymentLine({ label, value, strong = false }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-[#020617]/35 px-4 py-3">
      <span>{label}</span>
      <b
        className={[
          "min-w-0 max-w-[220px] break-words text-right",
          strong ? "text-[#f4c27a]" : "text-white",
        ].join(" ")}
      >
        {value}
      </b>
    </div>
  );
}
