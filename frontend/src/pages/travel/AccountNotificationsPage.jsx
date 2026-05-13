import { BellRing, Sparkles, Ticket } from "lucide-react";
import AccountLayout from "./AccountLayout";
import { formatDateShort } from "../../utils/formatters";

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        icon: Ticket,
        title: "Đặt tour Mộc Châu đã được xác nhận",
        desc: "Tư vấn viên sẽ liên hệ với bạn trong 15 phút để xác nhận chi tiết.",
        date: "2026-05-12",
        unread: true,
    },
    {
        id: 2,
        icon: Sparkles,
        title: "Khuyến mãi mới: -30% tour Tà Xùa cuối tuần",
        desc: "Số lượng có hạn — chỉ áp dụng cho 20 booking đầu tiên trong tuần.",
        date: "2026-05-10",
        unread: true,
    },
    {
        id: 3,
        icon: BellRing,
        title: "Nhắc nhở: 7 ngày nữa khởi hành Sa Pa",
        desc: "Đừng quên chuẩn bị giấy tờ và áo ấm cho chuyến đi.",
        date: "2026-05-07",
        unread: false,
    },
];

export default function AccountNotificationsPage() {
    return (
        <AccountLayout title="Thông báo" description="Các cập nhật quan trọng về booking và ưu đãi của bạn.">
            <div className="space-y-3">
                {MOCK_NOTIFICATIONS.map((n) => {
                    const Icon = n.icon;
                    return (
                        <article
                            key={n.id}
                            className="tv-card flex items-start gap-4 p-5"
                            style={n.unread ? { borderLeftWidth: 4, borderLeftColor: "var(--tv-primary)" } : {}}
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-primary-deep)" }}>
                                <Icon size={18} />
                            </span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-black" style={{ color: "var(--tv-text)" }}>{n.title}</h3>
                                    <span className="text-[11px] font-bold" style={{ color: "var(--tv-text-soft)" }}>{formatDateShort(n.date)}</span>
                                </div>
                                <p className="mt-1 text-xs leading-6" style={{ color: "var(--tv-text-muted)" }}>{n.desc}</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </AccountLayout>
    );
}
