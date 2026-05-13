import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    BellRing,
    ChevronDown,
    Heart,
    LogIn,
    LogOut,
    Menu,
    Phone,
    Search,
    Settings,
    UserCircle2,
    X,
} from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";
import { isLoggedIn, logout } from "../../utils/auth";
import BrandLogo from "../common/BrandLogo";

const NAV_ITEMS = [
    { label: "Trang chủ", to: "/" },
    { label: "Tour", to: "/tours" },
    { label: "Khuyến mãi", to: "/promotions" },
    { label: "Giờ chót", to: "/last-minute" },
    { label: "Điểm đến", to: "/destinations" },
    { label: "Cẩm nang", to: "/blog" },
    { label: "Liên hệ", to: "/contact" },
];

export default function Header({ isDark, onToggleTheme }) {
    const [open, setOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [logged, setLogged] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setLogged(isLoggedIn());
    }, []);

    useEffect(() => {
        const handler = () => setAccountOpen(false);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    const handleLogout = (e) => {
        e?.preventDefault();
        logout();
    };

    return (
        <>
            <motion.header
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="sticky top-0 z-50"
                style={{
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    background: scrolled ? "var(--tv-glass)" : "transparent",
                    borderBottom: scrolled ? `1px solid var(--tv-border)` : "1px solid transparent",
                    transition: "background 300ms, border-color 300ms",
                }}
            >
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="group transition-transform hover:scale-[1.02]" aria-label="Tây Bắc Travel">
                        <BrandLogo />
                    </Link>

                    <nav className="hidden xl:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                className="relative px-3 py-2 text-sm font-bold transition-colors rounded-lg"
                                style={({ isActive }) => ({
                                    color: isActive ? "var(--tv-primary)" : "var(--tv-text)",
                                })}
                            >
                                {({ isActive }) => (
                                    <span className="relative inline-flex flex-col items-center">
                                        {item.label}
                                        {isActive && (
                                            <motion.span
                                                layoutId="nav-underline"
                                                className="mt-1 h-0.5 w-6 rounded-full"
                                                style={{ background: "var(--tv-primary)" }}
                                            />
                                        )}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden lg:flex items-center gap-3">
                        <a
                            href="tel:19006868"
                            className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold border transition-colors hover:border-current"
                            style={{
                                color: "var(--tv-text)",
                                borderColor: "var(--tv-border-strong)",
                            }}
                        >
                            <Phone size={16} style={{ color: "var(--tv-primary)" }} />
                            1900 6868
                        </a>

                        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

                        {logged ? (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    onClick={() => setAccountOpen((o) => !o)}
                                    className="inline-flex h-11 items-center gap-2 rounded-full pl-2 pr-4 border"
                                    style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "var(--tv-gradient-primary)", color: "#06281c" }}>
                                        <UserCircle2 size={20} />
                                    </span>
                                    <span className="text-sm font-bold">Tài khoản</span>
                                    <ChevronDown size={14} className={`transition ${accountOpen ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {accountOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                            transition={{ duration: 0.18 }}
                                            className="absolute right-0 mt-2 w-60 rounded-2xl border p-2"
                                            style={{
                                                background: "var(--tv-bg-elevated)",
                                                borderColor: "var(--tv-border-strong)",
                                                boxShadow: "var(--tv-shadow-lg)",
                                            }}
                                        >
                                            <Link to="/account/profile" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold hover:bg-[var(--tv-bg-subtle)]" style={{ color: "var(--tv-text)" }}>
                                                <UserCircle2 size={18} /> Hồ sơ của tôi
                                            </Link>
                                            <Link to="/account/bookings" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold hover:bg-[var(--tv-bg-subtle)]" style={{ color: "var(--tv-text)" }}>
                                                <BellRing size={18} /> Tour đã đặt
                                            </Link>
                                            <Link to="/account/favorites" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold hover:bg-[var(--tv-bg-subtle)]" style={{ color: "var(--tv-text)" }}>
                                                <Heart size={18} /> Yêu thích
                                            </Link>
                                            <div className="my-1 h-px" style={{ background: "var(--tv-border)" }} />
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold hover:bg-[var(--tv-bg-subtle)]"
                                                style={{ color: "var(--tv-danger)" }}
                                            >
                                                <LogOut size={18} /> Đăng xuất
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="tv-btn-primary text-sm"
                            >
                                <LogIn size={16} /> Đăng nhập
                            </Link>
                        )}
                    </div>

                    <div className="flex lg:hidden items-center gap-2">
                        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} compact />
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            aria-label="Mở menu"
                            className="flex h-10 w-10 items-center justify-center rounded-full border"
                            style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </motion.header>

            <AnimatePresence>
                {open && (
                    <MobileDrawer
                        onClose={() => setOpen(false)}
                        logged={logged}
                        onLogout={handleLogout}
                        onNavigate={(to) => {
                            setOpen(false);
                            navigate(to);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

function MobileDrawer({ onClose, logged, onLogout, onNavigate }) {
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                className="fixed inset-y-0 right-0 z-50 w-[88%] max-w-sm overflow-y-auto p-6 lg:hidden"
                style={{ background: "var(--tv-bg-elevated)", borderLeft: "1px solid var(--tv-border)" }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BrandLogo size="sm" />
                    </div>
                    <button onClick={onClose} aria-label="Đóng" className="flex h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-7 grid gap-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.to}
                            onClick={() => onNavigate(item.to)}
                            className="flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors"
                            style={{ color: "var(--tv-text)", background: "var(--tv-bg-subtle)" }}
                        >
                            {item.label}
                            <Search size={14} style={{ color: "var(--tv-primary)" }} />
                        </button>
                    ))}
                </div>

                <div className="mt-6 grid gap-3">
                    <a
                        href="tel:19006868"
                        className="flex items-center justify-center gap-2 rounded-full border py-3 text-sm font-bold"
                        style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                    >
                        <Phone size={16} style={{ color: "var(--tv-primary)" }} /> Hotline 1900 6868
                    </a>

                    {logged ? (
                        <>
                            <button onClick={() => onNavigate("/account/profile")} className="tv-btn-outline justify-center">
                                <UserCircle2 size={16} /> Tài khoản
                            </button>
                            <button onClick={onLogout} className="tv-btn-primary justify-center" style={{ background: "var(--tv-danger)", color: "#fff" }}>
                                <LogOut size={16} /> Đăng xuất
                            </button>
                        </>
                    ) : (
                        <button onClick={() => onNavigate("/login")} className="tv-btn-primary justify-center">
                            <LogIn size={16} /> Đăng nhập
                        </button>
                    )}
                </div>

                <div className="mt-8 rounded-2xl p-5" style={{ background: "var(--tv-bg-subtle)" }}>
                    <Settings size={18} style={{ color: "var(--tv-accent)" }} />
                    <div className="mt-3 text-sm font-bold" style={{ color: "var(--tv-text)" }}>Hỗ trợ 24/7</div>
                    <p className="mt-1 text-xs leading-5" style={{ color: "var(--tv-text-muted)" }}>
                        Đội ngũ tư vấn sẵn sàng hỗ trợ bạn mọi lúc. Gọi hotline hoặc gửi email để được giải đáp nhanh nhất.
                    </p>
                </div>
            </motion.aside>
        </>
    );
}
