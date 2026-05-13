import { Star, X } from "lucide-react";
import { formatCurrencyShort } from "../../utils/formatters";
import { TOUR_CATEGORIES, TRANSPORTS, DEPARTURE_CITIES } from "../../data/mockTours";

const DURATIONS = [
    { value: "all", label: "Tất cả" },
    { value: "1-2", label: "1-2 ngày" },
    { value: "3-4", label: "3-4 ngày" },
    { value: "5+", label: "5+ ngày" },
];

const PRICE_RANGES = [
    { value: "all", label: "Tất cả mức giá", min: 0, max: Infinity },
    { value: "u2", label: "Dưới 2 triệu", min: 0, max: 2_000_000 },
    { value: "2-5", label: "2 - 5 triệu", min: 2_000_000, max: 5_000_000 },
    { value: "5-10", label: "5 - 10 triệu", min: 5_000_000, max: 10_000_000 },
    { value: "10+", label: "Trên 10 triệu", min: 10_000_000, max: Infinity },
];

const RATINGS = [
    { value: 0, label: "Tất cả" },
    { value: 4.5, label: "4.5 trở lên" },
    { value: 4, label: "4 trở lên" },
];

export default function FilterSidebar({ filters, onChange, onReset }) {
    const update = (patch) => onChange({ ...filters, ...patch });

    return (
        <aside
            className="rounded-2xl border p-5 h-fit sticky top-24"
            style={{ background: "var(--tv-bg-elevated)", borderColor: "var(--tv-border)" }}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-base font-black" style={{ color: "var(--tv-text)" }}>
                    Bộ lọc
                </h3>
                <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex items-center gap-1 text-xs font-bold hover:opacity-80"
                    style={{ color: "var(--tv-primary-deep)" }}
                >
                    <X size={12} /> Đặt lại
                </button>
            </div>

            <FilterBlock title="Điểm đến">
                <Select
                    value={filters.destination}
                    onChange={(v) => update({ destination: v })}
                    options={[
                        { value: "all", label: "Tất cả điểm đến" },
                        ...Array.from(new Set(["Mộc Châu, Sơn La", "Tà Xùa, Sơn La", "Ngọc Chiến, Sơn La", "Mù Cang Chải, Yên Bái", "Sa Pa, Lào Cai", "Mai Châu, Hòa Bình", "Hà Giang", "Điện Biên", "Lai Châu", "Hồ Thác Bà, Yên Bái", "Cao Bằng", "Ninh Bình", "Đà Nẵng", "Phú Quốc", "Quảng Ninh", "Đà Lạt", "Huế - Quảng Bình", "Nha Trang", "Bangkok - Pattaya", "Singapore - Malaysia", "Hàn Quốc", "Nhật Bản", "Pha Luông, Sơn La", "Y Tý, Lào Cai"])).map((d) => ({
                            value: d,
                            label: d,
                        })),
                    ]}
                />
            </FilterBlock>

            <FilterBlock title="Loại tour">
                <div className="grid gap-2">
                    {[{ id: "all", label: "Tất cả", emoji: "🌐" }, ...TOUR_CATEGORIES].map((cat) => {
                        const active = filters.category === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => update({ category: cat.id })}
                                className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors"
                                style={{
                                    background: active ? "var(--tv-primary)" : "var(--tv-bg-subtle)",
                                    color: active ? "#06281c" : "var(--tv-text)",
                                }}
                            >
                                <span>
                                    <span className="mr-1.5">{cat.emoji}</span>
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </FilterBlock>

            <FilterBlock title="Khoảng giá">
                <div className="grid gap-2">
                    {PRICE_RANGES.map((range) => {
                        const active = filters.priceRange === range.value;
                        return (
                            <button
                                key={range.value}
                                type="button"
                                onClick={() => update({ priceRange: range.value })}
                                className="rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors"
                                style={{
                                    background: active ? "var(--tv-primary)" : "var(--tv-bg-subtle)",
                                    color: active ? "#06281c" : "var(--tv-text)",
                                }}
                            >
                                {range.label}
                            </button>
                        );
                    })}
                </div>
            </FilterBlock>

            <FilterBlock title="Thời lượng">
                <div className="grid grid-cols-2 gap-2">
                    {DURATIONS.map((d) => {
                        const active = filters.duration === d.value;
                        return (
                            <button
                                key={d.value}
                                type="button"
                                onClick={() => update({ duration: d.value })}
                                className="rounded-xl px-3 py-2 text-center text-xs font-bold transition-colors"
                                style={{
                                    background: active ? "var(--tv-primary)" : "var(--tv-bg-subtle)",
                                    color: active ? "#06281c" : "var(--tv-text)",
                                }}
                            >
                                {d.label}
                            </button>
                        );
                    })}
                </div>
            </FilterBlock>

            <FilterBlock title="Phương tiện">
                <Select
                    value={filters.transport}
                    onChange={(v) => update({ transport: v })}
                    options={[{ value: "all", label: "Tất cả" }, ...TRANSPORTS.map((t) => ({ value: t, label: t }))]}
                />
            </FilterBlock>

            <FilterBlock title="Điểm khởi hành">
                <Select
                    value={filters.departure}
                    onChange={(v) => update({ departure: v })}
                    options={[{ value: "all", label: "Tất cả" }, ...DEPARTURE_CITIES.map((c) => ({ value: c, label: c }))]}
                />
            </FilterBlock>

            <FilterBlock title="Đánh giá">
                <div className="grid gap-2">
                    {RATINGS.map((r) => {
                        const active = filters.rating === r.value;
                        return (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => update({ rating: r.value })}
                                className="inline-flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold"
                                style={{
                                    background: active ? "var(--tv-primary)" : "var(--tv-bg-subtle)",
                                    color: active ? "#06281c" : "var(--tv-text)",
                                }}
                            >
                                {r.label}
                                {r.value > 0 && <Star size={12} fill="#facc15" stroke="#facc15" />}
                            </button>
                        );
                    })}
                </div>
            </FilterBlock>
        </aside>
    );
}

function FilterBlock({ title, children }) {
    return (
        <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--tv-border)" }}>
            <div className="mb-3 text-xs font-black uppercase tracking-widest" style={{ color: "var(--tv-text)" }}>
                {title}
            </div>
            {children}
        </div>
    );
}

function Select({ value, onChange, options }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="tv-input text-sm"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

export const DEFAULT_FILTERS = {
    destination: "all",
    category: "all",
    priceRange: "all",
    duration: "all",
    transport: "all",
    departure: "all",
    rating: 0,
};

export function applyFilters(tours, filters, search = "") {
    let result = tours;
    if (search) {
        const q = search.trim().toLowerCase();
        result = result.filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                t.destination.toLowerCase().includes(q) ||
                t.code.toLowerCase().includes(q) ||
                t.tags.some((tg) => tg.toLowerCase().includes(q)),
        );
    }
    if (filters.destination !== "all") {
        result = result.filter((t) => t.destination === filters.destination);
    }
    if (filters.category !== "all") {
        result = result.filter((t) => t.category === filters.category);
    }
    if (filters.priceRange !== "all") {
        const range = PRICE_RANGES.find((r) => r.value === filters.priceRange);
        if (range) result = result.filter((t) => t.price >= range.min && t.price < range.max);
    }
    if (filters.duration !== "all") {
        result = result.filter((t) => {
            const d = t.durationDays;
            if (filters.duration === "1-2") return d <= 2;
            if (filters.duration === "3-4") return d >= 3 && d <= 4;
            if (filters.duration === "5+") return d >= 5;
            return true;
        });
    }
    if (filters.transport !== "all") {
        result = result.filter((t) => t.transport === filters.transport);
    }
    if (filters.departure !== "all") {
        result = result.filter((t) => t.departure === filters.departure);
    }
    if (filters.rating > 0) {
        result = result.filter((t) => t.rating >= filters.rating);
    }
    return result;
}

export function getActiveCount(filters) {
    let count = 0;
    Object.entries(filters).forEach(([k, v]) => {
        if (k === "rating") {
            if (v > 0) count += 1;
        } else if (v !== "all") {
            count += 1;
        }
    });
    return count;
}

export const _PRICE_RANGES = PRICE_RANGES;
