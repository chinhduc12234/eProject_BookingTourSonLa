import { motion } from "framer-motion";
import { Clock, Timer } from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import TourGrid from "../../components/tour/TourGrid";
import { mockTours } from "../../data/mockTours";
import { siteImage } from "../../utils/images";

const LM_BG = siteImage(
    "last-minute",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80",
);

export default function LastMinutePage() {
    const tours = mockTours.filter((t) => t.isLastMinute);

    return (
        <TravelLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <section
                    className="relative overflow-hidden py-20"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(220,38,38,0.78), rgba(13,32,24,0.55)), url('${LM_BG}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="mx-auto max-w-7xl px-4 text-center text-white sm:px-6 lg:px-8">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
                            <Timer size={12} /> Khởi hành trong tuần
                        </span>
                        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                            Tour giờ chót - giá tốt nhất
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                            Những tour còn chỗ trống, khởi hành sớm với giá ưu đãi đặc biệt. Đặt nhanh trước khi hết chỗ!
                        </p>
                    </div>
                </section>

                <Container className="py-10">
                    <Breadcrumb items={[{ label: "Tour giờ chót" }]} />

                    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border p-4" style={{ background: "var(--tv-bg-elevated)", borderColor: "var(--tv-border)" }}>
                        <Clock size={18} style={{ color: "var(--tv-danger)" }} />
                        <span className="text-sm font-bold" style={{ color: "var(--tv-text)" }}>
                            {tours.length} tour đang chạy giờ chót — đặt ngay để giữ chỗ.
                        </span>
                    </div>

                    <div className="mt-6">
                        <TourGrid tours={tours} />
                    </div>
                </Container>
            </motion.div>
        </TravelLayout>
    );
}
