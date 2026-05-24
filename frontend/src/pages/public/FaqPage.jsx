import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle, Search, Sparkles } from "lucide-react";
import PublicLayout from "./PublicLayout";
import { faqItems } from "./publicContent";

export default function FaqPage() {
    const [query, setQuery] = useState("");
    const [openIndex, setOpenIndex] = useState(0);

    const filteredItems = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return faqItems;
        return faqItems.filter(
            (item) =>
                item.question.toLowerCase().includes(keyword) ||
                item.answer.toLowerCase().includes(keyword),
        );
    }, [query]);

    return (
        <PublicLayout>
            {/* HERO */}
            <section className="relative overflow-hidden bg-[#020617]">
                <div className="absolute inset-0 bg-grid-fade opacity-40" />
                <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#7FB77E]/25 blur-[120px] animate-float-slow" />
                <div className="absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-[#A67C52]/20 blur-[120px] animate-float-slow" />

                <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9de09c] to-[#4f8f4d] text-[#020617] shadow-soft-green animate-pulse-glow"
                    >
                        <HelpCircle size={32} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="mt-6 inline-flex"
                    >
                        <span className="section-tag">
                            <Sparkles size={12} /> FAQ
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="mt-4 text-5xl font-black leading-[1.05] text-white sm:text-6xl"
                    >
                        Câu hỏi thường gặp khi đặt tour{" "}
                        <span className="text-gradient-mountain animate-gradient-pan">
                            Tây Bắc
                        </span>
                        .
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                        className="mt-5 text-lg leading-8 text-slate-300"
                    >
                        Thông tin nhanh về đặt tour, giá dịch vụ, lịch trình, thời tiết và các
                        yêu cầu riêng cho nhóm khách.
                    </motion.p>

                    <motion.label
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.45 }}
                        className="relative mx-auto mt-10 block max-w-2xl"
                    >
                        <Search
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9de09c]"
                            size={20}
                        />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="h-14 w-full rounded-2xl border border-white/15 bg-white/[0.06] py-4 pl-14 pr-5 text-white outline-none placeholder:text-slate-400 transition focus:border-[#7FB77E] focus:bg-[#7FB77E]/10 focus:ring-4 focus:ring-[#7FB77E]/15"
                            placeholder="Tìm câu hỏi về đặt tour, thời tiết, giá tour..."
                        />
                        <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-[#7FB77E]/30 via-transparent to-[#A67C52]/30 opacity-60 blur-xl" />
                    </motion.label>
                </div>
            </section>

            {/* QUESTIONS */}
            <section className="relative bg-gradient-to-b from-[#f7faf6] via-[#eef6ed] to-[#f7faf6] py-20 text-slate-900">
                <div className="absolute inset-0 bg-dots-fade opacity-40" />
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-3">
                        {filteredItems.map((item, index) => {
                            const expanded = openIndex === index;
                            return (
                                <motion.article
                                    key={item.question}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.04 }}
                                    className={[
                                        "overflow-hidden rounded-2xl border bg-white shadow-sm transition-all",
                                        expanded
                                            ? "border-[#7FB77E]/60 shadow-soft-green"
                                            : "border-slate-200 hover:border-[#7FB77E]/40",
                                    ].join(" ")}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex(expanded ? -1 : index)}
                                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                    >
                                        <span className="flex items-center gap-4">
                                            <span
                                                className={[
                                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors",
                                                    expanded
                                                        ? "bg-[#7FB77E] text-white"
                                                        : "bg-[#edf7ec] text-[#4f8f4d]",
                                                ].join(" ")}
                                            >
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <span className="text-base font-black text-slate-900 sm:text-lg">
                                                {item.question}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            size={20}
                                            className={[
                                                "shrink-0 text-[#4f8f4d] transition-transform duration-300",
                                                expanded ? "rotate-180" : "",
                                            ].join(" ")}
                                        />
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {expanded && (
                                            <motion.div
                                                key="content"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden border-t border-slate-100"
                                            >
                                                <p className="px-6 py-5 pl-[4.5rem] text-sm leading-7 text-slate-600">
                                                    {item.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.article>
                            );
                        })}
                    </div>

                    {filteredItems.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"
                        >
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A67C52]/15 text-[#A67C52]">
                                <Search size={26} />
                            </div>
                            <p className="mt-5 text-lg font-black text-slate-800">
                                Chưa có câu hỏi phù hợp với từ khóa này.
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                Bạn có thể gửi câu hỏi trực tiếp cho đội tư vấn của chúng tôi.
                            </p>
                        </motion.div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
