import { Link, NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Compass,
  Home,
  LogOut,
  Map,
  MapPinned,
  Mountain,
  TicketCheck,
  UsersRound,
} from "lucide-react";
import { logout } from "../utils/auth";

const navItems = [
  { to: "/admin", label: "Dashboard", Icon: BarChart3, end: true },
  { to: "/admin/staff", label: "Nhân viên", Icon: UsersRound },
  { to: "/admin/provinces", label: "Tỉnh thành", Icon: Map },
  { to: "/admin/districts", label: "Quận huyện", Icon: Compass },
  { to: "/admin/locations", label: "Địa điểm", Icon: MapPinned },
  { to: "/admin/tours", label: "Tour", Icon: Mountain },
  { to: "/admin/bookings", label: "Booking", Icon: TicketCheck },
];

const navClass = ({ isActive }) =>
  [
    "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition",
    isActive
      ? "bg-[#7FB77E] text-[#06130d] shadow-lg shadow-[#7FB77E]/20"
      : "text-slate-300 hover:bg-white/10 hover:text-[#f8fafc]",
  ].join(" ");

export default function AdminLayout() {
  return (
    <div className="admin-shell flex h-screen bg-[#f8fafc] text-slate-900">
      <aside className="admin-sidebar flex w-[260px] shrink-0 flex-col border-r border-slate-800 bg-[#0f172a] px-4 py-5 text-[#f8fafc]">
        <Link
          to="/admin"
          className="mb-6 block rounded-2xl border border-white/10 bg-white/[0.04] p-3"
        >
          <img
            src="/logo-main-tay-bac.png"
            alt="Tây Bắc Travel"
            className="h-20 w-full object-contain drop-shadow-[0_10px_22px_rgba(127,183,126,0.35)]"
          />
        </Link>

        <div className="mb-3 px-3 text-xs font-black uppercase tracking-[0.22em] text-[#d4a878]">
          Quản trị
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navClass}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
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

      <main className="min-w-0 flex-1 overflow-auto bg-[#f8fafc]">
        <Outlet />
      </main>
    </div>
  );
}
