import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Search, User } from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import EmptyState from "../../components/common/EmptyState";
import { blogs } from "../../data/blogs";
import { formatDateShort } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";
import { siteImage } from "../../utils/images";

const BLOG_BG = siteImage(
    "blog",
    "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1920&q=80",
);

const CATEGORIES = [
    "Tất cả",
    "Cẩm nang",
    "Điểm đến",
    "Lịch trình",
    "Ẩm thực",
];

export default function BlogPage() {
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("Tất cả");
    const debounced = useDebounce(search, 250);

    const filtered = useMemo(() => {
        return blogs.filter((b) => {
            if (cat !== "Tất cả" && b.category !== cat) return false;
            if (debounced) {
                const q = debounced.toLowerCase();
                return (
                    b.title.toLowerCase().includes(q) ||
                    b.excerpt.toLowerCase().includes(q) ||
                    b.tags.some((t) => t.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [debounced, cat]);

    return (
        <TravelLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <section
                    className="relative overflow-hidden py-16"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(13,32,24,0.78), rgba(166,124,82,0.55)), url('${BLOG_BG}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="mx-auto max-w-7xl px-4 text-center text-white sm:px-6 lg:px-8">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
                            Cẩm nang
                        </span>
                        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                            Mẹo và kinh nghiệm du lịch
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                            Tổng hợp những bài viết hữu ích cho chuyến đi của bạn.
                        </p>
                        <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-full border border-white/30 bg-white/95 p-2 shadow-2xl">
                            <Search size={16} className="ml-2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Tìm bài viết..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                            />
                        </div>
                    </div>
                </section>

                <Container className="py-10">
                    <Breadcrumb items={[{ label: "Cẩm nang" }]} />

                    <div className="mt-5 flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => {
                            const active = c === cat;
                            return (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCat(c)}
                                    className="rounded-full px-4 py-2 text-xs font-bold transition-colors"
                                    style={{
                                        background: active ? "var(--tv-primary)" : "var(--tv-bg-subtle)",
                                        color: active ? "#06281c" : "var(--tv-text-muted)",
                                    }}
                                >
                                    {c}
                                </button>
                            );
                        })}
                    </div>

                    {filtered.length ? (
                        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filtered.map((blog, idx) => (
                                <motion.article
                                    key={blog.id}
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className="tv-card tv-card-hover overflow-hidden"
                                >
                                    <Link to={`/blog/${blog.slug}`} className="block tv-image-hover h-52">
                                        <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" loading="lazy" />
                                    </Link>
                                    <div className="p-5">
                                        <span className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-primary-deep)" }}>
                                            {blog.category}
                                        </span>
                                        <Link to={`/blog/${blog.slug}`} className="mt-3 block text-lg font-black hover:opacity-80" style={{ color: "var(--tv-text)" }}>
                                            {blog.title}
                                        </Link>
                                        <p className="mt-2 line-clamp-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>{blog.excerpt}</p>
                                        <div className="mt-4 flex items-center gap-3 text-[11px] font-bold" style={{ color: "var(--tv-text-soft)" }}>
                                            <span className="inline-flex items-center gap-1"><User size={11} /> {blog.author}</span>
                                            <span className="inline-flex items-center gap-1"><Calendar size={11} /> {formatDateShort(blog.date)}</span>
                                            <span className="inline-flex items-center gap-1"><Clock size={11} /> {blog.readingTime}p</span>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10">
                            <EmptyState
                                title="Không tìm thấy bài viết"
                                description="Hãy thử tìm với từ khoá khác hoặc chọn chuyên mục khác."
                            />
                        </div>
                    )}
                </Container>
            </motion.div>
        </TravelLayout>
    );
}
