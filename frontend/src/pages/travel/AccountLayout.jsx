import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    Bell,
    Heart,
    LogOut,
    Settings,
    Ticket,
    UserCircle2,
    Wallet,
} from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import { logout } from "../../utils/auth";
import { readJSON, STORAGE_KEYS } from "../../utils/storage";

const NAV = [
    { to: "/account/profile", label: "Hồ sơ", icon: UserCircle2 },
    { to: "/account/bookings", label: "Tour đã đặt", icon: Ticket },
    { to: "/account/favorites", label: "Yêu thích", icon: Heart },
    { to: "/account/payments", label: "Thanh toán", icon: Wallet },
    { to: "/account/notifications", label: "Thông báo", icon: Bell },
    { to: "/account/settings", label: "Cài đặt", icon: Settings },
];

export default function AccountLayout({ children, title, description }) {
    const navigate = useNavigate();
    const profile = readJSON(STORAGE_KEYS.profile, {
        fullName: "Khách Tây Bắc Travel",
        email: localStorage.getItem("email") || "guest@taybactravel.vn",
        phone: "—",
        avatar: "https://i.pravatar.cc/120?img=64",
    });

    return (
        <TravelLayout>
            <Container className="py-10">
                <Breadcrumb items={[{ label: "Tài khoản", to: "/account/profile" }, title ? { label: title } : null].filter(Boolean)} />

                <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
                    <aside className="h-fit space-y-4">
                        <div className="tv-card p-5 text-center">
                            <img src={profile.avatar} alt={profile.fullName} className="mx-auto h-20 w-20 rounded-full object-cover" />
                            <div className="mt-3 text-base font-black" style={{ color: "var(--tv-text)" }}>{profile.fullName}</div>
                            <div className="mt-1 text-xs" style={{ color: "var(--tv-text-muted)" }}>{profile.email}</div>
                            <Link to="/account/profile" className="mt-4 inline-flex w-full justify-center rounded-full border px-3 py-1.5 text-xs font-bold transition-colors hover:border-current"
                                style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                            >
                                Chỉnh sửa hồ sơ
                            </Link>
                        </div>

                        <nav className="tv-card overflow-hidden p-2">
                            {NAV.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
                                        style={({ isActive }) => ({
                                            background: isActive ? "var(--tv-bg-strong)" : "transparent",
                                            color: isActive ? "var(--tv-primary-deep)" : "var(--tv-text)",
                                        })}
                                    >
                                        <Icon size={16} />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                            <button
                                onClick={logout}
                                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors hover:bg-[var(--tv-bg-subtle)]"
                                style={{ color: "var(--tv-danger)" }}
                            >
                                <LogOut size={16} /> Đăng xuất
                            </button>
                        </nav>
                    </aside>

                    <section>
                        {title && (
                            <div className="mb-5">
                                <h1 className="text-2xl font-black md:text-3xl" style={{ color: "var(--tv-text)" }}>{title}</h1>
                                {description && (
                                    <p className="mt-1 text-sm" style={{ color: "var(--tv-text-muted)" }}>{description}</p>
                                )}
                            </div>
                        )}
                        {children}
                    </section>
                </div>
            </Container>
        </TravelLayout>
    );
}
