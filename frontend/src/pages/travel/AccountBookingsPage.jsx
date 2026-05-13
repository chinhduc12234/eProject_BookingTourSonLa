import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import AccountLayout from "./AccountLayout";
import EmptyState from "../../components/common/EmptyState";
import { useBookings } from "../../hooks/useBookings";
import { formatCurrency, formatDate, formatDateShort } from "../../utils/formatters";

const STATUS_LABELS = {
    PROCESSING: { label: "Đang xử lý", color: "bg-blue-500" },
    PENDING_PAYMENT: { label: "Chờ thanh toán", color: "bg-amber-500" },
    CONFIRMED: { label: "Đã xác nhận", color: "bg-emerald-600" },
    CANCELLED: { label: "Đã huỷ", color: "bg-rose-500" },
    COMPLETED: { label: "Hoàn thành", color: "bg-slate-500" },
};

export default function AccountBookingsPage() {
    const { bookings, cancelBooking } = useBookings();

    return (
        <AccountLayout title="Tour đã đặt" description="Theo dõi và quản lý các đơn đặt tour của bạn">
            {bookings.length === 0 ? (
                <EmptyState
                    icon={Ticket}
                    title="Chưa có booking nào"
                    description="Bạn chưa đặt tour nào. Hãy bắt đầu hành trình tiếp theo của bạn ngay hôm nay."
                    action={
                        <Link to="/tours" className="tv-btn-primary">
                            Khám phá tour
                        </Link>
                    }
                />
            ) : (
                <div className="grid gap-4">
                    {bookings.map((b) => {
                        const status = STATUS_LABELS[b.status] || STATUS_LABELS.PROCESSING;
                        return (
                            <article key={b.bookingCode} className="tv-card overflow-hidden grid md:grid-cols-[200px_1fr]">
                                <div className="relative h-48 md:h-auto">
                                    <img src={b.tourImage} alt={b.tourTitle} className="h-full w-full object-cover" />
                                    <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white ${status.color}`}>
                                        {status.label}
                                    </span>
                                </div>
                                <div className="flex flex-col p-5">
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold" style={{ color: "var(--tv-text-soft)" }}>
                                        <span className="inline-flex items-center gap-1"><Ticket size={11} /> {b.bookingCode}</span>
                                        <span>Đặt lúc {formatDateShort(b.createdAt)}</span>
                                    </div>
                                    <h3 className="mt-2 text-lg font-black" style={{ color: "var(--tv-text)" }}>{b.tourTitle}</h3>

                                    <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs font-bold" style={{ color: "var(--tv-text-muted)" }}>
                                        <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {formatDate(b.departure.date)}</span>
                                        <span className="inline-flex items-center gap-1"><MapPin size={11} /> {b.departure.start}</span>
                                        <span className="inline-flex items-center gap-1"><Users size={11} /> {b.travellers.adult} NL · {b.travellers.child} TE · {b.travellers.infant} EB</span>
                                    </div>

                                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--tv-border)" }}>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>Tổng tiền</div>
                                            <div className="text-xl font-black" style={{ color: "var(--tv-primary-deep)" }}>{formatCurrency(b.totalPrice)}</div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Link to={`/booking-success/${b.bookingCode}`} className="tv-btn-outline">
                                                Xem chi tiết
                                            </Link>
                                            {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (window.confirm("Bạn chắc chắn muốn huỷ booking này?")) {
                                                            cancelBooking(b.bookingCode);
                                                        }
                                                    }}
                                                    className="tv-btn-outline"
                                                    style={{ color: "var(--tv-danger)" }}
                                                >
                                                    Huỷ booking
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </AccountLayout>
    );
}
