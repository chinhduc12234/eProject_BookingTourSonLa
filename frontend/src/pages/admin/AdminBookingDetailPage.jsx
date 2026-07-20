import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  ShieldCheck,
  TicketCheck,
  UserCog,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  getAdminBookingDetail,
  updateAdminBooking,
} from "../../api/bookingApi";
import { getAllStaff } from "../../api/staffApi";
import { resolveUploadedFileUrl } from "../../api/userApi";
import {
  Badge,
  DepartureTypeBadge,
  DetailPaymentRow,
  InfoCard,
  TextBlock,
  bookingTypeText,
  customerTypeText,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  getDepartureTypeMeta,
  getMeta,
  paymentMeta,
  paymentMethodText,
  paymentPlanText,
  scheduleActivityStatusMeta,
  statusMeta,
} from "./bookingShared";

const defaultStaffRole = "GUIDE";

const staffRoleOptions = [
  { value: "GUIDE", label: "Hướng dẫn viên" },
  { value: "LEAD_GUIDE", label: "Hướng dẫn tour chính" },
  { value: "ASSISTANT_GUIDE", label: "Phụ tour" },
  { value: "TOUR_COORDINATOR", label: "Điều phối tour" },
  { value: "SUPPORT_STAFF", label: "Hỗ trợ đoàn" },
  { value: "DRIVER", label: "Tài xế" },
];

const staffRoleLabels = Object.fromEntries(
  staffRoleOptions.map((item) => [item.value, item.label]),
);

const getStaffRoleLabel = (role) => {
  if (!role) return "Chưa chọn vai trò";
  return staffRoleLabels[role] || role;
};

const mergeStaffOptions = (...groups) => {
  const uniqueStaff = new Map();

  groups.flat().filter(Boolean).forEach((staff) => {
    const id = String(staff.id ?? staff.employeeId ?? "");
    if (!id) return;

    uniqueStaff.set(id, {
      id: Number(staff.id ?? staff.employeeId),
      fullName: staff.fullName || "Nhân viên",
      phone: staff.phone || "",
      email: staff.email || "",
    });
  });

  return Array.from(uniqueStaff.values());
};

export default function AdminBookingDetailPage() {
  const { bookingId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffOptions, setStaffOptions] = useState([]);
  const [staffAssignments, setStaffAssignments] = useState([]);
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const resolveSelectedStaffAssignments = (booking) => {
    if (booking?.assignedStaffMembers?.length) {
      return booking.assignedStaffMembers
        .filter((staff) => staff?.employeeId)
        .map((staff) => ({
          employeeId: String(staff.employeeId),
          fullName: staff.fullName || "",
          phone: staff.phone || "",
          email: staff.email || "",
          roleInTrip: staff.roleInTrip || defaultStaffRole,
        }));
    }

    if (!booking?.assignedStaffId) {
      return [];
    }

    return [
      {
        employeeId: String(booking.assignedStaffId),
        fullName: booking.assignedStaffName || "",
        phone: booking.assignedStaffPhone || "",
        email: booking.assignedStaffEmail || "",
        roleInTrip: defaultStaffRole,
      },
    ];
  };

  const loadStaffOptions = async (
    keyword = "",
    selectedAssignments = staffAssignments,
  ) => {
    try {
      setStaffLoading(true);

      const response = await getAllStaff({
        page: 0,
        size: 20,
        keyword: keyword.trim() || undefined,
        isActive: true,
        sortBy: "fullName",
        direction: "asc",
      });

      const selectedStaff = selectedAssignments.map((assignment) => ({
        id: Number(assignment.employeeId),
        fullName: assignment.fullName,
        phone: assignment.phone,
        email: assignment.email,
      }));

      setStaffOptions(
        mergeStaffOptions(response.data.content || [], selectedStaff),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể tải danh sách nhân viên",
      );
    } finally {
      setStaffLoading(false);
    }
  };

  const addStaffAssignment = (staff) => {
    const staffId = String(staff.id);

    setStaffAssignments((currentAssignments) => {
      if (currentAssignments.some((item) => item.employeeId === staffId)) {
        return currentAssignments;
      }

      return [
        ...currentAssignments,
        {
          employeeId: staffId,
          fullName: staff.fullName || "",
          phone: staff.phone || "",
          email: staff.email || "",
          roleInTrip: defaultStaffRole,
        },
      ];
    });
  };

  const removeStaffAssignment = (employeeId) => {
    setStaffAssignments((currentAssignments) =>
      currentAssignments.filter((item) => item.employeeId !== employeeId),
    );
  };

  const updateStaffAssignment = (employeeId, patch) => {
    setStaffAssignments((currentAssignments) =>
      currentAssignments.map((item) =>
        item.employeeId === employeeId
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    );
  };

  const loadDetail = async () => {
    try {
      setLoading(true);
      const detailResponse = await getAdminBookingDetail(bookingId);
      const nextDetail = detailResponse.data;
      const nextAssignments = resolveSelectedStaffAssignments(nextDetail);

      setDetail(nextDetail);
      setStaffAssignments(nextAssignments);
      setInternalNote(nextDetail.internalNote || "");
      await loadStaffOptions("", nextAssignments);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể tải chi tiết đơn đặt tour",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [bookingId]);

  useEffect(() => {
    if (!detail || window.location.hash !== "#timeline") return;

    const timer = window.setTimeout(() => {
      document.getElementById("timeline")?.scrollIntoView({ block: "start" });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [detail]);

  useEffect(() => {
    if (!staffPickerOpen) return undefined;

    const timer = window.setTimeout(() => {
      loadStaffOptions(staffSearch);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [staffPickerOpen, staffSearch]);

  const handleAdminAction = async ({
    confirm = false,
    confirmPayment = false,
    paymentStatus,
  }) => {
    if (!detail) return;

    if (confirm && staffAssignments.length === 0) {
      toast.error("Vui lòng chọn nhân viên phụ trách trước khi xác nhận tour");
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        internalNote,
        confirm,
        confirmPayment,
        assignedStaffMembers: staffAssignments.map((assignment) => ({
          employeeId: Number(assignment.employeeId),
          roleInTrip: assignment.roleInTrip || defaultStaffRole,
        })),
      };

      if (paymentStatus) {
        payload.paymentStatus = paymentStatus;
      }

      const response = await updateAdminBooking(detail.id, payload);
      const nextDetail = response.data;
      const nextAssignments = resolveSelectedStaffAssignments(nextDetail);

      setDetail(nextDetail);
      setStaffAssignments(nextAssignments);
      setInternalNote(nextDetail.internalNote || "");
      setStaffOptions((currentOptions) =>
        mergeStaffOptions(currentOptions, nextAssignments),
      );

      toast.success(
        paymentStatus === "FAILED"
          ? "Đã từ chối thanh toán"
          : confirmPayment
            ? "Đã xác nhận thanh toán"
            : confirm
              ? "Đã gán nhân viên và xác nhận tour"
              : "Đã lưu phân công",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể cập nhật đơn đặt tour",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 text-slate-900 md:p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <TicketCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h1 className="mt-4 text-2xl font-black">Không tìm thấy đơn đặt tour</h1>
          <Link
            to="/admin/bookings"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-emerald-700"
          >
            <ArrowLeft size={17} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const hasGroup = Number(detail.totalPeople || 0) > 1;
  const isCancelled = detail.status === "CANCELLED";
  const isTourConfirmed = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(
    detail.status,
  );
  const assignedStaffMembers = staffAssignments;
  const isPaymentPendingReview = detail.paymentStatus === "PENDING_REVIEW";
  const confirmedPaymentLabel =
    Number(detail.remainingAmount || 0) > 0 ? "Đã cọc" : "Đã thanh toán";
  const scheduleActivities =
    detail.scheduleDays?.flatMap((day) => day.activities || []) || [];
  const completedScheduleActivities = scheduleActivities.filter((activity) =>
    ["DONE", "CHANGED", "SKIPPED"].includes(activity.status),
  ).length;
  const changedScheduleActivities =
    detail.scheduleChangedActivities ??
    scheduleActivities.filter((activity) => activity.status === "CHANGED").length;
  const skippedScheduleActivities =
    detail.scheduleSkippedActivities ??
    scheduleActivities.filter((activity) => activity.status === "SKIPPED").length;
  const pendingScheduleActivities =
    detail.schedulePendingActivities ??
    Math.max(0, scheduleActivities.length - completedScheduleActivities);
  const scheduleProgress = scheduleActivities.length
    ? Math.round((completedScheduleActivities / scheduleActivities.length) * 100)
    : 0;
  const scheduleNeedsReview =
    detail.scheduleNeedsReview ||
    changedScheduleActivities > 0 ||
    skippedScheduleActivities > 0;
  const scheduleLastUpdatedAt = detail.scheduleLastUpdatedAt;
  const scheduleLastUpdatedBy = detail.scheduleLastUpdatedBy;
  const departureTypeMeta = getDepartureTypeMeta(detail);
  const DepartureTypeIcon = detail.privateDeparture ? ShieldCheck : Users;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              to="/admin/bookings"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <ArrowLeft size={17} />
              Danh sách đơn đặt tour
            </Link>
            <div className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              {detail.bookingCode}
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Chi tiết đơn đặt tour
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Xem thông tin tour, khách đi tour, thanh toán và phân công nhân
              viên.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DepartureTypeBadge booking={detail} />
            <Badge meta={getMeta(statusMeta, detail.status)} />
            <Badge meta={getMeta(paymentMeta, detail.paymentStatus)} />
            <button
              type="button"
              onClick={loadDetail}
              disabled={loading || actionLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
            >
              <RefreshCcw size={16} />
              Làm mới
            </button>
          </div>
        </div>

        {isCancelled && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
            Đặt lịch đã hủy. Chính sách hoàn tiền bên dưới đang phản ánh theo
            ngày khởi hành của đơn đặt tour này.
          </div>
        )}

        {scheduleNeedsReview && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} />
              <div>
                <div className="font-black">Có báo cáo lịch trình cần admin xem</div>
                <div className="mt-1">
                  Nhân viên đã ghi nhận {changedScheduleActivities} hoạt động thay đổi và {skippedScheduleActivities} hoạt động bỏ qua.
                </div>
              </div>
            </div>
            <a
              href="#timeline"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-700 px-4 text-xs font-black text-white transition hover:bg-slate-950"
            >
              Xem timeline
            </a>
          </div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                <div className="min-h-64 bg-slate-100">
                  {detail.tourThumbnail ? (
                    <img
                      src={resolveUploadedFileUrl(detail.tourThumbnail)}
                      alt={detail.tourName}
                      className="h-full min-h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-64 items-center justify-center text-slate-300">
                      <TicketCheck size={42} />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Tour đã đặt
                    </span>
                    <DepartureTypeBadge booking={detail} />
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    {detail.tourName}
                  </h2>
                  {detail.tourShortDescription && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {detail.tourShortDescription}
                    </p>
                  )}

                  <div
                    className={[
                      "mt-4 flex items-start gap-3 rounded-2xl border p-4",
                      departureTypeMeta.panelClassName,
                    ].join(" ")}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70">
                      <DepartureTypeIcon size={20} />
                    </span>
                    <div>
                      <div className="font-black">{departureTypeMeta.title}</div>
                      <p className="mt-1 text-sm font-semibold leading-6 opacity-80">
                        {departureTypeMeta.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <InfoCard
                      icon={CalendarDays}
                      label="Khởi hành"
                      value={`${formatDate(detail.departureDate)} ${
                        detail.departureTime ? detail.departureTime.slice(0, 5) : ""
                      }`}
                    />
                    <InfoCard
                      icon={MapPin}
                      label="Điểm đi"
                      value={detail.departureLocation || "Chưa cập nhật"}
                    />
                    <InfoCard
                      icon={ClipboardList}
                      label="Thời lượng"
                      value={`${detail.durationDays || 0} ngày ${
                        detail.durationNights || 0
                      } đêm`}
                    />
                    <InfoCard
                      icon={CreditCard}
                      label="Tổng tiền"
                      value={formatCurrency(detail.totalPrice)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard
                icon={UserRound}
                label="Khách hàng"
                value={detail.customerName}
              />
              <InfoCard
                icon={Users}
                label="Số khách"
                value={`${detail.totalPeople || 0} khách - NL ${
                  detail.adultCount || 0
                } / TE ${detail.childCount || 0}`}
              />
              <InfoCard
                icon={Phone}
                label="Số điện thoại"
                value={detail.phone || "Chưa cập nhật"}
              />
              <InfoCard
                icon={Mail}
                label="Email"
                value={detail.email || "Chưa cập nhật"}
              />
              <InfoCard
                icon={ShieldCheck}
                label="Loại đơn"
                value={bookingTypeText[detail.bookingType] || detail.bookingType}
              />
              <InfoCard
                icon={DepartureTypeIcon}
                label="Loại lịch đã đặt"
                value={departureTypeMeta.label}
              />
              <InfoCard
                icon={MapPin}
                label="Điểm đón"
                value={detail.pickupAddress || "Chưa có địa chỉ đón"}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextBlock title="Mô tả tour" value={detail.tourDescription} />
              <TextBlock title="Dịch vụ bao gồm" value={detail.includedServices} />
              <TextBlock
                title="Dịch vụ không bao gồm"
                value={detail.excludedServices}
              />
              <TextBlock
                title="Ghi chú/yêu cầu của khách"
                value={[detail.note, detail.specialRequest].filter(Boolean).join("\n")}
              />
            </div>

            {detail.scheduleDays?.length > 0 && (
              <div
                id="timeline"
                className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Activity size={20} />
                    </span>
                    <div>
                      <h2 className="text-xl font-black text-slate-950">
                        Timeline tình trạng tour
                      </h2>
                      <p className="text-sm font-semibold text-slate-500">
                        Quản trị viên theo dõi xác nhận, từng hoạt động thực tế và mốc hoàn thành.
                      </p>
                    </div>
                  </div>
                  <div className="min-w-[180px]">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-500">
                      <span>Tiến độ</span>
                      <span>{scheduleProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${scheduleProgress}%` }}
                      />
                    </div>
                    <div className="mt-2 text-right text-xs font-bold text-slate-500">
                      {completedScheduleActivities}/{scheduleActivities.length} mốc đã xử lý
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Mốc xác nhận
                    </div>
                    <div className="mt-2 font-black text-emerald-950">
                      {detail.confirmedAt
                        ? "Tour đã được xác nhận"
                        : "Tour chưa được xác nhận"}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-emerald-800">
                      {formatDateTime(detail.confirmedAt)}
                    </div>
                    {detail.confirmedByName && (
                      <div className="mt-1 text-xs font-bold text-emerald-700">
                        Bởi {detail.confirmedByName}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <div className="text-xs font-black uppercase tracking-wide text-sky-700">
                      Điểm xuất phát / đón khách
                    </div>
                    <div className="mt-2 font-black text-sky-950">
                      {detail.departureLocation || "Chưa cập nhật điểm xuất phát"}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-sky-800">
                      Đón: {detail.pickupAddress || "Chưa có địa chỉ đón riêng"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Mốc hoàn thành
                    </div>
                    <div className="mt-2 font-black text-slate-950">
                      {detail.status === "COMPLETED"
                        ? "Tour đã hoàn thành"
                        : "Đang chờ hoàn thành đủ lịch trình"}
                    </div>
                    <div className="mt-3">
                      <Badge meta={getMeta(statusMeta, detail.status)} />
                    </div>
                  </div>
                  <div
                    className={[
                      "rounded-2xl border p-4",
                      scheduleNeedsReview
                        ? "border-amber-200 bg-amber-50"
                        : "border-emerald-100 bg-emerald-50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-xs font-black uppercase tracking-wide",
                        scheduleNeedsReview ? "text-amber-700" : "text-emerald-700",
                      ].join(" ")}
                    >
                      Báo cáo nhân viên
                    </div>
                    <div
                      className={[
                        "mt-2 font-black",
                        scheduleNeedsReview ? "text-amber-950" : "text-emerald-950",
                      ].join(" ")}
                    >
                      {scheduleNeedsReview ? "Cần admin xem lại" : "Chưa có vấn đề phát sinh"}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-700">
                      Đổi: {changedScheduleActivities} · Bỏ qua: {skippedScheduleActivities} · Còn: {pendingScheduleActivities}
                    </div>
                    {scheduleLastUpdatedAt && (
                      <div className="mt-2 text-xs font-bold text-slate-600">
                        {scheduleLastUpdatedBy || "Nhân viên"} · {formatDateTime(scheduleLastUpdatedAt)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {detail.scheduleDays.map((day) => (
                    <div key={day.id} className="relative border-l-2 border-emerald-100 pl-5">
                      <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white bg-emerald-600 shadow" />
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                            Ngày {day.dayNumber} · {formatDate(day.scheduleDate)}
                          </div>
                          <h3 className="mt-1 font-black text-slate-950">
                            {day.title}
                          </h3>
                          {day.description && (
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {day.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {day.activities?.length > 0 ? (
                          day.activities.map((activity) => {
                            const hasActualInfo =
                              activity.status !== "PENDING" ||
                              activity.actualStartTime ||
                              activity.actualEndTime ||
                              activity.actualNote ||
                              activity.attachmentUrl ||
                              activity.updatedByEmployeeName;

                            return (
                              <div
                                key={activity.id}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                              >
                                <div className="grid gap-3 lg:grid-cols-[130px_1fr_auto] lg:items-start">
                                  <div>
                                    <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                                      Theo lịch
                                    </div>
                                    <div className="mt-1 font-black text-slate-900">
                                      {formatTime(activity.startTime)}
                                      {activity.endTime
                                        ? ` - ${formatTime(activity.endTime)}`
                                        : ""}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-black text-slate-950">
                                      {activity.title}
                                    </div>
                                    {activity.description && (
                                      <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {activity.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="lg:text-right">
                                    <Badge
                                      meta={getMeta(
                                        scheduleActivityStatusMeta,
                                        activity.status,
                                      )}
                                    />
                                  </div>
                                </div>

                                {hasActualInfo && (
                                  <div className="mt-3 grid gap-3 rounded-2xl border border-white bg-white p-3 text-sm text-slate-600 md:grid-cols-2">
                                    {(activity.actualStartTime || activity.actualEndTime) && (
                                      <div>
                                        <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                                          Thời gian thực tế
                                        </div>
                                        <div className="mt-1 font-bold text-slate-900">
                                          {activity.actualStartTime
                                            ? formatDateTime(activity.actualStartTime)
                                            : "Chưa nhập"}
                                          {activity.actualEndTime
                                            ? ` - ${formatDateTime(activity.actualEndTime)}`
                                            : ""}
                                        </div>
                                      </div>
                                    )}
                                    {activity.completedAt && (
                                      <div>
                                        <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                                          Ghi nhận lúc
                                        </div>
                                        <div className="mt-1 font-bold text-slate-900">
                                          {formatDateTime(activity.completedAt)}
                                        </div>
                                      </div>
                                    )}
                                    {activity.updatedAt && (
                                      <div>
                                        <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                                          Cập nhật mới nhất
                                        </div>
                                        <div className="mt-1 font-bold text-slate-900">
                                          {formatDateTime(activity.updatedAt)}
                                        </div>
                                      </div>
                                    )}
                                    {activity.actualLocation && (
                                      <div>
                                        <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                                          Địa điểm thực tế
                                        </div>
                                        <div className="mt-1 font-bold text-slate-900">
                                          {activity.actualLocation}
                                        </div>
                                      </div>
                                    )}
                                    {activity.updatedByEmployeeName && (
                                      <div>
                                        <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                                          Nhân viên cập nhật
                                        </div>
                                        <div className="mt-1 font-bold text-slate-900">
                                          {activity.updatedByEmployeeName}
                                        </div>
                                      </div>
                                    )}
                                    {activity.actualNote && (
                                      <div className="md:col-span-2">
                                        <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                                          Nội dung cập nhật
                                        </div>
                                        <div className="mt-1 whitespace-pre-line font-semibold leading-6 text-slate-700">
                                          {activity.actualNote}
                                        </div>
                                      </div>
                                    )}
                                    {activity.attachmentUrl && (
                                      <div className="md:col-span-2">
                                        <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                                          Minh chứng nhân viên gửi
                                        </div>
                                        {String(activity.attachmentUrl).startsWith("/uploads/") && (
                                          <img
                                            src={resolveUploadedFileUrl(activity.attachmentUrl)}
                                            alt="Ảnh minh chứng nhân viên gửi"
                                            className="mt-2 h-36 w-full max-w-sm rounded-2xl border border-slate-200 object-cover"
                                          />
                                        )}
                                        <a
                                          href={resolveUploadedFileUrl(activity.attachmentUrl)}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="mt-1 inline-flex items-center gap-2 break-all text-sm font-black text-emerald-700 hover:text-slate-950"
                                        >
                                          <ExternalLink size={15} />
                                          {activity.attachmentUrl}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                            Ngày này chưa có hoạt động trong lịch trình.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.customers?.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-slate-950">
                  Danh sách khách đi tour
                </h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {detail.customers.map((customer, index) => (
                    <div
                      key={customer.id || index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-black text-slate-950">
                          {customer.fullName}
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          {customer.groupLeader && hasGroup
                            ? "Trưởng đoàn"
                            : "Hành khách"}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-1 text-sm text-slate-600">
                        <span>
                          {customerTypeText[customer.customerType] ||
                            customer.customerType}
                        </span>
                        <span>{customer.phone || "Chưa có SĐT"}</span>
                        <span className="break-all">
                          {customer.email || "Chưa có email"}
                        </span>
                        {customer.healthNote && (
                          <span>Sức khỏe: {customer.healthNote}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700">
                  <UserCog size={20} />
                </span>
                <div>
                  <h2 className="font-black text-slate-950">
                    Phân công nhân viên
                  </h2>
                  <p className="text-sm font-semibold text-slate-500">
                    Tìm nhanh nhân viên, gán vai trò rồi xác nhận tour.
                  </p>
                </div>
              </div>

              <label className="mt-5 block text-sm font-black text-slate-700">
                Nhân viên phụ trách
              </label>
              <button
                type="button"
                onClick={() => {
                  setStaffPickerOpen(true);
                  loadStaffOptions(staffSearch);
                }}
                disabled={actionLoading || isCancelled}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 px-4 text-sm font-black text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus size={18} />
                Tìm và gán nhân viên
              </button>

              {assignedStaffMembers.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {assignedStaffMembers.map((staff) => (
                    <div
                      key={staff.employeeId}
                      className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-black text-emerald-900">
                            {staff.fullName || `Nhân viên #${staff.employeeId}`}
                          </div>
                          <div className="mt-1 truncate text-emerald-700">
                            {staff.phone || staff.email || "Chưa có liên hệ"}
                          </div>
                        </div>
                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => removeStaffAssignment(staff.employeeId)}
                            disabled={actionLoading}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      <div className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-xs font-black uppercase tracking-wide text-emerald-800">
                        Vai trò hiện tại: {getStaffRoleLabel(staff.roleInTrip)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500">
                  Chưa có nhân viên nào được gán cho đơn này.
                </div>
              )}

              <label className="mt-5 block text-sm font-black text-slate-700">
                Ghi chú nội bộ
              </label>
              <textarea
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                disabled={actionLoading}
                rows={4}
                placeholder="Ví dụ: khách cần hỗ trợ đón tại khách sạn..."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 disabled:opacity-60"
              />

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => handleAdminAction({ confirm: false })}
                  disabled={actionLoading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={17} />
                  )}
                  Lưu phân công
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: "Xác nhận tour?",
                      text: "Tour sẽ được xác nhận và gán cho nhân viên đã chọn.",
                      icon: "question",
                      showCancelButton: true,
                      confirmButtonText: "Xác nhận",
                      cancelButtonText: "Hủy",
                      confirmButtonColor: "#2f7d55",
                      customClass: {
                        popup: "rounded-3xl",
                        confirmButton: "rounded-xl px-6 py-2",
                        cancelButton: "rounded-xl px-6 py-2",
                      },
                    });

                    if (result.isConfirmed) {
                      handleAdminAction({ confirm: true });
                    }
                  }}
                  disabled={actionLoading || isTourConfirmed || isCancelled}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {actionLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  {isTourConfirmed ? "Tour đã xác nhận" : "Xác nhận tour"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-black text-slate-950">Duyệt thanh toán</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Khách gửi xác nhận chuyển khoản trước, admin kiểm tra giao dịch
                rồi mới chốt trạng thái thanh toán.
              </p>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <DetailPaymentRow
                  label="Trạng thái"
                  value={<Badge meta={getMeta(paymentMeta, detail.paymentStatus)} />}
                />
                <DetailPaymentRow
                  label="Tổng tiền"
                  value={formatCurrency(detail.totalPrice)}
                />
                <DetailPaymentRow
                  label="Đã ghi nhận"
                  value={formatCurrency(detail.paidAmount)}
                />
                <DetailPaymentRow
                  label="Cọc 30%"
                  value={formatCurrency(detail.depositAmount)}
                />
                <DetailPaymentRow
                  label="Còn lại"
                  value={formatCurrency(detail.remainingAmount)}
                />
                {Number(detail.refundedAmount || 0) > 0 && (
                  <DetailPaymentRow
                    label="Đã hoàn"
                    value={formatCurrency(detail.refundedAmount)}
                  />
                )}
                {Number(detail.forfeitedDepositAmount || 0) > 0 && (
                  <DetailPaymentRow
                    label="Cọc đã giữ"
                    value={formatCurrency(detail.forfeitedDepositAmount)}
                  />
                )}
                {detail.paymentPlan && (
                  <DetailPaymentRow
                    label="Gói thanh toán"
                    value={paymentPlanText[detail.paymentPlan] || detail.paymentPlan}
                  />
                )}
                {detail.paymentMethod && (
                  <DetailPaymentRow
                    label="Phương thức"
                    value={paymentMethodText[detail.paymentMethod] || detail.paymentMethod}
                  />
                )}
                {detail.remainingPaymentMethod && (
                  <DetailPaymentRow
                    label="Phần còn lại"
                    value={
                      paymentMethodText[detail.remainingPaymentMethod] ||
                      detail.remainingPaymentMethod
                    }
                  />
                )}
                <DetailPaymentRow
                  label="Hạn thanh toán"
                  value={formatDateTime(detail.paymentDeadline)}
                />
                <DetailPaymentRow
                  label="Thanh toán lúc"
                  value={formatDateTime(detail.paidAt)}
                />
                {detail.refundedAt && (
                  <DetailPaymentRow
                    label="Hoàn tiền lúc"
                    value={formatDateTime(detail.refundedAt)}
                  />
                )}
                {detail.paymentReference && (
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs font-black uppercase text-slate-400">
                      Mã giao dịch
                    </div>
                    <div className="mt-1 break-all font-black text-slate-900">
                      {detail.paymentReference}
                    </div>
                  </div>
                )}
                {isPaymentPendingReview && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-900">
                    <div className="font-black">
                      Khách đã gửi xác nhận thanh toán
                    </div>
                    <p className="mt-1 text-sm leading-6">
                      Kiểm tra chuyển khoản rồi xác nhận để hệ thống chuyển sang
                      trạng thái {confirmedPaymentLabel}.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: "Xác nhận thanh toán?",
                          text: "Đơn sẽ được chuyển sang trạng thái đã thanh toán/đã cọc.",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Xác nhận",
                          cancelButtonText: "Hủy",
                          confirmButtonColor: "#2f7d55",
                          customClass: {
                            popup: "rounded-3xl",
                            confirmButton: "rounded-xl px-6 py-2",
                            cancelButton: "rounded-xl px-6 py-2",
                          },
                        });

                        if (result.isConfirmed) {
                          handleAdminAction({ confirmPayment: true });
                        }
                      }}
                      disabled={actionLoading || isCancelled}
                      className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {actionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CreditCard size={16} />
                      )}
                      Xác nhận thanh toán
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: "Từ chối thanh toán?",
                          text: "Đơn sẽ được đánh dấu thanh toán thất bại.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Từ chối",
                          cancelButtonText: "Hủy",
                          confirmButtonColor: "#dc2626",
                          customClass: {
                            popup: "rounded-3xl",
                            confirmButton: "rounded-xl px-6 py-2",
                            cancelButton: "rounded-xl px-6 py-2",
                          },
                        });

                        if (result.isConfirmed) {
                          handleAdminAction({ paymentStatus: "FAILED" });
                        }
                      }}
                      disabled={actionLoading || isCancelled}
                      className="ml-2 mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CreditCard size={16} />
                      )}
                      Từ chối thanh toán
                    </button>
                  </div>
                )}
                {detail.refundPolicyNote && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-amber-900">
                    <div className="text-xs font-black uppercase text-amber-600">
                      Chính sách hoàn tiền
                    </div>
                    <div className="mt-1 font-semibold leading-6">
                      {detail.refundPolicyNote}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {staffPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Gán nhân viên phụ trách
                </h2>
                <p className="text-sm font-semibold text-slate-500">
                  Tìm theo tên rồi thêm vào danh sách phân công của đơn này.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStaffPickerOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    value={staffSearch}
                    onChange={(event) => setStaffSearch(event.target.value)}
                    placeholder="Tìm theo tên, email hoặc số điện thoại"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">
                  {staffLoading ? (
                    <div className="flex min-h-[220px] items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                  ) : staffOptions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                      Không tìm thấy nhân viên phù hợp.
                    </div>
                  ) : (
                    staffOptions.map((staff) => {
                      const alreadySelected = assignedStaffMembers.some(
                        (item) => item.employeeId === String(staff.id),
                      );

                      return (
                        <button
                          key={staff.id}
                          type="button"
                          onClick={() => addStaffAssignment(staff)}
                          disabled={alreadySelected}
                          className={[
                            "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                            alreadySelected
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/60",
                          ].join(" ")}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-black">
                              {staff.fullName}
                            </span>
                            <span className="mt-1 block truncate text-xs font-semibold text-slate-500">
                              {staff.phone || staff.email || "Chưa có thông tin liên hệ"}
                            </span>
                          </span>
                          <span className="shrink-0 rounded-full px-3 py-1 text-xs font-black">
                            {alreadySelected ? "Đã chọn" : "Thêm"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                  Danh sách đã chọn
                </h3>
                <div className="mt-4 space-y-3">
                  {assignedStaffMembers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                      Chưa có nhân viên nào trong danh sách phân công.
                    </div>
                  ) : (
                    assignedStaffMembers.map((staff) => (
                      <div
                        key={staff.employeeId}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-black text-slate-950">
                              {staff.fullName || `Nhân viên #${staff.employeeId}`}
                            </div>
                            <div className="mt-1 truncate text-xs font-semibold text-slate-500">
                              {staff.phone || staff.email || "Chưa có liên hệ"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeStaffAssignment(staff.employeeId)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <label className="mt-3 block text-xs font-black uppercase tracking-wide text-slate-500">
                          Vai trò
                        </label>
                        <select
                          value={staff.roleInTrip || defaultStaffRole}
                          onChange={(event) =>
                            updateStaffAssignment(staff.employeeId, {
                              roleInTrip: event.target.value,
                            })
                          }
                          className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-emerald-500"
                        >
                          {staffRoleOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStaffPickerOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-emerald-700"
                  >
                    Xong
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
