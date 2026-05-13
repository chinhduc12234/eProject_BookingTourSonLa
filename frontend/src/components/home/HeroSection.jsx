import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Mountain, ShieldCheck, Sparkles, Star } from "lucide-react";
import SearchBox from "../search/SearchBox";
import { siteImage } from "../../utils/images";

const STATS = [
    { value: "120+", label: "Lịch trình Tây Bắc" },
    { value: "18k+", label: "Lượt khách hài lòng" },
    { value: "4.8/5", label: "Đánh giá trung bình" },
    { value: "60+", label: "Hướng dẫn viên" },
];

const BG_IMAGE = siteImage(
    "home",
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=80",
);

const FLOATING_BADGES = [
    { icon: Mountain, label: "Tây Bắc", position: "left-6 top-24" },
    { icon: Sparkles, label: "Săn mây", position: "right-10 top-32" },
    { icon: ShieldCheck, label: "An toàn", position: "left-12 bottom-32" },
    { icon: Compass, label: "Khám phá", position: "right-6 bottom-44" },
];

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1.0 }}
                    transition={{ duration: 12, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
                    style={{
                        backgroundImage: `url('${BG_IMAGE}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                    className="h-full w-full"
                />
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/75" />

            {FLOATING_BADGES.map((b, idx) => (
                <motion.span
                    key={b.label}
                    className={`absolute hidden md:inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur ${b.position}`}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: [0, -10, 0], opacity: 1 }}
                    transition={{ duration: 4 + idx * 0.3, repeat: Infinity, delay: idx * 0.4, ease: "easeInOut" }}
                >
                    <b.icon size={14} /> {b.label}
                </motion.span>
            ))}

            <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:pt-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
                        <Star size={12} fill="#facc15" stroke="#facc15" />
                        #1 Booking tour Tây Bắc — 2026
                    </span>
                    <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
                        Khám phá <span className="bg-gradient-to-r from-[#bbe5b9] via-white to-[#bbe5b9] bg-clip-text text-transparent">Tây Bắc</span>
                        <br />
                        theo cách của bạn.
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                        Mộc Châu mùa hoa mận, Tà Xùa biển mây, ruộng bậc thang Mù Cang Chải... Tất cả
                        trong một nền tảng đặt tour thông minh, lịch trình rõ ràng và dịch vụ tận tâm.
                    </p>

                    <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            to="/tours"
                            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-black text-[#06281c]"
                            style={{ background: "linear-gradient(135deg, #7FB77E, #9de09c)", boxShadow: "0 16px 40px rgba(127,183,126,0.45)" }}
                        >
                            Bắt đầu hành trình
                            <ArrowRight size={16} />
                        </Link>
                        <Link
                            to="/destinations"
                            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20"
                        >
                            Xem điểm đến
                        </Link>
                    </div>
                </motion.div>

                <div className="mt-12">
                    <SearchBox floating />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-4"
                >
                    {STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center text-white backdrop-blur"
                        >
                            <div className="text-2xl font-black sm:text-3xl">{stat.value}</div>
                            <div className="mt-1 text-xs font-semibold text-white/80">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="relative h-12" style={{ background: "linear-gradient(to bottom, transparent, var(--tv-bg))" }} />
        </section>
    );
}
