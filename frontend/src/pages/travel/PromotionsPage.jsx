import { motion } from "framer-motion";
import { BadgePercent, Flame } from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import TourGrid from "../../components/tour/TourGrid";
import { mockTours } from "../../data/mockTours";
import { siteImage } from "../../utils/images";

const PROMO_BG = siteImage(
    "promotions",
    "https://images.unsplash.com/photo-1531882015-9d3d6e9fdc6c?auto=format&fit=crop&w=1920&q=80",
);

export default function PromotionsPage() {
    const promotional = mockTours.filter((t) => t.isPromotion);

    return (
        <TravelLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <section
                    className="relative overflow-hidden py-20"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(166,124,82,0.75), rgba(127,183,126,0.5)), url('${PROMO_BG}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="mx-auto max-w-7xl px-4 text-center text-white sm:px-6 lg:px-8">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
                            <BadgePercent size={12} /> Ưu đãi đặc biệt
                        </span>
                        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                            Tour khuyến mãi giảm đến 30%
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                            Tiết kiệm chi phí cho hành trình mơ ước. Ưu đãi giới hạn theo từng ngày khởi hành — đặt sớm để có giá tốt nhất.
                        </p>
                    </div>
                </section>

                <Container className="py-10">
                    <Breadcrumb items={[{ label: "Khuyến mãi" }]} />
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <StatBox label="Tour ưu đãi" value={`${promotional.length}+`} />
                        <StatBox label="Giảm tối đa" value="30%" />
                        <StatBox label="Hoàn tiền" value="Cam kết 100%" />
                    </div>

                    <div className="mt-8">
                        <TourGrid tours={promotional} />
                    </div>
                </Container>
            </motion.div>
        </TravelLayout>
    );
}

function StatBox({ label, value }) {
    return (
        <div className="tv-card flex items-center gap-3 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--tv-gradient-primary)", color: "#06281c" }}>
                <Flame size={22} />
            </span>
            <div>
                <div className="text-2xl font-black" style={{ color: "var(--tv-text)" }}>{value}</div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>{label}</div>
            </div>
        </div>
    );
}
