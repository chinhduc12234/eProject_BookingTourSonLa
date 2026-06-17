import { useState, useEffect } from "react";
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Grid3X3,
  Loader2,
  LogOut,
  MapPin,
  Save,
  Search,
  XCircle,
} from "lucide-react";
import { employeeApi } from "../../api/bookingApi";
import {
  Badge,
  formatDate,
  formatDateTime,
  formatTime,
  getMeta,
  scheduleActivityStatusMeta,
  scheduleActivityStatuses,
} from "../admin/bookingShared";
import "./EmployeeDashboard.css";

const finishedActivityStatuses = ["DONE", "CHANGED", "SKIPPED"];

const getLocalDateTimeInputValue = (date = new Date()) => {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const toDateTimeInputValue = (value) => {
  if (!value) return "";
  return String(value).slice(0, 16);
};

const toApiDateTime = (value) => {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
};

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

const getBookingStatusLabel = (status) => {
  const labels = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    IN_PROGRESS: "Đang đi tour",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  return labels[status] || status || "Chưa rõ";
};

const getBookingStatusClass = (status) => {
  const classes = {
    PENDING: "badge-pending",
    CONFIRMED: "badge-confirmed",
    IN_PROGRESS: "badge-progress",
    COMPLETED: "badge-completed",
    CANCELLED: "badge-cancelled",
  };

  return classes[status] || "badge-pending";
};

const getScheduleProgress = (detail) => {
  const activities =
    detail?.scheduleDays?.flatMap((day) => day.activities || []) || [];
  const finished = activities.filter((activity) =>
    finishedActivityStatuses.includes(activity.status),
  ).length;

  return {
    total: activities.length,
    finished,
    percent: activities.length ? Math.round((finished / activities.length) * 100) : 0,
  };
};

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [trackingDetail, setTrackingDetail] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [activityForms, setActivityForms] = useState({});
  const [savingActivityId, setSavingActivityId] = useState(null);

  // KHỞI TẠO ĐỐI TƯỢNG NHÂN VIÊN LẤY TỪ DATABASE ĐĂNG NHẬP
  const [employeeInfo, setEmployeeInfo] = useState({
    name: "Nhân viên",
    role: "Nhân viên điều hành"
  });

  const loadDashboardData = async (showPageLoading = true) => {
    try {
      await Promise.resolve();
      if (showPageLoading) {
        setLoading(true);
      }

      
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Lấy trường dữ liệu họ tên hoặc username trả về từ Database của bạn
        const empName = parsedUser.fullName || parsedUser.name || parsedUser.username || "dang trung kien";
        const empRole = parsedUser.role === "ROLE_ADMIN" ? "Quản trị viên" : "Nhân viên điều hành";
        
        setEmployeeInfo({
          name: empName,
          role: empRole
        });
      }

     
      const [bookingsRes, statsRes] = await Promise.all([
        employeeApi.getEmployeeBookings(),
        employeeApi.getDashboardStats()
      ]);
      
      setBookings(bookingsRes.data || bookingsRes);
      setStats(statsRes.data || statsRes);
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu hệ thống:", error);
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadDashboardData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const openTrackingDetail = async (bookingId) => {
    try {
      setTrackingLoading(true);
      const response = await employeeApi.getEmployeeBookingDetail(bookingId);
      const detail = response.data || response;

      setTrackingDetail(detail);
      setActivityForms(buildActivityForms(detail));
    } catch (error) {
      console.error("Lỗi tải timeline tour:", error);
      alert(error?.response?.data?.message || "Không thể tải timeline tour được phân công.");
    } finally {
      setTrackingLoading(false);
    }
  };

  const updateActivityForm = (activityId, patch) => {
    setActivityForms((currentForms) => ({
      ...currentForms,
      [activityId]: {
        ...(currentForms[activityId] || {}),
        ...patch,
      },
    }));
  };

  const submitActivityUpdate = async (activity) => {
    if (!trackingDetail) return;

    const form = activityForms[activity.id] || {};
    const status = form.status || "PENDING";
    const actualNote = (form.actualNote || "").trim();

    if (status === "CHANGED" && (!form.actualStartTime || !actualNote)) {
      alert("Khi chọn Có thay đổi, vui lòng nhập thời gian thực tế và nội dung thay đổi.");
      return;
    }

    if (status === "SKIPPED" && !actualNote) {
      alert("Vui lòng nhập lý do khi bỏ qua hoạt động.");
      return;
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
        trackingDetail.id,
        activity.id,
        payload,
      );
      const nextDetail = response.data || response;

      setTrackingDetail(nextDetail);
      setActivityForms(buildActivityForms(nextDetail));
      await loadDashboardData(false);
      alert("Đã cập nhật tình trạng hoạt động.");
    } catch (error) {
      console.error("Lỗi cập nhật timeline tour:", error);
      alert(error?.response?.data?.message || "Không thể cập nhật tình trạng hoạt động.");
    } finally {
      setSavingActivityId(null);
    }
  };

  
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống điều hành?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const filteredBookings = bookings.filter(b => 
    (b.bookingCode && b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.customer && b.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.tourName && b.tourName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  const trackingProgress = getScheduleProgress(trackingDetail);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang đồng bộ cơ sở dữ liệu Tây Bắc Travel...</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="admin-sidebar">
        <div className="sidebar-top">
          <div className="brand-logo-area">
            <div className="logo-box">TB</div>
            <div>
              <h1 className="brand-title">Tây Bắc Travel</h1>
              <span className="brand-sub">WORKPLACE</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              onClick={() => setActiveTab("overview")}
              className={activeTab === "overview" ? "active-nav-btn" : ""}
            >
              <Grid3X3 /> <span>Tổng quan công việc</span>
            </button>
            <button 
              onClick={() => setActiveTab("bookings")}
              className={activeTab === "bookings" ? "active-nav-btn" : ""}
            >
              <Calendar /> <span>Quản lý Đặt chỗ</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-user-footer">
          <div className="user-profile-brief">
            <div className="user-avatar-circle">{employeeInfo.name.charAt(0)}</div>
            <div className="user-info-text">
              <p className="user-name">{employeeInfo.name}</p>
              <p className="user-role">{employeeInfo.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut /> <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <main className="admin-main-content">
        <header className="main-header">
          <div>
            <span className="header-subtitle">Khu vực tác nghiệp</span>
            <h2 className="header-title">
              {activeTab === "overview" ? "Bảng thống kê tổng quan" : "Danh sách quản lý điều hành đặt chỗ"}
            </h2>
          </div>
          <div className="header-right-user">
            <span>Xin chào, <b className="highlight-green">{employeeInfo.name}</b></span>
          </div>
        </header>

        <div className="main-body-container">
          
          {/* KHỐI THẺ SỐ LIỆU THỐNG KÊ */}
          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <span className="stat-label">Tổng Đơn Hệ Thống</span>
                <span className="stat-value text-white">{stats.totalBookings}</span>
              </div>
              <div className="stat-icon icon-blue"><Calendar /></div>
            </div>

            <div className="stat-card">
              <div>
                <span className="stat-label">Chờ Xác Nhận</span>
                <span className="stat-value text-amber">{stats.confirmedBookings ?? stats.pendingBookings}</span>
              </div>
              <div className="stat-icon icon-amber pulse"><Clock /></div>
            </div>

            <div className="stat-card">
              <div>
                <span className="stat-label">Đã Xác Nhận</span>
                <span className="stat-value text-green">
                  {bookings.filter(b => b.status === "CONFIRMED").length}
                </span>
              </div>
              <div className="stat-icon icon-green"><CheckCircle /></div>
            </div>

          </div>

          {/* TABLE QUẢN LÝ ĐẶT CHỖ */}
          {activeTab === "bookings" && (
            <div className="data-table-container">
              <div className="table-filter-bar">
                <div className="search-box-wrapper">
                  <Search className="search-icon-inside" />
                  <input 
                    type="text" 
                    placeholder="Tìm mã đơn, khách hàng, tên tour..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-field"
                  />
                </div>
                <div className="filter-result-count">
                  Hiển thị kết quả lọc: <b>{filteredBookings.length}</b> đơn đặt
                </div>
              </div>

              <div className="table-responsive-wrapper">
                <table className="custom-admin-table">
                  <thead>
                    <tr>
                      <th>Mã Đơn</th>
                      <th>Khách Hàng</th>
                      <th>Thông Tin Tour</th>
                      <th>Ngày Đặt</th>
                      <th className="text-center">Số Chỗ</th>
                      <th>Tổng Tiền</th>
                      <th className="text-center">Trạng Thái</th>
                      <th className="text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="font-mono-code">{booking.bookingCode}</td>
                          <td>
                            <div className="customer-main-name">{booking.customer}</div>
                            <div className="customer-sub-phone">{booking.phone}</div>
                          </td>
                          <td className="max-width-cell">
                            <div className="truncate-text" title={booking.tourName}>{booking.tourName}</div>
                          </td>
                          <td className="whitespace-nowrap-text">
                            {new Date(booking.date).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="text-center">
                            <span className="badge-slots">{booking.slots} Vé</span>
                          </td>
                          <td className="price-text-highlight">{formatVND(booking.totalPrice)}</td>
                          <td className="text-center">
                            <span className={`status-badge ${getBookingStatusClass(booking.status)}`}>
                              {getBookingStatusLabel(booking.status)}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="actions-buttons-flex">
                              <button
                                type="button"
                                onClick={() => openTrackingDetail(booking.id)}
                                disabled={
                                  trackingLoading ||
                                  booking.status === "PENDING" ||
                                  booking.status === "CANCELLED"
                                }
                                className="track-tour-btn"
                                title={
                                  booking.status === "PENDING"
                                    ? "Chờ admin xác nhận tour"
                                    : "Theo dõi timeline tour"
                                }
                              >
                                {trackingLoading ? <Loader2 /> : <Eye />}
                                <span>Theo dõi</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="empty-row-text">
                          Không tìm thấy đơn đặt chỗ nào trong cơ sở dữ liệu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB OVERVIEW */}
          {activeTab === "overview" && (
            <div className="overview-info-card">
              <h3 className="overview-card-title">
                <MapPin /> Chào mừng bạn làm việc tại văn phòng điều hành Sơn La Travel!
              </h3>
              <p className="overview-card-desc">
                Đây là khu vực dành riêng cho nhân viên điều phối của hệ thống Tây Bắc Travel. Hệ thống tự động đồng bộ hóa toàn bộ dữ liệu đặt chỗ từ phía khách hàng về Database theo thời gian thực. Hãy kiểm tra các đơn đăng ký liên tục để vận hành tour diễn ra tốt đẹp.
              </p>
            </div>
          )}

        </div>
      </main>

      {trackingDetail && (
        <div className="tracking-modal-backdrop">
          <section className="tracking-modal">
            <header className="tracking-modal-header">
              <div>
                <span className="header-subtitle">Timeline tour được phân công</span>
                <div className="tracking-title-row">
                  <Activity />
                  <h2 className="tracking-title">
                    {trackingDetail.tourName}
                  </h2>
                </div>
                <p className="tracking-subtitle">
                  {trackingDetail.bookingCode} · {trackingDetail.customerName} · {formatDate(trackingDetail.departureDate)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingDetail(null)}
                className="tracking-close-btn"
                title="Đóng timeline"
              >
                <XCircle />
              </button>
            </header>

            <div className="tracking-modal-body">
              <div className="tracking-summary-grid">
                <div className="tracking-summary-card">
                  <span>Trạng thái tour</span>
                  <b>{getBookingStatusLabel(trackingDetail.status)}</b>
                </div>
                <div className="tracking-summary-card">
                  <span>Khởi hành</span>
                  <b>
                    {formatDate(trackingDetail.departureDate)}
                    {trackingDetail.departureTime
                      ? ` ${formatTime(trackingDetail.departureTime)}`
                      : ""}
                    </b>
                </div>
                <div className="tracking-summary-card">
                  <span>Điểm xuất phát / đón khách</span>
                  <b>{trackingDetail.departureLocation || "Chưa cập nhật"}</b>
                  <small>{trackingDetail.pickupAddress || "Chưa có địa chỉ đón riêng"}</small>
                </div>
                <div className="tracking-summary-card">
                  <span>Đã xác nhận lúc</span>
                  <b>{formatDateTime(trackingDetail.confirmedAt)}</b>
                </div>
              </div>

              <div className="tracking-progress-box">
                <div className="tracking-progress-top">
                  <span>Tiến độ lịch trình</span>
                  <b>{trackingProgress.percent}%</b>
                </div>
                <div className="tracking-progress-bar">
                  <div style={{ width: `${trackingProgress.percent}%` }} />
                </div>
                <p>
                  {trackingProgress.finished}/{trackingProgress.total} hoạt động đã được cập nhật.
                </p>
              </div>

              <div className="tracking-days">
                {trackingDetail.scheduleDays?.map((day) => (
                  <div key={day.id} className="tracking-day">
                    <div className="tracking-day-heading">
                      <span>Ngày {day.dayNumber} · {formatDate(day.scheduleDate)}</span>
                      <h3>{day.title}</h3>
                      {day.description && <p>{day.description}</p>}
                    </div>

                    <div className="tracking-activity-list">
                      {day.activities?.length > 0 ? (
                        day.activities.map((activity) => {
                          const form = activityForms[activity.id] || {};
                          const currentStatus = form.status || activity.status || "PENDING";
                          const isSaving = savingActivityId === activity.id;
                          const isPendingForm = currentStatus === "PENDING";

                          return (
                            <article key={activity.id} className="tracking-activity-card">
                              <div className="tracking-activity-main">
                                <div className="tracking-scheduled-time">
                                  <Clock />
                                  <span>
                                    {formatTime(activity.startTime)}
                                    {activity.endTime
                                      ? ` - ${formatTime(activity.endTime)}`
                                      : ""}
                                  </span>
                                </div>
                                <div className="tracking-activity-text">
                                  <h4>{activity.title}</h4>
                                  {activity.description && <p>{activity.description}</p>}
                                  {activity.updatedByEmployeeName && (
                                    <small>
                                      Cập nhật bởi {activity.updatedByEmployeeName} · {formatDateTime(activity.updatedAt)}
                                    </small>
                                  )}
                                </div>
                                <Badge
                                  meta={getMeta(scheduleActivityStatusMeta, activity.status)}
                                />
                              </div>

                              <div className="tracking-activity-form">
                                <button
                                  type="button"
                                  className="quick-done-btn"
                                  onClick={() => {
                                    const now = getLocalDateTimeInputValue();
                                    updateActivityForm(activity.id, {
                                      status: "DONE",
                                      actualEndTime: form.actualEndTime || now,
                                    });
                                  }}
                                >
                                  <CheckCircle />
                                  Tích hoàn thành
                                </button>

                                <label>
                                  <span>Trạng thái</span>
                                  <select
                                    value={currentStatus}
                                    onChange={(event) => {
                                      const nextStatus = event.target.value;
                                      const now = getLocalDateTimeInputValue();
                                      const patch = { status: nextStatus };

                                      if (
                                        ["DONE", "CHANGED"].includes(nextStatus) &&
                                        !form.actualStartTime
                                      ) {
                                        patch.actualStartTime = now;
                                      }

                                      if (
                                        ["DONE", "CHANGED", "SKIPPED"].includes(nextStatus) &&
                                        !form.actualEndTime
                                      ) {
                                        patch.actualEndTime = now;
                                      }

                                      updateActivityForm(activity.id, patch);
                                    }}
                                  >
                                    {scheduleActivityStatuses.map((status) => (
                                      <option key={status.value} value={status.value}>
                                        {status.label}
                                      </option>
                                    ))}
                                  </select>
                                </label>

                                <label>
                                  <span>Thời gian bắt đầu thực tế</span>
                                  <input
                                    type="datetime-local"
                                    value={form.actualStartTime || ""}
                                    onChange={(event) =>
                                      updateActivityForm(activity.id, {
                                        actualStartTime: event.target.value,
                                      })
                                    }
                                    disabled={isPendingForm}
                                  />
                                </label>

                                <label>
                                  <span>Thời gian kết thúc/ghi nhận</span>
                                  <input
                                    type="datetime-local"
                                    value={form.actualEndTime || ""}
                                    onChange={(event) =>
                                      updateActivityForm(activity.id, {
                                        actualEndTime: event.target.value,
                                      })
                                    }
                                    disabled={isPendingForm}
                                  />
                                </label>

                                <label>
                                  <span>Địa điểm thực tế</span>
                                  <input
                                    type="text"
                                    value={form.actualLocation || ""}
                                    onChange={(event) =>
                                      updateActivityForm(activity.id, {
                                        actualLocation: event.target.value,
                                      })
                                    }
                                    placeholder="Ví dụ: Nhà tù Sơn La"
                                    disabled={isPendingForm}
                                  />
                                </label>

                                <label className="tracking-note-field">
                                  <span>
                                    Nội dung thay đổi / ghi chú
                                    {currentStatus === "CHANGED" || currentStatus === "SKIPPED"
                                      ? " *"
                                      : ""}
                                  </span>
                                  <textarea
                                    value={form.actualNote || ""}
                                    onChange={(event) =>
                                      updateActivityForm(activity.id, {
                                        actualNote: event.target.value,
                                      })
                                    }
                                    rows={3}
                                    placeholder="Ghi rõ thay đổi, lý do hoặc tình trạng thực tế..."
                                    disabled={isPendingForm}
                                  />
                                </label>

                                <div className="tracking-save-row">
                                  <button
                                    type="button"
                                    onClick={() => submitActivityUpdate(activity)}
                                    disabled={isSaving}
                                    className="save-activity-btn"
                                  >
                                    {isSaving ? <Loader2 className="spin-icon" /> : <Save />}
                                    Lưu tình trạng
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })
                      ) : (
                        <div className="tracking-empty-day">
                          Ngày này chưa có hoạt động trong lịch trình.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
