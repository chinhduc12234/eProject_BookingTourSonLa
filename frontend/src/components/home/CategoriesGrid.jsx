import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { homeCategories } from "../../data/blogs";
import { ArrowRight } from "lucide-react";

export default function CategoriesGrid() {
    return (
        <section className="relative py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="tv-section-title">Khám phá theo loại</p>
                    <h2 className="mt-2 text-3xl font-black md:text-4xl" style={{ color: "var(--tv-text)" }}>
                        Chọn loại tour bạn muốn
                    </h2>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {homeCategories.map((cat, idx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                        >
                            <Link
                                to={`/tours?category=${cat.id}`}
                                className="tv-card tv-card-hover group block p-4 text-center hover:!border-[var(--tv-primary)]"
                            >
                                <div
                                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110"
                                    style={{ background: "var(--tv-bg-subtle)" }}
                                >
                                    <span>{cat.icon}</span>
                                </div>
                                <h3 className="mt-3 text-sm font-black" style={{ color: "var(--tv-text)" }}>{cat.title}</h3>
                                <div
                                    className="mt-1 inline-flex items-center gap-1 text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100"
                                    style={{ color: "var(--tv-primary-deep)" }}
                                >
                                    {cat.count} <ArrowRight size={12} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
