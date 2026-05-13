import { Link } from "react-router-dom";
import {
    Mail,
    MapPin,
    Phone,
    Send,
    CreditCard,
    Wallet,
    Banknote,
} from "lucide-react";
import BrandLogo from "../common/BrandLogo";

function FacebookIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={props.size || 18} height={props.size || 18} {...props}>
            <path d="M22 12a10 10 0 1 0-11.55 9.88v-6.99H8.05V12h2.4V9.92c0-2.37 1.42-3.68 3.59-3.68 1.04 0 2.13.19 2.13.19v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48V12h2.63l-.42 2.89h-2.21v6.99A10 10 0 0 0 22 12z" />
        </svg>
    );
}

function InstagramIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={props.size || 18} height={props.size || 18} {...props}>
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <path d="M16 11.37a4 4 0 1 1-7.88 1.26 4 4 0 0 1 7.88-1.26z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );
}

function YoutubeIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={props.size || 18} height={props.size || 18} {...props}>
            <path d="M21.58 7.19a2.5 2.5 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42A2.5 2.5 0 0 0 2.42 7.2C2 8.75 2 12 2 12s0 3.25.42 4.81a2.5 2.5 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.5 2.5 0 0 0 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5 3-5 3z" />
        </svg>
    );
}

const COLUMNS = [
    {
        title: "Công ty",
        links: [
            { label: "Về Tây Bắc Travel", to: "/gioi-thieu" },
            { label: "Liên hệ", to: "/contact" },
            { label: "Cẩm nang du lịch", to: "/blog" },
            { label: "Câu hỏi thường gặp", to: "/faq" },
        ],
    },
    {
        title: "Tour du lịch",
        links: [
            { label: "Tour Tây Bắc", to: "/tours?category=tay-bac" },
            { label: "Tour Sơn La", to: "/tours?category=son-la" },
            { label: "Tour Mộc Châu", to: "/tours?category=moc-chau" },
            { label: "Tour khuyến mãi", to: "/promotions" },
            { label: "Tour giờ chót", to: "/last-minute" },
        ],
    },
    {
        title: "Chính sách",
        links: [
            { label: "Điều khoản sử dụng", to: "/blog/dieu-khoan-su-dung" },
            { label: "Chính sách bảo mật", to: "/blog/chinh-sach-bao-mat" },
            { label: "Chính sách hủy tour", to: "/blog/chinh-sach-huy-tour" },
            { label: "Chính sách thanh toán", to: "/blog/chinh-sach-thanh-toan" },
        ],
    },
];

const SOCIALS = [
    { icon: FacebookIcon, label: "Facebook", href: "#" },
    { icon: InstagramIcon, label: "Instagram", href: "#" },
    { icon: YoutubeIcon, label: "YouTube", href: "#" },
];

const PAYMENTS = [
    { icon: CreditCard, label: "Visa / Mastercard" },
    { icon: Wallet, label: "Momo / ZaloPay" },
    { icon: Banknote, label: "Chuyển khoản" },
];

export default function Footer() {
    return (
        <footer className="relative mt-24 overflow-hidden" style={{ background: "var(--tv-bg-elevated)" }}>
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, var(--tv-primary), transparent)" }}
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="grid gap-6 py-12 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tv-accent)" }}>
                            Đăng ký nhận tin
                        </p>
                        <h3 className="mt-2 text-2xl font-black md:text-3xl" style={{ color: "var(--tv-text)" }}>
                            Nhận ưu đãi tour Tây Bắc mỗi tuần
                        </h3>
                        <p className="mt-2 text-sm leading-7" style={{ color: "var(--tv-text-muted)" }}>
                            Không spam — chỉ gửi tour mới, ưu đãi sớm và mẹo du lịch hay mỗi tuần.
                        </p>
                    </div>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="flex w-full max-w-md gap-2"
                    >
                        <input
                            type="email"
                            placeholder="email@cuaban.com"
                            className="tv-input flex-1"
                        />
                        <button type="submit" className="tv-btn-primary">
                            <Send size={16} /> Đăng ký
                        </button>
                    </form>
                </section>

                <div className="h-px" style={{ background: "var(--tv-border)" }} />

                <section className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-3" aria-label="Tây Bắc Travel">
                            <BrandLogo size="lg" />
                        </Link>
                        <p className="mt-5 max-w-md text-sm leading-7" style={{ color: "var(--tv-text-muted)" }}>
                            Tây Bắc Travel - nền tảng booking tour du lịch Tây Bắc tập trung vào lịch trình
                            rõ ràng, trải nghiệm địa phương và dịch vụ đồng hành an toàn cho mỗi hành trình.
                        </p>

                        <div className="mt-6 flex flex-col gap-3">
                            <a href="tel:19006868" className="flex items-center gap-3 text-sm font-bold" style={{ color: "var(--tv-text)" }}>
                                <Phone size={16} style={{ color: "var(--tv-primary)" }} /> 1900 6868
                            </a>
                            <a href="mailto:support@taybactravel.vn" className="flex items-center gap-3 text-sm font-bold" style={{ color: "var(--tv-text)" }}>
                                <Mail size={16} style={{ color: "var(--tv-primary)" }} /> support@taybactravel.vn
                            </a>
                            <div className="flex items-center gap-3 text-sm font-bold" style={{ color: "var(--tv-text)" }}>
                                <MapPin size={16} style={{ color: "var(--tv-primary)" }} /> 13 Trịnh Văn Bô, Hà Nội
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                            {SOCIALS.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-current"
                                    style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text-muted)" }}
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {COLUMNS.map((col) => (
                        <div key={col.title}>
                            <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: "var(--tv-text)" }}>
                                {col.title}
                            </h4>
                            <div className="mt-4 flex flex-col gap-3">
                                {col.links.map((link) => (
                                    <Link
                                        key={link.label}
                                        to={link.to}
                                        className="text-sm transition-colors hover:opacity-80"
                                        style={{ color: "var(--tv-text-muted)" }}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                <div className="h-px" style={{ background: "var(--tv-border)" }} />

                <section className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs" style={{ color: "var(--tv-text-soft)" }}>
                        © {new Date().getFullYear()} Tây Bắc Travel. Booking tour Tây Bắc.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: "var(--tv-text-soft)" }}>Thanh toán:</span>
                        {PAYMENTS.map(({ icon: Icon, label }) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold"
                                style={{ borderColor: "var(--tv-border)", color: "var(--tv-text-muted)" }}
                            >
                                <Icon size={14} style={{ color: "var(--tv-primary)" }} />
                                {label}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </footer>
    );
}
