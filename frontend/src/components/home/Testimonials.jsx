import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { testimonials } from "../../data/blogs";

export default function Testimonials() {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="tv-section-title">Khách hàng nói gì</p>
                    <h2 className="mt-2 text-3xl font-black md:text-4xl" style={{ color: "var(--tv-text)" }}>
                        Hơn 18.000 chuyến đi hài lòng
                    </h2>
                </div>

                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {testimonials.map((t, idx) => (
                        <motion.figure
                            key={t.name}
                            initial={{ opacity: 0, y: 22 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.07 }}
                            className="tv-card flex flex-col p-6"
                        >
                            <Quote size={32} style={{ color: "var(--tv-primary)" }} className="opacity-60" />
                            <blockquote className="mt-3 flex-1 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                                "{t.comment}"
                            </blockquote>

                            <div className="mt-5 flex items-center gap-1" aria-label={`Đánh giá ${t.rating}`}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={i <= Math.round(t.rating) ? "#facc15" : "transparent"}
                                        stroke={i <= Math.round(t.rating) ? "#facc15" : "var(--tv-text-soft)"}
                                    />
                                ))}
                            </div>

                            <figcaption className="mt-4 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--tv-border)" }}>
                                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                                <div>
                                    <div className="text-sm font-black" style={{ color: "var(--tv-text)" }}>{t.name}</div>
                                    <div className="text-xs" style={{ color: "var(--tv-text-soft)" }}>{t.location}</div>
                                </div>
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
