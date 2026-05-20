import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Mountain, Phone, X } from "lucide-react";
import { brand, navLinks } from "./publicContent";

const navClass = ({ isActive }) =>
    [
        "px-3 py-2 text-sm font-semibold transition-colors",
        isActive ? "text-[#7FB77E]" : "text-slate-200 hover:text-white",
    ].join(" ");

export default function PublicLayout({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/95 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#7FB77E] text-[#020617]">
                            <Mountain size={24} strokeWidth={2.5} />
                        </span>
                        <span>
                            <span className="block text-lg font-black leading-5 text-white">{brand.displayName}</span>
                            <span className="block text-xs font-medium text-[#A67C52]">Booking tour du lịch Tây Bắc</span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {navLinks.map((item) => (
                            <NavLink key={item.to} to={item.to} className={navClass} end={item.to === "/"}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        <a
                            href={`tel:${brand.phone.replace(/\s/g, "")}`}
                            className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-bold text-white hover:border-[#7FB77E]/60"
                        >
                            <Phone size={17} />
                            {brand.phone}
                        </a>
                        <Link
                            to="/login"
                            className="inline-flex h-11 items-center rounded-lg bg-[#7FB77E] px-5 text-sm font-black text-[#020617] hover:bg-[#9de09c]"
                        >
                            Đăng nhập
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
                        aria-label="Mở menu"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {open && (
                    <div className="border-t border-white/10 bg-[#020617] px-4 py-4 md:hidden">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === "/"}
                                    onClick={() => setOpen(false)}
                                    className={navClass}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                            <Link
                                to="/login"
                                onClick={() => setOpen(false)}
                                className="mt-3 inline-flex h-11 items-center justify-center rounded-lg bg-[#7FB77E] px-5 text-sm font-black text-[#020617]"
                            >
                                Đăng nhập
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <main>{children}</main>

            <footer className="border-t border-white/10 bg-[#04120d]">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7FB77E] text-[#020617]">
                                <Mountain size={22} />
                            </span>
                            <span className="text-lg font-black text-white">{brand.displayName}</span>
                        </div>
                        <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                            Nền tảng booking tour du lịch Tây Bắc tập trung vào lịch trình rõ ràng, trải nghiệm địa phương
                            và dịch vụ đồng hành an toàn cho mỗi hành trình.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase text-white">Điều hướng</h3>
                        <div className="mt-4 flex flex-col gap-3">
                            {navLinks.map((item) => (
                                <Link key={item.to} to={item.to} className="text-sm text-slate-300 hover:text-[#7FB77E]">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase text-white">Liên hệ</h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-300">
                            <p>{brand.phone}</p>
                            <p>{brand.email}</p>
                            <p>{brand.address}</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
