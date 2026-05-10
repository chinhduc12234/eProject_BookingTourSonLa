import { useState } from "react";
import { Send } from "lucide-react";
import PublicLayout from "./PublicLayout";
import { contactCards, supportTopics } from "./publicContent";

export default function ContactPage() {
    const [sent, setSent] = useState(false);

    function handleSubmit(event) {
        event.preventDefault();
        setSent(true);
    }

    return (
        <PublicLayout>
            <section className="bg-[#020617] py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-black uppercase text-[#7FB77E]">Liên hệ</p>
                    <div className="mt-4 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                        <div>
                            <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl">
                                Cần hỗ trợ đặt tour Tây Bắc?
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-slate-300">
                                Gửi thông tin hành trình, số người, thời gian dự kiến và mức ngân sách. Đội hỗ trợ sẽ
                                phản hồi phương án phù hợp cho Mộc Châu, Tà Xùa, Sơn La và các điểm Tây Bắc liên quan.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {contactCards.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                                        <Icon className="text-[#7FB77E]" size={24} />
                                        <h2 className="mt-4 text-sm font-black uppercase text-slate-400">{item.title}</h2>
                                        <p className="mt-2 text-lg font-black text-white">{item.value}</p>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#f7faf6] py-16 text-slate-900">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-black">Gửi yêu cầu hỗ trợ</h2>
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <label className="block">
                                <span className="text-sm font-bold text-slate-700">Họ và tên</span>
                                <input
                                    className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-4 outline-none focus:border-[#7FB77E]"
                                    placeholder="Nguyễn Văn A"
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-bold text-slate-700">Số điện thoại</span>
                                <input
                                    className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-4 outline-none focus:border-[#7FB77E]"
                                    placeholder="09xx xxx xxx"
                                />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-sm font-bold text-slate-700">Email</span>
                                <input
                                    type="email"
                                    className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-4 outline-none focus:border-[#7FB77E]"
                                    placeholder="email@example.com"
                                />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-sm font-bold text-slate-700">Nhu cầu</span>
                                <textarea
                                    className="mt-2 min-h-32 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#7FB77E]"
                                    placeholder="Ví dụ: Gia đình 4 người muốn đi Mộc Châu 3 ngày 2 đêm..."
                                />
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#7FB77E] px-6 text-sm font-black text-[#020617] hover:bg-[#9de09c]"
                        >
                            Gửi yêu cầu
                            <Send size={17} />
                        </button>
                        {sent && <p className="mt-4 text-sm font-bold text-[#4f8f4d]">Yêu cầu đã được ghi nhận trên giao diện.</p>}
                    </form>

                    <div className="space-y-5">
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-black">Nhóm hỗ trợ</h2>
                            <ul className="mt-5 space-y-3">
                                {supportTopics.map((item) => (
                                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                                        <span className="mt-2 h-2 w-2 rounded-full bg-[#A67C52]" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-[#0b1f17] shadow-sm">
                            <div
                                className="h-72 bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80')",
                                }}
                            />
                            <div className="p-6">
                                <h2 className="text-xl font-black text-white">Văn phòng Hà Nội</h2>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    Điểm tiếp nhận đặt tour, điều hành tour và kết nối đối tác địa phương cho các hành
                                    trình Tây Bắc.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
