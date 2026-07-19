import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  assignAdminGroupTourStaff,
  confirmAdminGroupTour,
  getAdminGroupTourDetail,
  getAdminGroupTourTracking,
} from "../../api/bookingApi";
import { getAllStaff } from "../../api/staffApi";
import {
  Badge,
  formatDate,
  formatDateTime,
  formatTime,
  getMeta,
  scheduleActivityStatusMeta,
  statusMeta,
} from "./bookingShared";
import { resolveUploadedFileUrl } from "../../api/userApi";

const groupStatusMeta = {
  WAITING: { label: "Đang ghép khách", className: "border-amber-200 bg-amber-50 text-amber-800" },
  CONFIRMED: { label: "Đã xác nhận đoàn", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  IN_PROGRESS: { label: "Đang khởi hành", className: "border-sky-200 bg-sky-50 text-sky-800" },
  COMPLETED: { label: "Đã hoàn thành", className: "border-slate-200 bg-slate-100 text-slate-700" },
  CANCELLED: { label: "Không còn booking", className: "border-rose-200 bg-rose-50 text-rose-800" },
};

const operationSteps = [
  ["1", "Gom đơn", "Kiểm tra các đơn và số khách của cùng một lịch khởi hành."],
  ["2", "Phân công", "Chọn một nhân viên phụ trách chung cho toàn bộ đoàn."],
  ["3", "Chốt đoàn", "Xác nhận khi không nhận thêm khách cho chuyến này."],
  ["4", "Theo dõi", "Theo dõi tiến độ đoàn và các báo cáo từ nhân viên."],
];

export default function GroupTourDetailPage() {
  const { departureId } = useParams();
  const [tour, setTour] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [staff, setStaff] = useState([]);
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [detail, progress, employees] = await Promise.all([
        getAdminGroupTourDetail(departureId),
        getAdminGroupTourTracking(departureId),
        getAllStaff({ page: 0, size: 100, isActive: true }),
      ]);
      setTour(detail.data);
      setTracking(progress.data);
      setStaff(employees.data?.content || employees.data || []);
      setStaffId(detail.data?.assignedStaffId ? String(detail.data.assignedStaffId) : "");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tải thông tin tour ghép");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [departureId]);

  const saveStaff = async () => {
    if (!staffId) {
      toast.error("Vui lòng chọn nhân viên phụ trách đoàn");
      return;
    }

    try {
      setBusy(true);
      await assignAdminGroupTourStaff(departureId, Number(staffId));
      toast.success("Đã phân công nhân viên cho toàn đoàn");
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể lưu phân công");
    } finally {
      setBusy(false);
    }
  };

  const confirmGroup = async () => {
    try {
      setBusy(true);
      await confirmAdminGroupTour(departureId);
      toast.success("Đã chốt đoàn và đóng nhận khách cho lịch này");
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể xác nhận đoàn");
    } finally {
      setBusy(false);
    }
  };

  const bookings = tour?.bookings || [];
  const isConfirmed = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(tour?.groupStatus);
  const canConfirm = Boolean(tour?.assignedStaffId) && Number(tour?.pendingBookingCount || 0) > 0;
  const progress = Number(tracking?.progressPercent || 0);
  const capacityPercent = useMemo(() => {
    const maxPeople = Number(tour?.maxPeople || 0);
    return maxPeople ? Math.min(100, Math.round((Number(tour?.occupiedPeople || 0) / maxPeople) * 100)) : 0;
  }, [tour]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 size={40} className="animate-spin text-emerald-600" /></div>;
  }

  if (!tour) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link to="/admin/group-tours" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
              <ArrowLeft size={17} /> Danh sách tour ghép
            </Link>
            <div className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Đoàn ghép · lịch #{tour.departureId}</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{tour.tourName}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Quản lý một đoàn theo cùng lịch khởi hành, thay vì xử lý từng đơn rời rạc.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge meta={getMeta(groupStatusMeta, tour.groupStatus)} />
            <button type="button" onClick={load} disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60">
              <RefreshCcw size={16} /> Làm mới
            </button>
          </div>
        </header>

        {tracking?.needsReviewBookings > 0 && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} /><div><b>Có báo cáo hành trình cần xem lại</b><p className="mt-1">Nhân viên đã ghi nhận thay đổi hoặc bỏ qua hoạt động trong đoàn.</p></div></div>
            <a href="#tracking" className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-700 px-4 text-xs font-black text-white hover:bg-slate-950">Xem theo dõi</a>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={UsersRound} label="Khách đã giữ chỗ" value={`${tour.occupiedPeople || 0}/${tour.maxPeople || 0}`} detail={`Còn ${tour.availableSeats || 0} chỗ trống`} />
          <SummaryCard icon={ClipboardList} label="Đơn trong đoàn" value={tour.bookingCount || 0} detail={`${tour.pendingBookingCount || 0} chờ · ${tour.confirmedBookingCount || 0} xác nhận`} />
          <SummaryCard icon={UserRound} label="Nhân viên phụ trách" value={tour.assignedStaffName || "Chưa phân công"} detail={tour.assignedStaffEmail || "Cần phân công trước khi chốt đoàn"} compact />
          <SummaryCard icon={Activity} label="Tiến độ hành trình" value={`${progress}%`} detail={`${tracking?.completedActivities || 0}/${tracking?.totalActivities || 0} hoạt động hoàn thành`} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Thông tin chuyến</p><h2 className="mt-1 text-2xl font-black">{tour.tourName}</h2></div><span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-700"><CalendarDays size={16} className="text-emerald-700" />{formatDate(tour.departureDate)} · {formatTime(tour.departureTime)}</span></div></div>
              <div className="p-5"><div className="flex items-center justify-between gap-4"><div><div className="font-black">Mức độ lấp đầy đoàn</div><p className="mt-1 text-sm font-semibold text-slate-500">Số ghế đã được giữ theo tất cả đơn cùng lịch khởi hành.</p></div><b className="text-2xl text-emerald-700">{capacityPercent}%</b></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${capacityPercent}%` }} /></div></div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h2 className="text-xl font-black">Các đơn trong đoàn</h2><p className="mt-1 text-sm font-semibold text-slate-500">Danh sách khách cùng tham gia chuyến này.</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">{bookings.length} đơn</span></div>
              <div className="overflow-x-auto"><table className="admin-responsive-table admin-wide-table w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Mã đơn</th><th className="px-5 py-4">Khách hàng</th><th className="px-5 py-4">Số khách</th><th className="px-5 py-4">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-100">{bookings.map((booking) => <tr key={booking.id} className="align-top transition hover:bg-slate-50"><td data-label="Mã đơn" className="px-5 py-4"><div className="font-black text-slate-950">{booking.bookingCode}</div><div className="mt-1 text-xs font-semibold text-slate-500">#{booking.id}</div></td><td data-label="Khách hàng" className="px-5 py-4"><div className="font-bold text-slate-900">{booking.customerName}</div><div className="mt-1 text-xs font-semibold text-slate-500">{booking.phone || booking.email || "Chưa có liên hệ"}</div></td><td data-label="Số khách" className="px-5 py-4"><div className="font-black">{booking.totalPeople || 0} khách</div><div className="mt-1 text-xs text-slate-500">NL {booking.adultCount || 0} · TE {booking.childCount || 0}</div></td><td data-label="Trạng thái" className="px-5 py-4"><Badge meta={getMeta(statusMeta, booking.status)} /></td></tr>)}</tbody></table></div>
            </section>
          </main>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Điều hành đoàn</h2><p className="mt-1 text-sm font-semibold leading-6 text-slate-500">Thao tác tại đây áp dụng cho toàn bộ booking trong cùng lịch khởi hành.</p><div className="mt-5 space-y-3">{operationSteps.map(([number, title, description], index) => <div key={number} className={`flex gap-3 rounded-2xl border p-3 ${index === 1 && !tour.assignedStaffId ? "border-amber-200 bg-amber-50" : index === 2 && isConfirmed ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">{number}</span><div><b className="text-sm">{title}</b><p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500">{description}</p></div></div>)}</div></section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><ShieldCheck size={19} className="text-emerald-700" /><h2 className="text-lg font-black">Phân công & chốt đoàn</h2></div><label className="mt-4 block text-xs font-black uppercase tracking-widest text-slate-500">Nhân viên phụ trách</label><select value={staffId} disabled={busy || tour.groupStatus === "COMPLETED"} onChange={(event) => setStaffId(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-bold outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-60"><option value="">Chọn nhân viên phụ trách</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.fullName} · {member.email}</option>)}</select>{tour.assignedStaffName && <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">Đang phụ trách: {tour.assignedStaffName}</div>}<button type="button" disabled={busy || !staffId || tour.groupStatus === "COMPLETED"} onClick={saveStaff} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-black text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"><UserRound size={16} /> Lưu phân công</button><button type="button" disabled={busy || !canConfirm} onClick={confirmGroup} className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300"><CheckCircle2 size={17} /> Xác nhận đoàn</button><p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{isConfirmed ? "Đoàn đã chốt; lịch khởi hành không nhận thêm khách." : !tour.assignedStaffId ? "Hãy phân công nhân viên trước khi xác nhận đoàn." : !tour.pendingBookingCount ? "Không còn đơn chờ xác nhận trong đoàn." : "Xác nhận sẽ chốt toàn bộ đơn chờ và đóng nhận khách cho lịch này."}</p></section>
          </aside>
        </div>

        <section id="tracking" className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-black"><Activity size={21} className="text-emerald-700" />Theo dõi hành trình đoàn</h2><p className="mt-1 text-sm font-semibold text-slate-500">Tổng hợp tiến độ từ các booking trong đoàn.</p></div><span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">Tiến độ chung: {progress}%</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Đơn có lịch trình" value={tracking?.bookingsWithSchedule || 0} detail="Đã tạo timeline" /><SummaryCard label="Đơn hoàn thành" value={tracking?.completedBookings || 0} detail="Đủ điều kiện kết thúc" /><SummaryCard label="Cần xem báo cáo" value={tracking?.needsReviewBookings || 0} detail="Có thay đổi/bỏ qua" /><SummaryCard label="Hoạt động hoàn thành" value={`${tracking?.completedActivities || 0}/${tracking?.totalActivities || 0}`} detail="Tổng các lịch trình" /></div></section>
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardList size={21} className="text-emerald-700" />
            <div>
              <h2 className="text-xl font-black">Nhật ký & báo cáo đoàn</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Admin nhận báo cáo tập trung từ nhân viên điều hành đoàn.</p>
            </div>
          </div>
          <GroupScheduleReports days={tracking?.scheduleDays || []} />
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, detail, compact = false }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{Icon && <Icon size={21} className="text-emerald-700" />}<div className={`mt-3 font-black tracking-tight ${compact ? "text-xl" : "text-3xl"}`}>{value}</div><div className="mt-1 text-sm font-bold text-slate-500">{label}</div>{detail && <div className="mt-2 text-xs font-semibold text-slate-400">{detail}</div>}</div>;
}

function GroupScheduleReports({ days }) {
  const reportedActivities = days.flatMap((day) =>
    (day.activities || []).map((activity) => ({ ...activity, day })),
  ).filter((activity) =>
    activity.actualNote || activity.attachmentUrl || activity.updatedByEmployeeName,
  );

  if (!days.length) {
    return <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">Chưa có lịch trình để nhân viên cập nhật.</div>;
  }

  if (!reportedActivities.length) {
    return <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">Nhân viên chưa gửi ghi chú hoặc ảnh báo cáo. Báo cáo sẽ xuất hiện tại đây ngay sau khi được lưu.</div>;
  }

  return <div className="mt-5 border-t border-slate-100 pt-5"><div className="flex items-center justify-between gap-3"><div><h3 className="text-lg font-black">Báo cáo từ nhân viên</h3><p className="mt-1 text-sm font-semibold text-slate-500">Ghi chú và ảnh minh chứng được gửi trực tiếp từ timeline của nhân viên.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">{reportedActivities.length} báo cáo</span></div><div className="mt-4 grid gap-4 lg:grid-cols-2">{reportedActivities.map((activity) => <article key={activity.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-white p-4"><div><div className="text-xs font-black uppercase tracking-wider text-slate-400">Ngày {activity.day.dayNumber} · {formatDate(activity.day.scheduleDate)}</div><h4 className="mt-1 font-black text-slate-950">{activity.title}</h4></div><Badge meta={getMeta(scheduleActivityStatusMeta, activity.status)} /></div><div className="p-4">{activity.actualNote && <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{activity.actualNote}</p>}{activity.updatedByEmployeeName && <p className="mt-3 text-xs font-bold text-slate-500">Cập nhật bởi {activity.updatedByEmployeeName} · {formatDateTime(activity.updatedAt)}</p>}{activity.attachmentUrl && <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">{String(activity.attachmentUrl).startsWith("/uploads/") && <img src={resolveUploadedFileUrl(activity.attachmentUrl)} alt={`Báo cáo ${activity.title}`} className="max-h-64 w-full object-cover" />}<a href={resolveUploadedFileUrl(activity.attachmentUrl)} target="_blank" rel="noreferrer" className="block px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-50">Xem ảnh / tệp minh chứng</a></div>}</div></article>)}</div></div>;
}
