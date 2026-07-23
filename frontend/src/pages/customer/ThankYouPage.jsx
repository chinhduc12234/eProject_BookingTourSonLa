import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Headphones,
  Home,
  Info,
  Loader2,
  ReceiptText,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import toast from "react-hot-toast";

import { getBookingDetail } from "../../api/bookingApi";
import PublicLayout from "../public/PublicLayout";
import { scenicImages } from "../public/publicContent";
import {
  bookingStatusMeta,
  getMeta,
  paymentStatusMeta,
  StatusPill,
} from "./accountShared";

export default function ThankYouPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        if (!bookingId) {
          toast.error("Không tìm thấy thông tin đặt tour");
          navigate("/");
          return;
        }

        const response = await getBookingDetail(bookingId);
        // Đảm bảo lấy đúng bọc dữ liệu từ axios response (thường là response.data hoặc response.data.data)
        const bookingData = response?.data?.data ? response.data.data : response?.data;
        setBooking(bookingData);
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Không thể tải thông tin đơn đặt tour"
        );
        console.error("Lỗi tải thông tin đơn đặt tour:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#7FB77E]" />
            <p className="text-sm font-bold text-slate-400 tracking-wide animate-pulse">
              Đang tải dữ liệu đặt tour...
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const isDeposit = booking?.paymentPlan === "DEPOSIT";
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatDate = (value) =>
    value
      ? new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(`${value}T00:00:00`))
      : "Đang cập nhật";

  const bookingStatus = getMeta(bookingStatusMeta, booking?.status);
  const paymentStatus = getMeta(paymentStatusMeta, booking?.paymentStatus);

  return (
    <PublicLayout>
      <section className="thank-you-page relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#020617] py-10 text-slate-100 selection:bg-[#7FB77E]/30 sm:py-14 lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-35" />
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#7FB77E]/15 blur-[110px]" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#A67C52]/15 blur-[110px]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="thank-you-hero relative isolate min-h-[560px] overflow-hidden rounded-[28px] border border-white/20 bg-[#020617] shadow-[0_32px_100px_-45px_rgba(127,183,126,0.6)]">
            <div className="thank-you-hero-art absolute inset-0" aria-hidden="true">
              <img
                src={scenicImages.taXuaRidge}
                alt=""
                loading="eager"
                decoding="async"
                className="h-full w-full scale-105 object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(2,6,23,0.96)_0%,rgba(2,6,23,0.82)_36%,rgba(2,6,23,0.5)_68%,rgba(2,6,23,0.7)_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-transparent to-[#020617]/35" />
              <div className="absolute inset-0 bg-[#7FB77E]/[0.04] mix-blend-screen" />
            </div>
            <div className="relative z-10 grid min-h-[560px] gap-8 p-6 sm:p-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:p-14">
              <div className="max-w-2xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 scale-125 rounded-full bg-[#7FB77E]/30 blur-2xl" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#9de09c] via-[#7FB77E] to-[#4f8f4d] shadow-lg shadow-[#7FB77E]/25 sm:h-24 sm:w-24">
                      <CheckCircle2 size={50} className="text-[#020617] stroke-[2.5]" />
                    </div>
                  </div>
                  <div>
                    <span className="section-tag">
                      <ShieldCheck size={12} /> Đã tạo đơn đặt tour
                    </span>
                    <p className="mt-2 text-sm font-bold text-[#d4a878]">
                      {booking?.bookingCode
                        ? `Mã đơn ${booking.bookingCode}`
                        : "Tây Bắc Travel đã tiếp nhận thông tin"}
                    </p>
                  </div>
                </div>

                <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                  Cảm ơn quý khách!
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Yêu cầu đặt tour và lựa chọn thanh toán đã được ghi nhận. Đơn vẫn
                  chờ bộ phận vận hành kiểm tra trước khi được xác nhận.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/tai-khoan/booking")}
                    className="btn-primary min-h-12 flex-1 text-sm"
                  >
                    Xem lịch sử đặt tour
                    <ArrowRight size={17} />
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="btn-outline min-h-12 flex-1 text-sm"
                  >
                    <Home size={17} />
                    Quay về trang chủ
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/25 bg-[#020617]/65 p-5 shadow-[0_24px_70px_-34px_rgba(0,0,0,0.95)] backdrop-blur-md sm:p-6">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d4a878]">
                      Tóm tắt đơn đặt tour
                    </p>
                    <h2 className="mt-1 text-xl font-black text-white">
                      {booking?.tourName || "Hành trình Tây Bắc của bạn"}
                    </h2>
                  </div>
                  <StatusPill meta={bookingStatus} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {[
                    {
                      Icon: CalendarDays,
                      label: "Ngày khởi hành",
                      value: formatDate(booking?.departureDate),
                    },
                    {
                      Icon: UsersRound,
                      label: "Số hành khách",
                      value: `${booking?.totalPeople || 0} khách`,
                    },
                    {
                      Icon: ReceiptText,
                      label: isDeposit ? "Hình thức thanh toán" : "Tổng giá trị",
                      value: isDeposit
                        ? "Đặt cọc 30%"
                        : formatCurrency(booking?.totalPrice),
                    },
                    {
                      Icon: CreditCard,
                      label: "Trạng thái thanh toán",
                      value: <StatusPill meta={paymentStatus} />,
                    },
                  ].map(({ Icon, label, value }) => (
                    <div
                      key={label}
                      className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                    >
                      <Icon size={18} className="text-[#9de09c]" />
                      <p className="mt-3 text-xs font-bold text-slate-400">{label}</p>
                      <div className="mt-1 break-words text-sm font-black text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                Icon: ReceiptText,
                title: "Theo dõi trong tài khoản",
                text: "Mã đơn, trạng thái booking và thanh toán được hiển thị trong lịch sử đặt tour.",
              },
              {
                Icon: Info,
                title: "Bộ phận điều hành xác minh",
                text: "Quản trị viên kiểm tra thông tin thanh toán, lịch khởi hành và phân công nhân viên phụ trách.",
              },
              {
                Icon: Headphones,
                title: "Chờ cập nhật trạng thái",
                text: "Khi đơn được xử lý, trạng thái mới sẽ xuất hiện trong trang chi tiết booking của bạn.",
              },
            ].map(({ Icon, title, text }, index) => (
              <article
                key={title}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-[#7FB77E]/35 hover:bg-[#7FB77E]/[0.07]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                    <Icon size={18} />
                  </span>
                  <span className="text-xs font-black text-[#d4a878]">BƯỚC {index + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-black text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-slate-500">
            Cần hỗ trợ gấp? Vui lòng mở trang Liên hệ hoặc gọi số hotline hiển thị ở cuối trang.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
