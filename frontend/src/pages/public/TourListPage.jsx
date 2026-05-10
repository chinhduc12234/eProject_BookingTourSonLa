import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock, MapPin, Mountain, WalletCards } from "lucide-react";
import PublicLayout from "./PublicLayout";
import { featuredTours, formatDate, getFirstDeparture } from "./publicContent";

export default function TourListPage() {
    return (
        <PublicLayout>
            <section className="bg-[#020617] py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-black uppercase text-[#7FB77E]">Tour Tây Bắc</p>
                    <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                        <div>
                            <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl">
                                Tuyến tour chọn lọc cho hành trình Tây Bắc.
                            </h1>
                        </div>
                        <p className="text-lg leading-8 text-slate-300">
                            Các tour được xây dựng theo điểm đến thật: Mộc Châu, Tà Xùa, Mù Cang Chải, Sa Pa, Mai Châu,
                            Thác Bà, Điện Biên và Lai Châu. Mỗi tour có lịch trình tĩnh, điểm nổi bật, mức độ phù hợp và
                            ảnh địa điểm thực tế.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-[#f7faf6] py-16 text-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {featuredTours.map((tour) => {
                            const firstDeparture = getFirstDeparture(tour);

                            return (
                                <article key={tour.slug} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                    <Link to={`/tour/${tour.slug}`} className="block">
                                        <img src={tour.image} alt={tour.title} className="h-60 w-full object-cover" />
                                    </Link>
                                    <div className="p-5">
                                        <div className="flex flex-wrap gap-2">
                                            {tour.tags.map((tag) => (
                                                <span key={tag} className="rounded-lg bg-[#edf7ec] px-3 py-1 text-xs font-black text-[#4f8f4d]">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h2 className="mt-4 text-2xl font-black">{tour.title}</h2>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{tour.summary}</p>

                                        <div className="mt-5 grid gap-3 text-sm text-slate-700">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={17} className="text-[#A67C52]" />
                                                <span>{tour.place}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={17} className="text-[#A67C52]" />
                                                <span>{tour.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mountain size={17} className="text-[#A67C52]" />
                                                <span>{tour.difficulty}</span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg bg-[#f7faf6] px-3 py-2 font-bold">
                                                <CalendarDays size={17} className="text-[#A67C52]" />
                                                <span>Khởi hành {formatDate(firstDeparture.date)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                                            <div className="flex items-center gap-2">
                                                <WalletCards size={18} className="text-[#4f8f4d]" />
                                                <span className="text-xl font-black">{tour.price}</span>
                                            </div>
                                            <Link
                                                to={`/dat-tour/${tour.slug}?date=${firstDeparture.id}`}
                                                className="inline-flex items-center gap-2 rounded-lg bg-[#7FB77E] px-4 py-2 text-sm font-black text-[#020617] hover:bg-[#9de09c]"
                                            >
                                                Đặt vé
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                        <Link
                                            to={`/tour/${tour.slug}`}
                                            className="mt-4 inline-flex text-sm font-black text-[#4f8f4d] hover:text-[#2f6c31]"
                                        >
                                            Xem chi tiết tour
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
