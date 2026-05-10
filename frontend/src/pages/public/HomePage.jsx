import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Search } from "lucide-react";
import PublicLayout from "./PublicLayout";
import {
    destinationGroups,
    featuredTours,
    formatDate,
    getFirstDeparture,
    heroStats,
    quickSearch,
    serviceHighlights,
    trustBadges,
    whyChooseUs,
} from "./publicContent";

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function HomePage() {
    return (
        <PublicLayout>
            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "url('https://datviettour.com.vn/uploads/images/tin-tuc-SEO/mien-bac/danh-thang/du-lich-son-la-3.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <div className="absolute inset-0 bg-[#020617]/70" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020617] to-transparent" />

                <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                    <motion.div initial="hidden" animate="show" variants={fadeUp}>
                        <span className="inline-flex rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-[#d9f5d8] backdrop-blur">
                            Booking tour du lịch Tây Bắc
                        </span>
                        <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                            Lên lịch cho hành trình núi rừng Tây Bắc.
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                            Khám phá Mộc Châu, Tà Xùa, Sông Đà và các bản làng Sơn La với lịch trình rõ ràng, dịch vụ
                            đồng hành và trải nghiệm địa phương được chọn lọc.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/tour"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#7FB77E] px-6 text-sm font-black text-[#020617] hover:bg-[#9de09c]"
                            >
                                Đặt vé ngay
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                to="/gioi-thieu"
                                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 px-6 text-sm font-bold text-white hover:border-[#7FB77E]"
                            >
                                Về chúng tôi
                            </Link>
                        </div>

                        <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                            {heroStats.map((item) => (
                                <div key={item.label} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                                    <div className="text-2xl font-black text-white">{item.value}</div>
                                    <div className="mt-1 text-xs font-semibold text-slate-300">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.12 }}
                        className="rounded-lg border border-white/15 bg-[#020617]/70 p-5 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#7FB77E] text-[#020617]">
                                <Search size={21} />
                            </span>
                            <div>
                                <h2 className="text-xl font-black text-white">Tìm tour phù hợp</h2>
                                <p className="text-sm text-slate-300">Chọn nhanh nhu cầu cho chuyến đi sắp tới.</p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3">
                            {quickSearch.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex items-center gap-4 rounded-lg bg-white/[0.08] p-4">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#7FB77E]">
                                            <Icon size={20} />
                                        </span>
                                        <div>
                                            <div className="text-xs font-bold uppercase text-slate-400">{item.label}</div>
                                            <div className="mt-1 text-sm font-bold text-white">{item.value}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Link
                            to="/tour"
                            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#A67C52] text-sm font-black text-white hover:bg-[#c29161]"
                        >
                            Xem ngày khởi hành
                        </Link>
                    </motion.div>
                </div>
            </section>

            <section className="bg-[#020617] py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="text-sm font-black uppercase text-[#7FB77E]">Tour nổi bật</p>
                            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Gợi ý hành trình Tây Bắc</h2>
                        </div>
                        <Link to="/tour" className="text-sm font-bold text-[#A67C52] hover:text-[#d4a878]">
                            Xem tất cả tour
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-6 md:grid-cols-3">
                        {featuredTours.map((tour) => {
                            const firstDeparture = getFirstDeparture(tour);

                            return (
                                <article key={tour.title} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                                    <Link to={`/tour/${tour.slug}`} className="block">
                                        <img src={tour.image} alt={tour.title} className="h-56 w-full object-cover" />
                                    </Link>
                                    <div className="p-5">
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="font-bold text-[#7FB77E]">{tour.place}</span>
                                            <span className="text-slate-300">{tour.duration}</span>
                                        </div>
                                        <Link to={`/tour/${tour.slug}`} className="mt-3 block text-xl font-black text-white hover:text-[#9de09c]">
                                            {tour.title}
                                        </Link>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {tour.tags.map((tag) => (
                                                <span key={tag} className="rounded-lg bg-white/[0.08] px-3 py-1 text-xs font-bold text-slate-200">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-sm font-bold text-slate-200">
                                            <CalendarDays size={17} className="text-[#7FB77E]" />
                                            <span>Khởi hành {formatDate(firstDeparture.date)}</span>
                                        </div>
                                        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                                            <span className="text-sm text-slate-400">Từ</span>
                                            <span className="text-lg font-black text-white">{tour.price}</span>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <Link
                                                to={`/tour/${tour.slug}`}
                                                className="text-sm font-black text-slate-300 hover:text-white"
                                            >
                                                Chi tiết
                                            </Link>
                                            <Link
                                                to={`/dat-tour/${tour.slug}?date=${firstDeparture.id}`}
                                                className="inline-flex items-center gap-2 text-sm font-black text-[#7FB77E] hover:text-[#9de09c]"
                                            >
                                                Đặt vé
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-[#f7faf6] py-16 text-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                        <div>
                            <p className="text-sm font-black uppercase text-[#4f8f4d]">Dịch vụ</p>
                            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Đặt tour nhanh, thông tin rõ, đồng hành sát.</h2>
                            <ul className="mt-6 space-y-3">
                                {whyChooseUs.map((item) => (
                                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                                        <span className="mt-2 h-2 w-2 rounded-full bg-[#7FB77E]" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {serviceHighlights.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#edf7ec] text-[#4f8f4d]">
                                            <Icon size={22} />
                                        </span>
                                        <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#020617] py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 md:grid-cols-3">
                        {destinationGroups.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
                                    <Icon className="text-[#7FB77E]" size={28} />
                                    <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-300">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-8 grid gap-3 md:grid-cols-3">
                        {trustBadges.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3">
                                    <Icon size={18} className="text-[#A67C52]" />
                                    <span className="text-sm font-bold text-slate-200">{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
