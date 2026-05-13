import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    AlertCircle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock,
    Heart,
    MapPin,
    Minus,
    Mountain,
    Plus,
    Share2,
    ShieldCheck,
    Star,
    Ticket,
    Users,
    WalletCards,
    X,
} from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import Gallery from "../../components/tour/Gallery";
import TourGrid from "../../components/tour/TourGrid";
import {
    getTourBySlug,
    getRelatedTours,
} from "../../data/mockTours";
import { formatCurrency, formatDate, formatDateShort } from "../../utils/formatters";
import { useFavorites } from "../../hooks/useFavorites";

const TABS = [
    { id: "overview", label: "Tổng quan" },
    { id: "itinerary", label: "Lịch trình" },
    { id: "included", label: "Bao gồm" },
    { id: "excluded", label: "Không bao gồm" },
    { id: "policies", label: "Điều khoản" },
    { id: "reviews", label: "Đánh giá" },
];

export default function TourDetailNewPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const tour = getTourBySlug(slug);
    const { isFavorite, toggleFavorite } = useFavorites();
    const [activeTab, setActiveTab] = useState("overview");
    const [travellers, setTravellers] = useState({ adult: 2, child: 0, infant: 0 });
    const [selectedDeparture, setSelectedDeparture] = useState(tour?.nextDepartures?.[0] || null);

    const related = useMemo(() => getRelatedTours(tour, 4), [tour]);

    if (!tour) return <Navigate to="/tours" replace />;

    const fav = isFavorite(tour.slug);
    const adultPrice = tour.price;
    const childPrice = Math.round(adultPrice * 0.7);
    const infantPrice = Math.round(adultPrice * 0.1);
    const totalGuests = travellers.adult + travellers.child + travellers.infant;
    const totalPrice =
        travellers.adult * adultPrice + travellers.child * childPrice + travellers.infant * infantPrice;
    const overSeats = selectedDeparture ? totalGuests > selectedDeparture.seats : false;

    const updateTraveller = (key, delta) => {
        const min = key === "adult" ? 1 : 0;
        setTravellers((c) => ({ ...c, [key]: Math.max(min, c[key] + delta) }));
    };

    const handleBook = () => {
        const params = new URLSearchParams();
        if (selectedDeparture) params.set("date", selectedDeparture.id);
        params.set("adult", travellers.adult);
        params.set("child", travellers.child);
        params.set("infant", travellers.infant);
        navigate(`/booking/${tour.slug}?${params.toString()}`);
    };

    return (
        <TravelLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <Container className="pt-8">
                    <Breadcrumb
                        items={[
                            { label: "Tour", to: "/tours" },
                            { label: tour.title },
                        ]}
                    />

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-primary-deep)" }}>
                                    <Ticket size={11} /> {tour.code}
                                </span>
                                {tour.isHot && (
                                    <span className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white">
                                        🔥 Hot
                                    </span>
                                )}
                                {tour.discount > 0 && (
                                    <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white">
                                        -{tour.discount}%
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl lg:text-5xl" style={{ color: "var(--tv-text)" }}>
                                {tour.title}
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--tv-text-muted)" }}>
                                <span className="inline-flex items-center gap-1.5">
                                    <Star size={14} fill="#facc15" stroke="#facc15" />
                                    <b style={{ color: "var(--tv-text)" }}>{tour.rating}</b>
                                    <span>({tour.reviewCount} đánh giá)</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin size={14} /> {tour.destination}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => toggleFavorite(tour.slug)}
                                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold"
                                style={{
                                    borderColor: "var(--tv-border-strong)",
                                    background: fav ? "var(--tv-danger)" : "transparent",
                                    color: fav ? "#fff" : "var(--tv-text)",
                                }}
                            >
                                <Heart size={14} fill={fav ? "#fff" : "transparent"} />
                                {fav ? "Đã yêu thích" : "Yêu thích"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard?.writeText(window.location.href);
                                }}
                                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold"
                                style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                            >
                                <Share2 size={14} /> Chia sẻ
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Gallery images={tour.images} title={tour.title} />
                    </div>
                </Container>

                <Container className="py-10">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <QuickInfo icon={Clock} label="Thời lượng" value={tour.duration} />
                        <QuickInfo icon={MapPin} label="Khởi hành" value={tour.departure} />
                        <QuickInfo icon={Mountain} label="Phương tiện" value={tour.transport} />
                        <QuickInfo icon={Users} label="Số chỗ còn" value={`${tour.seatsLeft} chỗ`} />
                        <QuickInfo icon={Ticket} label="Loại tour" value={tour.categoryLabels[0]} />
                    </div>
                </Container>

                <Container className="pb-16">
                    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                        <div>
                            <div className="sticky top-20 z-10 -mx-2 overflow-x-auto rounded-2xl border" style={{ background: "var(--tv-bg-elevated)", borderColor: "var(--tv-border)" }}>
                                <div className="flex gap-1 px-2 py-2">
                                    {TABS.map((tab) => {
                                        const active = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors"
                                                style={{
                                                    background: active ? "var(--tv-primary)" : "transparent",
                                                    color: active ? "#06281c" : "var(--tv-text-muted)",
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-5 space-y-5">
                                {activeTab === "overview" && (
                                    <TabPanel title="Tổng quan hành trình">
                                        <p className="text-sm leading-7" style={{ color: "var(--tv-text-muted)" }}>
                                            {tour.overview}
                                        </p>
                                        <h3 className="mt-6 text-lg font-black" style={{ color: "var(--tv-text)" }}>
                                            Điểm nổi bật
                                        </h3>
                                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                                            {tour.highlights.map((h) => (
                                                <li key={h} className="flex items-start gap-2 rounded-xl p-3 text-sm" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-text)" }}>
                                                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--tv-primary-deep)" }} />
                                                    <span>{h}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </TabPanel>
                                )}

                                {activeTab === "itinerary" && (
                                    <TabPanel title="Lịch trình chi tiết">
                                        <div className="space-y-4">
                                            {tour.itinerary.map((day) => (
                                                <div key={day.day} className="rounded-2xl border p-5" style={{ borderColor: "var(--tv-border)" }}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-10 w-10 items-center justify-center rounded-full font-black" style={{ background: "var(--tv-gradient-primary)", color: "#06281c" }}>
                                                            {day.day}
                                                        </span>
                                                        <h4 className="text-base font-black" style={{ color: "var(--tv-text)" }}>
                                                            Ngày {day.day}: {day.title}
                                                        </h4>
                                                    </div>
                                                    <ul className="mt-3 space-y-2 pl-12">
                                                        {day.activities.map((a, i) => (
                                                            <li key={i} className="flex gap-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                                                                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--tv-primary)" }} />
                                                                <span>{a}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </TabPanel>
                                )}

                                {activeTab === "included" && (
                                    <TabPanel title="Dịch vụ bao gồm">
                                        <ul className="grid gap-2 sm:grid-cols-2">
                                            {tour.included.map((item) => (
                                                <li key={item} className="flex items-start gap-2 rounded-xl p-3 text-sm" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-text)" }}>
                                                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--tv-primary-deep)" }} />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </TabPanel>
                                )}

                                {activeTab === "excluded" && (
                                    <TabPanel title="Không bao gồm">
                                        <ul className="grid gap-2 sm:grid-cols-2">
                                            {tour.excluded.map((item) => (
                                                <li key={item} className="flex items-start gap-2 rounded-xl p-3 text-sm" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-text)" }}>
                                                    <X size={16} className="mt-0.5 shrink-0" style={{ color: "var(--tv-danger)" }} />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </TabPanel>
                                )}

                                {activeTab === "policies" && (
                                    <TabPanel title="Điều khoản & Chính sách">
                                        <ul className="space-y-3">
                                            {tour.policies.map((p) => (
                                                <li key={p} className="flex items-start gap-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                                                    <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: "var(--tv-accent)" }} />
                                                    <span>{p}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </TabPanel>
                                )}

                                {activeTab === "reviews" && (
                                    <TabPanel title={`Đánh giá (${tour.reviewCount})`}>
                                        <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-center rounded-2xl p-5" style={{ background: "var(--tv-bg-subtle)" }}>
                                            <div className="text-center">
                                                <div className="text-5xl font-black" style={{ color: "var(--tv-primary-deep)" }}>{tour.rating}</div>
                                                <div className="mt-1 flex justify-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <Star key={i} size={14} fill={i <= Math.round(tour.rating) ? "#facc15" : "transparent"} stroke={i <= Math.round(tour.rating) ? "#facc15" : "var(--tv-text-soft)"} />
                                                    ))}
                                                </div>
                                                <div className="mt-1 text-xs font-bold" style={{ color: "var(--tv-text-muted)" }}>{tour.reviewCount} đánh giá</div>
                                            </div>
                                            <div className="grid gap-2 text-xs font-bold" style={{ color: "var(--tv-text-muted)" }}>
                                                {[5, 4, 3, 2, 1].map((s) => {
                                                    const pct = s === 5 ? 70 : s === 4 ? 22 : s === 3 ? 5 : 2;
                                                    return (
                                                        <div key={s} className="flex items-center gap-2">
                                                            <span className="w-6">{s}★</span>
                                                            <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--tv-bg-strong)" }}>
                                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--tv-primary)" }} />
                                                            </div>
                                                            <span className="w-10 text-right">{pct}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="mt-5 space-y-3">
                                            {SAMPLE_REVIEWS.map((r, i) => (
                                                <div key={i} className="rounded-2xl border p-4" style={{ borderColor: "var(--tv-border)" }}>
                                                    <div className="flex items-center gap-3">
                                                        <img src={r.avatar} alt={r.name} className="h-10 w-10 rounded-full object-cover" />
                                                        <div>
                                                            <div className="text-sm font-black" style={{ color: "var(--tv-text)" }}>{r.name}</div>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                {[1, 2, 3, 4, 5].map((j) => (
                                                                    <Star key={j} size={11} fill={j <= r.rating ? "#facc15" : "transparent"} stroke={j <= r.rating ? "#facc15" : "var(--tv-text-soft)"} />
                                                                ))}
                                                                <span className="ml-1 text-[10px] font-bold" style={{ color: "var(--tv-text-soft)" }}>{r.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="mt-3 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>{r.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </TabPanel>
                                )}
                            </div>
                        </div>

                        <aside className="h-fit lg:sticky lg:top-24">
                            <BookingCard
                                tour={tour}
                                selectedDeparture={selectedDeparture}
                                onChangeDeparture={setSelectedDeparture}
                                travellers={travellers}
                                onTraveller={updateTraveller}
                                totalPrice={totalPrice}
                                overSeats={overSeats}
                                onBook={handleBook}
                            />
                        </aside>
                    </div>

                    {related.length > 0 && (
                        <section className="mt-16">
                            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="tv-section-title">Tour tương tự</p>
                                    <h3 className="mt-2 text-2xl font-black md:text-3xl" style={{ color: "var(--tv-text)" }}>Khám phá thêm</h3>
                                </div>
                                <Link to="/tours" className="inline-flex items-center gap-1 text-sm font-bold hover:opacity-80" style={{ color: "var(--tv-primary-deep)" }}>
                                    Xem tất cả tour <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="mt-6">
                                <TourGrid tours={related} />
                            </div>
                        </section>
                    )}
                </Container>
            </motion.div>
        </TravelLayout>
    );
}

function QuickInfo({ icon: Icon, label, value }) {
    return (
        <div className="tv-card flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-primary-deep)" }}>
                <Icon size={18} />
            </span>
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>{label}</div>
                <div className="mt-0.5 text-sm font-bold" style={{ color: "var(--tv-text)" }}>{value}</div>
            </div>
        </div>
    );
}

function TabPanel({ title, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="tv-card p-6"
        >
            <h2 className="text-xl font-black md:text-2xl" style={{ color: "var(--tv-text)" }}>{title}</h2>
            <div className="mt-4">{children}</div>
        </motion.div>
    );
}

function BookingCard({ tour, selectedDeparture, onChangeDeparture, travellers, onTraveller, totalPrice, overSeats, onBook }) {
    return (
        <div className="tv-card overflow-hidden p-5">
            <div className="flex items-end justify-between">
                <div>
                    {tour.oldPrice && (
                        <div className="text-xs line-through" style={{ color: "var(--tv-text-soft)" }}>
                            {formatCurrency(tour.oldPrice)}
                        </div>
                    )}
                    <div className="text-3xl font-black" style={{ color: "var(--tv-primary-deep)" }}>
                        {formatCurrency(tour.price)}
                    </div>
                    <div className="text-xs font-bold" style={{ color: "var(--tv-text-muted)" }}>/khách người lớn</div>
                </div>
                {tour.discount > 0 && (
                    <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black text-white">-{tour.discount}%</span>
                )}
            </div>

            <div className="mt-5">
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tv-text)" }}>Chọn ngày khởi hành</div>
                <div className="mt-2 grid gap-2">
                    {tour.nextDepartures.map((dep) => {
                        const active = selectedDeparture?.id === dep.id;
                        return (
                            <button
                                key={dep.id}
                                type="button"
                                onClick={() => onChangeDeparture(dep)}
                                className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs transition-colors"
                                style={{
                                    borderColor: active ? "var(--tv-primary)" : "var(--tv-border-strong)",
                                    background: active ? "var(--tv-bg-strong)" : "transparent",
                                }}
                            >
                                <div>
                                    <div className="font-black" style={{ color: "var(--tv-text)" }}>{formatDateShort(dep.date)}</div>
                                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>{dep.id} · {dep.transport}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black" style={{ color: "var(--tv-primary-deep)" }}>{dep.seats} chỗ</div>
                                    <div className="text-[10px]" style={{ color: "var(--tv-text-muted)" }}>{dep.status}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-5 space-y-2">
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tv-text)" }}>Số lượng hành khách</div>
                <Counter label="Người lớn" hint="Từ 12+ tuổi" value={travellers.adult} onChange={(d) => onTraveller("adult", d)} min={1} />
                <Counter label="Trẻ em" hint="5 - 11 tuổi · -30%" value={travellers.child} onChange={(d) => onTraveller("child", d)} min={0} />
                <Counter label="Em bé" hint="Dưới 5 tuổi · -90%" value={travellers.infant} onChange={(d) => onTraveller("infant", d)} min={0} />
            </div>

            <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--tv-border)" }}>
                <div className="flex items-center justify-between text-sm font-bold" style={{ color: "var(--tv-text-muted)" }}>
                    <span>Tạm tính</span>
                    <span className="text-2xl font-black" style={{ color: "var(--tv-text)" }}>{formatCurrency(totalPrice)}</span>
                </div>
                {overSeats && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-bold text-red-600">
                        <AlertCircle size={12} /> Vượt quá số chỗ còn lại của ngày này.
                    </p>
                )}
                <button
                    type="button"
                    onClick={onBook}
                    disabled={overSeats}
                    className="tv-btn-primary mt-4 w-full justify-center"
                >
                    <WalletCards size={16} /> Đặt tour ngay
                </button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold" style={{ color: "var(--tv-text-soft)" }}>
                    <ShieldCheck size={12} /> Bảo lưu chỗ 24h, không tính phí trước khi xác nhận
                </div>
            </div>
        </div>
    );
}

function Counter({ label, hint, value, onChange, min = 0 }) {
    return (
        <div className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: "var(--tv-border)" }}>
            <div>
                <div className="text-sm font-black" style={{ color: "var(--tv-text)" }}>{label}</div>
                <div className="text-[10px] font-bold" style={{ color: "var(--tv-text-soft)" }}>{hint}</div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(-1)}
                    disabled={value <= min}
                    className="flex h-8 w-8 items-center justify-center rounded-full border disabled:opacity-40"
                    style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                >
                    <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-black" style={{ color: "var(--tv-text)" }}>{value}</span>
                <button
                    type="button"
                    onClick={() => onChange(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border"
                    style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );
}

const SAMPLE_REVIEWS = [
    {
        name: "Mai Anh",
        avatar: "https://i.pravatar.cc/100?img=47",
        rating: 5,
        date: "Tháng 4, 2026",
        comment:
            "Mình rất hài lòng với chuyến đi. HDV nhiệt tình, lịch trình hợp lý không bị dồn. Khách sạn sạch, ăn ngon. Sẽ tiếp tục đặt!",
    },
    {
        name: "Quang Hùng",
        avatar: "https://i.pravatar.cc/100?img=12",
        rating: 5,
        date: "Tháng 3, 2026",
        comment: "Trải nghiệm tuyệt vời, đáng đồng tiền. Recommend cho ai lần đầu đi Tây Bắc.",
    },
    {
        name: "Thanh Hà",
        avatar: "https://i.pravatar.cc/100?img=32",
        rating: 4,
        date: "Tháng 3, 2026",
        comment: "Chuyến đi đẹp, có vài điểm nhỏ cần cải thiện về điểm dừng nghỉ trên đường. Nhìn chung rất ok.",
    },
];
