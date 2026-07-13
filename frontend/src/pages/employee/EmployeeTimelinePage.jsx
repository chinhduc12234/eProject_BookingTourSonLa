import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Flag,
  Image,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { employeeApi } from "../../api/bookingApi";
import { resolveUploadedFileUrl } from "../../api/userApi";
import {
  Badge,
  DepartureTypeBadge,
  bookingTypeText,
  customerTypeText,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  getDepartureTypeMeta,
  getMeta,
  paymentMeta,
  paymentPlanText,
  statusMeta,
} from "../admin/bookingShared";
import "./EmployeeTimeline.css";

const FINISHED = ["DONE", "CHANGED", "SKIPPED"];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chưa làm", short: "Chờ" },
  { value: "DONE", label: "Hoàn thành", short: "Xong" },
  { value: "CHANGED", label: "Có thay đổi", short: "Đổi" },
  { value: "SKIPPED", label: "Hủy bỏ", short: "Hủy" },
];

const ACTIVITY_META = {
  PENDING: { label: "Chưa thực hiện", className: "border-slate-200 bg-slate-50 text-slate-600" },
  DONE: { label: "Hoàn thành", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  CHANGED: { label: "Có thay đổi", className: "border-amber-200 bg-amber-50 text-amber-800" },
  SKIPPED: { label: "Đã hủy", className: "border-rose-200 bg-rose-50 text-rose-800" },
};

const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const getLocalDateTimeInputValue = (date = new Date()) => {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const toDateTimeInputValue = (value) => (value ? String(value).slice(0, 16) : "");

const toApiDateTime = (value) => (value ? (value.length === 16 ? `${value}:00` : value) : null);

const buildActivityForms = (detail) => {
  const forms = {};
  detail?.scheduleDays?.forEach((day) => {
    day.activities?.forEach((activity) => {
      forms[activity.id] = {
        status: activity.status || "PENDING",
        actualStartTime: toDateTimeInputValue(activity.actualStartTime),
        actualEndTime: toDateTimeInputValue(activity.actualEndTime),
        actualLocation: activity.actualLocation || "",
        actualNote: activity.actualNote || "",
        attachmentUrl: activity.attachmentUrl || "",
      };
    });
  });
  return forms;
};

const getScheduleProgress = (detail) => {
  const activities = detail?.scheduleDays?.flatMap((d) => d.activities || []) || [];
  const finished = activities.filter((a) => FINISHED.includes(a.status)).length;
  return {
    total: activities.length,
    finished,
    percent: activities.length ? Math.round((finished / activities.length) * 100) : 0,
    isComplete: activities.length > 0 && finished === activities.length,
  };
};

const getDayProgress = (day) => {
  const activities = day?.activities || [];
  const finished = activities.filter((a) => FINISHED.includes(a.status)).length;
  return {
    total: activities.length,
    finished,
    percent: activities.length ? Math.round((finished / activities.length) * 100) : 0,
    isComplete: activities.length > 0 && finished === activities.length,
    hasStarted: finished > 0,
  };
};

const getSuggestedStepKey = (detail, progress) => {
  if (progress.isComplete) return "finish";
  for (const day of detail?.scheduleDays || []) {
    const hasPending = day.activities?.some((a) => a.status === "PENDING");
    if (hasPending) return `day-${day.id}`;
  }
  const firstDay = detail?.scheduleDays?.[0];
  return firstDay ? `day-${firstDay.id}` : "confirm";
};

const getPendingActivities = (detail) => {
  const pending = [];
  (detail?.scheduleDays || []).forEach((day) => {
    (day.activities || []).forEach((activity) => {
      if (activity.status === "PENDING") {
        pending.push({
          dayNumber: day.dayNumber,
          title: activity.title,
          time: activity.startTime,
        });
      }
    });
  });
  return pending;
};

const getAssignedStaff = (detail) => {
  if (detail.assignedStaffMembers?.length > 0) return detail.assignedStaffMembers;
  if (!detail.assignedStaffId) return [];
  return [{
    employeeId: detail.assignedStaffId,
    fullName: detail.assignedStaffName,
    phone: detail.assignedStaffPhone,
    email: detail.assignedStaffEmail,
    roleInTrip: "Nhân viên phụ trách",
  }];
};

function ProgressRing({ percent }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="tl-progress-ring-wrap">
      <svg viewBox="0 0 100 100">
        <defs>
          <linearGradient id="tlProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <circle className="tl-progress-ring-bg" cx="50" cy="50" r={radius} />
        <circle
          className="tl-progress-ring-fill"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="tl-progress-ring-label">
        <b>{percent}%</b>
        <small>Tiến độ</small>
      </div>
    </div>
  );
}

export default function EmployeeTimelinePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const initialNavDone = useRef(false);

  const [detail, setDetail] = useState(null);
  const [activityForms, setActivityForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingActivityId, setSavingActivityId] = useState(null);
  const [uploadingImageId, setUploadingImageId] = useState(null);
  const [completingTour, setCompletingTour] = useState(false);
  const [activeStepKey, setActiveStepKey] = useState("confirm");
  const [expandedActivities, setExpandedActivities] = useState({});

  const progress = useMemo(() => getScheduleProgress(detail), [detail]);
  const pendingActivities = useMemo(() => getPendingActivities(detail), [detail]);
  const departureTypeMeta = useMemo(() => getDepartureTypeMeta(detail), [detail]);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getEmployeeBookingDetail(bookingId);
      const nextDetail = response.data || response;
      setDetail(nextDetail);
      setActivityForms(buildActivityForms(nextDetail));
      return nextDetail;
    } catch (error) {
      console.error("Lỗi tải timeline tour:", error);
      toast.error(error?.response?.data?.message || "Không thể tải timeline tour.");
      navigate("/employee");
      return null;
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const timelineSteps = useMemo(() => {
    if (!detail) return [];

    const daySteps = (detail.scheduleDays || []).map((day) => {
      const dp = getDayProgress(day);
      return {
        key: `day-${day.id}`,
        type: "day",
        label: `Ngày ${day.dayNumber}`,
        subLabel: `${dp.finished}/${dp.total} hoạt động`,
        icon: CalendarDays,
        day,
        state: dp.isComplete ? "complete" : dp.hasStarted ? "active" : "waiting",
      };
    });

    return [
      {
        key: "confirm",
        type: "confirm",
        label: "Xác nhận",
        subLabel: formatDateTime(detail.confirmedAt),
        icon: CheckCircle,
        state: "complete",
      },
      ...daySteps,
      {
        key: "finish",
        type: "finish",
        label: "Hoàn thành",
        subLabel: detail.status === "COMPLETED" ? "Đã hoàn tất" : `${pendingActivities.length} còn lại`,
        icon: Flag,
        state: progress.isComplete ? "complete" : progress.finished > 0 ? "active" : "waiting",
      },
    ];
  }, [detail, progress, pendingActivities.length]);

  useEffect(() => {
    if (!detail || initialNavDone.current) return;
    const suggested = getSuggestedStepKey(detail, progress);
    if (detail.status === "IN_PROGRESS" || detail.status === "CONFIRMED") {
      setActiveStepKey(suggested);
    }
    initialNavDone.current = true;
  }, [detail, progress]);

  useEffect(() => {
    if (!timelineSteps.length) return;
    if (!timelineSteps.some((s) => s.key === activeStepKey)) {
      setActiveStepKey("confirm");
    }
  }, [activeStepKey, timelineSteps]);

  const activeStep = timelineSteps.find((s) => s.key === activeStepKey) || timelineSteps[0];
  const activeStepIndex = timelineSteps.findIndex((s) => s.key === activeStepKey);

  const goToStep = (index) => {
    if (index >= 0 && index < timelineSteps.length) {
      setActiveStepKey(timelineSteps[index].key);
    }
  };

  const updateActivityForm = (activityId, patch) => {
    setActivityForms((current) => ({
      ...current,
      [activityId]: { ...(current[activityId] || {}), ...patch },
    }));
  };

  const submitActivityUpdate = async (activity, overridePayload = null) => {
    if (!detail) return false;

    const form = overridePayload || activityForms[activity.id] || {};
    const status = form.status || "PENDING";
    const actualNote = (form.actualNote || "").trim();

    if (status === "CHANGED" && !actualNote) {
      toast.error("Vui lòng điền nội dung thay đổi.");
      return false;
    }
    if (status === "SKIPPED" && !actualNote) {
      toast.error("Vui lòng điền lý do hủy hoạt động.");
      return false;
    }

    const payload = {
      status,
      actualStartTime: toApiDateTime(form.actualStartTime),
      actualEndTime: toApiDateTime(form.actualEndTime),
      actualLocation: (form.actualLocation || "").trim() || null,
      actualNote: actualNote || null,
      attachmentUrl: (form.attachmentUrl || "").trim() || null,
    };

    try {
      setSavingActivityId(activity.id);
      const response = await employeeApi.updateScheduleActivity(
        detail.id,
        activity.id,
        payload,
      );
      const nextDetail = response.data || response;
      setDetail(nextDetail);
      setActivityForms(buildActivityForms(nextDetail));

      const statusLabel = STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
      toast.success(`Đã lưu và báo về admin: ${activity.title} — ${statusLabel}`);

      setExpandedActivities((current) => ({ ...current, [activity.id]: false }));
      return true;
    } catch (error) {
      console.error("Lỗi cập nhật hoạt động:", error);
      toast.error(error?.response?.data?.message || "Không thể cập nhật hoạt động.");
      return false;
    } finally {
      setSavingActivityId(null);
    }
  };

  const quickComplete = async (activity) => {
    const now = getLocalDateTimeInputValue();
    const form = activityForms[activity.id] || {};
    const payload = {
      status: "DONE",
      actualStartTime: form.actualStartTime || now,
      actualEndTime: form.actualEndTime || now,
      actualLocation: form.actualLocation || "",
      actualNote: "",
      attachmentUrl: form.attachmentUrl || "",
    };
    updateActivityForm(activity.id, payload);
    await submitActivityUpdate(activity, payload);
  };

  const uploadReportImage = async (activity, file) => {
    if (!detail || !file) return;

    if (!file.type?.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh để báo cáo.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ảnh báo cáo không được vượt quá 10MB.");
      return;
    }

    try {
      setUploadingImageId(activity.id);
      const response = await employeeApi.uploadScheduleActivityReportImage(
        detail.id,
        activity.id,
        file,
      );
      const url = response?.data?.url || response?.url;

      if (!url) {
        throw new Error("Không nhận được đường dẫn ảnh báo cáo");
      }

      updateActivityForm(activity.id, { attachmentUrl: url });
      toast.success("Đã tải ảnh báo cáo lên. Bấm Lưu tình trạng để gửi cho admin.");
    } catch (error) {
      console.error("Lỗi upload ảnh báo cáo:", error);
      toast.error(error?.response?.data?.message || "Không thể tải ảnh báo cáo.");
    } finally {
      setUploadingImageId(null);
    }
  };

  const completeTour = async () => {
    if (!progress.isComplete) {
      toast.error("Còn hoạt động chưa cập nhật. Vui lòng hoàn tất trước.");
      return;
    }
    if (!window.confirm("Xác nhận đánh dấu tour này đã hoàn thành?")) return;

    try {
      setCompletingTour(true);
      const response = await employeeApi.completeBooking(detail.id);
      const nextDetail = response.data || response;
      setDetail(nextDetail);
      setActivityForms(buildActivityForms(nextDetail));
      toast.success("Đã báo admin: tour đã hoàn thành!");
      setActiveStepKey("finish");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể hoàn thành tour.");
    } finally {
      setCompletingTour(false);
    }
  };

  const toggleActivity = (activityId, currentStatus) => {
    setExpandedActivities((c) => {
      const currently =
        c[activityId] !== undefined ? c[activityId] : currentStatus === "PENDING";
      return { ...c, [activityId]: !currently };
    });
  };

  const isExpanded = (activity) => {
    if (expandedActivities[activity.id] !== undefined) return expandedActivities[activity.id];
    return activity.status === "PENDING";
  };

  const getActivityClass = (status) => {
    const s = (status || "PENDING").toLowerCase();
    if (s === "done") return "is-done";
    if (s === "changed") return "is-changed";
    if (s === "skipped") return "is-skipped";
    if (s === "pending") return "is-active";
    return "";
  };

  const getActivityDotIcon = (status) => {
    if (status === "DONE") return Check;
    if (status === "SKIPPED") return XCircle;
    if (status === "CHANGED") return Sparkles;
    return Circle;
  };

  /* ── Render panels ── */

  const renderConfirmPanel = () => {
    const staff = getAssignedStaff(detail);

    return (
      <div className="tl-panel-body">
        <div className="tl-hero">
          <div>
            <div className="tl-hero-badges">
              <DepartureTypeBadge booking={detail} />
              <span className="tl-hero-type">
                {bookingTypeText[detail.bookingType] || detail.bookingType || "Tour"}
              </span>
            </div>
            <h3>{detail.tourName}</h3>
            <p className="tl-hero-code">{detail.bookingCode}</p>
          </div>
          <div className="tl-hero-stats">
            <div className="tl-hero-stat">
              <Users />
              <b>{detail.totalPeople || 0}</b>
              <small>khách · {detail.adultCount || 0} NL · {detail.childCount || 0} TE</small>
            </div>
            <div className="tl-hero-stat">
              <CalendarDays />
              <b>{formatDate(detail.departureDate)}</b>
              <small>{formatTime(detail.departureTime)}</small>
            </div>
            <div className="tl-hero-stat">
              <Clock />
              <b>{detail.durationDays || 0}N</b>
              <small>{detail.durationNights || 0} đêm</small>
            </div>
          </div>
        </div>

        <div className="tl-confirm-grid">
          <div>
            <div className="tl-section">
              <h3 className="tl-section-title"><UserCheck /> Thông tin tác nghiệp</h3>
              <div className="tl-info-grid">
                <div className="tl-info-item"><span>Loại lịch</span><b>{departureTypeMeta.label}</b></div>
                <div className="tl-info-item"><span>Người đặt</span><b>{detail.customerName}</b></div>
                {detail.organizationName && (
                  <div className="tl-info-item"><span>Đoàn / tổ chức</span><b>{detail.organizationName}</b></div>
                )}
                {detail.contactPerson && (
                  <div className="tl-info-item"><span>Người liên hệ</span><b>{detail.contactPerson}</b></div>
                )}
                <div className="tl-info-item">
                  <span>Điện thoại</span>
                  <b className="tl-contact-link"><Phone />{detail.phone || "Chưa cập nhật"}</b>
                </div>
                <div className="tl-info-item">
                  <span>Email</span>
                  <b className="tl-contact-link"><Mail />{detail.email || "Chưa cập nhật"}</b>
                </div>
                <div className="tl-info-item">
                  <span>Điểm đón</span>
                  <b className="tl-contact-link"><MapPin />{detail.pickupAddress || "Chưa cập nhật"}</b>
                </div>
                <div className="tl-info-item">
                  <span>Khởi hành</span><b>{detail.departureLocation || "Chưa cập nhật"}</b>
                </div>
                <div className="tl-info-item">
                  <span>Số người</span><b>{detail.totalPeople || 0} khách · {detail.adultCount || 0} NL · {detail.childCount || 0} TE</b>
                </div>
              </div>
            </div>

            {detail.customers?.length > 0 && (
              <div className="tl-section">
                <h3 className="tl-section-title">
                  <Users /> Hành khách ({detail.customers.length})
                </h3>
                <div className="tl-passenger-grid">
                  {detail.customers.map((c, i) => (
                    <div key={c.id || i} className="tl-passenger">
                      <div className="tl-passenger-top">
                        <b>{c.fullName}</b>
                        <span className="tl-tag">
                          {customerTypeText[c.customerType] || c.customerType || "Khách"}
                        </span>
                        {c.groupLeader && <span className="tl-tag tl-tag-leader">Trưởng đoàn</span>}
                      </div>
                      <div className="tl-passenger-meta">
                        {c.phone && <span>{c.phone}</span>}
                        {c.identityNumber && <span>CCCD: {c.identityNumber}</span>}
                        {c.dateOfBirth && <span>NS: {formatDate(c.dateOfBirth)}</span>}
                        {c.healthNote && <span className="tl-health-warn">⚕ {c.healthNote}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(detail.includedServices || detail.excludedServices) && (
              <div className="tl-section">
                <h3 className="tl-section-title"><ShieldCheck /> Dịch vụ tour</h3>
                {detail.includedServices && (
                  <div className="tl-service included"><b>Bao gồm</b><p>{detail.includedServices}</p></div>
                )}
                {detail.excludedServices && (
                  <div className="tl-service excluded"><b>Không bao gồm</b><p>{detail.excludedServices}</p></div>
                )}
              </div>
            )}
          </div>

          <aside>
            <div className="tl-side-card">
              <h4><CalendarDays /> Lịch đi</h4>
              <div className="tl-info-grid">
                <div className="tl-info-item"><span>Ngày</span><b>{formatDate(detail.departureDate)}</b></div>
                <div className="tl-info-item"><span>Giờ</span><b>{formatTime(detail.departureTime)}</b></div>
                <div className="tl-info-item"><span>Thời lượng</span><b>{detail.durationDays || 0} ngày {detail.durationNights || 0} đêm</b></div>
              </div>
            </div>

            <div className="tl-side-card">
              <h4><Banknote /> Thanh toán</h4>
              <div className="tl-info-grid">
                <div className="tl-info-item"><span>Tổng</span><b className="tl-price">{formatCurrency(detail.totalPrice)}</b></div>
                <div className="tl-info-item"><span>Đã trả</span><b>{formatCurrency(detail.paidAmount)}</b></div>
                {Number(detail.remainingAmount || 0) > 0 && (
                  <div className="tl-info-item"><span>Còn lại</span><b className="tl-remaining">{formatCurrency(detail.remainingAmount)}</b></div>
                )}
                <div className="tl-info-item">
                  <span>Gói</span>
                  <b>{paymentPlanText[detail.paymentPlan] || detail.paymentPlan || "Chưa cập nhật"}</b>
                </div>
              </div>
            </div>

            {staff.length > 0 && (
              <div className="tl-side-card">
                <h4><Users /> Đội ngũ</h4>
                {staff.map((s) => (
                  <div key={s.employeeId} className="tl-staff">
                    <b>{s.fullName}</b>
                    <small>{s.roleInTrip || "Nhân viên điều hành"}</small>
                    {s.phone && <small>{s.phone}</small>}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        {(detail.specialRequest || detail.note) && (
          <div className="tl-note guest">
            <b>Yêu cầu / ghi chú khách</b>
            <p>{detail.specialRequest || detail.note}</p>
          </div>
        )}
        {detail.internalNote && (
          <div className="tl-note internal">
            <b>Ghi chú nội bộ (admin)</b>
            <p>{detail.internalNote}</p>
          </div>
        )}
      </div>
    );
  };

  const renderActivityForm = (activity) => {
    const form = activityForms[activity.id] || {};
    const currentStatus = form.status || activity.status || "PENDING";
    const isSaving = savingActivityId === activity.id;
    const isPending = currentStatus === "PENDING";

    return (
      <div className="tl-activity-form">
        <div className="tl-quick-actions">
          <button
            type="button"
            className="tl-quick-btn"
            disabled={isSaving}
            onClick={() => quickComplete(activity)}
          >
            {isSaving ? <Loader2 className="spin-icon" /> : <Zap />}
            Hoàn thành nhanh & lưu
          </button>
        </div>

        <div className="tl-status-pills">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-status={opt.value}
              className={`tl-status-pill${currentStatus === opt.value ? " is-selected" : ""}`}
              onClick={() => {
                const now = getLocalDateTimeInputValue();
                const patch = { status: opt.value };
                if (["DONE", "CHANGED"].includes(opt.value) && !form.actualStartTime) {
                  patch.actualStartTime = now;
                }
                if (["DONE", "CHANGED", "SKIPPED"].includes(opt.value) && !form.actualEndTime) {
                  patch.actualEndTime = now;
                }
                updateActivityForm(activity.id, patch);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="tl-form-grid">
          <label className="tl-field">
            <span>Bắt đầu thực tế</span>
            <input
              type="datetime-local"
              value={form.actualStartTime || ""}
              disabled={isPending}
              onChange={(e) => updateActivityForm(activity.id, { actualStartTime: e.target.value })}
            />
          </label>
          <label className="tl-field">
            <span>Kết thúc / ghi nhận</span>
            <input
              type="datetime-local"
              value={form.actualEndTime || ""}
              disabled={isPending}
              onChange={(e) => updateActivityForm(activity.id, { actualEndTime: e.target.value })}
            />
          </label>
          <label className="tl-field">
            <span>Địa điểm thực tế</span>
            <input
              type="text"
              value={form.actualLocation || ""}
              disabled={isPending}
              placeholder="Ví dụ: Nhà tù Sơn La"
              onChange={(e) => updateActivityForm(activity.id, { actualLocation: e.target.value })}
            />
          </label>
          <label className="tl-field full">
            <span>
              {currentStatus === "SKIPPED" ? "Lý do hủy *" : "Ghi chú / thay đổi"}
              {(currentStatus === "CHANGED" || currentStatus === "SKIPPED") && " *"}
            </span>
            <textarea
              value={form.actualNote || ""}
              disabled={isPending}
              rows={3}
              placeholder="Mô tả tình trạng thực tế, lý do thay đổi hoặc hủy..."
              onChange={(e) => updateActivityForm(activity.id, { actualNote: e.target.value })}
            />
          </label>
          <label className="tl-field full">
            <span>Đường dẫn minh chứng / ảnh báo cáo</span>
            <input
              type="url"
              value={form.attachmentUrl || ""}
              disabled={isPending}
              placeholder="Dán link ảnh, file hoặc bài báo cáo nếu có"
              onChange={(e) => updateActivityForm(activity.id, { attachmentUrl: e.target.value })}
            />
          </label>
          <div className="tl-field full">
            <span>Upload ảnh báo cáo</span>
            <div className="tl-report-upload-row">
              <label className={`tl-report-upload-btn${isPending ? " is-disabled" : ""}`}>
                {uploadingImageId === activity.id ? (
                  <Loader2 className="spin-icon" />
                ) : (
                  <UploadCloud />
                )}
                {uploadingImageId === activity.id ? "Đang tải ảnh..." : "Chọn ảnh báo cáo"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={isPending || uploadingImageId === activity.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    uploadReportImage(activity, file);
                  }}
                />
              </label>
              <small>Ảnh JPG, PNG, WEBP hoặc GIF, tối đa 10MB.</small>
            </div>
            {String(form.attachmentUrl || "").startsWith("/uploads/") && (
              <div className="tl-report-preview">
                <Image />
                <img
                  src={resolveUploadedFileUrl(form.attachmentUrl)}
                  alt="Ảnh báo cáo hoạt động"
                />
                <a
                  href={resolveUploadedFileUrl(form.attachmentUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Xem ảnh báo cáo
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="tl-save-row">
          <span className="tl-admin-report-hint">
            Khi bấm lưu, nội dung này sẽ hiển thị ngay trong trang theo dõi của admin.
          </span>
          <button
            type="button"
            className="tl-save-btn"
            disabled={isSaving}
            onClick={() => submitActivityUpdate(activity)}
          >
            {isSaving ? <Loader2 className="spin-icon" /> : <Save />}
            Lưu tình trạng
          </button>
        </div>
      </div>
    );
  };

  const renderDayPanel = (day) => {
    const dp = getDayProgress(day);

    return (
      <div className="tl-panel-body">
        <div className="tl-day-bar">
          <div className="tl-day-bar-top">
            <span>Tiến độ ngày {day.dayNumber}</span>
            <b>{dp.percent}%</b>
          </div>
          <div className="tl-day-bar-track">
            <div className="tl-day-bar-fill" style={{ width: `${dp.percent}%` }} />
          </div>
        </div>

        {day.description && <p className="tl-day-desc">{day.description}</p>}

        <div className="tl-activity-list">
          {day.activities?.length > 0 ? (
            day.activities.map((activity) => {
              const expanded = isExpanded(activity);
              const DotIcon = getActivityDotIcon(activity.status);

              return (
                <div
                  key={activity.id}
                  className={`tl-activity ${getActivityClass(activity.status)}`}
                >
                  <div className="tl-activity-rail">
                    <div className="tl-activity-dot">
                      <DotIcon />
                    </div>
                  </div>
                  <div
                    className={`tl-activity-card${expanded ? " is-expanded" : ""}`}
                  >
                    <div
                      className="tl-activity-head"
                      onClick={() => toggleActivity(activity.id, activity.status)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && toggleActivity(activity.id, activity.status)
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <div className="tl-activity-time">
                        <Clock />
                        {formatTime(activity.startTime)}
                        {activity.endTime ? ` – ${formatTime(activity.endTime)}` : ""}
                      </div>
                      <div className="tl-activity-info">
                        <h4>{activity.title}</h4>
                        {activity.description && <p>{activity.description}</p>}
                        {activity.updatedByEmployeeName && (
                          <small>
                            {activity.updatedByEmployeeName} · {formatDateTime(activity.updatedAt)}
                          </small>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Badge meta={getMeta(ACTIVITY_META, activity.status)} />
                        <div className="tl-activity-chevron">
                          <ChevronDown />
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: "hidden" }}
                        >
                          {renderActivityForm(activity)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="tl-empty">Ngày này chưa có hoạt động trong lịch trình.</div>
          )}
        </div>
      </div>
    );
  };

  const renderFinishPanel = () => (
    <div className="tl-panel-body">
      <div className="tl-finish-hero">
        <div className="tl-finish-icon">
          {detail.status === "COMPLETED" ? <CheckCircle /> : <Flag />}
        </div>
        <h3>
          {detail.status === "COMPLETED"
            ? "Tour đã hoàn thành!"
            : progress.isComplete
              ? "Sẵn sàng hoàn tất tour"
              : "Chưa đủ điều kiện hoàn tất"}
        </h3>
        <p>
          {detail.status === "COMPLETED"
            ? "Tất cả hoạt động đã được ghi nhận và tour đã kết thúc."
            : progress.isComplete
              ? "Toàn bộ hoạt động đã cập nhật. Bạn có thể đánh dấu tour hoàn thành."
              : `Còn ${pendingActivities.length} hoạt động cần cập nhật trước khi hoàn tất.`}
        </p>
      </div>

      <div className="tl-finish-stats">
        <div className="tl-finish-stat">
          <span>Tiến độ</span>
          <b>{progress.percent}%</b>
        </div>
        <div className="tl-finish-stat">
          <span>Hoạt động</span>
          <b>{progress.finished}/{progress.total}</b>
        </div>
        <div className="tl-finish-stat">
          <span>Trạng thái</span>
          <b style={{ fontSize: 16 }}>
            {getMeta(statusMeta, detail.status).label}
          </b>
        </div>
      </div>

      {pendingActivities.length > 0 && (
        <div className="tl-pending-list">
          <b>Hoạt động chưa cập nhật ({pendingActivities.length})</b>
          <ul>
            {pendingActivities.map((item, i) => (
              <li key={i}>
                Ngày {item.dayNumber} · {formatTime(item.time)} — {item.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className={`tl-complete-btn${detail.status === "COMPLETED" ? " is-done" : ""}`}
        disabled={!progress.isComplete || completingTour || detail.status === "COMPLETED"}
        onClick={completeTour}
      >
        {completingTour ? (
          <Loader2 className="spin-icon" />
        ) : detail.status === "COMPLETED" ? (
          <CheckCircle />
        ) : (
          <Flag />
        )}
        {detail.status === "COMPLETED"
          ? "Tour đã hoàn thành"
          : "Xác nhận hoàn thành tour"}
      </button>
    </div>
  );

  const renderPanel = () => {
    if (!activeStep) return null;

    const headings = {
      confirm: {
        eyebrow: "Bước 1 · Xác nhận",
        title: "Thông tin đơn đặt tour",
        desc: "Kiểm tra đầy đủ thông tin trước khi bắt đầu lịch trình thực tế.",
      },
      day: {
        eyebrow: `Ngày ${activeStep.day?.dayNumber} · ${formatDate(activeStep.day?.scheduleDate)}`,
        title: activeStep.day?.title || `Lịch trình ngày ${activeStep.day?.dayNumber}`,
        desc: "Cập nhật tình trạng từng hoạt động trong ngày.",
      },
      finish: {
        eyebrow: "Bước cuối · Hoàn thành",
        title: "Kết thúc tour",
        desc: "Đánh dấu hoàn tất khi toàn bộ hoạt động đã được ghi nhận.",
      },
    };

    const h = headings[activeStep.type] || headings.confirm;

    return (
      <motion.div
        key={activeStep.key}
        className="tl-panel"
        variants={panelVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="tl-panel-head">
          <span className="tl-panel-eyebrow">{h.eyebrow}</span>
          <h2>{h.title}</h2>
          <p>{h.desc}</p>
        </div>
        {activeStep.type === "confirm" && renderConfirmPanel()}
        {activeStep.type === "day" && renderDayPanel(activeStep.day)}
        {activeStep.type === "finish" && renderFinishPanel()}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="tl-loading">
        <div className="tl-loading-spinner" />
        <p>Đang tải timeline tour...</p>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="tl-shell">
      <header className="tl-header">
        <div className="tl-header-inner">
          <button type="button" className="tl-back-btn" onClick={() => navigate("/employee")}>
            <ArrowLeft />
            Quay lại
          </button>
          <div className="tl-header-info">
            <span className="tl-header-eyebrow">Timeline tour</span>
            <h1 className="tl-header-title">{detail.tourName}</h1>
            <div className="tl-header-meta">
              <span className="tl-header-code">{detail.bookingCode}</span>
              <span>·</span>
              <span>{detail.customerName}</span>
              <span>·</span>
              <span>{formatDate(detail.departureDate)}</span>
              <span>·</span>
              <span>{detail.totalPeople || 0} khách</span>
            </div>
          </div>
          <div className="tl-header-badges">
            <DepartureTypeBadge booking={detail} />
            <Badge meta={getMeta(statusMeta, detail.status)} />
            <Badge meta={getMeta(paymentMeta, detail.paymentStatus)} />
          </div>
        </div>
      </header>

      <div className="tl-layout">
        <aside className="tl-sidebar">
          <div className="tl-progress-card">
            <ProgressRing percent={progress.percent} />
            <p className="tl-progress-caption">
              <b>{progress.finished}/{progress.total}</b> hoạt động đã cập nhật
            </p>
          </div>

          <div className="tl-steps-card">
            <div className="tl-steps-label">Tiến trình tour</div>
            <ol className="tl-step-list">
              {timelineSteps.map((step) => {
                const Icon = step.icon;
                const selected = step.key === activeStepKey;
                return (
                  <li key={step.key}>
                    <button
                      type="button"
                      className={[
                        "tl-step-btn",
                        `is-${step.state}`,
                        selected ? "is-selected" : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => setActiveStepKey(step.key)}
                    >
                      <span className="tl-step-icon"><Icon /></span>
                      <span className="tl-step-text">
                        <b>{step.label}</b>
                        <small>{step.subLabel}</small>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="tl-nav-row">
            <button
              type="button"
              className="tl-nav-btn"
              disabled={activeStepIndex <= 0}
              onClick={() => goToStep(activeStepIndex - 1)}
            >
              <ChevronLeft /> Trước
            </button>
            <button
              type="button"
              className="tl-nav-btn"
              disabled={activeStepIndex >= timelineSteps.length - 1}
              onClick={() => goToStep(activeStepIndex + 1)}
            >
              Tiếp <ChevronRight />
            </button>
          </div>
        </aside>

        <main className="tl-main">
          <AnimatePresence mode="wait">
            {renderPanel()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
