import { useMemo, useState } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
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
                item.answer.toLowerCase().includes(keyword)
        );
    }, [query]);

    return (
        <PublicLayout>
            <section className="bg-[#020617] py-20">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#7FB77E] text-[#020617]">
                        <HelpCircle size={30} />
                    </span>
                    <p className="mt-6 text-sm font-black uppercase text-[#7FB77E]">FAQ</p>
                    <h1 className="mt-3 text-5xl font-black leading-tight text-white sm:text-6xl">
                        Câu hỏi thường gặp khi đặt tour Tây Bắc.
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-slate-300">
                        Thông tin nhanh về đặt tour, giá dịch vụ, lịch trình, thời tiết và các yêu cầu riêng cho nhóm
                        khách.
                    </p>
                    <label className="relative mx-auto mt-8 block max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="h-14 w-full rounded-lg border border-white/10 bg-white/10 py-4 pl-12 pr-4 text-white outline-none placeholder:text-slate-400 focus:border-[#7FB77E]"
                            placeholder="Tìm câu hỏi về đặt tour, thời tiết, giá tour..."
                        />
                    </label>
                </div>
            </section>

            <section className="bg-[#f7faf6] py-16 text-slate-900">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-3">
                        {filteredItems.map((item, index) => {
                            const expanded = openIndex === index;
                            return (
                                <article key={item.question} className="rounded-lg border border-slate-200 bg-white shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex(expanded ? -1 : index)}
                                        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                                    >
                                        <span className="text-base font-black text-slate-900">{item.question}</span>
                                        <ChevronDown
                                            size={20}
                                            className={[
                                                "shrink-0 text-[#4f8f4d] transition-transform",
                                                expanded ? "rotate-180" : "",
                                            ].join(" ")}
                                        />
                                    </button>
                                    {expanded && (
                                        <div className="border-t border-slate-100 px-5 py-5">
                                            <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                    {filteredItems.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <p className="font-bold text-slate-700">Chưa có câu hỏi phù hợp với từ khóa này.</p>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
