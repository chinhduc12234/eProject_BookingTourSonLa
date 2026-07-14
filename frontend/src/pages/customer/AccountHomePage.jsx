import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  RefreshCcw,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import { getMyBookings } from "../../api/bookingApi";
import { getCurrentUserProfile } from "../../api/userApi";
import AccountShell from "./AccountShell";
import {
  bookingStatusMeta,
  formatCurrency,
  formatDate,
  getMeta,
  paymentStatusMeta,
  StatusPill,
} from "./accountShared";

export default function AccountHomePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadAccount = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const [profileResponse, bookingResponse] = await Promise.all([
          getCurrentUserProfile(),
          getMyBookings(),
        ]);

        if (!mounted) return;

        setProfile(profileResponse.data);
        setBookings(bookingResponse.data || []);
      } catch (error) {
        const message = error?.response?.data?.message || "Không thể tải thông tin tài khoản";
        setLoadError(message);
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAccount();

    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  const summary = useMemo(() => {
    const confirmedBookings = bookings.filter(
      (booking) =>
        booking.status === "PENDING" || booking.status === "CONFIRMED",
    ).length;
    const paidBookings = bookings.filter(
      (booking) => booking.paymentStatus === "PAID",
    ).length;
    const totalSpent = bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice || 0),
      0,
    );

    return {
      totalBookings: bookings.length,
      confirmedBookings,
      paidBookings,
      totalSpent,
    };
  }, [bookings]);

  const latestBooking = bookings[0];

  if (loading) {
    return (
      <AccountShell title="Tổng quan tài khoản">
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7FB77E]" />
        </div>
      </AccountShell>
    );
  }

  if (loadError) {
    return (
      <AccountShell title="Tổng quan tài khoản">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-300/25 bg-rose-300/[0.07] p-8 text-center" role="alert">
          <ShieldAlert className="mx-auto h-11 w-11 text-rose-200" />
          <h2 className="mt-4 text-xl font-black text-white">Chưa tải được tài khoản</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="btn-outline mt-5 text-sm"
          >
            <RefreshCcw size={16} /> Thử tải lại
          </button>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      title={profile?.fullName || "Tổng quan tài khoản"}
      description="Quản lý nhanh hồ sơ, lịch sử đặt tour và trạng thái các hành trình đã đăng ký."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Đơn đặt tour", value: summary.totalBookings, Icon: CalendarDays },
          { label: "Đang xử lý", value: summary.confirmedBookings, Icon: Clock3 },
          { label: "Đã thanh toán", value: summary.paidBookings, Icon: CreditCard },
          {
            label: "Tổng giá trị",
            value: formatCurrency(summary.totalSpent),
            Icon: CheckCircle2,
          },
        ].map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
              <Icon size={20} />
            </span>
            <div className="mt-4 text-xs font-bold text-slate-400">{label}</div>
            <div className="mt-1 text-2xl font-black text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
              <UserRound size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-white">Hồ sơ của bạn</h2>
              <p className="text-sm text-slate-400">
                Thông tin này được dùng khi đặt tour.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Mail size={17} className="mt-0.5 shrink-0 text-[#9de09c]" />
              <span className="break-all">{profile?.email}</span>
            </div>
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Phone size={17} className="mt-0.5 shrink-0 text-[#d4a878]" />
              <span>{profile?.phone || "Chưa cập nhật số điện thoại"}</span>
            </div>
          </div>

          <Link to="/tai-khoan/thong-tin" className="btn-primary mt-5 w-full text-sm">
            Chỉnh sửa thông tin
            <ChevronRight size={17} />
          </Link>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A67C52]/15 text-[#d4a878]">
                <CalendarDays size={20} />
              </span>
              <div>
                <h2 className="text-xl font-black text-white">Đơn đặt tour gần nhất</h2>
                <p className="text-sm text-slate-400">
                  Xem nhanh trạng thái tour đã đặt.
                </p>
              </div>
            </div>
            <Link
              to="/tai-khoan/booking"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-black text-white transition hover:border-[#7FB77E]/40 hover:bg-[#7FB77E]/10"
            >
              Tất cả
            </Link>
          </div>

          {latestBooking ? (
            <div className="mt-5 rounded-xl border border-[#7FB77E]/30 bg-[#7FB77E]/10 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-bold text-[#d4a878]">
                    {latestBooking.bookingCode}
                  </div>
                  <h3 className="mt-1 text-xl font-black text-white">
                    {latestBooking.tourName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Khởi hành {formatDate(latestBooking.departureDate)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <StatusPill meta={getMeta(bookingStatusMeta, latestBooking.status)} />
                  <StatusPill
                    meta={getMeta(paymentStatusMeta, latestBooking.paymentStatus)}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-slate-300">Tổng tiền</span>
                <span className="text-xl font-black text-gradient-gold">
                  {formatCurrency(latestBooking.totalPrice)}
                </span>
              </div>

              <Link
                to={`/tai-khoan/booking/${latestBooking.id}`}
                className="btn-primary mt-5 w-full text-sm"
              >
                Xem chi tiết trạng thái
                <ChevronRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-4 text-sm font-bold text-slate-300">
                Bạn chưa có đơn đặt tour nào.
              </p>
              <Link to="/tours" className="btn-primary mt-5 text-sm">
                Xem tour
                <ChevronRight size={17} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </AccountShell>
  );
}
