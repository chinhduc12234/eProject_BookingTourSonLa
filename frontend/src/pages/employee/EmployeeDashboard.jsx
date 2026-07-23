import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Grid3X3,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { employeeApi } from "../../api/bookingApi";
import { DepartureTypeBadge } from "../admin/bookingShared";
import { getAuthName, logout } from "../../utils/auth";
import "./EmployeeDashboard.css";

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

const getOperationStatus = (bookings) => {
  const activeBookings = bookings.filter((booking) => booking.status !== "CANCELLED");

  if (activeBookings.length === 0) return "CANCELLED";
  if (activeBookings.every((booking) => booking.status === "COMPLETED")) return "COMPLETED";
  if (activeBookings.some((booking) => booking.status === "IN_PROGRESS")) return "IN_PROGRESS";
  if (activeBookings.some((booking) => booking.status === "CONFIRMED")) return "CONFIRMED";
  return "PENDING";
};

const groupBookingsForOperation = (bookings) => {
  const groups = new Map();

  bookings.forEach((booking) => {
    const isPrivate = booking.bookingType === "PRIVATE" || booking.privateDeparture;
    const key = !isPrivate && booking.departureId
      ? `departure-${booking.departureId}`
      : `booking-${booking.id}`;
    groups.set(key, [...(groups.get(key) || []), booking]);
  });

  return [...groups.values()].map((group) => {
    const activeBookings = group.filter((booking) => booking.status !== "CANCELLED");
    const representative = activeBookings[0] || group[0];
    const isGroupTour = !(
      representative.bookingType === "PRIVATE" || representative.privateDeparture
    );
    const customerNames = [...new Set(group.map((booking) => booking.customer || booking.customerName).filter(Boolean))];
    const totalPeople = activeBookings.reduce(
      (sum, booking) => sum + Number(booking.totalPeople || booking.slots || 0),
      0,
    );

    return {
      ...representative,
      status: getOperationStatus(group),
      totalPeople,
      slots: totalPeople,
      adultCount: activeBookings.reduce((sum, booking) => sum + Number(booking.adultCount || 0), 0),
      childCount: activeBookings.reduce((sum, booking) => sum + Number(booking.childCount || 0), 0),
      totalPrice: activeBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
      isGroupTour,
      groupBookingCount: group.length,
      activeBookingCount: activeBookings.length,
      customerSummary: customerNames.join(", "),
      bookingCodes: group.map((booking) => booking.bookingCode).filter(Boolean),
      customer: customerNames.join(", "),
      phone: isGroupTour
        ? group.map((booking) => booking.bookingCode).filter(Boolean).join(" · ")
        : representative.phone,
    };
  });
};

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [employeeInfo, setEmployeeInfo] = useState({
    name: getAuthName() || "Nhân viên",
    role: "Nhân viên điều hành",
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setLoadError("");
      setEmployeeInfo({
        name: getAuthName() || "Nhân viên",
        role: "Nhân viên điều hành",
      });

      const [bookingsRes, statsRes] = await Promise.all([
        employeeApi.getEmployeeBookings(),
        employeeApi.getDashboardStats(),
      ]);

      setBookings(bookingsRes.data || bookingsRes);
      setStats(statsRes.data || statsRes);
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu nhân viên:", error);
      setLoadError(
        error?.response?.data?.message || "Không thể tải dữ liệu được phân công.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadDashboardData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống điều hành?")) {
      logout();
    }
  };

  const operationTours = groupBookingsForOperation(bookings);

  const filteredBookings = operationTours.filter((booking) => {
    const keyword = searchTerm.toLowerCase();
    const customerName = booking.customerSummary || booking.customerName || booking.customer || "";
    const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;
    return matchesStatus && (
      booking.bookingCodes?.some((code) => code?.toLowerCase().includes(keyword)) ||
      booking.bookingCode?.toLowerCase().includes(keyword) ||
      customerName.toLowerCase().includes(keyword) ||
      (booking.tourName || "").toLowerCase().includes(keyword)
    );
  });

  const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);

  const completedCount =
    stats.completedBookings ??
    operationTours.filter((booking) => booking.status === "COMPLETED").length;

  const activeCount = operationTours.filter((booking) =>
    ["CONFIRMED", "IN_PROGRESS"].includes(booking.status),
  ).length;
  const privateDepartureCount = operationTours.filter(
    (booking) => booking.privateDeparture,
  ).length;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang đồng bộ dữ liệu Tây Bắc Travel...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="loading-screen" role="alert">
        <ShieldCheck size={44} />
        <p>{loadError}</p>
        <button type="button" className="logout-btn" onClick={loadDashboardData}>
          <RefreshCw size={17} /> Thử tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="employee-shell">
      <aside className="employee-sidebar">
        <div className="sidebar-top">
            <div className="brand-logo-area">
            <div className="logo-box">
              <img src="/logo-main-tay-bac.png" alt="" aria-hidden="true" />
            </div>
            <div>
              <h1 className="brand-title">Tây Bắc Travel</h1>
              <span className="brand-sub">KHU ĐIỀU HÀNH</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={activeTab === "overview" ? "active-nav-btn" : ""}
              aria-pressed={activeTab === "overview"}
            >
              <Grid3X3 /> <span>Tổng quan công việc</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bookings")}
              className={activeTab === "bookings" ? "active-nav-btn" : ""}
              aria-pressed={activeTab === "bookings"}
            >
              <Calendar /> <span>Quản lý đặt chỗ</span>
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
          <button type="button" onClick={handleLogout} className="logout-btn">
            <LogOut /> <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        <header className="main-header">
          <div>
            <span className="header-subtitle">Khu vực tác nghiệp</span>
            <h2 className="header-title">
              {activeTab === "overview"
                ? "Bảng thống kê tổng quan"
                : "Danh sách điều hành đơn đặt tour"}
            </h2>
          </div>
          <div className="employee-header-actions">
            <span className="employee-data-chip">
              <span aria-hidden="true" /> Dữ liệu được phân công
            </span>
            <button
              type="button"
              onClick={loadDashboardData}
              className="employee-refresh-btn"
              aria-label="Làm mới dữ liệu điều hành"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={17} />
            </button>
            <div className="header-right-user">
              Xin chào, <b className="highlight-green">{employeeInfo.name}</b>
            </div>
          </div>
        </header>

        <div className="main-body-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <span className="stat-label">Tổng đơn được gán</span>
                <span className="stat-value text-white">{stats.totalBookings}</span>
              </div>
              <div className="stat-icon icon-blue">
                <Calendar />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <span className="stat-label">Cần theo dõi</span>
                <span className="stat-value text-amber">
                  {activeCount}
                </span>
              </div>
              <div className="stat-icon icon-amber pulse">
                <Clock />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <span className="stat-label">Tour riêng</span>
                <span className="stat-value text-green">
                  {privateDepartureCount}
                </span>
              </div>
              <div className="stat-icon icon-green">
                <ShieldCheck />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <span className="stat-label">Đã hoàn thành</span>
                <span className="stat-value text-green">
                  {completedCount}
                </span>
              </div>
              <div className="stat-icon icon-green">
                <CheckCircle />
              </div>
            </div>
          </div>

          {activeTab === "bookings" && (
            <div className="data-table-container">
              <div className="table-filter-bar">
                <div className="search-box-wrapper">
                  <Search className="search-icon-inside" aria-hidden="true" />
                  <input
                    type="text"
                    aria-label="Tìm booking được phân công"
                    placeholder="Tìm mã đơn, khách hàng, tên tour..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="search-input-field"
                  />
                </div>
                <div className="employee-filter-actions">
                  <label>
                    <span className="sr-only">Lọc trạng thái booking</span>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="employee-status-filter"
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="PENDING">Chờ xác nhận</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="IN_PROGRESS">Đang đi tour</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </label>
                  <div className="filter-result-count">
                    Hiển thị: <b>{filteredBookings.length}</b> đơn
                  </div>
                </div>
              </div>

              <div className="table-responsive-wrapper">
                <table className="custom-admin-table">
                  <caption className="sr-only">
                    Danh sách booking và tour đang được phân công cho nhân viên
                  </caption>
                  <thead>
                    <tr>
                      <th>Đơn & khách</th>
                      <th>Tour & lịch</th>
                      <th className="text-center">Số người</th>
                      <th>Tổng tiền</th>
                      <th className="text-center">Trạng thái</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td data-label="Đơn & khách">
                            <div className="font-mono-code">
                              {booking.isGroupTour
                                ? `TOUR GHÉP · ${booking.activeBookingCount}/${booking.groupBookingCount} đơn`
                                : booking.bookingCode}
                            </div>
                            <div className="customer-main-name">
                              {booking.customerName || booking.customer || "Khách hàng"}
                            </div>
                            <div className="customer-sub-phone">
                              {booking.phone || booking.email || "Chưa có liên hệ"}
                            </div>
                          </td>
                          <td data-label="Tour & lịch" className="max-width-cell">
                            <div className="truncate-text" title={booking.tourName}>
                              {booking.tourName}
                            </div>
                            <div className="booking-tour-meta">
                              <DepartureTypeBadge booking={booking} />
                              <span className="date-chip">
                                {booking.departureDate
                                  ? new Date(booking.departureDate).toLocaleDateString("vi-VN")
                                  : booking.date
                                    ? new Date(booking.date).toLocaleDateString("vi-VN")
                                    : "Chưa cập nhật"}
                              </span>
                            </div>
                          </td>
                          <td data-label="Số người" className="text-center">
                            <span className="badge-slots">
                              {booking.totalPeople || booking.slots || 0} khách
                            </span>
                            <div className="people-breakdown">
                              NL {booking.adultCount || 0} · TE {booking.childCount || 0}
                            </div>
                          </td>
                          <td data-label="Tổng tiền" className="price-text-highlight">
                            {formatVND(booking.totalPrice)}
                          </td>
                          <td data-label="Trạng thái" className="text-center">
                            <span
                              className={`status-badge ${getBookingStatusClass(
                                booking.status,
                              )}`}
                            >
                              {getBookingStatusLabel(booking.status)}
                            </span>
                          </td>
                          <td data-label="Thao tác" className="text-center">
                            <div className="actions-buttons-flex">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/employee/bookings/${booking.id}/timeline`)
                                }
                                disabled={
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
                                <Eye />
                                <span>Theo dõi tour</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="empty-row-text">
                          Không tìm thấy đơn đặt chỗ nào trong dữ liệu được phân công.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="overview-info-card">
              <h3 className="overview-card-title">
                <MapPin /> Chào mừng bạn làm việc tại khu vực điều hành tour!
              </h3>
              <p className="overview-card-desc">
                Đây là khu vực dành cho nhân viên điều phối. Hãy mở từng đơn được
                phân công để theo dõi timeline tour, ghi nhận thay đổi thực tế và
                hoàn tất lịch trình sau chuyến đi.
              </p>
              <div className="employee-workflow-grid">
                {[
                  ["01", "Nhận phân công", "Chỉ xử lý các booking được admin giao"],
                  ["02", "Cập nhật thực tế", "Ghi trạng thái, thời gian và minh chứng"],
                  ["03", "Hoàn tất tour", "Chỉ hoàn thành khi mọi hoạt động đã xử lý"],
                ].map(([step, title, description]) => (
                  <div key={step} className="employee-workflow-step">
                    <span>{step}</span>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
