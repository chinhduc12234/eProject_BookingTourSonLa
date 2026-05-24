import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Globe,
    Mail,
    MapPin,
    Menu,
    MessageCircle,
    Mountain,
    Phone,
    Send,
    Share2,
    X,
} from "lucide-react";
import { brand, navLinks } from "./publicContent";

const navClass = ({ isActive }) =>
    ["nav-link", isActive ? "is-active" : ""].join(" ").trim();

export default function PublicLayout({ children }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100">
            {/* HEADER */}
            <header
                className={[
                    "sticky top-0 z-50 transition-all duration-300",
                    scrolled
                        ? "border-b border-white/10 bg-[#020617]/85 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]"
                        : "border-b border-white/5 bg-gradient-to-b from-[#020617]/80 to-[#020617]/0 backdrop-blur-md",
                ].join(" ")}
            >
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="group flex items-center gap-3">
                        <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#9de09c] via-[#7FB77E] to-[#4f8f4d] text-[#020617] shadow-[0_8px_24px_-8px_rgba(127,183,126,0.7)]">
                            <span className="absolute inset-0 rounded-xl bg-[#7FB77E]/40 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <Mountain size={24} strokeWidth={2.5} className="relative" />
                        </span>
                        <span>
                            <span className="block text-lg font-black leading-5 text-white">
                                {brand.displayName}
                            </span>
                            <span className="block text-[11px] font-semibold tracking-widest text-[#d4a878]">
                                BOOKING TOUR TÂY BẮC
                            </span>
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
                            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white transition-all hover:border-[#7FB77E]/60 hover:bg-[#7FB77E]/10"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7FB77E]/20 text-[#9de09c] group-hover:bg-[#7FB77E]/30">
                                <Phone size={15} />
                            </span>
                            {brand.phone}
                        </a>
                        <Link to="/login" className="btn-primary px-5 text-sm">
                            Đăng nhập
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition hover:border-[#7FB77E]/60 hover:bg-[#7FB77E]/10 md:hidden"
                        aria-label="Mở menu"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-white/10 bg-[#020617]/95 px-4 py-4 backdrop-blur-xl md:hidden"
                    >
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
                                className="btn-primary mt-3 w-full"
                            >
                                Đăng nhập
                            </Link>
                        </div>
                    </motion.div>
                )}
            </header>

            <main>{children}</main>

            {/* FOOTER */}
            <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#04120d] via-[#04120d] to-[#020617]">
                <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#7FB77E]/10 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#A67C52]/10 blur-[120px]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Newsletter band */}
                    <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 backdrop-blur-md md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-10 mt-[-2rem] md:mt-[-3rem]">
                        <div>
                            <span className="section-tag">
                                <Send size={12} /> Nhận tin Tây Bắc
                            </span>
                            <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                                Đăng ký để nhận lịch tour, ưu đãi và bí kíp đi Tây Bắc.
                            </h3>
                        </div>
                        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                className="field-input flex-1"
                            />
                            <button type="submit" className="btn-primary whitespace-nowrap">
                                Đăng ký
                                <Send size={16} />
                            </button>
                        </form>
                    </div>

                    <div className="grid gap-12 py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#9de09c] via-[#7FB77E] to-[#4f8f4d] text-[#020617]">
                                    <Mountain size={22} />
                                </span>
                                <span className="text-lg font-black text-white">
                                    {brand.displayName}
                                </span>
                            </div>
                            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                                Nền tảng booking tour du lịch Tây Bắc tập trung vào lịch trình rõ ràng, trải nghiệm
                                địa phương và dịch vụ đồng hành an toàn cho mỗi hành trình.
                            </p>
                            <div className="mt-6 flex items-center gap-3">
                                {[
                                    { Icon: Globe, label: "Website" },
                                    { Icon: Share2, label: "Mạng xã hội" },
                                    { Icon: MessageCircle, label: "Tin nhắn" },
                                ].map(({ Icon, label }, idx) => (
                                    <a
                                        key={idx}
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        aria-label={label}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all hover:border-[#7FB77E]/60 hover:bg-[#7FB77E]/10 hover:text-[#9de09c]"
                                    >
                                        <Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#d4a878]">
                                Điều hướng
                            </h3>
                            <div className="mt-5 flex flex-col gap-3">
                                {navLinks.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="group inline-flex w-fit items-center gap-2 text-sm text-slate-300 transition-colors hover:text-[#9de09c]"
                                    >
                                        <span className="inline-block h-px w-3 bg-[#7FB77E] transition-all group-hover:w-6" />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#d4a878]">
                                Hỗ trợ
                            </h3>
                            <div className="mt-5 flex flex-col gap-3 text-sm text-slate-300">
                                <Link to="/faq" className="hover:text-[#9de09c]">Câu hỏi thường gặp</Link>
                                <Link to="/lien-he" className="hover:text-[#9de09c]">Gửi yêu cầu tư vấn</Link>
                                <Link to="/gioi-thieu" className="hover:text-[#9de09c]">Chính sách dịch vụ</Link>
                                <Link to="/tours" className="hover:text-[#9de09c]">Lịch khởi hành</Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#d4a878]">
                                Liên hệ
                            </h3>
                            <div className="mt-5 space-y-4 text-sm text-slate-300">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7FB77E]/15 text-[#9de09c]">
                                        <Phone size={15} />
                                    </span>
                                    <span>{brand.phone}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7FB77E]/15 text-[#9de09c]">
                                        <Mail size={15} />
                                    </span>
                                    <span className="break-all">{brand.email}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7FB77E]/15 text-[#9de09c]">
                                        <MapPin size={15} />
                                    </span>
                                    <span>{brand.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-slate-400 md:flex-row">
                        <p>© {new Date().getFullYear()} {brand.displayName}. Tất cả các quyền được bảo lưu.</p>
                        <p className="flex items-center gap-2">
                            Thiết kế cho hành trình
                            <span className="text-[#9de09c]">Tây Bắc</span>
                            <span>·</span>
                            <span className="text-[#d4a878]">Sơn La · Mộc Châu · Tà Xùa</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
