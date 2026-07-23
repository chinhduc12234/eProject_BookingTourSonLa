import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  CalendarRange,
  ChartPie,
  Compass,
  Home,
  LogOut,
  Map,
  MapPinned,
  Menu,
  Mountain,
  TicketCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { getAuthName, logout } from "../utils/auth";

const navGroups = [
  {
    key: "overview",
    label: "Tổng quan",
    description: "Theo dõi và báo cáo",
    items: [
      { to: "/admin", label: "Bảng điều khiển", Icon: BarChart3, end: true },
      { to: "/admin/statistics", label: "Thống kê & báo cáo", Icon: ChartPie },
    ],
  },
  {
    key: "operations",
    label: "Điều hành tour",
    description: "Xử lý các đoàn",
    items: [
      { to: "/admin/group-tours", label: "Đoàn tour ghép", Icon: CalendarRange },
      { to: "/admin/bookings", label: "Đơn tour riêng", Icon: TicketCheck },
    ],
  },
  {
    key: "catalog",
    label: "Sản phẩm du lịch",
    description: "Tour và điểm đến",
    items: [
      { to: "/admin/tours", label: "Danh sách tour", Icon: Mountain },
      { to: "/admin/locations", label: "Điểm tham quan", Icon: MapPinned },
    ],
  },
  {
    key: "organization",
    label: "Tổ chức & địa bàn",
    description: "Nhân sự và khu vực",
    items: [
      { to: "/admin/staff", label: "Nhân sự", Icon: UsersRound },
      { to: "/admin/provinces", label: "Tỉnh / Thành phố", Icon: Map },
      { to: "/admin/districts", label: "Quận / Huyện", Icon: Compass },
    ],
  },
];

const navClass = ({ isActive }) =>
  [
    "admin-nav-link relative flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition",
    isActive
      ? "is-active bg-[#7FB77E] text-[#06130d] shadow-lg shadow-[#7FB77E]/20"
      : "text-slate-300 hover:bg-white/10 hover:text-[#f8fafc]",
  ].join(" ");

const groupContainsPath = (group, pathname) =>
  group.items.some((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  );

export default function AdminLayout() {
  const adminName = getAuthName() || "Quản trị viên";
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="admin-shell flex h-screen overflow-hidden text-slate-900">
      <header className="admin-mobile-header">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="admin-mobile-menu-button"
          aria-label="Mở điều hướng quản trị"
          aria-expanded={mobileMenuOpen}
          aria-controls="admin-sidebar"
        >
          <Menu size={21} />
        </button>

        <Link to="/admin" className="admin-mobile-brand" aria-label="Tây Bắc Travel - Tổng quan quản trị">
          <img src="/logo-main-tay-bac.png" alt="" aria-hidden="true" />
          <span>
            <strong>Tây Bắc Travel</strong>
            <small>Trung tâm điều hành</small>
          </span>
        </Link>

        <span className="admin-mobile-avatar" title={adminName} aria-label={`Quản trị viên ${adminName}`}>
          {adminName.trim().charAt(0).toUpperCase()}
        </span>
      </header>

      {mobileMenuOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Đóng điều hướng quản trị"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`admin-sidebar flex w-[260px] shrink-0 flex-col border-r border-slate-800 bg-[#0f172a] px-4 py-5 text-[#f8fafc]${mobileMenuOpen ? " is-mobile-open" : ""}`}
      >
        <button
          type="button"
          className="admin-mobile-close"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Đóng điều hướng quản trị"
        >
          <X size={20} />
        </button>

        <Link
          to="/admin"
          className="admin-brand-card mb-6 block rounded-2xl border border-white/10 bg-white/[0.04] p-3"
        >
          <img
            src="/logo-main-tay-bac.png"
            alt="Tây Bắc Travel"
            className="h-20 w-full object-contain drop-shadow-[0_10px_22px_rgba(127,183,126,0.35)]"
          />
          <span className="admin-brand-caption mt-1 block text-center text-[10px] font-black uppercase tracking-[0.22em] text-[#d4a878]">
            Trung tâm điều hành
          </span>
        </Link>

        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d4a878]">
            Khu vực quản trị
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
            4 nhóm
          </span>
        </div>

        <nav
          className="admin-nav flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
          aria-label="Điều hướng quản trị"
        >
          {navGroups.map((group) => {
            const active = groupContainsPath(group, pathname);
            const headingId = `admin-nav-group-${group.key}`;

            return (
              <section
                key={group.key}
                className={`admin-nav-group${active ? " is-active" : ""}`}
                aria-labelledby={headingId}
              >
                <div className="admin-nav-group-heading" id={headingId}>
                  <span className="admin-nav-group-marker" aria-hidden="true" />
                  <span className="min-w-0">
                    <strong>{group.label}</strong>
                    <small>{group.description}</small>
                  </span>
                </div>

                <div className="admin-nav-group-items">
                  {group.items.map(({ to, label, Icon, end }) => (
                    <NavLink key={to} to={to} end={end} className={navClass}>
                      <Icon size={17} aria-hidden="true" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              </section>
            );
          })}
        </nav>

        <div className="admin-session-card mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
            <UserRound size={19} />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-sm text-white">{adminName}</strong>
            <small className="mt-0.5 block text-[10px] font-black uppercase tracking-[0.15em] text-[#d4a878]">
              Phiên quản trị
            </small>
          </span>
        </div>

        <div className="admin-sidebar-footer mt-6 space-y-2 border-t border-white/10 pt-4">
          <Link
            to="/"
            className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-[#f8fafc]"
          >
            <Home size={18} />
            <span>Về website</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-rose-200 transition hover:bg-rose-400/10 hover:text-rose-100"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="admin-main min-w-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
