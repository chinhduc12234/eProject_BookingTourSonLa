import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    CalendarDays,
    Check,
    CheckCircle2,
    Copy,
    Download,
    Headphones,
    Mail,
    Phone,
    Sparkles,
    Ticket,
    Users,
    Wallet,
} from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import { useBookings } from "../../hooks/useBookings";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useState } from "react";

export default function BookingSuccessPage() {
    const { bookingCode } = useParams();
    const { findBooking } = useBookings();
    const booking = findBooking(bookingCode);
    const [copied, setCopied] = useState(false);

    if (!booking) return <Navigate to="/" replace />;

    const handleCopy = () => {
        navigator.clipboard?.writeText(booking.bookingCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <TravelLayout>
            <Container className="py-12">
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45 }}
                    className="tv-card overflow-hidden"
                >
                    <div
                        className="relative overflow-hidden px-6 py-12 text-center text-white sm:px-12"
                        style={{
                            background: `linear-gradient(135deg, var(--tv-primary-deep), var(--tv-primary)), url('${booking.tourImage}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundBlendMode: "multiply",
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 8, -8, 0] }}
                            transition={{ duration: 0.55 }}
                            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-emerald-700 shadow-2xl"
                        >
                            <CheckCircle2 size={44} />
                        </motion.div>

                        <h1 className="mt-5 text-3xl font-black sm:text-4xl">Đặt tour thành công!</h1>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 sm:text-base opacity-90">
                            Cảm ơn bạn đã tin tưởng và lựa chọn Tây Bắc Travel. Chúng tôi đã ghi nhận đơn đặt tour và sẽ liên hệ xác nhận trong vòng 15 phút.
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-3 backdrop-blur">
                            <Ticket size={14} />
                            <span className="text-sm font-bold">Mã booking:</span>
                            <span className="text-base font-black tracking-wider">{booking.bookingCode}</span>
                            <button onClick={handleCopy} className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30" aria-label="Sao chép">
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-2">
                        <div>
                            <h2 className="text-lg font-black" style={{ color: "var(--tv-text)" }}>Thông tin tour</h2>
                            <div className="mt-4 grid gap-3 text-sm" style={{ color: "var(--tv-text-muted)" }}>
                                <InfoRow icon={Ticket} label="Tour" value={booking.tourTitle} />
                                <InfoRow icon={CalendarDays} label="Ngày khởi hành" value={formatDate(booking.departure.date)} />
                                <InfoRow icon={Users} label="Số khách" value={`${booking.travellers.adult} NL · ${booking.travellers.child} TE · ${booking.travellers.infant} EB`} />
                                <InfoRow icon={Wallet} label="Tổng tiền" value={formatCurrency(booking.totalPrice)} highlight />
                                <InfoRow icon={Sparkles} label="Phương thức TT" value={paymentLabel(booking.payment)} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-black" style={{ color: "var(--tv-text)" }}>Hướng dẫn tiếp theo</h2>
                            <ol className="mt-4 space-y-3 text-sm" style={{ color: "var(--tv-text-muted)" }}>
                                <Step idx={1} title="Kiểm tra email" desc={`Email xác nhận đã được gửi tới ${booking.contact.email}. Vui lòng kiểm tra hộp thư đến và spam.`} />
                                <Step idx={2} title="Chờ liên hệ" desc="Tư vấn viên sẽ gọi xác nhận trong 15-30 phút làm việc." />
                                <Step idx={3} title="Hoàn tất thanh toán" desc={paymentInstruction(booking.payment)} />
                                <Step idx={4} title="Chuẩn bị hành trang" desc="Theo dõi thông tin tour và checklist gửi qua email trước ngày khởi hành 3 ngày." />
                            </ol>
                        </div>
                    </div>

                    <div className="border-t p-6 sm:p-8" style={{ borderColor: "var(--tv-border)" }}>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <ContactTile icon={Phone} title="Hotline" value="1900 6868" href="tel:19006868" />
                            <ContactTile icon={Mail} title="Email" value="support@taybactravel.vn" href="mailto:support@taybactravel.vn" />
                            <ContactTile icon={Headphones} title="Live chat" value="08:00 - 22:00" />
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                            <Link to="/account/bookings" className="tv-btn-outline">
                                Xem booking của tôi
                            </Link>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="tv-btn-outline"
                                >
                                    <Download size={14} /> In phiếu đặt
                                </button>
                                <Link to="/tours" className="tv-btn-primary">
                                    Khám phá tour khác
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </TravelLayout>
    );
}

function paymentLabel(id) {
    if (id === "TRANSFER") return "Chuyển khoản ngân hàng";
    if (id === "WALLET") return "Ví điện tử";
    return "Thanh toán tại văn phòng";
}

function paymentInstruction(id) {
    if (id === "TRANSFER") return "Vui lòng chuyển khoản theo thông tin trong email xác nhận, hệ thống sẽ tự động kích hoạt booking.";
    if (id === "WALLET") return "Mở app ví điện tử và hoàn tất thanh toán theo hướng dẫn.";
    return "Mang theo CCCD/CMND tới văn phòng Tây Bắc Travel để hoàn tất thanh toán.";
}

function InfoRow({ icon: Icon, label, value, highlight }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-xl px-3 py-2.5" style={{ background: "var(--tv-bg-subtle)" }}>
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>
                <Icon size={12} /> {label}
            </span>
            <span className={`text-sm font-bold ${highlight ? "" : ""}`} style={{ color: highlight ? "var(--tv-primary-deep)" : "var(--tv-text)" }}>
                {value}
            </span>
        </div>
    );
}

function Step({ idx, title, desc }) {
    return (
        <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black" style={{ background: "var(--tv-gradient-primary)", color: "#06281c" }}>
                {idx}
            </span>
            <div>
                <div className="text-sm font-bold" style={{ color: "var(--tv-text)" }}>{title}</div>
                <div className="mt-0.5 text-xs leading-6" style={{ color: "var(--tv-text-muted)" }}>{desc}</div>
            </div>
        </li>
    );
}

function ContactTile({ icon: Icon, title, value, href }) {
    const Comp = href ? "a" : "div";
    return (
        <Comp
            href={href}
            className="flex items-center gap-3 rounded-2xl border p-4 transition-colors hover:border-current"
            style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
        >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-primary-deep)" }}>
                <Icon size={18} />
            </span>
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>{title}</div>
                <div className="mt-0.5 text-sm font-bold">{value}</div>
            </div>
        </Comp>
    );
}
