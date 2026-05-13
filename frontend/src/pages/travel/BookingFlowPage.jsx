import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Banknote,
    Building2,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    Mail,
    MapPin,
    Phone,
    Plus,
    Shield,
    Ticket,
    User,
    Wallet,
    Users,
} from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import BookingStepper from "../../components/booking/BookingStepper";
import { getTourBySlug } from "../../data/mockTours";
import { formatCurrency, formatDate, generateBookingCode } from "../../utils/formatters";
import { useBookings } from "../../hooks/useBookings";

const STEPS = [
    { label: "Ngày & khách" },
    { label: "Liên hệ" },
    { label: "Hành khách" },
    { label: "Xác nhận" },
    { label: "Thanh toán" },
];

const PAYMENT_OPTIONS = [
    {
        id: "TRANSFER",
        title: "Chuyển khoản",
        desc: "Thanh toán qua chuyển khoản ngân hàng. Nhận xác nhận trong 5-10 phút.",
        icon: Banknote,
    },
    {
        id: "WALLET",
        title: "Ví điện tử",
        desc: "Momo, ZaloPay, VNPay. Thanh toán nhanh trong 1 phút.",
        icon: Wallet,
    },
    {
        id: "OFFICE",
        title: "Thanh toán tại văn phòng",
        desc: "Đặt tour trước, thanh toán khi đến văn phòng Tây Bắc Travel.",
        icon: Building2,
    },
];

export default function BookingFlowPage() {
    const { tourSlug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addBooking } = useBookings();
    const tour = getTourBySlug(tourSlug);

    const initialDeparture = useMemo(() => {
        if (!tour) return null;
        const id = searchParams.get("date");
        return tour.nextDepartures.find((d) => d.id === id) || tour.nextDepartures[0];
    }, [tour, searchParams]);

    const [current, setCurrent] = useState(0);
    const [departure, setDeparture] = useState(initialDeparture);
    const [travellers, setTravellers] = useState({
        adult: Number(searchParams.get("adult")) || 2,
        child: Number(searchParams.get("child")) || 0,
        infant: Number(searchParams.get("infant")) || 0,
    });
    const [contact, setContact] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        note: "",
    });
    const [passengers, setPassengers] = useState([]);
    const [agree, setAgree] = useState(false);
    const [payment, setPayment] = useState("TRANSFER");

    if (!tour) return <Navigate to="/tours" replace />;

    const totalGuests = travellers.adult + travellers.child + travellers.infant;
    const adultPrice = tour.price;
    const childPrice = Math.round(adultPrice * 0.7);
    const infantPrice = Math.round(adultPrice * 0.1);
    const totalPrice =
        travellers.adult * adultPrice +
        travellers.child * childPrice +
        travellers.infant * infantPrice;

    const handleTraveller = (key, delta) => {
        const min = key === "adult" ? 1 : 0;
        setTravellers((c) => ({ ...c, [key]: Math.max(min, c[key] + delta) }));
    };

    const fillPassengers = () => {
        const totalNeeded = travellers.adult + travellers.child + travellers.infant;
        const next = [...passengers];
        while (next.length < totalNeeded) {
            const idx = next.length;
            const type =
                idx < travellers.adult
                    ? "adult"
                    : idx < travellers.adult + travellers.child
                    ? "child"
                    : "infant";
            next.push({ type, fullName: "", dob: "", gender: "male" });
        }
        while (next.length > totalNeeded) next.pop();
        return next;
    };

    const validate = (step) => {
        if (step === 0) {
            return Boolean(departure) && totalGuests > 0 && totalGuests <= departure.seats;
        }
        if (step === 1) {
            return (
                contact.fullName.trim().length > 1 &&
                /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(contact.email) &&
                /^[\d\s+()-]{8,}$/.test(contact.phone)
            );
        }
        if (step === 2) {
            const filled = fillPassengers();
            return filled.every((p) => p.fullName.trim().length > 0);
        }
        if (step === 3) {
            return agree;
        }
        if (step === 4) {
            return Boolean(payment);
        }
        return false;
    };

    const goNext = () => {
        if (!validate(current)) return;
        if (current === 1) setPassengers(fillPassengers());
        setCurrent((c) => Math.min(STEPS.length - 1, c + 1));
    };

    const goPrev = () => setCurrent((c) => Math.max(0, c - 1));

    const handleConfirm = () => {
        if (!validate(4)) return;
        const code = generateBookingCode();
        addBooking({
            bookingCode: code,
            tourSlug: tour.slug,
            tourTitle: tour.title,
            tourImage: tour.images[0],
            departure,
            travellers,
            contact,
            passengers,
            payment,
            totalPrice,
            status: payment === "OFFICE" ? "PENDING_PAYMENT" : "PROCESSING",
        });
        navigate(`/booking-success/${code}`);
    };

    return (
        <TravelLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <Container className="py-10">
                    <Breadcrumb
                        items={[
                            { label: "Tour", to: "/tours" },
                            { label: tour.title, to: `/tours/${tour.slug}` },
                            { label: "Đặt tour" },
                        ]}
                    />

                    <div className="mt-5 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <p className="tv-section-title">Hoàn tất đặt tour</p>
                            <h1 className="mt-1 text-3xl font-black md:text-4xl" style={{ color: "var(--tv-text)" }}>
                                {tour.title}
                            </h1>
                        </div>
                        <Link
                            to={`/tours/${tour.slug}`}
                            className="inline-flex items-center gap-1.5 text-sm font-bold hover:opacity-80"
                            style={{ color: "var(--tv-primary-deep)" }}
                        >
                            <ArrowLeft size={14} /> Quay lại chi tiết
                        </Link>
                    </div>

                    <div className="mt-8 rounded-2xl border p-5" style={{ background: "var(--tv-bg-elevated)", borderColor: "var(--tv-border)" }}>
                        <BookingStepper steps={STEPS} current={current} />
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={current}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.3 }}
                                    className="tv-card p-6"
                                >
                                    {current === 0 && (
                                        <Step1
                                            tour={tour}
                                            departure={departure}
                                            onDeparture={setDeparture}
                                            travellers={travellers}
                                            onTraveller={handleTraveller}
                                        />
                                    )}
                                    {current === 1 && <Step2 contact={contact} onChange={setContact} />}
                                    {current === 2 && (
                                        <Step3
                                            passengers={passengers.length ? passengers : fillPassengers()}
                                            setPassengers={setPassengers}
                                            travellers={travellers}
                                        />
                                    )}
                                    {current === 3 && (
                                        <Step4
                                            tour={tour}
                                            departure={departure}
                                            travellers={travellers}
                                            contact={contact}
                                            passengers={passengers}
                                            agree={agree}
                                            onAgree={setAgree}
                                            totalPrice={totalPrice}
                                        />
                                    )}
                                    {current === 4 && (
                                        <Step5 payment={payment} onPayment={setPayment} totalPrice={totalPrice} />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={goPrev}
                                    disabled={current === 0}
                                    className="tv-btn-outline disabled:opacity-40"
                                >
                                    <ArrowLeft size={14} /> Quay lại
                                </button>
                                {current < STEPS.length - 1 ? (
                                    <button type="button" onClick={goNext} disabled={!validate(current)} className="tv-btn-primary">
                                        Tiếp tục <ArrowRight size={14} />
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleConfirm} disabled={!validate(current)} className="tv-btn-primary">
                                        <CheckCircle2 size={14} /> Hoàn tất đặt tour
                                    </button>
                                )}
                            </div>
                        </div>

                        <BookingSummary tour={tour} departure={departure} travellers={travellers} totalPrice={totalPrice} />
                    </div>
                </Container>
            </motion.div>
        </TravelLayout>
    );
}

function Step1({ tour, departure, onDeparture, travellers, onTraveller }) {
    return (
        <div>
            <h2 className="text-xl font-black md:text-2xl" style={{ color: "var(--tv-text)" }}>
                Chọn ngày khởi hành & số lượng khách
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                Chọn ngày khởi hành phù hợp với bạn và cập nhật số lượng người tham gia.
            </p>

            <div className="mt-5">
                <Label>Lịch khởi hành</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {tour.nextDepartures.map((dep) => {
                        const active = departure?.id === dep.id;
                        return (
                            <button
                                key={dep.id}
                                type="button"
                                onClick={() => onDeparture(dep)}
                                className="rounded-xl border p-3 text-left transition-colors"
                                style={{
                                    borderColor: active ? "var(--tv-primary)" : "var(--tv-border-strong)",
                                    background: active ? "var(--tv-bg-strong)" : "transparent",
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-black" style={{ color: "var(--tv-text)" }}>{formatDate(dep.date)}</div>
                                        <div className="mt-1 text-[11px] font-bold" style={{ color: "var(--tv-text-soft)" }}>
                                            {dep.id} · {dep.transport}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black" style={{ color: "var(--tv-primary-deep)" }}>{dep.seats} chỗ</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--tv-text-muted)" }}>{dep.status}</div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-6">
                <Label>Số lượng khách</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <CounterTile label="Người lớn" hint="12+ tuổi" value={travellers.adult} onChange={(d) => onTraveller("adult", d)} min={1} />
                    <CounterTile label="Trẻ em" hint="5-11 tuổi" value={travellers.child} onChange={(d) => onTraveller("child", d)} min={0} />
                    <CounterTile label="Em bé" hint="<5 tuổi" value={travellers.infant} onChange={(d) => onTraveller("infant", d)} min={0} />
                </div>
            </div>
        </div>
    );
}

function Step2({ contact, onChange }) {
    const update = (patch) => onChange({ ...contact, ...patch });
    return (
        <div>
            <h2 className="text-xl font-black md:text-2xl" style={{ color: "var(--tv-text)" }}>
                Thông tin người liên hệ
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                Đây là người sẽ nhận xác nhận booking và liên hệ trong suốt hành trình.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Field label="Họ và tên" icon={User}>
                    <input type="text" value={contact.fullName} onChange={(e) => update({ fullName: e.target.value })} className="tv-input" placeholder="Nguyễn Văn A" />
                </Field>
                <Field label="Email" icon={Mail}>
                    <input type="email" value={contact.email} onChange={(e) => update({ email: e.target.value })} className="tv-input" placeholder="email@example.com" />
                </Field>
                <Field label="Số điện thoại" icon={Phone}>
                    <input type="tel" value={contact.phone} onChange={(e) => update({ phone: e.target.value })} className="tv-input" placeholder="09xx xxx xxx" />
                </Field>
                <Field label="Địa chỉ" icon={MapPin}>
                    <input type="text" value={contact.address} onChange={(e) => update({ address: e.target.value })} className="tv-input" placeholder="Hà Nội" />
                </Field>
                <Field label="Ghi chú" className="md:col-span-2">
                    <textarea
                        value={contact.note}
                        onChange={(e) => update({ note: e.target.value })}
                        rows={3}
                        className="tv-input min-h-[88px] resize-y"
                        placeholder="Yêu cầu bữa ăn, điểm đón, đặc biệt khác..."
                    />
                </Field>
            </div>
        </div>
    );
}

function Step3({ passengers, setPassengers, travellers }) {
    const update = (idx, patch) =>
        setPassengers(passengers.map((p, i) => (i === idx ? { ...p, ...patch } : p)));

    return (
        <div>
            <h2 className="text-xl font-black md:text-2xl" style={{ color: "var(--tv-text)" }}>
                Thông tin hành khách
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                Vui lòng điền chính xác thông tin {travellers.adult} người lớn, {travellers.child} trẻ em, {travellers.infant} em bé.
            </p>

            <div className="mt-5 space-y-3">
                {passengers.map((p, idx) => (
                    <div key={idx} className="rounded-2xl border p-4" style={{ borderColor: "var(--tv-border-strong)" }}>
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tv-primary-deep)" }}>
                                {p.type === "adult" ? "Người lớn" : p.type === "child" ? "Trẻ em" : "Em bé"} {idx + 1}
                            </div>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                            <Field label="Họ và tên">
                                <input type="text" value={p.fullName} onChange={(e) => update(idx, { fullName: e.target.value })} className="tv-input" placeholder="Họ tên" />
                            </Field>
                            <Field label="Ngày sinh">
                                <input type="date" value={p.dob} onChange={(e) => update(idx, { dob: e.target.value })} className="tv-input" />
                            </Field>
                            <Field label="Giới tính">
                                <select value={p.gender} onChange={(e) => update(idx, { gender: e.target.value })} className="tv-input">
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </Field>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Step4({ tour, departure, travellers, contact, passengers, agree, onAgree, totalPrice }) {
    return (
        <div>
            <h2 className="text-xl font-black md:text-2xl" style={{ color: "var(--tv-text)" }}>
                Xác nhận thông tin đặt tour
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                Kiểm tra lại các thông tin trước khi tiến hành thanh toán.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <SummaryRow icon={Ticket} title="Tour" value={tour.title} />
                <SummaryRow icon={CalendarDays} title="Ngày khởi hành" value={formatDate(departure.date)} />
                <SummaryRow
                    icon={Users}
                    title="Số khách"
                    value={`${travellers.adult} NL · ${travellers.child} TE · ${travellers.infant} EB`}
                />
                <SummaryRow icon={Wallet} title="Tổng tiền" value={formatCurrency(totalPrice)} />
                <SummaryRow icon={User} title="Người liên hệ" value={contact.fullName} />
                <SummaryRow icon={Phone} title="SĐT liên hệ" value={contact.phone} />
            </div>

            <div className="mt-5">
                <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: "var(--tv-text)" }}>Hành khách</h3>
                <ul className="mt-2 space-y-1 text-sm" style={{ color: "var(--tv-text-muted)" }}>
                    {passengers.map((p, i) => (
                        <li key={i}>
                            {i + 1}. <b style={{ color: "var(--tv-text)" }}>{p.fullName || "(Chưa nhập)"}</b> ·{" "}
                            {p.type === "adult" ? "Người lớn" : p.type === "child" ? "Trẻ em" : "Em bé"} ·{" "}
                            {p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Khác"}
                        </li>
                    ))}
                </ul>
            </div>

            <label className="mt-5 flex items-start gap-2 rounded-xl p-4 cursor-pointer" style={{ background: "var(--tv-bg-subtle)" }}>
                <input type="checkbox" checked={agree} onChange={(e) => onAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--tv-primary-deep)]" />
                <span className="text-xs leading-6" style={{ color: "var(--tv-text-muted)" }}>
                    Tôi đã đọc và đồng ý với{" "}
                    <Link to="/blog/dieu-khoan-su-dung" className="tv-link">điều khoản sử dụng</Link>,{" "}
                    <Link to="/blog/chinh-sach-huy-tour" className="tv-link">chính sách hủy tour</Link> và{" "}
                    <Link to="/blog/chinh-sach-bao-mat" className="tv-link">chính sách bảo mật</Link> của Tây Bắc Travel.
                </span>
            </label>
        </div>
    );
}

function Step5({ payment, onPayment, totalPrice }) {
    return (
        <div>
            <h2 className="text-xl font-black md:text-2xl" style={{ color: "var(--tv-text)" }}>Chọn phương thức thanh toán</h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                Tất cả phương thức đều an toàn và bảo mật. Tổng thanh toán:{" "}
                <b style={{ color: "var(--tv-text)" }}>{formatCurrency(totalPrice)}</b>.
            </p>

            <div className="mt-5 grid gap-3">
                {PAYMENT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = payment === opt.id;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => onPayment(opt.id)}
                            className="flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors"
                            style={{
                                borderColor: active ? "var(--tv-primary)" : "var(--tv-border-strong)",
                                background: active ? "var(--tv-bg-strong)" : "transparent",
                            }}
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--tv-gradient-primary)", color: "#06281c" }}>
                                <Icon size={22} />
                            </span>
                            <div className="flex-1">
                                <div className="text-base font-black" style={{ color: "var(--tv-text)" }}>{opt.title}</div>
                                <div className="mt-1 text-xs leading-6" style={{ color: "var(--tv-text-muted)" }}>{opt.desc}</div>
                            </div>
                            <div
                                className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                                style={{ borderColor: active ? "var(--tv-primary-deep)" : "var(--tv-border-strong)" }}
                            >
                                {active && <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--tv-primary-deep)" }} />}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-xl p-4 text-xs leading-6" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-text-muted)" }}>
                <Shield size={16} className="mt-0.5 shrink-0" style={{ color: "var(--tv-primary-deep)" }} />
                Thông tin thanh toán được mã hoá và bảo mật theo tiêu chuẩn quốc tế. Đây là môi trường demo, hệ thống sẽ không trừ tiền thật.
            </div>
        </div>
    );
}

function BookingSummary({ tour, departure, travellers, totalPrice }) {
    return (
        <aside className="h-fit lg:sticky lg:top-24">
            <div className="tv-card overflow-hidden">
                <img src={tour.images[0]} alt={tour.title} className="h-40 w-full object-cover" />
                <div className="p-5">
                    <div className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tv-primary-deep)" }}>
                        {tour.destination}
                    </div>
                    <h3 className="mt-1 text-lg font-black" style={{ color: "var(--tv-text)" }}>{tour.title}</h3>
                    <div className="mt-3 grid gap-2 text-sm" style={{ color: "var(--tv-text-muted)" }}>
                        <div className="flex items-center gap-2"><CalendarDays size={14} /> {formatDate(departure.date)}</div>
                        <div className="flex items-center gap-2"><Ticket size={14} /> Mã: {departure.id}</div>
                        <div className="flex items-center gap-2"><Users size={14} /> {travellers.adult} NL · {travellers.child} TE · {travellers.infant} EB</div>
                    </div>
                    <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--tv-border)" }}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>Tổng cộng</span>
                            <span className="text-2xl font-black" style={{ color: "var(--tv-text)" }}>{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function Label({ children }) {
    return <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--tv-text)" }}>{children}</span>;
}

function Field({ label, icon: Icon, children, className = "" }) {
    return (
        <label className={`block ${className}`}>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-muted)" }}>
                {Icon ? <Icon size={11} /> : null}
                {label}
            </span>
            <div className="mt-1">{children}</div>
        </label>
    );
}

function CounterTile({ label, hint, value, onChange, min = 0 }) {
    return (
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--tv-border-strong)" }}>
            <div className="text-sm font-black" style={{ color: "var(--tv-text)" }}>{label}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>{hint}</div>
            <div className="mt-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => onChange(-1)}
                    disabled={value <= min}
                    className="flex h-8 w-8 items-center justify-center rounded-full border disabled:opacity-40"
                    style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                >
                    −
                </button>
                <span className="text-base font-black" style={{ color: "var(--tv-text)" }}>{value}</span>
                <button
                    type="button"
                    onClick={() => onChange(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border"
                    style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                >
                    <Plus size={12} />
                </button>
            </div>
        </div>
    );
}

function SummaryRow({ icon: Icon, title, value }) {
    return (
        <div className="rounded-xl border p-3" style={{ borderColor: "var(--tv-border)" }}>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>
                <Icon size={11} /> {title}
            </div>
            <div className="mt-1 text-sm font-bold" style={{ color: "var(--tv-text)" }}>{value}</div>
        </div>
    );
}
