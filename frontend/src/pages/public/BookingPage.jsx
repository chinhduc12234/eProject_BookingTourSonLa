import { useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    MapPin,
    Minus,
    Plus,
    ShieldCheck,
    Ticket,
    Users,
    WalletCards,
} from "lucide-react";
import PublicLayout from "./PublicLayout";
import {
    formatCurrency,
    formatDate,
    getDepartureById,
    getTourBySlug,
    parsePrice,
} from "./publicContent";

export default function BookingPage() {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const tour = getTourBySlug(slug);
    const departureId = searchParams.get("date");
    const selectedDeparture = useMemo(() => getDepartureById(tour, departureId), [tour, departureId]);
    const [travellers, setTravellers] = useState({ adult: 2, child: 0 });
    const [form, setForm] = useState({ fullName: "", phone: "", email: "", note: "" });
    const [submitted, setSubmitted] = useState(false);

    if (!tour) {
        return <Navigate to="/tour" replace />;
    }

    const adultPrice = parsePrice(tour.price);
    const childPrice = Math.round(adultPrice * 0.7);
    const totalGuests = travellers.adult + travellers.child;
    const overSeats = totalGuests > selectedDeparture.seats;
    const totalPrice = travellers.adult * adultPrice + travellers.child * childPrice;

    function chooseDeparture(departure) {
        setSearchParams({ date: departure.id });
        setSubmitted(false);
    }

    function updateTraveller(type, delta) {
        setTravellers((current) => {
            const minimum = type === "adult" ? 1 : 0;
            return { ...current, [type]: Math.max(minimum, current[type] + delta) };
        });
        setSubmitted(false);
    }

    function updateForm(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setSubmitted(false);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (overSeats) return;
        setSubmitted(true);
    }

    return (
        <PublicLayout>
            <section className="bg-[#020617] py-12 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Link to={`/tour/${tour.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#d9f5d8] hover:text-white">
                        <ArrowLeft size={17} />
                        Quay lại chi tiết tour
                    </Link>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                        <div>
                            <p className="text-sm font-black uppercase text-[#7FB77E]">Đặt vé tour Tây Bắc</p>
                            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{tour.title}</h1>
                            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{tour.summary}</p>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex gap-3">
                                    <CalendarDays className="mt-1 shrink-0 text-[#7FB77E]" size={20} />
                                    <div>
                                        <div className="text-xs font-black uppercase text-slate-400">Ngày khởi hành</div>
                                        <div className="mt-1 text-sm font-bold">{formatDate(selectedDeparture.date)}</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <MapPin className="mt-1 shrink-0 text-[#7FB77E]" size={20} />
                                    <div>
                                        <div className="text-xs font-black uppercase text-slate-400">Điểm đón</div>
                                        <div className="mt-1 text-sm font-bold">{selectedDeparture.start}</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Users className="mt-1 shrink-0 text-[#7FB77E]" size={20} />
                                    <div>
                                        <div className="text-xs font-black uppercase text-slate-400">Số chỗ còn</div>
                                        <div className="mt-1 text-sm font-bold">{selectedDeparture.seats} chỗ</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Clock className="mt-1 shrink-0 text-[#7FB77E]" size={20} />
                                    <div>
                                        <div className="text-xs font-black uppercase text-slate-400">Thời lượng</div>
                                        <div className="mt-1 text-sm font-bold">{tour.duration}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#f7faf6] py-14 text-slate-900">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_390px] lg:px-8">
                    <div className="space-y-6">
                        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-2xl font-black">Chọn ngày khởi hành</h2>
                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                {tour.departures.map((departure) => {
                                    const isActive = departure.id === selectedDeparture.id;
                                    return (
                                        <button
                                            key={departure.id}
                                            type="button"
                                            onClick={() => chooseDeparture(departure)}
                                            className={`rounded-lg border p-4 text-left transition ${
                                                isActive
                                                    ? "border-[#4f8f4d] bg-[#edf7ec] shadow-sm"
                                                    : "border-slate-200 bg-white hover:border-[#7FB77E]"
                                            }`}
                                        >
                                            <div className="text-sm font-black">{formatDate(departure.date)}</div>
                                            <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
                                                <span>{departure.status}</span>
                                                <span>{departure.seats} chỗ</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </article>

                        <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
                            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-2xl font-black">Số lượng vé</h2>
                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    {[
                                        { key: "adult", label: "Người lớn", price: adultPrice },
                                        { key: "child", label: "Trẻ em", price: childPrice },
                                    ].map((item) => (
                                        <div key={item.key} className="rounded-lg border border-slate-200 p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="text-sm font-black">{item.label}</div>
                                                    <div className="mt-1 text-xs font-semibold text-slate-500">{formatCurrency(item.price)} / vé</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateTraveller(item.key, -1)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:border-[#7FB77E]"
                                                        aria-label={`Giảm ${item.label}`}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="flex h-9 w-10 items-center justify-center text-sm font-black">
                                                        {travellers[item.key]}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateTraveller(item.key, 1)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:border-[#7FB77E]"
                                                        aria-label={`Tăng ${item.label}`}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {overSeats && (
                                    <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                        Số vé đang chọn vượt quá số chỗ còn lại của ngày khởi hành này.
                                    </p>
                                )}
                            </article>

                            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-2xl font-black">Thông tin người đặt</h2>
                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <label className="grid gap-2 text-sm font-bold">
                                        Họ và tên
                                        <input
                                            required
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={updateForm}
                                            className="h-12 rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-[#7FB77E]"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </label>
                                    <label className="grid gap-2 text-sm font-bold">
                                        Số điện thoại
                                        <input
                                            required
                                            name="phone"
                                            value={form.phone}
                                            onChange={updateForm}
                                            className="h-12 rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-[#7FB77E]"
                                            placeholder="09xx xxx xxx"
                                        />
                                    </label>
                                    <label className="grid gap-2 text-sm font-bold md:col-span-2">
                                        Email
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={updateForm}
                                            className="h-12 rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-[#7FB77E]"
                                            placeholder="email@example.com"
                                        />
                                    </label>
                                    <label className="grid gap-2 text-sm font-bold md:col-span-2">
                                        Ghi chú
                                        <textarea
                                            name="note"
                                            value={form.note}
                                            onChange={updateForm}
                                            rows={4}
                                            className="rounded-lg border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-[#7FB77E]"
                                            placeholder="Yêu cầu bữa ăn, điểm đón hoặc thông tin cần lưu ý"
                                        />
                                    </label>
                                </div>
                            </article>
                        </form>
                    </div>

                    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <img src={tour.image} alt={tour.title} className="h-52 w-full rounded-lg object-cover" />
                        <h2 className="mt-5 text-2xl font-black">{tour.title}</h2>
                        <div className="mt-4 space-y-3 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                                <Ticket size={17} className="text-[#4f8f4d]" />
                                <span>Mã lịch: {selectedDeparture.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarDays size={17} className="text-[#4f8f4d]" />
                                <span>{formatDate(selectedDeparture.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <WalletCards size={17} className="text-[#4f8f4d]" />
                                <span>Giá từ {tour.price}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={17} className="text-[#4f8f4d]" />
                                <span>Xác nhận vé theo ngày khởi hành đã chọn</span>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-slate-100 pt-5">
                            <div className="flex justify-between text-sm font-semibold text-slate-600">
                                <span>{travellers.adult} người lớn</span>
                                <span>{formatCurrency(travellers.adult * adultPrice)}</span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm font-semibold text-slate-600">
                                <span>{travellers.child} trẻ em</span>
                                <span>{formatCurrency(travellers.child * childPrice)}</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                <span className="text-sm font-black uppercase text-slate-500">Tạm tính</span>
                                <span className="text-2xl font-black">{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="booking-form"
                            disabled={overSeats}
                            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7FB77E] text-sm font-black text-[#020617] hover:bg-[#9de09c] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                        >
                            <CreditCard size={18} />
                            Xác nhận đặt vé
                        </button>

                        {submitted && (
                            <div className="mt-4 flex gap-3 rounded-lg bg-[#edf7ec] p-4 text-sm font-bold text-[#2f6c31]">
                                <CheckCircle2 size={18} className="shrink-0" />
                                <span>Phiếu đặt vé đã được ghi nhận trên giao diện. Mã lịch: {selectedDeparture.id}.</span>
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </PublicLayout>
    );
}
