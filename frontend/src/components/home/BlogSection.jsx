import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { blogs } from "../../data/blogs";
import { formatDateShort } from "../../utils/formatters";

export default function BlogSection() {
    const recent = blogs.slice(0, 3);
    return (
        <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="tv-section-title">Cẩm nang du lịch</p>
                        <h2 className="mt-2 text-3xl font-black md:text-4xl" style={{ color: "var(--tv-text)" }}>
                            Mẹo và kinh nghiệm cho hành trình
                        </h2>
                    </div>
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-1 text-sm font-bold hover:opacity-80"
                        style={{ color: "var(--tv-primary-deep)" }}
                    >
                        Xem tất cả bài viết <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {recent.map((blog, idx) => (
                        <motion.article
                            key={blog.id}
                            initial={{ opacity: 0, y: 22 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.08 }}
                            className="tv-card tv-card-hover overflow-hidden"
                        >
                            <Link to={`/blog/${blog.slug}`} className="block tv-image-hover relative h-52">
                                <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" loading="lazy" />
                                <span
                                    className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-white"
                                    style={{ background: "var(--tv-gradient-primary)", color: "#06281c" }}
                                >
                                    {blog.category}
                                </span>
                            </Link>
                            <div className="p-5">
                                <div className="flex items-center gap-3 text-xs font-bold" style={{ color: "var(--tv-text-soft)" }}>
                                    <span className="inline-flex items-center gap-1"><User size={12} /> {blog.author}</span>
                                    <span className="inline-flex items-center gap-1"><Calendar size={12} /> {formatDateShort(blog.date)}</span>
                                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {blog.readingTime} phút</span>
                                </div>
                                <Link to={`/blog/${blog.slug}`} className="mt-3 line-clamp-2 text-lg font-black leading-snug hover:opacity-80" style={{ color: "var(--tv-text)" }}>
                                    {blog.title}
                                </Link>
                                <p className="mt-2 line-clamp-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                                    {blog.excerpt}
                                </p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
