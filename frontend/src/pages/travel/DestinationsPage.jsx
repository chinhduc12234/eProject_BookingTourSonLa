import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import { destinations } from "../../data/destinations";
import { siteImage } from "../../utils/images";

const DEST_BG = siteImage(
    "destinations",
    "https://images.unsplash.com/photo-1531882015-9d3d6e9fdc6c?auto=format&fit=crop&w=1920&q=80",
);

export default function DestinationsPage() {
    return (
        <TravelLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <section
                    className="relative overflow-hidden py-20"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(13,32,24,0.78), rgba(79,143,77,0.55)), url('${DEST_BG}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="mx-auto max-w-7xl px-4 text-center text-white sm:px-6 lg:px-8">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
                            <MapPin size={12} /> Khám phá điểm đến
                        </span>
                        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                            Vùng đất nào đang chờ bạn?
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                            Mỗi vùng đất một câu chuyện. Khám phá các điểm đến nổi bật của Tây Bắc và các tour đặc trưng tại đó.
                        </p>
                    </div>
                </section>

                <Container className="py-10">
                    <Breadcrumb items={[{ label: "Điểm đến" }]} />

                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {destinations.map((d, idx) => (
                            <motion.div
                                key={d.id}
                                initial={{ opacity: 0, y: 22 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                            >
                                <Link
                                    to={`/destinations/${d.id}`}
                                    className="group block overflow-hidden rounded-3xl border tv-image-hover relative h-72"
                                    style={{ borderColor: "var(--tv-border)" }}
                                >
                                    <img src={d.image} alt={d.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                                    <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-white">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold backdrop-blur">
                                            <MapPin size={11} /> {d.region}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1.5 text-[11px] font-bold">
                                            <Sparkles size={11} /> {d.tourCount} tour
                                        </span>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                        <h3 className="text-2xl font-black">{d.name}</h3>
                                        <p className="mt-1 text-sm opacity-90">{d.tagline}</p>
                                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#9de09c]">
                                            Khám phá ngay <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </motion.div>
        </TravelLayout>
    );
}
