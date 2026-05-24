import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MessageSquare, Send, Sparkles } from "lucide-react";
import PublicLayout from "./PublicLayout";
import { contactCards, supportTopics } from "./publicContent";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: "easeOut", delay: i * 0.08 },
    }),
};

export default function ContactPage() {
    const [sent, setSent] = useState(false);

    function handleSubmit(event) {
        event.preventDefault();
        setSent(true);
    }

    return (
        <PublicLayout>
            {/* HERO */}
            <section className="relative overflow-hidden bg-[#020617]">
                <div className="absolute inset-0 bg-grid-fade opacity-40" />
                <div className="absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-[#7FB77E]/20 blur-[120px] animate-float-slow" />
                <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[#A67C52]/20 blur-[120px] animate-float-slow" />

                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" animate="show" variants={fadeUp}>
                        <span className="section-tag">
                            <MessageSquare size={12} /> Liên hệ
                        </span>
                    </motion.div>

                    <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
                        <motion.div custom={1} initial="hidden" animate="show" variants={fadeUp}>
                            <h1 className="text-5xl font-black leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                                Cần tư vấn tour{" "}
                                <span className="text-gradient-green">Tây Bắc?</span>
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                                Gửi thông tin hành trình, số người, thời gian dự kiến và mức ngân
                                sách. Đội tư vấn sẽ gợi ý lịch trình phù hợp cho Mộc Châu, Tà Xùa,
                                Sơn La và các điểm Tây Bắc liên quan.
                            </p>

                            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#d4a878]">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9de09c] opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7FB77E]" />
                                </span>
                                Phản hồi trong 24 giờ
                            </div>
                        </motion.div>

                        <motion.div
                            custom={2}
                            initial="hidden"
                            animate="show"
                            variants={fadeUp}
                            className="grid gap-3"
                        >
                            {contactCards.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.title}
                                        whileHover={{ x: 6 }}
                                        className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-5 transition-all hover:border-[#7FB77E]/50"
                                    >
                                        <span
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c] transition-all group-hover:bg-[#7FB77E]/25"
                                            style={{ animationDelay: `${idx * 0.2}s` }}
                                        >
                                            <Icon size={22} />
                                        </span>
                                        <div className="min-w-0">
                                            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#d4a878]">
                                                {item.title}
                                            </h2>
                                            <p className="mt-1 text-lg font-black text-white">
                                                {item.value}
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-slate-400">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FORM + INFO */}
            <section className="relative bg-gradient-to-b from-[#f7faf6] via-[#eef6ed] to-[#f7faf6] py-20 text-slate-900">
                <div className="absolute inset-0 bg-dots-fade opacity-40" />
                <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                    <motion.form
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        onSubmit={handleSubmit}
                        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
                    >
                        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#7FB77E]/15 blur-2xl" />
                        <div className="relative flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#9de09c] to-[#4f8f4d] text-white">
                                <Send size={22} />
                            </span>
                            <div>
                                <h2 className="text-2xl font-black">Gửi yêu cầu tư vấn</h2>
                                <p className="text-sm text-slate-500">
                                    Đội tư vấn phản hồi trong 24 giờ làm việc
                                </p>
                            </div>
                        </div>

                        <div className="relative mt-7 grid gap-4 md:grid-cols-2">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                                    Họ và tên
                                </span>
                                <input
                                    className="field-input-light mt-2"
                                    placeholder="Nguyễn Văn A"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                                    Số điện thoại
                                </span>
                                <input
                                    className="field-input-light mt-2"
                                    placeholder="09xx xxx xxx"
                                />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                                    Email
                                </span>
                                <input
                                    type="email"
                                    className="field-input-light mt-2"
                                    placeholder="email@example.com"
                                />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                                    Nhu cầu của bạn
                                </span>
                                <textarea
                                    className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#7FB77E] focus:ring-4 focus:ring-[#7FB77E]/15"
                                    placeholder="Ví dụ: Gia đình 4 người muốn đi Mộc Châu 3 ngày 2 đêm vào tháng 12..."
                                />
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary relative mt-6 w-full text-sm sm:w-auto"
                        >
                            Gửi yêu cầu
                            <Send size={16} />
                        </button>

                        {sent && (
                            <motion.div
                                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="mt-5 inline-flex items-center gap-3 rounded-xl border border-[#7FB77E]/40 bg-[#edf7ec] px-4 py-3 text-sm font-bold text-[#4f8f4d]"
                            >
                                <CheckCircle2 size={18} />
                                Yêu cầu đã được ghi nhận trên giao diện. Chúng tôi sẽ liên hệ sớm.
                            </motion.div>
                        )}
                    </motion.form>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="space-y-5"
                    >
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A67C52]/15 text-[#A67C52]">
                                    <Sparkles size={20} />
                                </span>
                                <h2 className="text-xl font-black">Nhóm hỗ trợ</h2>
                            </div>
                            <ul className="mt-5 space-y-3">
                                {supportTopics.map((item, idx) => (
                                    <motion.li
                                        key={item}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.45, delay: idx * 0.08 }}
                                        className="flex items-start gap-3 text-sm leading-7 text-slate-700"
                                    >
                                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#A67C52]/15 text-[#A67C52]">
                                            ✓
                                        </span>
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-[#0b1f17] shadow-sm">
                            <div
                                className="relative h-72 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                style={{
                                    backgroundImage:
                                        "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80')",
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl bg-[#020617]/80 px-3 py-2 backdrop-blur-md">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#9de09c]" />
                                    <span className="text-xs font-bold text-white">
                                        Văn phòng Sơn La đang mở cửa
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h2 className="text-xl font-black text-white">
                                    Văn phòng Sơn La
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    Điểm tiếp nhận tư vấn, điều hành tour và kết nối đối tác địa
                                    phương cho các hành trình Tây Bắc.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
}
