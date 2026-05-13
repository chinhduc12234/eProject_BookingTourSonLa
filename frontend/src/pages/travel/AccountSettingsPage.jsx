import { useState } from "react";
import { Bell, Languages, Lock, Moon, Save, Sun } from "lucide-react";
import toast from "react-hot-toast";
import AccountLayout from "./AccountLayout";
import { useTheme } from "../../hooks/useTheme";

export default function AccountSettingsPage() {
    const { theme, setTheme } = useTheme();
    const [notif, setNotif] = useState({ email: true, sms: false, push: true });
    const [language, setLanguage] = useState("vi");

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success("Đã lưu thiết lập");
    };

    return (
        <AccountLayout title="Cài đặt" description="Tuỳ chỉnh giao diện, ngôn ngữ và thông báo.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <section className="tv-card p-6">
                    <h3 className="text-lg font-black" style={{ color: "var(--tv-text)" }}>Giao diện</h3>
                    <p className="mt-1 text-xs" style={{ color: "var(--tv-text-muted)" }}>Chọn giao diện sáng hoặc tối phù hợp với bạn.</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {[
                            { id: "light", label: "Sáng", icon: Sun },
                            { id: "dark", label: "Tối", icon: Moon },
                        ].map((t) => {
                            const Icon = t.icon;
                            const active = theme === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTheme(t.id)}
                                    className="flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors"
                                    style={{
                                        borderColor: active ? "var(--tv-primary)" : "var(--tv-border-strong)",
                                        background: active ? "var(--tv-bg-strong)" : "transparent",
                                    }}
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-primary-deep)" }}>
                                        <Icon size={18} />
                                    </span>
                                    <div>
                                        <div className="text-sm font-black" style={{ color: "var(--tv-text)" }}>Chế độ {t.label}</div>
                                        <div className="text-xs" style={{ color: "var(--tv-text-muted)" }}>
                                            {t.id === "light" ? "Sáng dịu mắt, hợp ban ngày" : "Tối sang trọng, đỡ mỏi mắt"}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="tv-card p-6">
                    <h3 className="text-lg font-black" style={{ color: "var(--tv-text)" }}>Thông báo</h3>
                    <div className="mt-4 grid gap-2">
                        {[
                            { key: "email", label: "Nhận thông báo qua email" },
                            { key: "sms", label: "Nhận thông báo qua SMS" },
                            { key: "push", label: "Nhận thông báo trên trình duyệt" },
                        ].map((opt) => (
                            <label key={opt.key} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "var(--tv-border)" }}>
                                <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--tv-text)" }}>
                                    <Bell size={14} /> {opt.label}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notif[opt.key]}
                                    onChange={(e) => setNotif((c) => ({ ...c, [opt.key]: e.target.checked }))}
                                    className="h-4 w-4 accent-[var(--tv-primary-deep)]"
                                />
                            </label>
                        ))}
                    </div>
                </section>

                <section className="tv-card p-6">
                    <h3 className="text-lg font-black" style={{ color: "var(--tv-text)" }}>Ngôn ngữ & Bảo mật</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <label className="block">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-muted)" }}>
                                <Languages size={11} /> Ngôn ngữ
                            </span>
                            <select className="tv-input mt-1" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="vi">Tiếng Việt</option>
                                <option value="en">English</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-muted)" }}>
                                <Lock size={11} /> Mật khẩu
                            </span>
                            <button type="button" className="tv-btn-outline mt-1 w-full justify-center">Đổi mật khẩu</button>
                        </label>
                    </div>
                </section>

                <div>
                    <button type="submit" className="tv-btn-primary">
                        <Save size={14} /> Lưu thay đổi
                    </button>
                </div>
            </form>
        </AccountLayout>
    );
}
