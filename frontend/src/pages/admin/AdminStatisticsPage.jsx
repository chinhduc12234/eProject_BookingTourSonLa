import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Banknote,
  CalendarDays,
  ChartPie,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  RefreshCcw,
  TrendingUp,
  Users,
} from "lucide-react";

import { getAdminStatistics } from "../../api/adminStatisticsApi";
import {
  Badge,
  formatCurrency,
  formatDate,
  formatDateTime,
  getMeta,
  paymentMeta,
  paymentPlanText,
  statusMeta,
} from "./bookingShared";

const currentMonthValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const parseMonthValue = (value) => {
  const [year, month] = value.split("-").map(Number);

  return { year, month };
};

const numberFormat = (value) => Number(value || 0).toLocaleString("vi-VN");

function MetricCard({ Icon, label, value, desc, tone = "text-emerald-700 bg-emerald-50" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={22} />
      </span>
      <div className="mt-5 text-3xl font-black tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-sm font-black text-slate-700">{label}</div>
      {desc && <p className="mt-2 text-sm leading-5 text-slate-500">{desc}</p>}
    </div>
  );
}

function ProgressRow({ label, value, amount, percent, tone = "bg-emerald-600" }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-black text-slate-800">{label}</span>
        <span className="font-black text-slate-950">{percent || 0}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.min(100, Math.max(0, percent || 0))}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 text-xs font-bold text-slate-500">
        <span>{numberFormat(value)} lượt</span>
        <span>{amount ? formatCurrency(amount) : ""}</span>
      </div>
    </div>
  );
}

export default function AdminStatisticsPage() {
  const [monthValue, setMonthValue] = useState(currentMonthValue);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const selectedMonthLabel = useMemo(() => {
    const { year, month } = parseMonthValue(monthValue);

    return `Tháng ${month}/${year}`;
  }, [monthValue]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await getAdminStatistics(parseMonthValue(monthValue));
      setStats(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    Promise.resolve().then(async () => {
      try {
        setLoading(true);
        const response = await getAdminStatistics(parseMonthValue(monthValue));

        if (!mounted) return;

        setStats(response.data);
      } catch (error) {
        if (mounted) {
          toast.error(error?.response?.data?.message || "Không thể tải dữ liệu thống kê");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [monthValue]);

  const paymentBreakdown = stats?.paymentBreakdown || [];
  const fullPayment = paymentBreakdown.find((item) => item.key === "FULL");
  const depositPayment = paymentBreakdown.find((item) => item.key === "DEPOSIT");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#f8fafc] p-4 text-slate-900 md:p-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <ChartPie size={27} />
            </span>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Thống kê vận hành</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Theo dõi doanh thu, thanh toán, lượng khách và tiến độ tour theo từng tháng.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="statistics-month">
              Chọn tháng thống kê
            </label>
            <input
              id="statistics-month"
              type="month"
              value={monthValue}
              onChange={(event) => setMonthValue(event.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm outline-none transition focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={loadStatistics}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
              Làm mới
            </button>
          </div>
        </div>

        {loading && !stats ? (
          <div className="mt-10 flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                Icon={Banknote}
                label="Tổng tiền tháng này"
                value={formatCurrency(stats?.receivedRevenue)}
                desc={`Doanh thu đã ghi nhận trong ${selectedMonthLabel}`}
              />
              <MetricCard
                Icon={CreditCard}
                label="Giá trị đơn đặt tour"
                value={formatCurrency(stats?.totalBookingValue)}
                desc={`Còn lại ${formatCurrency(stats?.remainingRevenue)} chưa thu`}
                tone="bg-amber-50 text-amber-700"
              />
              <MetricCard
                Icon={Users}
                label="Khách đã book tour"
                value={numberFormat(stats?.customerCount)}
                desc={`${numberFormat(stats?.activeBookings)} booking còn hiệu lực`}
                tone="bg-sky-50 text-sky-700"
              />
              <MetricCard
                Icon={TrendingUp}
                label="Giá trị trung bình"
                value={formatCurrency(stats?.averageBookingValue)}
                desc="Tính trên các booking chưa hủy"
                tone="bg-violet-50 text-violet-700"
              />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Tỷ lệ thanh toán</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Phân loại theo hình thức khách đã chọn khi thanh toán.
                    </p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <CreditCard size={21} />
                  </span>
                </div>

                <div className="mt-6 space-y-5">
                  <ProgressRow
                    label="Thanh toán toàn bộ"
                    value={stats?.fullPaymentCount}
                    amount={fullPayment?.amount}
                    percent={stats?.fullPaymentPercent}
                  />
                  <ProgressRow
                    label="Thanh toán đặt cọc"
                    value={stats?.depositPaymentCount}
                    amount={depositPayment?.amount}
                    percent={stats?.depositPaymentPercent}
                    tone="bg-amber-500"
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-2xl font-black text-slate-950">
                      {numberFormat(stats?.pendingReviewCount)}
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-500">
                      Thanh toán chờ kiểm tra
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-2xl font-black text-slate-950">
                      {numberFormat(stats?.unpaidCount)}
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-500">Chưa thanh toán</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">Tiến độ tour</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-300">
                      Tính theo các booking có ngày khởi hành trong {selectedMonthLabel}.
                    </p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7FB77E] text-[#06130d]">
                    <CalendarDays size={21} />
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
                    <Clock3 size={22} className="text-sky-200" />
                    <div className="mt-4 text-3xl font-black">
                      {numberFormat(stats?.inProgressTours)}
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-300">Tour đang chạy</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
                    <CheckCircle2 size={22} className="text-emerald-200" />
                    <div className="mt-4 text-3xl font-black">
                      {numberFormat(stats?.completedTours)}
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-300">Tour hoàn thành</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-300">
                    <span>Tỷ lệ hoàn thành</span>
                    <span>{stats?.completionRate || 0}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#7FB77E]"
                      style={{ width: `${Math.min(100, Math.max(0, stats?.completionRate || 0))}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-950">Trạng thái booking</h2>
                <div className="mt-5 space-y-4">
                  {(stats?.statusBreakdown || []).map((item) => (
                    <ProgressRow
                      key={item.key}
                      label={item.label}
                      value={item.count}
                      percent={item.percent}
                      tone={
                        item.key === "CANCELLED"
                          ? "bg-rose-500"
                          : item.key === "COMPLETED"
                            ? "bg-slate-600"
                            : item.key === "IN_PROGRESS"
                              ? "bg-sky-500"
                              : "bg-emerald-600"
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Tour có doanh thu tốt</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Xếp theo số tiền đã ghi nhận trong tháng.
                    </p>
                  </div>
                  <ChartPie size={22} className="text-emerald-700" />
                </div>

                <div className="mt-5 space-y-4">
                  {(stats?.topTours || []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm font-bold text-slate-500">
                      Chưa có tour phát sinh doanh thu trong tháng này.
                    </div>
                  ) : (
                    stats.topTours.map((tour, index) => (
                      <div key={tour.tourId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-xs font-black uppercase tracking-wider text-emerald-700">
                              #{index + 1}
                            </div>
                            <div className="mt-1 font-black text-slate-950">{tour.tourName}</div>
                            <div className="mt-1 text-xs font-bold text-slate-500">
                              {numberFormat(tour.bookingCount)} booking - {numberFormat(tour.customerCount)} khách
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-amber-700">
                              {formatCurrency(tour.revenue)}
                            </div>
                            <div className="mt-1 text-xs font-bold text-slate-500">
                              {tour.percent || 0}% doanh thu
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Booking mới trong tháng</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Hiển thị các đơn gần nhất theo thời điểm đặt tour.
                  </p>
                </div>
                <Link
                  to="/admin/bookings"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-emerald-700"
                >
                  Xem tất cả
                </Link>
              </div>

              {(stats?.recentBookings || []).length === 0 ? (
                <div className="py-16 text-center text-sm font-bold text-slate-500">
                  Chưa có booking trong {selectedMonthLabel}.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="admin-responsive-table admin-wide-table w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Đơn</th>
                        <th className="px-5 py-4">Khách hàng</th>
                        <th className="px-5 py-4">Tour</th>
                        <th className="px-5 py-4">Ngày đi</th>
                        <th className="px-5 py-4">Thanh toán</th>
                        <th className="px-5 py-4">Trạng thái</th>
                        <th className="px-5 py-4">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.recentBookings.map((booking) => (
                        <tr key={booking.id} className="align-top transition hover:bg-slate-50">
                          <td className="px-5 py-4" data-label="Đơn">
                            <div className="font-black text-slate-950">{booking.bookingCode}</div>
                            <div className="mt-1 text-xs font-semibold text-slate-500">
                              {formatDateTime(booking.bookedAt)}
                            </div>
                          </td>
                          <td className="px-5 py-4" data-label="Khách hàng">
                            <div className="font-bold text-slate-900">{booking.customerName}</div>
                            <div className="mt-1 text-xs font-semibold text-slate-500">
                              {numberFormat(booking.totalPeople)} khách
                            </div>
                          </td>
                          <td className="px-5 py-4" data-label="Tour">
                            <div className="max-w-[280px] font-bold text-slate-900">{booking.tourName}</div>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-700" data-label="Ngày đi">
                            {formatDate(booking.departureDate)}
                          </td>
                          <td className="px-5 py-4" data-label="Thanh toán">
                            <div className="font-black text-amber-700">
                              {formatCurrency(booking.paidAmount)}
                            </div>
                            <div className="mt-1 text-xs font-semibold text-slate-500">
                              {paymentPlanText[booking.paymentPlan] || "Chưa chọn"}
                            </div>
                          </td>
                          <td className="px-5 py-4" data-label="Trạng thái">
                            <div className="space-y-2">
                              <Badge meta={getMeta(statusMeta, booking.status)} />
                              <Badge meta={getMeta(paymentMeta, booking.paymentStatus)} />
                            </div>
                          </td>
                          <td className="px-5 py-4" data-label="Chi tiết">
                            <Link
                              to={`/admin/bookings/${booking.id}`}
                              className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-black text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-50"
                            >
                              Xem
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </motion.div>
  );
}
