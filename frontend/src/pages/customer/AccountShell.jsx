import { Link, NavLink } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import PublicLayout from "../public/PublicLayout";

const navItems = [
  { to: "/tai-khoan", label: "Tổng quan", Icon: LayoutDashboard },
  { to: "/tai-khoan/thong-tin", label: "Thông tin cá nhân", Icon: UserRound },
  { to: "/tai-khoan/booking", label: "Lịch sử booking", Icon: CalendarDays },
];

export default function AccountShell({
  title,
  description,
  children,
  actions,
}) {
  return (
    <PublicLayout>
      <section className="account-shell min-h-[calc(100vh-80px)] bg-[#020617] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-[#7FB77E]/10">
            <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className="section-tag">
                  <ShieldCheck size={12} /> Tài khoản khách hàng
                </span>
                <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  {title}
                </h1>
                {description && (
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                    {description}
                  </p>
                )}
              </div>
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>

            <nav className="flex gap-2 overflow-x-auto border-t border-white/10 px-5 py-3 sm:px-7">
              {navItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/tai-khoan"}
                  className={({ isActive }) =>
                    [
                      "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-black transition",
                      isActive
                        ? "bg-[#7FB77E] text-[#020617] shadow-soft-green"
                        : "border border-white/10 bg-white/[0.04] text-slate-200 hover:border-[#7FB77E]/40 hover:bg-[#7FB77E]/10",
                    ].join(" ")
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
              <Link
                to="/tours"
                className="ml-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-slate-200 transition hover:border-[#7FB77E]/40 hover:bg-[#7FB77E]/10"
              >
                <ClipboardList size={17} />
                Xem tour
              </Link>
            </nav>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </section>
    </PublicLayout>
  );
}
