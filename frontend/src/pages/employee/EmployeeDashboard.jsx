import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  Grid3X3,
  LogOut,
  MapPin,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { employeeApi } from "../../api/bookingApi";
import "./EmployeeDashboard.css";

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  // KHỞI TẠO ĐỐI TƯỢNG NHÂN VIÊN LẤY TỪ DATABASE ĐĂNG NHẬP
  const [employeeInfo, setEmployeeInfo] = useState({
    name: "Nhân viên",
    role: "Nhân viên điều hành"
  });

  const loadDashboardData = async () => {
    try {
      await Promise.resolve();
      setLoading(true);

      
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
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadDashboardData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

    const handleStatusChange = async (id, newStatus) => {
    const actionText = newStatus === "CONFIRMED" ? "DUYỆT" : "HỦY";
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} đơn đặt tour này?`)) {
      try {
        await employeeApi.updateBookingStatus(id, newStatus);
        alert(`Đã ${actionText} đơn đặt tour thành công!`);
        await loadDashboardData(); // Tải lại dữ liệu sau khi cập nhật thành công
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái đơn đặt:", error);
        alert("Thao tác thất bại, vui lòng kiểm tra lại kết nối Spring Boot!");
      }
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
                <span className="stat-label">Chờ Kiểm Duyệt</span>
                <span className="stat-value text-amber">{stats.pendingBookings}</span>
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

            <div className="stat-card">
              <div>
                <span className="stat-label">Doanh Thu Thực Tế</span>
                <span className="stat-value text-amber font-medium-size">{formatVND(stats.totalRevenue)}</span>
              </div>
              <div className="stat-icon icon-amber"><TrendingUp /></div>
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
                            {booking.status === "PENDING" && (
                              <span className="status-badge badge-pending">Chờ duyệt</span>
                            )}
                            {booking.status === "CONFIRMED" && (
                              <span className="status-badge badge-confirmed">Đã duyệt</span>
                            )}
                            {booking.status === "CANCELLED" && (
                              <span className="status-badge badge-cancelled">Đã hủy</span>
                            )}
                          </td>
                          <td className="text-center">
                            <div className="actions-buttons-flex">
                              {booking.status === "PENDING" ? (
                                <>
                                  <button onClick={() => handleStatusChange(booking.id, "CONFIRMED")} className="action-btn btn-success" title="Duyệt đơn">
                                    <CheckCircle />
                                  </button>
                                  <button onClick={() => handleStatusChange(booking.id, "CANCELLED")} className="action-btn btn-danger" title="Hủy đơn">
                                    <XCircle />
                                  </button>
                                </>
                              ) : (
                                <span className="completed-text">Hoàn tất</span>
                              )}
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
    </div>
  );
}
