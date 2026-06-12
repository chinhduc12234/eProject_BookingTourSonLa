import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock3,
  CreditCard,
  ImageIcon,
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
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { cancelBooking, getBookingDetail, payBooking } from "../../api/bookingApi";
import { resolveUploadedFileUrl } from "../../api/userApi";
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

const genderText = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

const paymentPlanText = {
  FULL: "Thanh toán 100%",
  DEPOSIT: "Đặt cọc 30%",
};

const remainingMethodText = {
  CASH_ON_DEPARTURE: "Tiền mặt hoặc QR",
  BANK_TRANSFER_LATER: "Chuyển khoản phần còn lại",
  BANK_TRANSFER_QR: "Chuyển khoản QR",
};

const bankInfo = {
  bankId: "970422",
  bankName: "MB Bank",
  accountNo: "0123456789",
  accountName: "TAY BAC TRAVEL",
};

const finalPaymentStatuses = [
  "PAID",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "FORFEITED",
];

const pendingReviewPaymentStatuses = ["PENDING_REVIEW"];

const buildBankQrUrl = ({ amount, bookingCode, paymentType }) => {
  const safeAmount = Math.max(0, Math.round(Number(amount || 0)));
  const addInfo = encodeURIComponent(`${bookingCode || "BOOKING"} ${paymentType}`);
  const accountName = encodeURIComponent(bankInfo.accountName);

  return `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-compact2.png?amount=${safeAmount}&addInfo=${addInfo}&accountName=${accountName}`;
};

const getPaymentErrorMessage = (error) => {
  const message = error?.response?.data?.message;

  if (!message) {
    return "Không thể thanh toán booking";
  }

  const normalized = message.toLowerCase();

  if (
    normalized.includes("could not execute statement") ||
    normalized.includes("data truncated")
  ) {
    return "Hệ thống chưa ghi nhận được thanh toán. Vui lòng thử lại hoặc liên hệ quản trị để kiểm tra cấu hình booking.";
  }

  return message;
};

const normalizeServiceItems = (value) => {
  const text = String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>\s*<li[^>]*>/gi, "\n")
    .replace(/<\/?(ul|ol|li)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .trim();

  if (!text) return [];

  return text
    .split(/\r?\n+/)
    .map((item) => item.replace(/^[\s\-•*]+/, "").trim())
    .filter(Boolean);
};

const normalizeTextBlocks = (value) => {
  const text = String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6])>\s*<(p|div|h[1-6])[^>]*>/gi, "\n\n")
    .replace(/<\/li>\s*<li[^>]*>/gi, "\n")
    .replace(/<\/?(p|div|span|strong|em|ul|ol|li|h[1-6])[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  if (!text) return [];

  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
};

const buildTourGallery = (booking) => {
  const items = [];
  const seen = new Set();

  const pushImage = (image) => {
    const rawUrl = image?.imageUrl;
    const src = resolveUploadedFileUrl(rawUrl);

    if (!src || seen.has(src)) return;

    seen.add(src);
    items.push({
      id: image?.id ?? `tour-image-${items.length}`,
      src,
      isThumbnail: Boolean(image?.isThumbnail),
    });
  };

  if (Array.isArray(booking?.tourImages)) {
    booking.tourImages.forEach(pushImage);
  }

  if (booking?.tourThumbnail) {
    pushImage({
      id: "tour-thumbnail",
      imageUrl: booking.tourThumbnail,
      isThumbnail: true,
    });
  }

  return items;
};

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState("FULL");
  const [remainingMethod, setRemainingMethod] = useState("CASH_ON_DEPARTURE");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState("");
  const paymentSectionRef = useRef(null);
  const stage = searchParams.get("stage");

  useEffect(() => {
    let mounted = true;

    const loadBooking = async () => {
      try {
        setLoading(true);
        const response = await getBookingDetail(bookingId);
        if (mounted) {
          setBooking(response.data);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải chi tiết booking",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
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
  }, [
    booking?.id,
    booking?.paymentPlan,
    booking?.paymentStatus,
    booking?.remainingPaymentMethod,
  ]);

  useEffect(() => {
    if (!booking || !paymentSectionRef.current || stage !== "payment") return;

    paymentSectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [booking, stage]);

  useEffect(() => {
    if (!booking) return;

    const gallery = buildTourGallery(booking);
    const thumbnailIndex = gallery.findIndex((image) => image.isThumbnail);

    setActiveImageIndex(thumbnailIndex >= 0 ? thumbnailIndex : 0);
  }, [booking?.id]);

  const statusMeta = getMeta(bookingStatusMeta, booking?.status);
  const paymentMeta = getMeta(paymentStatusMeta, booking?.paymentStatus);
  const selectedStatusIndex = bookingSteps.findIndex(
    (step) => step.key === booking?.status,
  );

  const tourGallery = buildTourGallery(booking);
  const activeTourImage =
    tourGallery[activeImageIndex] || tourGallery[0] || null;
  const tourSummary =
    booking?.tourShortDescription ||
    booking?.tourDescription ||
    "Thông tin tour đang được cập nhật.";
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
  const descriptionBlocks = normalizeTextBlocks(
    booking?.tourDescription || booking?.tourShortDescription,
  );

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
      navigate(`/tai-khoan/booking/${booking.id}`, { replace: true });
      toast.success("Đã gửi xác nhận thanh toán. Hệ thống đang kiểm tra giao dịch.");
    } catch (error) {
      toast.error(getPaymentErrorMessage(error));
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
    <div className="rounded-2xl border border-white/10 bg-[#020617]/40 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
          <QrCode size={19} />
        </span>
        <div className="min-w-0">
          <div className="break-words font-black text-white">{title}</div>
          <p className="text-xs font-semibold leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <div className="mx-auto w-full max-w-[220px] rounded-2xl bg-white p-3 shadow-sm">
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

        <div className="min-w-0 grid gap-2 text-sm text-slate-300">
          <PaymentRow label="Ngân hàng" value={bankInfo.bankName} />
          <PaymentRow label="Số tài khoản" value={bankInfo.accountNo} />
          <PaymentRow label="Chủ tài khoản" value={bankInfo.accountName} />
          <PaymentRow
            label="Nội dung"
            value={`${booking?.bookingCode || ""} ${paymentType}`}
          />
          <div className="mt-2 min-w-0 rounded-2xl border border-[#d4a878]/25 bg-[#d4a878]/10 p-3">
            <div className="text-xs font-bold text-[#f3d7b0]">Số tiền cần chuyển</div>
            <div className="mt-1 break-words text-xl font-black text-white">
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
      description="Theo dõi tiến độ xác nhận, thanh toán và toàn bộ thông tin tour đã đặt."
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_440px]">
          <section className="space-y-6">
            {stage === "payment" && (
              <div className="rounded-2xl border border-sky-300/30 bg-sky-300/10 p-5 text-sky-50">
                <div className="font-black text-white">Bước 2: Thanh toán booking</div>
                <p className="mt-2 text-sm leading-7 text-sky-100/90">
                  Booking đã được tạo thành công. Bạn hãy chọn thanh toán 100% hoặc đặt cọc 30%, sau đó gửi xác nhận để hệ thống ghi nhận yêu cầu của bạn.
                </p>
              </div>
            )}

            <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-[0_30px_90px_-50px_rgba(15,23,42,0.8)]">
              <div className="relative min-h-[360px] sm:min-h-[420px] bg-[#020617] overflow-hidden">
                {activeTourImage ? (
                  <button
                    type="button"
                    onClick={() => setLightboxImage(activeTourImage.src)}
                    className="group absolute inset-0 block h-full w-full outline-none text-left"
                  >
                    <img
                      src={activeTourImage.src}
                      alt={booking.tourName}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-[#020617]/20 to-transparent transition duration-300 group-hover:from-[#020617]/95" />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(157,224,156,0.15),transparent_40%)]" />

                    <div className="absolute inset-x-0 bottom-0 p-6 z-10 pointer-events-none">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#020617]/60 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md shadow-sm">
                          {booking.bookingCode}
                        </span>
                        {tourGallery.length > 1 && (
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-100 backdrop-blur-md">
                            <ImageIcon size={13} className="text-[#9de09c]" />
                            {tourGallery.length} ảnh tour
                          </span>
                        )}
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#7FB77E]/20 bg-[#7FB77E]/15 px-3 py-1.5 text-xs font-black text-[#d9ffd8] backdrop-blur-sm">
                        <CheckCircle2 size={14} className="text-[#9de09c]" />
                        Tour đã đặt
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(157,224,156,0.18),transparent_42%)] text-center text-slate-300 p-6">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-[#9de09c]">
                      <ImageIcon size={28} />
                    </span>
                    <p className="max-w-xs text-sm leading-7">
                      Chưa có hình ảnh tour. Hệ thống vẫn hiển thị đầy đủ lịch trình, dịch vụ và thông tin booking cho bạn.
                    </p>
                  </div>
                )}
              </div>

              {tourGallery.length > 1 && (
                <div className="border-b border-white/10 bg-[#020617]/40 p-4">
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                    {tourGallery.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={[
                          "group relative overflow-hidden rounded-xl border transition outline-none w-full",
                          index === activeImageIndex
                            ? "border-[#7FB77E] shadow-[0_0_15px_rgba(157,224,156,0.25)] bg-white/5"
                            : "border-white/10 hover:border-white/25",
                        ].join(" ")}
                      >
                        <img
                          src={image.src}
                          alt={`${booking.tourName} ${index + 1}`}
                          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/50 via-transparent to-transparent opacity-80" />
                        {image.isThumbnail && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-[#7FB77E] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-[#04120d] shadow-sm">
                            Chính
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-b from-white/[0.02] to-[#07111f] p-6 sm:p-8">
                {/* Nhãn trạng thái */}
                <div className="flex flex-wrap gap-2">
                  <StatusPill meta={statusMeta} />
                  <StatusPill meta={paymentMeta} />
                  {booking.paymentPlan && (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-black text-slate-200">
                      {paymentPlanText[booking.paymentPlan] || booking.paymentPlan}
                    </span>
                  )}
                </div>

                {/* Tên Tour */}
                <h1 className="mt-4 text-3xl sm:text-4xl font-black leading-tight text-white tracking-tight">
                  {booking.tourName}
                </h1>

                {tourSummary && (
                  <p className="mt-3 text-sm sm:text-base leading-7 text-slate-300 max-w-4xl">
                    {tourSummary}
                  </p>
                )}

                <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                  <HeroFact
                    Icon={CalendarDays}
                    label="Khởi hành"
                    value={`${formatDate(booking.departureDate)}${booking.departureTime ? ` • ${booking.departureTime.slice(0, 5)}` : ""}`}
                  />
                  <HeroFact
                    Icon={MapPin}
                    label="Điểm xuất phát"
                    value={booking.departureLocation || "Đang cập nhật"}
                  />
                  <HeroFact
                    Icon={Clock3}
                    label="Thời lượng"
                    value={`${booking.durationDays || 0} ngày ${booking.durationNights || 0} đêm`}
                  />
                  <HeroFact
                    Icon={Users}
                    label="Số khách"
                    value={`${booking.totalPeople || 0} khách`}
                  />
                </div>

                <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-3 border-t border-white/5 pt-6">
                  <AmountTile
                    label="Tổng booking"
                    value={formatCurrency(totalAmount)}
                  />
                  <AmountTile
                    label="Đã ghi nhận"
                    value={formatCurrency(paidAmount)}
                    accent="text-emerald-200"
                  />
                  <AmountTile
                    label="Còn lại"
                    value={formatCurrency(remainingAmount)}
                    accent="text-[#f3d7b0]"
                  />
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row border-t border-white/5 pt-6 justify-start">
                  <Link
                    to={`/tours/${booking.tourId}`}
                    className="btn-outline min-w-[160px] text-sm text-center justify-center items-center inline-flex py-3"
                  >
                    Xem tour gốc
                  </Link>
                  {activeTourImage && (
                    <button
                      type="button"
                      onClick={() => setLightboxImage(activeTourImage.src)}
                      className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl border border-[#7FB77E]/30 bg-[#7FB77E]/10 px-5 py-3 text-sm font-black text-[#d9ffd8] transition hover:border-[#7FB77E]/60 hover:bg-[#7FB77E]/18"
                    >
                      <ImageIcon size={16} className="text-[#9de09c]" />
                      Xem ảnh lớn
                    </button>
                  )}
                </div>
              </div>

            </div>

            {booking.status === "CANCELLED" ? (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-rose-100">
                <XCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-black">Đặt lịch đã hủy</div>
                  <p className="mt-1 text-sm leading-7 text-rose-100/85">
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
                        "rounded-2xl border p-4",
                        done
                          ? "border-[#7FB77E]/40 bg-[#7FB77E]/12"
                          : "border-white/10 bg-white/[0.03]",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-xl",
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

            <div className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                    <ClipboardList size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Tổng quan chuyến đi
                    </h2>
                    <p className="text-sm text-slate-400">
                      Toàn bộ mốc thời gian và thông tin chính của booking này.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DetailMetric
                    label="Mã booking"
                    value={booking.bookingCode}
                    hint="Mã tra cứu giao dịch"
                  />
                  <DetailMetric
                    label="Ngày đặt"
                    value={formatDateTime(booking.bookedAt)}
                    hint="Thời điểm tạo booking"
                  />
                  <DetailMetric
                    label="Loại booking"
                    value={bookingTypeText[booking.bookingType] || "Cá nhân"}
                    hint="Hình thức đặt tour"
                  />
                  <DetailMetric
                    label="Liên hệ nhanh"
                    value={booking.phone || "Chưa cập nhật"}
                    hint="Số điện thoại khách đặt"
                  />
                  <DetailMetric
                    label="Người lớn"
                    value={`${booking.adultCount || 0} khách`}
                    hint={`${formatCurrency(booking.adultPrice || 0)} / khách`}
                  />
                  <DetailMetric
                    label="Trẻ em"
                    value={`${booking.childCount || 0} khách`}
                    hint={`${formatCurrency(booking.childPrice || 0)} / khách`}
                  />
                  <DetailMetric
                    label="Điểm đón khách"
                    value={booking.pickupAddress || "Khách sẽ cập nhật sau"}
                    hint="Thông tin phục vụ điều hành"
                    wide
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4a878]/15 text-[#f3d7b0]">
                    <CreditCard size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Chi phí booking
                    </h2>
                    <p className="text-sm text-slate-400">
                      Breakdown giá tour theo booking hiện tại.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <DetailRow
                    label={`${booking.adultCount || 0} người lớn`}
                    value={formatCurrency(
                      Number(booking.adultPrice || 0) * Number(booking.adultCount || 0),
                    )}
                  />
                  <DetailRow
                    label={`${booking.childCount || 0} trẻ em`}
                    value={formatCurrency(
                      Number(booking.childPrice || 0) * Number(booking.childCount || 0),
                    )}
                  />
                  <DetailRow label="Tổng tiền tour" value={formatCurrency(totalAmount)} />
                  <DetailRow label="Tiền cọc 30%" value={formatCurrency(depositAmount)} />
                  <DetailRow label="Đã ghi nhận" value={formatCurrency(paidAmount)} />
                  <DetailRow label="Còn lại" value={formatCurrency(remainingAmount)} />
                  {booking.paymentPlan && (
                    <DetailRow
                      label="Gói thanh toán"
                      value={paymentPlanText[booking.paymentPlan] || booking.paymentPlan}
                    />
                  )}
                  {booking.remainingPaymentMethod && (
                    <DetailRow
                      label="Thanh toán phần còn lại"
                      value={
                        remainingMethodText[booking.remainingPaymentMethod] ||
                        booking.remainingPaymentMethod
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                  <ImageIcon size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Mô tả chi tiết tour
                  </h2>
                  <p className="text-sm text-slate-400">
                    Nội dung giới thiệu và trải nghiệm chính của hành trình.
                  </p>
                </div>
              </div>

              <RichTextContent
                className="mt-5"
                blocks={descriptionBlocks}
                emptyText="Mô tả chi tiết của tour đang được cập nhật."
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <ServiceCard
                title="Dịch vụ bao gồm"
                Icon={CheckCircle2}
                tone="green"
                items={normalizeServiceItems(booking.includedServices)}
                emptyText="Chưa có thông tin dịch vụ bao gồm."
              />
              <ServiceCard
                title="Dịch vụ không bao gồm"
                Icon={ShieldCheck}
                tone="gold"
                items={normalizeServiceItems(booking.excludedServices)}
                emptyText="Chưa có thông tin dịch vụ không bao gồm."
              />
            </div>

            {(booking.note || booking.specialRequest) && (
              <div className="rounded-2xl border border-[#A67C52]/25 bg-[#A67C52]/[0.06] p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-[#f3d7b0]"
                  />
                  <div className="text-sm leading-7 text-slate-200">
                    <div className="text-base font-black text-white">
                      Ghi chú và yêu cầu của khách
                    </div>
                    {booking.note && (
                      <p className="mt-3">
                        <span className="font-black text-white">Ghi chú:</span>{" "}
                        {booking.note}
                      </p>
                    )}
                    {booking.specialRequest && (
                      <p className="mt-2">
                        <span className="font-black text-white">Yêu cầu riêng:</span>{" "}
                        {booking.specialRequest}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                  <ClipboardList size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Lịch trình đã chốt
                  </h2>
                  <p className="text-sm text-slate-400">
                    Lịch trình được lưu riêng cho booking này để bạn dễ theo dõi.
                  </p>
                </div>
              </div>

              {booking.scheduleDays?.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {booking.scheduleDays.map((day) => (
                    <div
                      key={day.id}
                      className="rounded-2xl border border-white/10 bg-[#020617]/35 p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#d4a878]">
                            Ngày {day.dayNumber}
                          </div>
                          <h3 className="mt-1 text-lg font-black text-white">
                            {day.title}
                          </h3>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-[#7FB77E]/25 bg-[#7FB77E]/12 px-3 py-1 text-xs font-black text-[#d9ffd8]">
                          {day.activities?.length || 0} hoạt động
                        </span>
                      </div>

                      {day.description && (
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {day.description}
                        </p>
                      )}

                      {day.activities?.length > 0 ? (
                        <div className="mt-4 grid gap-3">
                          {day.activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#7FB77E]/20"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="inline-flex items-center gap-2 rounded-full bg-[#7FB77E]/12 px-3 py-1 text-xs font-bold text-[#d9ffd8]">
                                    <Clock3 size={13} />
                                    {activity.startTime
                                      ? activity.startTime.slice(0, 5)
                                      : "Chưa rõ giờ"}
                                    {activity.endTime
                                      ? ` - ${activity.endTime.slice(0, 5)}`
                                      : ""}
                                  </div>
                                  <div className="mt-3 text-base font-black text-white">
                                    {activity.title}
                                  </div>
                                </div>
                              </div>

                              {activity.description && (
                                <p className="mt-3 text-sm leading-7 text-slate-300">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
                          Ngày này chưa có chi tiết hoạt động cụ thể.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm leading-7 text-slate-400">
                  Lịch trình đang được cập nhật. Bộ phận điều hành sẽ hoàn thiện lịch chi tiết cho booking này sớm nhất.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <div
              ref={paymentSectionRef}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                  <CreditCard size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-black text-white">Thanh toán</h2>
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
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#020617]/40 p-3">
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
                        note: "Gửi xác nhận cọc 30%, admin kiểm tra trước khi chốt giữ chỗ.",
                      },
                    ].map(({ key, Icon, title, amount, note }) => {
                      const active = paymentChoice === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPaymentChoice(key)}
                          className={[
                            "min-w-0 rounded-2xl border p-4 text-left transition",
                            active
                              ? "border-[#7FB77E]/60 bg-[#7FB77E]/15"
                              : "border-white/10 bg-white/[0.03] hover:border-white/25",
                          ].join(" ")}
                        >
                          <Icon size={20} className="text-[#9de09c]" />
                          <div className="mt-3 break-words font-black text-white">{title}</div>
                          <div className="mt-1 break-words text-lg font-black text-[#d4a878]">
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
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
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
                            <span className="min-w-0 break-words">
                              {remainingMethodText[method]}
                            </span>
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
                        ? "Sau khi gửi xác nhận cọc, booking sẽ chuyển sang trạng thái kiểm tra thanh toán."
                        : "Sau khi gửi xác nhận, admin sẽ kiểm tra trước khi chuyển sang Đã thanh toán.",
                  })}

                  <button
                    type="button"
                    onClick={() => handlePay(selectedPaymentType)}
                    disabled={paying || selectedPaymentAmount <= 0}
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
                <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50">
                  <div className="font-black text-white">
                    {remainingAmount > 0
                      ? "Yêu cầu thanh toán đang được kiểm tra"
                      : "Yêu cầu thanh toán đủ đang được kiểm tra"}
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
                  <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 p-4 text-sm leading-7 text-sky-100">
                    Booking đã giữ chỗ bằng tiền cọc. Phần còn lại là{" "}
                    <b>{formatCurrency(remainingAmount)}</b> và có thể thanh toán
                    tiền mặt khi khởi hành hoặc chuyển khoản bằng QR.
                  </div>
                </div>
              )}

              {finalPaymentStatuses.includes(booking.paymentStatus) && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#020617]/40 p-4 text-sm leading-7 text-slate-300">
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
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Thông tin khách đặt
                  </h2>
                  <p className="text-sm text-slate-400">
                    Thông tin liên hệ và địa chỉ đón khách cho booking này.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <ContactRow Icon={UserRound} value={booking.customerName} />
                {booking.organizationName && (
                  <ContactRow
                    Icon={ShieldCheck}
                    tone="gold"
                    value={`${booking.organizationName}${booking.contactPerson ? ` • ${booking.contactPerson}` : ""
                      }`}
                  />
                )}
                <ContactRow
                  Icon={Phone}
                  value={booking.phone || "Chưa cập nhật số điện thoại"}
                />
                <ContactRow
                  Icon={Mail}
                  tone="gold"
                  value={booking.email || "Chưa cập nhật email"}
                  breakAll
                />
                <ContactRow
                  Icon={MapPin}
                  value={booking.pickupAddress || "Chưa có địa chỉ đón"}
                />
              </div>
            </div>

            {booking.assignedStaffName && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                    <UserRound size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Nhân viên phụ trách
                    </h2>
                    <p className="text-sm text-slate-400">
                      Người đang theo dõi và xử lý booking của bạn.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <ContactRow Icon={UserRound} value={booking.assignedStaffName} />
                  {booking.assignedStaffPhone && (
                    <ContactRow Icon={Phone} value={booking.assignedStaffPhone} />
                  )}
                  {booking.assignedStaffEmail && (
                    <ContactRow
                      Icon={Mail}
                      tone="gold"
                      value={booking.assignedStaffEmail}
                      breakAll
                    />
                  )}
                </div>
              </div>
            )}

            {booking.customers?.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                    <Users size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Danh sách hành khách
                    </h2>
                    <p className="text-sm text-slate-400">
                      Hồ sơ khách đi tour đã gửi kèm theo booking.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {booking.customers.map((customer, index) => (
                    <div
                      key={customer.id || index}
                      className="rounded-2xl border border-white/10 bg-[#020617]/40 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-black text-white">
                            {customer.fullName || "Hành khách"}
                          </div>
                          <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            {customerTypeText[customer.customerType] || "Hành khách"}
                          </div>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-slate-200">
                          {customer.groupLeader && hasGroup ? "Trưởng đoàn" : "Thành viên"}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                        <PassengerField
                          label="Giới tính"
                          value={genderText[customer.gender] || "Khác"}
                        />
                        <PassengerField
                          label="Ngày sinh"
                          value={customer.dateOfBirth ? formatDate(customer.dateOfBirth) : "Chưa cập nhật"}
                        />
                        <PassengerField
                          label="Số điện thoại"
                          value={customer.phone || "Chưa cập nhật"}
                        />
                        <PassengerField
                          label="Số giấy tờ"
                          value={
                            customer.identityNumber ||
                            (customer.customerType === "ADULT"
                              ? "Chưa cập nhật"
                              : "Không yêu cầu")
                          }
                        />
                        <PassengerField
                          label="Email"
                          value={customer.email || "Chưa cập nhật"}
                          breakAll
                        />
                        <PassengerField
                          label="Liên hệ khẩn cấp"
                          value={customer.emergencyContact || "Chưa cập nhật"}
                        />
                        {customer.address && (
                          <PassengerField
                            label="Địa chỉ"
                            value={customer.address}
                            breakAll
                            wide
                          />
                        )}
                      </div>

                      {customer.healthNote && (
                        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-7 text-amber-50">
                          <span className="font-black text-white">Lưu ý sức khỏe:</span>{" "}
                          {customer.healthNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-4 text-sm font-bold text-slate-300">
            Không tìm thấy booking.
          </p>
        </div>
      )}

      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 p-4 backdrop-blur-md"
          onClick={() => setLightboxImage("")}
        >
          <button
            type="button"
            aria-label="Đóng ảnh"
            onClick={() => setLightboxImage("")}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:border-[#7FB77E] hover:bg-[#7FB77E]/15"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxImage}
            alt={booking?.tourName || "Tour image"}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[86vh] max-w-6xl rounded-3xl object-contain shadow-2xl"
          />
        </div>
      )}
    </AccountShell>
  );
}

function HeroFact({ Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
        <Icon size={17} />
      </span>
      <div className="mt-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-black leading-6 text-white">{value}</div>
    </div>
  );
}

function AmountTile({ label, value, accent = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617]/45 p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className={["mt-2 text-lg font-black", accent].join(" ")}>
        {value}
      </div>
    </div>
  );
}

function DetailMetric({ label, value, hint, wide = false }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-[#020617]/35 p-4",
        wide ? "sm:col-span-2" : "",
      ].join(" ")}
    >
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-black leading-7 text-white">{value}</div>
      {hint && <div className="mt-1 text-xs leading-6 text-slate-400">{hint}</div>}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#020617]/35 px-4 py-3">
      <span className="text-slate-300">{label}</span>
      <b className="text-right text-white">{value}</b>
    </div>
  );
}

function ServiceCard({ title, Icon, tone, items, emptyText }) {
  const toneClasses =
    tone === "gold"
      ? {
        icon: "bg-[#d4a878]/15 text-[#f3d7b0]",
        card: "border-[#d4a878]/20 bg-[#d4a878]/[0.05]",
        bullet: "bg-[#f3d7b0]",
      }
      : {
        icon: "bg-[#7FB77E]/15 text-[#9de09c]",
        card: "border-[#7FB77E]/20 bg-[#7FB77E]/[0.05]",
        bullet: "bg-[#9de09c]",
      };

  return (
    <div className={`rounded-2xl border p-5 ${toneClasses.card}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses.icon}`}>
          <Icon size={18} />
        </span>
        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          <p className="text-sm text-slate-400">
            Thông tin áp dụng trực tiếp cho chương trình tour này.
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${toneClasses.bullet}`}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-400">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function RichTextContent({ blocks, emptyText, className = "" }) {
  if (!blocks.length) {
    return (
      <div
        className={[
          "rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-400",
          className,
        ].join(" ")}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <div className={["space-y-4", className].join(" ")}>
      {blocks.map((block, index) => (
        <p
          key={`${block}-${index}`}
          className="whitespace-pre-line text-sm leading-8 text-slate-200"
        >
          {block}
        </p>
      ))}
    </div>
  );
}

function ContactRow({ Icon, value, tone = "green", breakAll = false }) {
  const color =
    tone === "gold" ? "text-[#f3d7b0]" : "text-[#9de09c]";

  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-[#020617]/35 px-4 py-3">
      <Icon size={16} className={`mt-0.5 shrink-0 ${color}`} />
      <span className={breakAll ? "break-all" : ""}>{value}</span>
    </div>
  );
}

function PassengerField({ label, value, wide = false, breakAll = false }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className={["mt-1 leading-7 text-slate-200", breakAll ? "break-all" : ""].join(" ")}>
        {value}
      </div>
    </div>
  );
}

function PaymentRow({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] items-start gap-3">
      <span className="min-w-0 break-words">{label}</span>
      <b className="min-w-0 max-w-[210px] break-words text-right text-white">
        {value}
      </b>
    </div>
  );
}
