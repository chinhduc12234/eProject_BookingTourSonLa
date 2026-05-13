import { useState } from "react";
import { motion } from "framer-motion";
import {
    BookOpen,
    ChevronDown,
    Clock,
    Mail,
    MapPin,
    Phone,
    Send,
    User,
} from "lucide-react";
import toast from "react-hot-toast";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import { siteImage } from "../../utils/images";

const CONTACT_BG = siteImage(
    "contact",
    "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1920&q=80",
);

const FAQS = [
    {
        q: "Làm sao để đặt tour?",
        a: "Bạn chỉ cần chọn tour mong muốn, nhấn 'Đặt ngay', điền thông tin và chọn phương thức thanh toán. Booking sẽ được xác nhận ngay sau khi hoàn tất thanh toán.",
    },
    {
        q: "Tôi có thể đổi/hủy tour không?",
        a: "Có. Bạn có thể đổi/hủy tour theo chính sách hủy tour. Hủy trước 14 ngày được hoàn 100%, trước 7-13 ngày hoàn 70%, trước 3-6 ngày hoàn 30%.",
    },
    {
        q: "Có hỗ trợ tour cho doanh nghiệp không?",
        a: "Có. Chúng tôi có gói tour team building, khảo sát thị trường và tri ân khách hàng dành riêng cho doanh nghiệp. Liên hệ hotline để được tư vấn.",
    },
    {
        q: "Phương thức thanh toán nào được chấp nhận?",
        a: "Chuyển khoản ngân hàng, ví điện tử (Momo, ZaloPay, VNPay), thẻ Visa/Mastercard hoặc thanh toán trực tiếp tại văn phòng.",
    },
    {
        q: "Có hỗ trợ tour cá nhân hoặc tour riêng không?",
        a: "Có. Đội ngũ tư vấn sẽ thiết kế tour riêng theo yêu cầu, sở thích, ngân sách và thời gian của bạn.",
    },
];

const CONTACT_CARDS = [
    { icon: Phone, label: "Hotline 24/7", value: "1900 6868", href: "tel:19006868" },
    { icon: Mail, label: "Email", value: "support@taybactravel.vn", href: "mailto:support@taybactravel.vn" },
    { icon: MapPin, label: "Văn phòng", value: "13 Trịnh Văn Bô, Hà Nội" },
    { icon: Clock, label: "Giờ làm việc", value: "08:00 - 22:00 hàng ngày" },
];

export default function ContactTravelPage() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [activeFaq, setActiveFaq] = useState(0);

    const update = (patch) => setForm((c) => ({ ...c, ...patch }));

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success("Cảm ơn bạn! Tư vấn viên sẽ liên hệ trong 15 phút.");
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    };

    return (
        <TravelLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <section
                    className="relative overflow-hidden py-16"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(79,143,77,0.78), rgba(13,32,24,0.55)), url('${CONTACT_BG}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="mx-auto max-w-7xl px-4 text-center text-white sm:px-6 lg:px-8">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
                            Hỗ trợ
                        </span>
                        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                            Liên hệ với Tây Bắc Travel
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                            Đội tư vấn luôn sẵn sàng hỗ trợ bạn 24/7. Hãy để lại tin nhắn hoặc gọi trực tiếp cho chúng tôi.
                        </p>
                    </div>
                </section>

                <Container className="py-10">
                    <Breadcrumb items={[{ label: "Liên hệ" }]} />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {CONTACT_CARDS.map((c) => {
                            const Wrapper = c.href ? "a" : "div";
                            return (
                                <Wrapper
                                    key={c.label}
                                    href={c.href}
                                    className="tv-card p-5 flex items-center gap-3 transition-colors hover:!border-[var(--tv-primary)]"
                                >
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "var(--tv-gradient-primary)", color: "#06281c" }}>
                                        <c.icon size={20} />
                                    </span>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>{c.label}</div>
                                        <div className="mt-0.5 text-sm font-black" style={{ color: "var(--tv-text)" }}>{c.value}</div>
                                    </div>
                                </Wrapper>
                            );
                        })}
                    </div>

                    <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="tv-card p-6 lg:p-8">
                            <h2 className="text-2xl font-black md:text-3xl" style={{ color: "var(--tv-text)" }}>Gửi tin nhắn cho chúng tôi</h2>
                            <p className="mt-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                                Phản hồi trung bình trong 15 phút trong giờ làm việc.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 grid gap-3 md:grid-cols-2">
                                <Field icon={User} label="Họ và tên">
                                    <input type="text" required className="tv-input" value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="Nguyễn Văn A" />
                                </Field>
                                <Field icon={Mail} label="Email">
                                    <input type="email" required className="tv-input" value={form.email} onChange={(e) => update({ email: e.target.value })} placeholder="email@example.com" />
                                </Field>
                                <Field icon={Phone} label="Số điện thoại">
                                    <input type="tel" required className="tv-input" value={form.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="09xx xxx xxx" />
                                </Field>
                                <Field icon={BookOpen} label="Chủ đề">
                                    <input type="text" required className="tv-input" value={form.subject} onChange={(e) => update({ subject: e.target.value })} placeholder="Tư vấn tour Mộc Châu" />
                                </Field>
                                <Field label="Nội dung" className="md:col-span-2">
                                    <textarea required rows={5} className="tv-input min-h-[140px] resize-y" value={form.message} onChange={(e) => update({ message: e.target.value })} placeholder="Nội dung tin nhắn..." />
                                </Field>
                                <div className="md:col-span-2">
                                    <button type="submit" className="tv-btn-primary">
                                        <Send size={14} /> Gửi tin nhắn
                                    </button>
                                </div>
                            </form>
                        </div>

                        <aside className="h-fit space-y-4">
                            <div className="tv-card overflow-hidden">
                                <iframe
                                    src="https://www.openstreetmap.org/export/embed.html?bbox=105.821%2C21.045%2C105.835%2C21.055&layer=mapnik"
                                    title="Bản đồ Tây Bắc Travel"
                                    width="100%"
                                    height="240"
                                    className="block"
                                    loading="lazy"
                                />
                                <div className="p-5">
                                    <div className="text-sm font-black" style={{ color: "var(--tv-text)" }}>Văn phòng Hà Nội</div>
                                    <div className="mt-1 text-xs" style={{ color: "var(--tv-text-muted)" }}>13 Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</div>
                                </div>
                            </div>

                            <div className="tv-card p-5">
                                <h3 className="text-lg font-black" style={{ color: "var(--tv-text)" }}>Câu hỏi thường gặp</h3>
                                <div className="mt-4 space-y-2">
                                    {FAQS.map((f, i) => {
                                        const active = activeFaq === i;
                                        return (
                                            <div key={i} className="rounded-xl border" style={{ borderColor: "var(--tv-border)" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveFaq(active ? -1 : i)}
                                                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                                                >
                                                    <span className="text-sm font-bold" style={{ color: "var(--tv-text)" }}>{f.q}</span>
                                                    <ChevronDown size={14} className={`transition ${active ? "rotate-180" : ""}`} style={{ color: "var(--tv-text-muted)" }} />
                                                </button>
                                                {active && (
                                                    <div className="px-4 pb-3 text-xs leading-6" style={{ color: "var(--tv-text-muted)" }}>{f.a}</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>
                    </div>
                </Container>
            </motion.div>
        </TravelLayout>
    );
}

function Field({ label, icon: Icon, children, className = "" }) {
    return (
        <label className={`block ${className}`}>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-muted)" }}>
                {Icon ? <Icon size={11} /> : null}
                {label}
            </span>
            <div className="mt-1">{children}</div>
        </label>
    );
}
