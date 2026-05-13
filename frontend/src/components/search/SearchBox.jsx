import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    CalendarDays,
    MapPin,
    PlaneTakeoff,
    Search,
    SlidersHorizontal,
    Wallet,
} from "lucide-react";
import { TOUR_CATEGORIES, DEPARTURE_CITIES } from "../../data/mockTours";

const PRICE_RANGES = [
    { value: "all", label: "Tất cả mức giá" },
    { value: "u2", label: "Dưới 2 triệu" },
    { value: "2-5", label: "2 - 5 triệu" },
    { value: "5-10", label: "5 - 10 triệu" },
    { value: "10+", label: "Trên 10 triệu" },
];

const DURATIONS = [
    { value: "all", label: "Số ngày" },
    { value: "1-2", label: "1-2 ngày" },
    { value: "3-4", label: "3-4 ngày" },
    { value: "5+", label: "5+ ngày" },
];

const DESTINATIONS = [
    "Tất cả điểm đến",
    "Mộc Châu, Sơn La",
    "Tà Xùa, Sơn La",
    "Ngọc Chiến, Sơn La",
    "Sa Pa, Lào Cai",
    "Mù Cang Chải, Yên Bái",
    "Mai Châu, Hòa Bình",
    "Hà Giang",
    "Cao Bằng",
    "Y Tý, Lào Cai",
    "Điện Biên",
];

export default function SearchBox({ floating = false }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        category: "all",
        departure: "Hà Nội",
        destination: "Tất cả điểm đến",
        date: "",
        duration: "all",
        priceRange: "all",
        keyword: "",
    });

    const update = (patch) => setForm((current) => ({ ...current, ...patch }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (form.keyword) params.set("q", form.keyword);
        if (form.category !== "all") params.set("category", form.category);
        if (form.priceRange !== "all") params.set("priceRange", form.priceRange);
        if (form.duration !== "all") params.set("duration", form.duration);
        if (form.departure !== "all") params.set("departure", form.departure);
        if (form.destination !== "Tất cả điểm đến") params.set("destination", form.destination);
        if (form.date) params.set("date", form.date);
        navigate(`/tours?${params.toString()}`);
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ y: floating ? 30 : 0, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className={`relative w-full rounded-3xl border p-3 sm:p-5 ${floating ? "shadow-2xl" : ""}`}
            style={{
                background: floating ? "rgba(255,255,255,0.95)" : "var(--tv-bg-elevated)",
                borderColor: floating ? "rgba(255,255,255,0.4)" : "var(--tv-border)",
                color: "#0b1f17",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
        >
            <div className="flex flex-wrap items-center gap-2 mb-3">
                {TOUR_CATEGORIES.slice(0, 5).map((cat) => {
                    const active = form.category === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => update({ category: active ? "all" : cat.id })}
                            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                            style={{
                                background: active ? "#7FB77E" : "transparent",
                                borderColor: active ? "#7FB77E" : "rgba(11,31,23,0.15)",
                                color: active ? "#06281c" : "#0b1f17",
                            }}
                        >
                            <span>{cat.emoji}</span>
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-3 md:grid-cols-12">
                <FieldGroup className="md:col-span-3" icon={PlaneTakeoff} label="Điểm khởi hành">
                    <select
                        value={form.departure}
                        onChange={(e) => update({ departure: e.target.value })}
                        className="search-field"
                    >
                        {["all", ...DEPARTURE_CITIES].map((c) => (
                            <option key={c} value={c}>
                                {c === "all" ? "Tất cả" : c}
                            </option>
                        ))}
                    </select>
                </FieldGroup>

                <FieldGroup className="md:col-span-3" icon={MapPin} label="Điểm đến">
                    <select
                        value={form.destination}
                        onChange={(e) => update({ destination: e.target.value })}
                        className="search-field"
                    >
                        {DESTINATIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </FieldGroup>

                <FieldGroup className="md:col-span-2" icon={CalendarDays} label="Ngày đi">
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => update({ date: e.target.value })}
                        className="search-field"
                    />
                </FieldGroup>

                <FieldGroup className="md:col-span-2" icon={SlidersHorizontal} label="Thời lượng">
                    <select
                        value={form.duration}
                        onChange={(e) => update({ duration: e.target.value })}
                        className="search-field"
                    >
                        {DURATIONS.map((d) => (
                            <option key={d.value} value={d.value}>
                                {d.label}
                            </option>
                        ))}
                    </select>
                </FieldGroup>

                <FieldGroup className="md:col-span-2" icon={Wallet} label="Khoảng giá">
                    <select
                        value={form.priceRange}
                        onChange={(e) => update({ priceRange: e.target.value })}
                        className="search-field"
                    >
                        {PRICE_RANGES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                </FieldGroup>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#71807a" }} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên tour, mã tour, từ khoá..."
                        value={form.keyword}
                        onChange={(e) => update({ keyword: e.target.value })}
                        className="search-field !pl-10"
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-black"
                    style={{
                        background: "linear-gradient(135deg, #7FB77E, #4f8f4d)",
                        color: "#06281c",
                        boxShadow: "0 12px 28px rgba(79,143,77,0.28)",
                    }}
                >
                    <Search size={16} /> Tìm tour
                </button>
            </div>

            <style>{`
                .search-field {
                    width: 100%;
                    background: rgba(247,250,246,0.7);
                    border: 1px solid rgba(11,31,23,0.08);
                    border-radius: 999px;
                    padding: 0.7rem 1rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #0b1f17;
                    outline: none;
                    transition: all 180ms;
                }
                .search-field:focus {
                    border-color: #7FB77E;
                    box-shadow: 0 0 0 4px rgba(127,183,126,0.25);
                }
            `}</style>
        </motion.form>
    );
}

function FieldGroup({ children, icon: Icon, label, className = "" }) {
    return (
        <label className={`flex flex-col gap-1 ${className}`}>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider" style={{ color: "#4a5b52" }}>
                <Icon size={12} /> {label}
            </span>
            {children}
        </label>
    );
}
