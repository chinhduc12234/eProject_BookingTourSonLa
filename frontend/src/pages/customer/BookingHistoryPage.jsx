import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Eye,
  Loader2,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { getMyBookings } from "../../api/bookingApi";
import AccountShell from "./AccountShell";
import {
  bookingStatusMeta,
  formatCurrency,
  formatDate,
  getMeta,
  paymentStatusMeta,
  StatusPill,
} from "./accountShared";

const bookingTypeText = {
  INDIVIDUAL: "Cá nhân",
  GROUP: "Theo đoàn",
  PRIVATE: "Tour riêng",
};

export default function BookingHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadBookings = async () => {
      try {
        setLoading(true);
        const response = await getMyBookings();
        if (mounted) setBookings(response.data || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải lịch sử đặt tour",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBookings();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AccountShell
      title="Lịch sử đặt tour"
      description="Danh sách các tour bạn đã đặt. Chọn từng đơn để xem trạng thái chi tiết."
    >
      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A67C52]/15 text-[#d4a878]">
              <CalendarDays size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-white">Lịch sử đặt tour</h2>
              <p className="text-sm text-slate-400">
                Theo dõi các tour đã đặt.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-300">
            {bookings.length}
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7FB77E]" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.06] text-slate-400">
              <CalendarDays size={24} />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-300">
              Bạn chưa có đơn đặt tour nào.
            </p>
            <Link to="/tours" className="btn-primary mt-5 text-sm">
              Xem tour
              <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {bookings.map((booking) => {
              const itemStatus = getMeta(bookingStatusMeta, booking.status);
              const itemPayment = getMeta(
                paymentStatusMeta,
                booking.paymentStatus,
              );

              return (
                <Link
                  key={booking.id}
                  to={`/tai-khoan/booking/${booking.id}`}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#7FB77E]/40 hover:bg-[#7FB77E]/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-[#d4a878]">
                        {booking.bookingCode} ·{" "}
                        {bookingTypeText[booking.bookingType] || "Cá nhân"}
                      </div>
                      <h3 className="mt-1 line-clamp-2 font-black text-white">
                        {booking.tourName}
                      </h3>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-slate-300 transition group-hover:bg-[#7FB77E] group-hover:text-[#020617]">
                      <Eye size={17} />
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill meta={itemStatus} />
                    <StatusPill meta={itemPayment} />
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-3">
                      <span>Ngày đi</span>
                      <span className="font-bold text-white">
                        {formatDate(booking.departureDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Số khách</span>
                      <span className="inline-flex items-center gap-1 font-bold text-white">
                        <Users size={15} className="text-[#9de09c]" />
                        {Number(booking.adultCount || 0) +
                          Number(booking.childCount || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Tổng tiền</span>
                      <span className="font-black text-[#f4c27a]">
                        {formatCurrency(booking.totalPrice)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </AccountShell>
  );
}
