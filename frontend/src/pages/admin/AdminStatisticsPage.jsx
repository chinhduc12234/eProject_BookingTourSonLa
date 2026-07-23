import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  ChartPie,
  CheckCircle2,
  CreditCard,
  Eye,
  Loader2,
  ListFilter,
  RefreshCcw,
  TrendingUp,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

import { getAdminStatistics } from "../../api/adminStatisticsApi";
import {
  Badge,
  DepartureTypeBadge,
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
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const parseMonthValue = (value) => {
  const [year, month] = String(value || currentMonthValue()).split("-").map(Number);
  return { year, month };
};

const numberFormat = (value) => Number(value || 0).toLocaleString("vi-VN");
const percentValue = (value) => Math.min(100, Math.max(0, Number(value || 0)));
const percentOf = (value, total) => (total ? Math.round((value / total) * 100) : 0);

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

function ProgressRow({ label, value, amount, percent, tone = "bg-emerald-600", suffix = "booking" }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-black text-slate-800">{label}</span>
        <span className="font-black text-slate-950">{percent || 0}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${percentValue(percent)}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 text-xs font-bold text-slate-500">
        <span>{numberFormat(value)} {suffix}</span>
        {amount !== undefined && <span>{formatCurrency(amount)}</span>}
      </div>
    </div>
  );
}

function SummaryTile({ label, value, desc, tone = "bg-slate-50", dark = false }) {
  return (
    <div className={`rounded-xl border border-slate-200 p-4 ${tone}`}>
      <div className={`text-2xl font-black ${dark ? "text-white" : "text-slate-950"}`}>{value}</div>
      <div className={`mt-1 text-sm font-black ${dark ? "text-slate-200" : "text-slate-700"}`}>{label}</div>
      {desc && <div className={`mt-1 text-xs font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>{desc}</div>}
    </div>
  );
}

function queueTone(key) {
  return {
    PENDING: "border-amber-200 bg-amber-50 text-amber-900",
    CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-900",
    IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-800",
    COMPLETED: "border-slate-200 bg-slate-100 text-slate-900",
    CANCELLED: "border-rose-200 bg-rose-50 text-rose-900",
  }[key] || "border-slate-200 bg-slate-50 text-slate-900";
}

function managementDetailPath(item) {
  if (item.privateDeparture || !item.departureId) {
    return `/admin/bookings/${item.bookingId}`;
  }

  return `/admin/group-tours/${item.departureId}`;
}

function managementDetailLabel(item) {
  return item.privateDeparture ? "Chi tiết tour riêng" : "Chi tiết tour ghép";
}

export default function AdminStatisticsPage() {
  const [monthValue, setMonthValue] = useState(currentMonthValue);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeQueueKey, setActiveQueueKey] = useState("PENDING");
  const requestIdRef = useRef(0);

  const selectedMonthLabel = useMemo(() => {
    const { year, month } = parseMonthValue(monthValue);
    return `Tháng ${month}/${year}`;
  }, [monthValue]);

  const loadStatistics = useCallback(async (targetMonth = monthValue) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getAdminStatistics(parseMonthValue(targetMonth));
      if (requestId === requestIdRef.current) {
        setStats(response.data);
      }
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Không thể tải dữ liệu thống kê";
      if (requestId === requestIdRef.current) {
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [monthValue]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const paymentBreakdown = stats?.paymentBreakdown || [];
  const statusBreakdown = stats?.statusBreakdown || [];
  const activeBookings = Number(stats?.activeBookings || 0);
  const totalBookings = Number(stats?.totalBookings || 0);
  const cancelledBookings = Number(stats?.cancelledBookings || 0);
  const cancellationRate = percentOf(cancelledBookings, totalBookings);
  const paidPayment = paymentBreakdown.find((item) => item.key === "FULL");
  const depositPayment = paymentBreakdown.find((item) => item.key === "DEPOSIT");
  const pendingPayment = paymentBreakdown.find((item) => item.key === "PENDING_REVIEW");
  const unpaidPayment = paymentBreakdown.find((item) => item.key === "UNPAID");
  const refundedPayment = paymentBreakdown.find((item) => item.key === "REFUNDED");
  const managementQueues = stats?.managementQueues || [];
  const activeQueue = managementQueues.find((queue) => queue.key === activeQueueKey)
    || managementQueues[0]
    || { key: "", label: "Chưa có dữ liệu", count: 0, customerCount: 0, totalValue: 0, items: [] };
  const employeeStats = stats?.employeeStats || [];

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
                Đối soát doanh thu, thanh toán, khách, booking và lịch khởi hành theo tháng.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="statistics-month">Chọn tháng thống kê</label>
            <input
              id="statistics-month"
              type="month"
              value={monthValue}
              onChange={(event) => setMonthValue(event.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm outline-none transition focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => loadStatistics()}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
              Làm mới
            </button>
          </div>
        </div>

        {errorMessage && stats && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">
            <span className="inline-flex items-center gap-2"><AlertCircle size={18} /> {errorMessage}</span>
            <button type="button" onClick={() => loadStatistics()} className="font-black underline">Thử lại</button>
          </div>
        )}

        {loading && !stats ? (
          <div className="mt-10 flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : errorMessage && !stats ? (
          <div className="mt-10 rounded-2xl border border-rose-200 bg-white p-10 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
            <h2 className="mt-4 text-xl font-black text-slate-950">Chưa tải được thống kê</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">{errorMessage}</p>
            <button
              type="button"
              onClick={() => loadStatistics()}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-emerald-700"
            >
              <RefreshCcw size={17} /> Thử lại
            </button>
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                Icon={Banknote}
                label="Doanh thu đã ghi nhận"
                value={formatCurrency(stats?.receivedRevenue)}
                desc={`Chỉ gồm thanh toán đã xác nhận trong ${selectedMonthLabel}`}
              />
              <MetricCard
                Icon={CreditCard}
                label="Giá trị đơn còn hiệu lực"
                value={formatCurrency(stats?.totalBookingValue)}
                desc={`${numberFormat(activeBookings)} booking • Còn phải thu ${formatCurrency(stats?.remainingRevenue)}`}
                tone="bg-amber-50 text-amber-700"
              />
              <MetricCard
                Icon={TrendingUp}
                label="Giá trị trung bình / đơn"
                value={formatCurrency(stats?.averageBookingValue)}
                desc="Tính trên booking chưa hủy, không tính đơn hủy"
                tone="bg-emerald-50 text-emerald-700"
              />
              <MetricCard
                Icon={Users}
                label="Khách còn hiệu lực"
                value={numberFormat(stats?.customerCount)}
                desc={`${numberFormat(activeBookings)} booking còn hiệu lực`}
                tone="bg-amber-50 text-amber-800"
              />
              <MetricCard
                Icon={CalendarDays}
                label="Đơn phát sinh"
                value={numberFormat(totalBookings)}
                desc={`${numberFormat(cancelledBookings)} đơn hủy • Tỷ lệ hủy ${cancellationRate}%`}
                tone="bg-emerald-50 text-emerald-700"
              />
              <MetricCard
                Icon={CheckCircle2}
                label="Lịch khởi hành có khách"
                value={numberFormat(stats?.totalDepartures)}
                desc={`${numberFormat(stats?.upcomingTours)} sắp khởi hành trong ${selectedMonthLabel}`}
                tone="bg-amber-50 text-amber-800"
              />
            </section>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950 shadow-sm">
              <div className="font-black">Phạm vi số liệu: {selectedMonthLabel}</div>
              <div className="mt-2 grid gap-2 font-semibold text-emerald-900 md:grid-cols-3">
                <span>• Đơn và doanh thu: theo thời điểm tạo booking.</span>
                <span>• Tiến độ tour: theo ngày khởi hành, mỗi lịch chỉ đếm một lần.</span>
                <span>• Doanh thu đã ghi nhận: đã trừ tiền hoàn, không tính giao dịch chờ duyệt.</span>
              </div>
            </div>

            <section className="mt-6 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Trung tâm xử lý tour</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Chọn một trạng thái để xem danh sách cần quản lý.</p>
                  </div>
                  <ListFilter size={22} className="text-emerald-700" />
                </div>
                <div className="mt-5 space-y-3">
                  {managementQueues.map((queue) => (
                    <button
                      key={queue.key}
                      type="button"
                      onClick={() => setActiveQueueKey(queue.key)}
                      className={`w-full rounded-xl border p-4 text-left transition ${activeQueueKey === queue.key ? "border-slate-950 ring-2 ring-emerald-200" : "hover:border-emerald-300"} ${queueTone(queue.key)}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-black">{queue.label}</span>
                        <span className="text-2xl font-black">{numberFormat(queue.count)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold opacity-75">
                        <span>{numberFormat(queue.customerCount)} khách</span>
                        <span>{formatCurrency(queue.totalValue)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">{activeQueue.label}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {numberFormat(activeQueue.count)} booking • {numberFormat(activeQueue.customerCount)} khách • {formatCurrency(activeQueue.totalValue)}
                    </p>
                  </div>
                </div>
                {(activeQueue.items || []).length === 0 ? (
                  <div className="py-16 text-center text-sm font-bold text-slate-500">Không có tour/booking ở trạng thái này trong {selectedMonthLabel}.</div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {activeQueue.items.map((item) => (
                      <div key={item.bookingId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-slate-950">{item.tourName}</span>
                              <DepartureTypeBadge booking={{ privateDeparture: item.privateDeparture }} />
                              <Badge meta={getMeta(statusMeta, item.status)} />
                            </div>
                            <div className="mt-2 text-sm font-bold text-slate-700">{item.bookingCode} • {item.customerName} • {numberFormat(item.totalPeople)} khách</div>
                            <div className="mt-1 text-xs font-semibold text-slate-500">Khởi hành: {formatDate(item.departureDate)} • {formatCurrency(item.totalPrice)}</div>
                            <div className="mt-2 text-xs font-bold text-slate-500">
                              Nhân viên: {item.assignedStaffNames?.length ? item.assignedStaffNames.join(", ") : "Chưa được gán"}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <Link to={managementDetailPath(item)} className="inline-flex h-9 items-center gap-1 rounded-lg bg-slate-950 px-3 text-xs font-black text-white hover:bg-emerald-700"><Eye size={15} /> {managementDetailLabel(item)}</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {activeQueue.count > activeQueue.items.length && <div className="pt-2 text-center text-xs font-bold text-slate-500">Đang hiển thị {activeQueue.items.length} mục đầu tiên.</div>}
                  </div>
                )}
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Phân bổ nhân viên</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Theo dõi ai đã được gán, ai đang chạy tour và tour cụ thể đang phụ trách.</p>
                </div>
                <Link to="/admin/staff" className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 px-4 text-sm font-black text-emerald-700 hover:bg-emerald-50">Quản lý nhân viên</Link>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryTile label="Tổng nhân viên" value={numberFormat(stats?.totalStaffCount)} desc="Nhân viên đang hoạt động" tone="bg-slate-50" />
                <SummaryTile label="Đã được gán" value={numberFormat(stats?.assignedStaffCount)} desc={`${numberFormat(stats?.assignedBookingCount)} booking có nhân viên`} tone="bg-emerald-50" />
                <SummaryTile label="Đang chạy tour" value={numberFormat(stats?.runningStaffCount)} desc="Đang phụ trách booking IN_PROGRESS" tone="bg-blue-50" />
                <SummaryTile label="Chưa được gán" value={numberFormat(stats?.unassignedStaffCount)} desc={`${numberFormat(stats?.unassignedBookingCount)} booking chưa có nhân viên`} tone="bg-amber-50" />
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="admin-responsive-table admin-wide-table w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                    <tr><th className="px-4 py-4">Nhân viên</th><th className="px-4 py-4">Đã gán</th><th className="px-4 py-4">Đang chạy</th><th className="px-4 py-4">Sắp chạy</th><th className="px-4 py-4">Hoàn thành</th><th className="px-4 py-4">Tour đang/gán</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employeeStats.map((employee) => (
                      <tr key={employee.employeeId} className="align-top hover:bg-slate-50">
                        <td className="px-4 py-4"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${employee.assignedBookingCount ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{employee.assignedBookingCount ? <UserCheck size={18} /> : <UserX size={18} />}</span><div><div className="font-black text-slate-950">{employee.fullName}</div><div className="mt-1 text-xs font-semibold text-slate-500">{employee.email}</div></div></div></td>
                        <td className="px-4 py-4 font-black text-slate-900">{numberFormat(employee.assignedBookingCount)}</td>
                        <td className="px-4 py-4 font-black text-blue-700">{numberFormat(employee.runningBookingCount)}</td>
                        <td className="px-4 py-4 font-black text-amber-700">{numberFormat(employee.upcomingBookingCount)}</td>
                        <td className="px-4 py-4 font-black text-slate-700">{numberFormat(employee.completedBookingCount)}</td>
                        <td className="px-4 py-4"><div className="max-w-[360px] text-xs font-bold leading-5 text-slate-600">{employee.assignedTourNames?.length ? employee.assignedTourNames.join(" • ") : "Chưa được gán tour"}</div>{employee.runningTourNames?.length > 0 && <div className="mt-2 text-xs font-black text-blue-700">Đang chạy: {employee.runningTourNames.join(" • ")}</div>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Đối soát doanh thu</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Các khoản cộng lại để kiểm tra số liệu.</p>
                  </div>
                  <Banknote className="text-emerald-700" size={22} />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <SummaryTile label="Giá trị đơn hiệu lực" value={formatCurrency(stats?.totalBookingValue)} desc={`${numberFormat(activeBookings)} booking`} />
                  <SummaryTile label="Đã thu xác nhận" value={formatCurrency(stats?.receivedRevenue)} desc="Đã trừ hoàn tiền" tone="bg-emerald-50" />
                  <SummaryTile label="Còn phải thu" value={formatCurrency(stats?.remainingRevenue)} desc="Giá trị hiệu lực - tiền đã thu" tone="bg-amber-50" />
                  <SummaryTile label="Giá trị đơn đã hủy" value={formatCurrency(stats?.cancelledBookingValue)} desc={`${numberFormat(cancelledBookings)} booking hủy`} tone="bg-rose-50" />
                  <SummaryTile label="Tiền chờ kiểm tra" value={formatCurrency(stats?.pendingReviewAmount)} desc="Chưa cộng vào doanh thu" tone="bg-blue-50" />
                  <SummaryTile label="Tiền đã hoàn" value={formatCurrency(stats?.refundedAmount)} desc="Theo các booking trong kỳ" tone="bg-slate-100" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Tình trạng thanh toán</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Tỷ lệ tính trên toàn bộ booking còn hiệu lực.</p>
                  </div>
                  <CreditCard className="text-emerald-700" size={22} />
                </div>
                <div className="mt-6 space-y-5">
                  <ProgressRow label="Đã thanh toán đủ" value={paidPayment?.count} amount={paidPayment?.amount} percent={paidPayment?.percent} />
                  <ProgressRow label="Đã đặt cọc" value={depositPayment?.count} amount={depositPayment?.amount} percent={depositPayment?.percent} tone="bg-amber-500" />
                  <ProgressRow label="Chờ kiểm tra" value={pendingPayment?.count} amount={pendingPayment?.amount} percent={pendingPayment?.percent} tone="bg-blue-500" />
                  <ProgressRow label="Chưa thanh toán" value={unpaidPayment?.count} amount={unpaidPayment?.amount} percent={unpaidPayment?.percent} tone="bg-rose-500" />
                  {refundedPayment?.count > 0 && (
                    <ProgressRow label="Đã hoàn tiền" value={refundedPayment.count} amount={refundedPayment.amount} percent={refundedPayment.percent} tone="bg-slate-500" />
                  )}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-950">Trạng thái booking</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Phân loại theo trạng thái xử lý đơn trong tháng.</p>
                <div className="mt-5 space-y-4">
                  {statusBreakdown.map((item) => (
                    <ProgressRow
                      key={item.key}
                      label={item.label}
                      value={item.count}
                      amount={item.amount}
                      percent={item.percent}
                      tone={item.key === "CANCELLED" ? "bg-rose-500" : item.key === "COMPLETED" ? "bg-slate-600" : item.key === "IN_PROGRESS" ? "bg-blue-500" : "bg-emerald-600"}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">Tiến độ lịch khởi hành</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-300">Đếm lịch duy nhất có ít nhất một booking chưa hủy.</p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7FB77E] text-[#06130d]"><CalendarDays size={21} /></span>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <SummaryTile label="Sắp khởi hành" value={numberFormat(stats?.upcomingTours)} tone="bg-white/[0.08]" dark />
                  <SummaryTile label="Đang chạy" value={numberFormat(stats?.inProgressTours)} tone="bg-white/[0.08]" dark />
                  <SummaryTile label="Hoàn thành" value={numberFormat(stats?.completedTours)} tone="bg-white/[0.08]" dark />
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-300">
                    <span>Tỷ lệ lịch đã hoàn thành</span><span>{stats?.completionRate || 0}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#7FB77E]" style={{ width: `${percentValue(stats?.completionRate)}%` }} />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-400">{numberFormat(stats?.totalDepartures)} lịch khởi hành có khách trong {selectedMonthLabel}</div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Tour có doanh thu tốt</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Xếp theo tiền đã thu xác nhận trong tháng.</p>
                  </div>
                  <ChartPie size={22} className="text-emerald-700" />
                </div>
                <div className="mt-5 space-y-4">
                  {(stats?.topTours || []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm font-bold text-slate-500">Chưa có doanh thu xác nhận trong tháng này.</div>
                  ) : stats.topTours.map((tour, index) => (
                    <div key={tour.tourId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xs font-black uppercase tracking-wider text-emerald-700">#{index + 1}</div>
                          <div className="mt-1 font-black text-slate-950">{tour.tourName}</div>
                          <div className="mt-1 text-xs font-bold text-slate-500">{numberFormat(tour.bookingCount)} booking • {numberFormat(tour.customerCount)} khách</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-amber-700">{formatCurrency(tour.revenue)}</div>
                          <div className="mt-1 text-xs font-bold text-slate-500">{tour.percent || 0}% doanh thu</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-950">Tóm tắt nhanh</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Các chỉ số vận hành giúp kiểm tra nhanh dữ liệu tháng.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <SummaryTile label="Đơn chờ xác nhận" value={numberFormat(stats?.pendingBookings)} desc="Cần nhân viên xử lý" tone="bg-amber-50" />
                  <SummaryTile label="Đơn đã xác nhận" value={numberFormat(stats?.confirmedBookings)} desc="Đã qua bước duyệt" tone="bg-emerald-50" />
                  <SummaryTile label="Khách trong đơn hủy" value={numberFormat(stats?.cancelledCustomerCount)} desc="Không tính vào khách hiệu lực" tone="bg-rose-50" />
                  <SummaryTile label="Tỷ lệ hủy" value={`${cancellationRate}%`} desc={`${numberFormat(cancelledBookings)} / ${numberFormat(totalBookings)} booking`} tone="bg-amber-50" />
                </div>
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Booking phát sinh trong tháng</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Tối đa 8 đơn gần nhất, sắp theo thời điểm tạo booking.</p>
                </div>
                <Link to="/admin/bookings" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-emerald-700">Xem tất cả</Link>
              </div>

              {(stats?.recentBookings || []).length === 0 ? (
                <div className="py-16 text-center text-sm font-bold text-slate-500">Chưa có booking trong {selectedMonthLabel}.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="admin-responsive-table admin-wide-table w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Đơn</th><th className="px-5 py-4">Khách hàng</th><th className="px-5 py-4">Tour</th><th className="px-5 py-4">Ngày đi</th><th className="px-5 py-4">Thanh toán</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.recentBookings.map((booking) => (
                        <tr key={booking.id} className="align-top transition hover:bg-slate-50">
                          <td className="px-5 py-4" data-label="Đơn"><div className="font-black text-slate-950">{booking.bookingCode}</div><div className="mt-1 text-xs font-semibold text-slate-500">{formatDateTime(booking.bookedAt)}</div></td>
                          <td className="px-5 py-4" data-label="Khách hàng"><div className="font-bold text-slate-900">{booking.customerName}</div><div className="mt-1 text-xs font-semibold text-slate-500">{numberFormat(booking.totalPeople)} khách</div></td>
                          <td className="px-5 py-4" data-label="Tour"><div className="max-w-[280px] font-bold text-slate-900">{booking.tourName}</div><div className="mt-2"><DepartureTypeBadge booking={booking} /></div></td>
                          <td className="px-5 py-4 font-bold text-slate-700" data-label="Ngày đi">{formatDate(booking.departureDate)}</td>
                          <td className="px-5 py-4" data-label="Thanh toán"><div className="font-black text-amber-700">{formatCurrency(booking.paidAmount)} / {formatCurrency(booking.totalPrice)}</div><div className="mt-1 text-xs font-semibold text-slate-500">Còn {formatCurrency(booking.remainingAmount)}</div><div className="mt-1 text-xs font-semibold text-slate-500">{paymentPlanText[booking.paymentPlan] || "Chưa chọn"}</div></td>
                          <td className="px-5 py-4" data-label="Trạng thái"><div className="space-y-2"><Badge meta={getMeta(statusMeta, booking.status)} /><Badge meta={getMeta(paymentMeta, booking.paymentStatus)} /></div></td>
                          <td className="px-5 py-4" data-label="Chi tiết"><Link to={`/admin/bookings/${booking.id}`} className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-black text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-50">Xem</Link></td>
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
