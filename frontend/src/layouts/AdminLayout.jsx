import { Link, NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  CalendarRange,
  ChartPie,
  Compass,
  Home,
  LogOut,
  Map,
  MapPinned,
  Mountain,
  TicketCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { getAuthName, logout } from "../utils/auth";

const navItems = [
  { to: "/admin", label: "Tổng quan", Icon: BarChart3, end: true },
  { to: "/admin/group-tours", label: "Tour ghép", Icon: CalendarRange },
  { to: "/admin/bookings", label: "Đơn tour riêng", Icon: TicketCheck },
  { to: "/admin/statistics", label: "Thống kê", Icon: ChartPie },
  { to: "/admin/tours", label: "Tour", Icon: Mountain },
  { to: "/admin/staff", label: "Nhân viên", Icon: UsersRound },
  { to: "/admin/locations", label: "Địa điểm", Icon: MapPinned },
  { to: "/admin/provinces", label: "Tỉnh thành", Icon: Map },
  { to: "/admin/districts", label: "Quận huyện", Icon: Compass },
];

const navClass = ({ isActive }) =>
  [
    "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-all duration-150",
    isActive
      ? "bg-[#7FB77E] text-[#06130d] shadow-lg shadow-[#7FB77E]/20"
      : "text-slate-300 hover:translate-x-0.5 hover:bg-white/10 hover:text-[#f8fafc]",
  ].join(" ");

export default function AdminLayout() {
  const adminName = getAuthName() || "Quản trị viên";

  return (
    <div className="admin-shell flex h-screen overflow-hidden text-slate-900">
      <aside className="admin-sidebar flex w-[260px] shrink-0 flex-col border-r border-slate-800 bg-[#0f172a] px-4 py-5 text-[#f8fafc]">
        <Link
          to="/admin"
          className="admin-brand-card relative mb-6 block overflow-hidden rounded-2xl border border-white/10 p-3 shadow-lg shadow-black/20"
        >
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src="/images/taybac/moc-chau-hills.jpg"
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/70 via-[#0f172a]/88 to-[#0f172a]/95" />
          </div>
          <div className="relative">
            <img
              src="/logo-main-tay-bac.png"
              alt="Tây Bắc Travel"
              className="h-20 w-full object-contain drop-shadow-[0_10px_22px_rgba(127,183,126,0.35)]"
            />
            <span className="admin-brand-caption mt-1 block text-center text-[10px] font-black uppercase tracking-[0.22em] text-[#d4a878]">
              Trung tâm điều hành
            </span>
          </div>
        </Link>

        <div className="mb-3 flex items-center gap-2 px-3 text-xs font-black uppercase tracking-[0.22em] text-[#d4a878]">
          <span className="h-px flex-1 bg-white/10" />
          Quản trị
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <nav className="admin-nav flex flex-1 flex-col gap-1.5" aria-label="Điều hướng quản trị">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navClass}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-session-card mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 shadow-inner shadow-black/10">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c] ring-1 ring-inset ring-[#7FB77E]/20">
            <UserRound size={19} />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-sm text-white">{adminName}</strong>
            <small className="mt-0.5 block text-[10px] font-black uppercase tracking-[0.15em] text-[#d4a878]">
              Phiên quản trị
            </small>
          </span>
        </div>

        <div className="admin-sidebar-footer mt-6 space-y-1.5 border-t border-white/10 pt-4">
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
