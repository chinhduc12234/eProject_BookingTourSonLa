import { CreditCard, Wallet } from "lucide-react";
import AccountLayout from "./AccountLayout";
import EmptyState from "../../components/common/EmptyState";
import { useBookings } from "../../hooks/useBookings";
import { formatCurrency, formatDateShort } from "../../utils/formatters";

const PAY_LABELS = {
    TRANSFER: "Chuyển khoản",
    WALLET: "Ví điện tử",
    OFFICE: "Văn phòng",
};

export default function AccountPaymentsPage() {
    const { bookings } = useBookings();

    if (!bookings.length) {
        return (
            <AccountLayout title="Lịch sử thanh toán">
                <EmptyState
                    icon={Wallet}
                    title="Chưa có giao dịch nào"
                    description="Khi bạn đặt tour và thanh toán, lịch sử sẽ hiển thị tại đây."
                />
            </AccountLayout>
        );
    }

    return (
        <AccountLayout title="Lịch sử thanh toán" description="Tổng hợp các giao dịch đặt tour của bạn.">
            <div className="tv-card overflow-hidden">
                <div className="grid grid-cols-[1.4fr_1fr_1fr_120px] gap-3 border-b px-4 py-3 text-[10px] font-black uppercase tracking-widest md:grid-cols-[1.7fr_1fr_1fr_120px]" style={{ borderColor: "var(--tv-border)", color: "var(--tv-text-soft)", background: "var(--tv-bg-subtle)" }}>
                    <span>Booking</span>
                    <span>Hình thức</span>
                    <span>Tổng tiền</span>
                    <span className="text-right">Trạng thái</span>
                </div>
                {bookings.map((b) => (
                    <div key={b.bookingCode} className="grid grid-cols-[1.4fr_1fr_1fr_120px] gap-3 border-b px-4 py-3 text-sm md:grid-cols-[1.7fr_1fr_1fr_120px]" style={{ borderColor: "var(--tv-border)", color: "var(--tv-text)" }}>
                        <span>
                            <div className="font-black">{b.bookingCode}</div>
                            <div className="text-xs" style={{ color: "var(--tv-text-soft)" }}>{b.tourTitle} · {formatDateShort(b.createdAt)}</div>
                        </span>
                        <span className="inline-flex items-center gap-2 font-bold" style={{ color: "var(--tv-text-muted)" }}>
                            <CreditCard size={14} /> {PAY_LABELS[b.payment]}
                        </span>
                        <span className="font-black" style={{ color: "var(--tv-primary-deep)" }}>{formatCurrency(b.totalPrice)}</span>
                        <span className="text-right">
                            <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-text)" }}>
                                {b.status === "PENDING_PAYMENT" ? "Chờ TT" : b.status === "PROCESSING" ? "Đang xử lý" : b.status === "CANCELLED" ? "Đã huỷ" : "OK"}
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </AccountLayout>
    );
}
