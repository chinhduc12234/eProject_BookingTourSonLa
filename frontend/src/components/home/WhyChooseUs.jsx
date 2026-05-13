import { motion } from "framer-motion";
import {
    BadgePercent,
    Headphones,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

const ICONS = { ShieldCheck, BadgePercent, Headphones, Sparkles };

const ITEMS = [
    {
        icon: "ShieldCheck",
        title: "Cam kết chất lượng",
        desc: "Mọi tour đều được kiểm duyệt nghiêm ngặt về an toàn, lịch trình và dịch vụ.",
    },
    {
        icon: "BadgePercent",
        title: "Giá tốt nhất thị trường",
        desc: "Cam kết giá cạnh tranh, hoàn tiền 200% nếu tìm được tour cùng chất lượng giá rẻ hơn.",
    },
    {
        icon: "Headphones",
        title: "Hỗ trợ 24/7",
        desc: "Đội tư vấn và HDV luôn sẵn sàng hỗ trợ trước, trong và sau chuyến đi.",
    },
    {
        icon: "Sparkles",
        title: "Trải nghiệm độc đáo",
        desc: "Mỗi tour đều có trải nghiệm bản địa thật, không 'check-in cảnh giả' hay 'tour chen chúc'.",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="tv-section-title">Vì sao chọn chúng tôi</p>
                    <h2 className="mt-2 text-3xl font-black md:text-4xl" style={{ color: "var(--tv-text)" }}>
                        4 cam kết cho mỗi chuyến đi
                    </h2>
                </div>

                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {ITEMS.map((item, idx) => {
                        const Icon = ICONS[item.icon];
                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 22 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: idx * 0.08 }}
                                className="tv-card tv-card-hover p-6"
                            >
                                <div
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                                    style={{
                                        background: "var(--tv-gradient-primary)",
                                        color: "#06281c",
                                    }}
                                >
                                    <Icon size={24} />
                                </div>
                                <h3 className="mt-5 text-lg font-black" style={{ color: "var(--tv-text)" }}>
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                                    {item.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
