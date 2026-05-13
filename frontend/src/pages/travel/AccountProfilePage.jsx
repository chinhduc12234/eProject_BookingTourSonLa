import { useState } from "react";
import toast from "react-hot-toast";
import { Camera, Mail, MapPin, Phone, Save, User } from "lucide-react";
import AccountLayout from "./AccountLayout";
import { readJSON, writeJSON, STORAGE_KEYS } from "../../utils/storage";

const DEFAULT_PROFILE = {
    fullName: "Khách Tây Bắc Travel",
    email: "guest@taybactravel.vn",
    phone: "",
    address: "",
    dob: "",
    gender: "male",
    avatar: "https://i.pravatar.cc/120?img=64",
};

export default function AccountProfilePage() {
    const [form, setForm] = useState(() => readJSON(STORAGE_KEYS.profile, DEFAULT_PROFILE));

    const update = (patch) => setForm((c) => ({ ...c, ...patch }));

    const handleSubmit = (e) => {
        e.preventDefault();
        writeJSON(STORAGE_KEYS.profile, form);
        toast.success("Đã cập nhật hồ sơ");
    };

    return (
        <AccountLayout title="Hồ sơ của tôi" description="Quản lý thông tin cá nhân và cài đặt tài khoản">
            <form onSubmit={handleSubmit} className="tv-card p-6 lg:p-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="relative">
                        <img src={form.avatar} alt={form.fullName} className="h-24 w-24 rounded-full object-cover" />
                        <button type="button" className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white" style={{ background: "var(--tv-gradient-primary)", color: "#06281c" }}>
                            <Camera size={14} />
                        </button>
                    </div>
                    <div>
                        <h3 className="text-lg font-black" style={{ color: "var(--tv-text)" }}>{form.fullName || "Người dùng Tây Bắc Travel"}</h3>
                        <p className="text-xs" style={{ color: "var(--tv-text-muted)" }}>Ảnh đại diện được hiển thị trên các bình luận và đánh giá.</p>
                    </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <Field icon={User} label="Họ và tên">
                        <input type="text" className="tv-input" value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} />
                    </Field>
                    <Field icon={Mail} label="Email">
                        <input type="email" className="tv-input" value={form.email} onChange={(e) => update({ email: e.target.value })} />
                    </Field>
                    <Field icon={Phone} label="Số điện thoại">
                        <input type="tel" className="tv-input" value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
                    </Field>
                    <Field icon={MapPin} label="Địa chỉ">
                        <input type="text" className="tv-input" value={form.address} onChange={(e) => update({ address: e.target.value })} />
                    </Field>
                    <Field label="Ngày sinh">
                        <input type="date" className="tv-input" value={form.dob} onChange={(e) => update({ dob: e.target.value })} />
                    </Field>
                    <Field label="Giới tính">
                        <select className="tv-input" value={form.gender} onChange={(e) => update({ gender: e.target.value })}>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </Field>
                </div>

                <div className="mt-6">
                    <button type="submit" className="tv-btn-primary">
                        <Save size={14} /> Lưu thay đổi
                    </button>
                </div>
            </form>
        </AccountLayout>
    );
}

function Field({ label, icon: Icon, children }) {
    return (
        <label className="block">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-muted)" }}>
                {Icon ? <Icon size={11} /> : null}
                {label}
            </span>
            <div className="mt-1">{children}</div>
        </label>
    );
}
