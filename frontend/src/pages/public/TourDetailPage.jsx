import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, MapPin, Mountain, Users, WalletCards } from "lucide-react";
import PublicLayout from "./PublicLayout";
import { featuredTours, formatDate, getFirstDeparture } from "./publicContent";

export default function TourDetailPage() {
    const { slug } = useParams();
    const tour = featuredTours.find((item) => item.slug === slug);
    const firstDeparture = getFirstDeparture(tour);

    if (!tour) {
        return <Navigate to="/tour" replace />;
    }

    return (
        <PublicLayout>
            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url('${tour.image}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <div className="absolute inset-0 bg-[#020617]/75" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020617] to-transparent" />

                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <Link to="/tour" className="inline-flex items-center gap-2 text-sm font-bold text-[#d9f5d8] hover:text-white">
                        <ArrowLeft size={17} />
                        Quay lại danh sách tour
                    </Link>
                    <div className="mt-8 max-w-4xl">
                        <p className="text-sm font-black uppercase text-[#7FB77E]">{tour.place}</p>
                        <h1 className="mt-3 text-5xl font-black leading-tight text-white sm:text-6xl">{tour.title}</h1>
                        <p className="mt-6 text-lg leading-8 text-slate-200">{tour.summary}</p>
                    </div>
                </div>
            </section>

            <section className="bg-[#020617] py-8">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
                    {[
                        { icon: Clock, label: "Thời lượng", value: tour.duration },
                        { icon: WalletCards, label: "Giá từ", value: tour.price },
                        { icon: Mountain, label: "Mức độ", value: tour.difficulty },
                        { icon: Users, label: "Phù hợp", value: tour.suitable },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                                <Icon size={20} className="text-[#7FB77E]" />
                                <div className="mt-3 text-xs font-black uppercase text-slate-400">{item.label}</div>
                                <div className="mt-1 text-sm font-bold text-white">{item.value}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="bg-[#f7faf6] py-16 text-slate-900">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
                    <div className="space-y-6">
                        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-black">Tổng quan hành trình</h2>
                            <div className="mt-5 grid gap-4 text-sm leading-7 text-slate-700">
                                <p className="flex gap-3">
                                    <MapPin size={18} className="mt-1 shrink-0 text-[#A67C52]" />
                                    <span>{tour.route}</span>
                                </p>
                                <p className="flex gap-3">
                                    <CalendarDays size={18} className="mt-1 shrink-0 text-[#A67C52]" />
                                    <span>Thời điểm đẹp: {tour.bestTime}</span>
                                </p>
                            </div>
                        </article>

                        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                                <div>
                                    <h2 className="text-2xl font-black">Lịch khởi hành</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">Chọn đúng ngày đi và đặt vé trực tiếp theo số chỗ còn lại.</p>
                                </div>
                                <Link to="/tour" className="text-sm font-black text-[#4f8f4d] hover:text-[#2f6c31]">
                                    Xem thêm tour
                                </Link>
                            </div>
                            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                                {tour.departures.map((departure) => (
                                    <div
                                        key={departure.id}
                                        className="grid gap-4 border-b border-slate-100 p-4 last:border-b-0 md:grid-cols-[1.2fr_0.9fr_0.8fr_auto] md:items-center"
                                    >
                                        <div>
                                            <div className="text-sm font-black">{formatDate(departure.date)}</div>
                                            <div className="mt-1 text-xs font-semibold text-slate-500">Mã lịch: {departure.id}</div>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-700">
                                            {departure.start} · {departure.transport}
                                        </div>
                                        <div className="text-sm font-bold text-[#4f8f4d]">
                                            {departure.status} · {departure.seats} chỗ
                                        </div>
                                        <Link
                                            to={`/dat-tour/${tour.slug}?date=${departure.id}`}
                                            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7FB77E] px-4 text-sm font-black text-[#020617] hover:bg-[#9de09c]"
                                        >
                                            Đặt vé
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-black">Lịch trình chi tiết</h2>
                            <div className="mt-6 space-y-4">
                                {tour.itinerary.map((item, index) => (
                                    <div key={item} className="flex gap-4">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7FB77E] text-sm font-black text-[#020617]">
                                            {index + 1}
                                        </span>
                                        <p className="pt-1 text-sm leading-7 text-slate-700">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-black">Dịch vụ bao gồm</h2>
                            <div className="mt-6 grid gap-3 md:grid-cols-2">
                                {tour.includes.map((item) => (
                                    <div key={item} className="flex gap-3 rounded-lg bg-[#f7faf6] p-4 text-sm font-semibold text-slate-700">
                                        <CheckCircle2 size={18} className="shrink-0 text-[#4f8f4d]" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>

                    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <img src={tour.image} alt={tour.title} className="h-56 w-full rounded-lg object-cover" />
                        <h2 className="mt-5 text-2xl font-black">{tour.title}</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{tour.summary}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {tour.highlights.map((item) => (
                                <span key={item} className="rounded-lg bg-[#edf7ec] px-3 py-1 text-xs font-black text-[#4f8f4d]">
                                    {item}
                                </span>
                            ))}
                        </div>
                        <Link
                            to={`/dat-tour/${tour.slug}?date=${firstDeparture.id}`}
                            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#7FB77E] text-sm font-black text-[#020617] hover:bg-[#9de09c]"
                        >
                            Đặt vé ngay
                        </Link>
                    </aside>
                </div>
            </section>
        </PublicLayout>
    );
}
