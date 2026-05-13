import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Share2, User } from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import { blogs } from "../../data/blogs";
import { formatDate } from "../../utils/formatters";

export default function BlogDetailPage() {
    const { slug } = useParams();
    const blog = blogs.find((b) => b.slug === slug);

    // Hỗ trợ slug chính sách / điều khoản (mock content placeholder)
    if (!blog) {
        const STATIC_POSTS = ["dieu-khoan-su-dung", "chinh-sach-bao-mat", "chinh-sach-huy-tour", "chinh-sach-thanh-toan"];
        if (STATIC_POSTS.includes(slug)) {
            return <StaticPost slug={slug} />;
        }
        return <Navigate to="/blog" replace />;
    }

    const related = blogs.filter((b) => b.id !== blog.id).slice(0, 3);

    return (
        <TravelLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <section
                    className="relative h-[55vh] min-h-[420px] overflow-hidden"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(13,32,24,0.5), rgba(13,32,24,0.75)), url('${blog.image}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="relative mx-auto flex h-full max-w-4xl flex-col justify-end px-4 pb-12 text-white sm:px-6 lg:px-8">
                        <span className="inline-flex max-w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
                            {blog.category}
                        </span>
                        <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{blog.title}</h1>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                            <span className="inline-flex items-center gap-1.5"><User size={14} /> {blog.author}</span>
                            <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> {formatDate(blog.date)}</span>
                            <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {blog.readingTime} phút đọc</span>
                        </div>
                    </div>
                </section>

                <Container className="py-12">
                    <Breadcrumb items={[{ label: "Cẩm nang", to: "/blog" }, { label: blog.title }]} />

                    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
                        <article className="tv-card p-6 lg:p-8">
                            <p className="text-base leading-8" style={{ color: "var(--tv-text-muted)" }}>{blog.excerpt}</p>
                            <div className="mt-5 text-sm leading-8" style={{ color: "var(--tv-text-muted)" }}>
                                {blog.content}
                            </div>

                            <p className="mt-5 text-sm leading-8" style={{ color: "var(--tv-text-muted)" }}>
                                Đây là bài viết minh hoạ cho cẩm nang du lịch của Tây Bắc Travel. Trong phiên bản thật,
                                nội dung sẽ được biên soạn chi tiết với hình ảnh thực tế, các điểm cần lưu ý, lịch trình
                                gợi ý và checklist mang theo cho từng hành trình.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-2">
                                {blog.tags.map((t) => (
                                    <span key={t} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-text-muted)" }}>
                                        #{t}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6" style={{ borderColor: "var(--tv-border)" }}>
                                <Link to="/blog" className="tv-btn-outline">
                                    <ArrowLeft size={14} /> Quay lại cẩm nang
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard?.writeText(window.location.href)}
                                    className="tv-btn-outline"
                                >
                                    <Share2 size={14} /> Chia sẻ
                                </button>
                            </div>
                        </article>

                        <aside className="h-fit lg:sticky lg:top-24 space-y-4">
                            <div className="tv-card p-5">
                                <div className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tv-primary-deep)" }}>Bài viết khác</div>
                                <div className="mt-3 grid gap-3">
                                    {related.map((r) => (
                                        <Link key={r.id} to={`/blog/${r.slug}`} className="group flex items-center gap-3">
                                            <img src={r.image} alt={r.title} className="h-14 w-20 rounded-lg object-cover" loading="lazy" />
                                            <div>
                                                <div className="text-xs font-bold line-clamp-2 group-hover:opacity-80" style={{ color: "var(--tv-text)" }}>{r.title}</div>
                                                <div className="mt-1 text-[10px]" style={{ color: "var(--tv-text-soft)" }}>{r.category} · {r.readingTime}p</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </Container>
            </motion.div>
        </TravelLayout>
    );
}

function StaticPost({ slug }) {
    const TITLES = {
        "dieu-khoan-su-dung": "Điều khoản sử dụng",
        "chinh-sach-bao-mat": "Chính sách bảo mật",
        "chinh-sach-huy-tour": "Chính sách hủy tour",
        "chinh-sach-thanh-toan": "Chính sách thanh toán",
    };
    return (
        <TravelLayout>
            <Container className="py-16">
                <Breadcrumb items={[{ label: "Cẩm nang", to: "/blog" }, { label: TITLES[slug] }]} />
                <div className="mt-6 tv-card p-8">
                    <h1 className="text-3xl font-black md:text-4xl" style={{ color: "var(--tv-text)" }}>
                        {TITLES[slug]}
                    </h1>
                    <p className="mt-3 text-sm leading-7" style={{ color: "var(--tv-text-muted)" }}>
                        Đây là nội dung mẫu cho trang {TITLES[slug].toLowerCase()}. Nội dung chi tiết sẽ
                        được cập nhật sau, bao gồm: phạm vi áp dụng, quyền và nghĩa vụ của các bên, quy
                        trình giải quyết khiếu nại và thông tin liên hệ.
                    </p>
                </div>
            </Container>
        </TravelLayout>
    );
}
