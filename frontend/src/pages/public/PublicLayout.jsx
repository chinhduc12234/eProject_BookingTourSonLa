import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Globe,
    Mail,
    MapPin,
    LogOut,
    Menu,
    MessageCircle,
    Moon,
    Phone,
    Send,
    Share2,
    Sun,
    UserRound,
    X,
} from "lucide-react";
import { getCurrentUserProfile } from "../../api/userApi";
import { getAuthName, getRole, isLoggedIn, logout } from "../../utils/auth";
import { applyTheme, getInitialTheme } from "../../utils/theme";
import { brand, navLinks, photoCredits } from "./publicContent";

const navClass = ({ isActive }) =>
    ["nav-link", isActive ? "is-active" : ""].join(" ").trim();

export default function PublicLayout({ children }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [authenticated, setAuthenticated] = useState(isLoggedIn());
    const [profile, setProfile] = useState(null);
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const syncTheme = (event) => {
            setTheme(event.detail || getInitialTheme());
        };

        window.addEventListener("theme-change", syncTheme);
        return () => window.removeEventListener("theme-change", syncTheme);
    }, []);

    useEffect(() => {
        let mounted = true;

        const syncProfile = async () => {
            const hasToken = isLoggedIn();
            setAuthenticated(hasToken);

            if (!hasToken) {
                setProfile(null);
                return;
            }

            try {
                const response = await getCurrentUserProfile();
                if (mounted) setProfile(response.data);
            } catch {
                if (mounted) {
                    setAuthenticated(false);
                    setProfile(null);
                }
            }
        };

        syncProfile();
        window.addEventListener("auth-change", syncProfile);
        window.addEventListener("storage", syncProfile);

        return () => {
            mounted = false;
            window.removeEventListener("auth-change", syncProfile);
            window.removeEventListener("storage", syncProfile);
        };
    }, []);

    const accountName = profile?.fullName || getAuthName() || "Tài khoản";
    const accountPath =
        getRole() === "ADMIN"
            ? "/admin"
            : getRole() === "EMPLOYEE"
                ? "/employee"
                : "/tai-khoan";
    const isLightTheme = theme === "light";

    const toggleTheme = () => {
        setTheme(applyTheme(isLightTheme ? "dark" : "light"));
    };

    const themeButton = (
        <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition hover:border-[#7FB77E]/60 hover:bg-[#7FB77E]/10"
            aria-label={isLightTheme ? "Chuyển sang nền tối" : "Chuyển sang nền sáng"}
            title={isLightTheme ? "Nền tối" : "Nền sáng"}
        >
            {isLightTheme ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );

    return (
        <div className="public-shell min-h-screen bg-[#020617] text-slate-100">
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
                    <Link to="/" className="group flex items-center" aria-label={brand.displayName}>
                        <img
                            src="/logo-main-tay-bac.png"
                            alt={brand.displayName}
                            className="h-14 w-40 object-contain drop-shadow-[0_10px_22px_rgba(127,183,126,0.45)] transition group-hover:drop-shadow-[0_14px_28px_rgba(127,183,126,0.65)]"
                        />
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {navLinks.map((item) => (
                            <NavLink key={item.to} to={item.to} className={navClass} end={item.to === "/"}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        {themeButton}
                        {authenticated ? (
                            <>
                                <Link
                                    to={accountPath}
                                    className="inline-flex h-11 max-w-[220px] items-center gap-2 rounded-xl border border-[#7FB77E]/35 bg-[#7FB77E]/10 px-4 text-sm font-black text-white transition hover:border-[#7FB77E]/70 hover:bg-[#7FB77E]/20"
                                    title="Trang cá nhân"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#7FB77E] text-[#020617]">
                                        <UserRound size={15} />
                                    </span>
                                    <span className="truncate">{accountName}</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition hover:border-rose-300/50 hover:bg-rose-300/10 hover:text-rose-100"
                                    aria-label="Đăng xuất"
                                    title="Đăng xuất"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="btn-primary px-5 text-sm">
                                Đăng nhập
                            </Link>
                        )}
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
                            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                                <span className="text-sm font-bold text-slate-200">
                                    {isLightTheme ? "Nền sáng" : "Nền tối"}
                                </span>
                                {themeButton}
                            </div>
                            {authenticated ? (
                                <>
                                    <Link
                                        to={accountPath}
                                        onClick={() => setOpen(false)}
                                        className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#7FB77E]/35 bg-[#7FB77E]/10 px-4 text-sm font-black text-white"
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#7FB77E] text-[#020617]">
                                            <UserRound size={17} />
                                        </span>
                                        {accountName}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpen(false);
                                            logout();
                                        }}
                                        className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-300/30 bg-rose-300/10 px-4 text-sm font-black text-rose-100"
                                    >
                                        <LogOut size={18} />
                                        Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setOpen(false)}
                                    className="btn-primary mt-3 w-full"
                                >
                                    Đăng nhập
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </header>

            <main>{children}</main>

            {/* FOOTER */}
            <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#04120d] via-[#04120d] to-[#020617] pt-8 sm:pt-10">
                <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#7FB77E]/10 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#A67C52]/10 blur-[120px]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Newsletter band */}
                    <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 backdrop-blur-md md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-10">
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
                                <img
                                    src="/logo-main-tay-bac.png"
                                    alt={brand.displayName}
                                    className="h-24 w-56 object-contain drop-shadow-[0_12px_28px_rgba(127,183,126,0.35)]"
                                />
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
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="text-[#d4a878]">Ảnh:</span>
                            {photoCredits.map((item, index) => (
                                <a
                                    key={`${item.label}-${index}`}
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="transition hover:text-[#9de09c]"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
