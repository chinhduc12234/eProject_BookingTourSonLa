import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { destinations } from "../../data/destinations";

export default function DestinationsHighlight() {
    const featured = destinations.slice(0, 6);
    return (
        <section className="relative overflow-hidden py-16">
            <div className="absolute inset-0 opacity-50" style={{ background: "linear-gradient(to bottom, var(--tv-bg-subtle), transparent)" }} />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="tv-section-title">Điểm đến nổi bật</p>
                    <h2 className="mt-2 text-3xl font-black md:text-4xl" style={{ color: "var(--tv-text)" }}>
                        Tây Bắc qua từng vùng đất
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-7" style={{ color: "var(--tv-text-muted)" }}>
                        Mỗi điểm đến mang một câu chuyện riêng. Khám phá các vùng đất nổi bật và chọn cho mình hành trình phù hợp.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {featured.map((d, idx) => (
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

                <div className="mt-8 text-center">
                    <Link
                        to="/destinations"
                        className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition-colors hover:border-[var(--tv-primary)]"
                        style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                    >
                        Xem tất cả điểm đến <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
