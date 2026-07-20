import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowUp,
    Mail,
    MapPin,
    LogOut,
    Menu,
    Phone,
    Send,
    UserRound,
    X,
} from "lucide-react";
import { getCurrentUserProfile } from "../../api/userApi";
import { getAuthName, getRole, isLoggedIn, logout } from "../../utils/auth";
import { brand, navLinks, photoCredits } from "./publicContent";

const navClass = ({ isActive }) =>
    ["nav-link", isActive ? "is-active" : ""].join(" ").trim();

export default function PublicLayout({ children }) {
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [authenticated, setAuthenticated] = useState(isLoggedIn());
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const scrollRange = Math.max(
                document.documentElement.scrollHeight - window.innerHeight,
                1,
            );
            setScrolled(scrollTop > 12);
            setScrollProgress(Math.min(scrollTop / scrollRange, 1));
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!open) return undefined;

        const handleEscape = (event) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

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

    return (
        <div className="public-shell min-h-screen bg-[#020617] text-slate-100">
            <a href="#noi-dung-chinh" className="public-skip-link">
                Chuyển đến nội dung chính
            </a>
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
                    <Link to="/" className="group flex items-center gap-3" aria-label={brand.displayName}>
                        <img
                            src="/logo-main-tay-bac.png"
                            alt={brand.displayName}
                            className="h-14 w-40 object-contain drop-shadow-[0_10px_22px_rgba(127,183,126,0.45)] transition group-hover:drop-shadow-[0_14px_28px_rgba(127,183,126,0.65)]"
                        />
                        <span className="hidden leading-none xl:block">
                            <span className="block text-sm font-black tracking-[0.14em] text-white">
                                TÂY BẮC
                            </span>
                            <span className="mt-1 block text-[10px] font-black tracking-[0.28em] text-[#9de09c]">
                                TRAVEL
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
                        {authenticated ? (
                            <>
                                <Link
                                    to={accountPath}
                                    className="inline-flex h-11 max-w-[220px] items-center gap-2 rounded-xl border border-[#7FB77E]/35 bg-[#7FB77E]/10 px-4 text-sm font-black text-white transition hover:border-[#7FB77E]/70 hover:bg-[#7FB77E]/20"
                                    title="Thông tin tài khoản"
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
                        aria-expanded={open}
                        aria-controls="public-mobile-menu"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        id="public-mobile-menu"
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
                <span
                    className="public-scroll-progress"
                    style={{ transform: `scaleX(${scrollProgress})` }}
                    aria-hidden="true"
                />
            </header>

            <main id="noi-dung-chinh">{children}</main>

            {scrollProgress > 0.18 && (
                <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="public-back-to-top"
                    aria-label="Về đầu trang"
                    title="Về đầu trang"
                >
                    <ArrowUp size={19} />
                </motion.button>
            )}

            {/* FOOTER */}
            <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#04120d] via-[#04120d] to-[#020617] pt-8 sm:pt-10">
                <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#7FB77E]/10 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#A67C52]/10 blur-[120px]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Consultation band */}
                    <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 backdrop-blur-md md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-10">
                        <div>
                            <span className="section-tag">
                                <Send size={12} /> Lên kế hoạch chuyến đi
                            </span>
                            <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                                Tìm hành trình phù hợp với thời gian của bạn.
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Xem tour đang mở bán hoặc gửi thông tin để trao đổi qua email.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                            <Link to="/tours" className="btn-outline whitespace-nowrap">
                                Xem tour
                            </Link>
                            <Link to="/lien-he" className="btn-primary whitespace-nowrap">
                                Liên hệ tư vấn
                                <Send size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-12 py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <img
                                    src="/logo-main-tay-bac.png"
                                    alt={brand.displayName}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-24 w-56 object-contain drop-shadow-[0_12px_28px_rgba(127,183,126,0.35)]"
                                />
                            </div>
                            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                                Nền tảng đặt tour du lịch Tây Bắc tập trung vào lịch trình rõ ràng, trải nghiệm
                                địa phương và dịch vụ đồng hành an toàn cho mỗi hành trình.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="btn-outline px-4 text-xs">
                                    <Phone size={15} /> Gọi tư vấn
                                </a>
                                <a href={`mailto:${brand.email}`} className="btn-outline px-4 text-xs">
                                    <Mail size={15} /> Gửi email
                                </a>
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
                                    <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="hover:text-[#9de09c]">{brand.phone}</a>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7FB77E]/15 text-[#9de09c]">
                                        <Mail size={15} />
                                    </span>
                                    <a href={`mailto:${brand.email}`} className="break-all hover:text-[#9de09c]">{brand.email}</a>
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

                    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-slate-300 md:flex-row">
                        <p>© {new Date().getFullYear()} {brand.displayName}. Tất cả các quyền được bảo lưu.</p>
                        <div className="flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-1 md:justify-end">
                            <span className="font-bold text-[#d4a878]">Nguồn ảnh:</span>
                            {photoCredits.map((item, index) => (
                                <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
                                    {index > 0 && <span aria-hidden="true">·</span>}
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="transition hover:text-[#9de09c]"
                                    >
                                        {item.label}
                                    </a>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
