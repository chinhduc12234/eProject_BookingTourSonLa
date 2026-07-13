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
  Search,
  ShieldCheck,
} from "lucide-react";
import { employeeApi } from "../../api/bookingApi";
import { DepartureTypeBadge } from "../admin/bookingShared";
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

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [employeeInfo, setEmployeeInfo] = useState({
    name: "Nhân viên",
    role: "Nhân viên điều hành",
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setEmployeeInfo({
          name:
            parsedUser.fullName ||
            parsedUser.name ||
            parsedUser.username ||
            "Nhân viên",
          role:
            parsedUser.role === "ROLE_ADMIN"
              ? "Quản trị viên"
              : "Nhân viên điều hành",
        });
      }

      const [bookingsRes, statsRes] = await Promise.all([
        employeeApi.getEmployeeBookings(),
        employeeApi.getDashboardStats(),
      ]);

      setBookings(bookingsRes.data || bookingsRes);
      setStats(statsRes.data || statsRes);
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu nhân viên:", error);
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const keyword = searchTerm.toLowerCase();
    const customerName = booking.customerName || booking.customer || "";
    return (
      booking.bookingCode?.toLowerCase().includes(keyword) ||
      customerName.toLowerCase().includes(keyword) ||
      booking.tourName?.toLowerCase().includes(keyword)
    );
  });

  const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);

  const completedCount =
    stats.completedBookings ??
    bookings.filter((booking) => booking.status === "COMPLETED").length;

  const activeCount = bookings.filter((booking) =>
    ["CONFIRMED", "IN_PROGRESS"].includes(booking.status),
  ).length;
  const privateDepartureCount = bookings.filter(
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

  return (
    <div className="employee-shell">
      <aside className="employee-sidebar">
        <div className="sidebar-top">
          <div className="brand-logo-area">
            <div className="logo-box">TB</div>
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
            >
              <Grid3X3 /> <span>Tổng quan công việc</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bookings")}
              className={activeTab === "bookings" ? "active-nav-btn" : ""}
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
          <div className="header-right-user">
            Xin chào, <b className="highlight-green">{employeeInfo.name}</b>
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
                  <Search className="search-icon-inside" />
                  <input
                    type="text"
                    placeholder="Tìm mã đơn, khách hàng, tên tour..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
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
                            <div className="font-mono-code">{booking.bookingCode}</div>
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
