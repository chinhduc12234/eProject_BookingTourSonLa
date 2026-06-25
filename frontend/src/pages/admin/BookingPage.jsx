import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CreditCard,
  Eye,
  Loader2,
  RefreshCcw,
  Search,
  TicketCheck,
  Users,
} from "lucide-react";

import { getAdminBookings } from "../../api/bookingApi";
import {
  Badge,
  bookingStatuses,
  formatCurrency,
  formatDate,
  formatDateTime,
  getMeta,
  paymentMeta,
  paymentStatuses,
  statusMeta,
} from "./bookingShared";

const scheduleReportMeta = {
  EMPTY: {
    label: "Chưa có lịch trình",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  WAITING: {
    label: "Chưa báo cáo",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  IN_PROGRESS: {
    label: "Đang báo cáo",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  NEEDS_REVIEW: {
    label: "Cần admin xem",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  COMPLETED: {
    label: "Ổn, đã xong",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
};

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 10;

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getAdminBookings({
        page,
        size: pageSize,
        keyword,
        status,
        paymentStatus,
      });

      setBookings(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách đơn đặt tour");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    Promise.resolve().then(async () => {
      try {
        setLoading(true);
        const response = await getAdminBookings({
          page,
          size: pageSize,
          keyword,
          status,
          paymentStatus,
        });

        if (!mounted) return;

        setBookings(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } catch (error) {
        if (mounted) {
          toast.error(error?.response?.data?.message || "Không thể tải danh sách đơn đặt tour");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [page, keyword, status, paymentStatus]);

  const summary = useMemo(() => {
    const confirmed = bookings.filter(
      (booking) =>
        booking.status === "PENDING" || booking.status === "CONFIRMED",
    ).length;
    const paid = bookings.filter((booking) => booking.paymentStatus === "PAID").length;
    const pendingPayment = bookings.filter(
      (booking) => booking.paymentStatus === "PENDING_REVIEW",
    ).length;
    const needsReview = bookings.filter((booking) => booking.scheduleNeedsReview).length;
    const people = bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPeople || 0),
      0,
    );

    return { confirmed, paid, pendingPayment, needsReview, people };
  }, [bookings]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(0);
    setKeyword(search.trim());
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <TicketCheck size={26} />
            </span>
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Quản lý đơn đặt tour
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Theo dõi đơn đặt tour, kiểm tra thanh toán, phân công nhân viên và xác nhận hành trình.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadBookings}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
            Làm mới
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Tổng đơn đặt tour", value: totalElements, Icon: TicketCheck },
            { label: "Chờ/Xác nhận", value: summary.confirmed, Icon: CalendarDays },
            { label: "Báo cáo cần xem", value: summary.needsReview, Icon: AlertTriangle },
            { label: "Kiểm tra thanh toán", value: summary.pendingPayment, Icon: CreditCard },
            { label: "Khách trong trang", value: summary.people, Icon: Users },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Icon size={22} className="text-emerald-700" />
              <div className="mt-4 text-3xl font-black">{value}</div>
              <div className="mt-1 text-sm font-bold text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <form onSubmit={submitSearch} className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm mã đơn, tên khách, email, số điện thoại, tour..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 font-semibold outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setPage(0);
                setStatus(event.target.value);
              }}
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold outline-none transition focus:border-emerald-500 focus:bg-white"
            >
              {bookingStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={paymentStatus}
              onChange={(event) => {
                setPage(0);
                setPaymentStatus(event.target.value);
              }}
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold outline-none transition focus:border-emerald-500 focus:bg-white"
            >
              {paymentStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-emerald-700"
            >
              <Search size={17} />
              Tìm
            </button>
          </form>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center font-semibold text-slate-500">
              Chưa có đơn đặt tour phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Đơn đặt tour</th>
                    <th className="px-5 py-4">Khách hàng</th>
                    <th className="px-5 py-4">Tour</th>
                    <th className="px-5 py-4">Ngày đi</th>
                    <th className="px-5 py-4">Số khách</th>
                    <th className="px-5 py-4">Tổng tiền</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="px-5 py-4">Báo cáo NV</th>
                    <th className="px-5 py-4">Thanh toán</th>
                    <th className="px-5 py-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="align-top transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-black text-slate-950">{booking.bookingCode}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          #{booking.id}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{booking.customerName}</div>
                        <div className="mt-1 text-xs text-slate-500">{booking.phone}</div>
                        <div className="mt-1 text-xs text-slate-500">{booking.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="max-w-[240px] font-bold text-slate-900">{booking.tourName}</div>
                        {booking.assignedStaffName && (
                          <div className="mt-1 text-xs font-semibold text-emerald-700">
                            NV: {booking.assignedStaffName}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">
                        {formatDate(booking.departureDate)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-black">{booking.totalPeople || 0}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          NL {booking.adultCount || 0} · TE {booking.childCount || 0}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-black text-amber-700">
                        {formatCurrency(booking.totalPrice)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge meta={getMeta(statusMeta, booking.status)} />
                      </td>
                      <td className="px-5 py-4">
                        <div
                          className={[
                            "inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-black",
                            getMeta(scheduleReportMeta, booking.scheduleReportStatus).className,
                          ].join(" ")}
                        >
                          {getMeta(scheduleReportMeta, booking.scheduleReportStatus).label}
                        </div>
                        {Number(booking.scheduleTotalActivities || 0) > 0 && (
                          <div className="mt-2 text-xs font-bold text-slate-500">
                            {booking.scheduleCompletedActivities || 0}/{booking.scheduleTotalActivities || 0} mốc
                            {" · "}
                            {booking.scheduleProgressPercent || 0}%
                          </div>
                        )}
                        {booking.scheduleLastUpdatedAt && (
                          <div className="mt-1 max-w-[190px] text-xs font-semibold text-slate-500">
                            {booking.scheduleLastUpdatedBy || "Nhân viên"} · {formatDateTime(booking.scheduleLastUpdatedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge meta={getMeta(paymentMeta, booking.paymentStatus)} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/admin/bookings/${booking.id}`}
                            aria-label={`Xem chi tiết đơn ${booking.bookingCode || booking.id}`}
                            className="inline-flex min-h-11 min-w-[112px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-emerald-300 bg-white px-5 py-2.5 text-[15px] font-extrabold leading-none tracking-normal text-emerald-950 shadow-sm transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                          >
                            <Eye
                              size={18}
                              strokeWidth={2.5}
                              className="shrink-0"
                              aria-hidden="true"
                            />
                            <span className="block">Chi Tiết</span>
                          </Link>
                          {["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(
                            booking.status,
                          ) && (
                            <Link
                              to={`/admin/bookings/${booking.id}#timeline`}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-slate-950"
                            >
                              <Activity size={16} />
                              Theo dõi
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-sm font-bold text-slate-500">
            Đơn đã thanh toán trong trang: {summary.paid}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold disabled:opacity-40"
            >
              Trước
            </button>
            <span className="text-sm font-black">
              {page + 1} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
