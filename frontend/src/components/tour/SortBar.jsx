import { ArrowDownAZ, Grid3x3, List, SortAsc, SortDesc, Sparkles, Star } from "lucide-react";

const SORTS = [
    { value: "featured", label: "Nổi bật", icon: Sparkles },
    { value: "newest", label: "Mới nhất", icon: ArrowDownAZ },
    { value: "price-asc", label: "Giá thấp", icon: SortAsc },
    { value: "price-desc", label: "Giá cao", icon: SortDesc },
    { value: "rating", label: "Đánh giá", icon: Star },
];

export default function SortBar({ sort, onChange, layout, onLayout, total }) {
    return (
        <div
            className="flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ background: "var(--tv-bg-elevated)", borderColor: "var(--tv-border)" }}
        >
            <div className="flex items-center gap-2 text-sm">
                <span className="font-bold" style={{ color: "var(--tv-text)" }}>{total ?? 0}</span>
                <span style={{ color: "var(--tv-text-muted)" }}>tour phù hợp</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <div className="hidden md:flex items-center gap-1">
                    {SORTS.map((s) => {
                        const Icon = s.icon;
                        const active = sort === s.value;
                        return (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => onChange(s.value)}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-colors"
                                style={{
                                    background: active ? "var(--tv-primary)" : "transparent",
                                    color: active ? "#06281c" : "var(--tv-text-muted)",
                                }}
                            >
                                <Icon size={13} />
                                {s.label}
                            </button>
                        );
                    })}
                </div>
                <select
                    value={sort}
                    onChange={(e) => onChange(e.target.value)}
                    className="tv-input md:hidden text-xs py-2"
                >
                    {SORTS.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                {onLayout && (
                    <div
                        className="inline-flex items-center rounded-full border p-1"
                        style={{ borderColor: "var(--tv-border-strong)" }}
                    >
                        <button
                            type="button"
                            onClick={() => onLayout("grid")}
                            aria-label="Hiển thị lưới"
                            className="flex h-7 w-7 items-center justify-center rounded-full"
                            style={{
                                background: layout === "grid" ? "var(--tv-primary)" : "transparent",
                                color: layout === "grid" ? "#06281c" : "var(--tv-text-muted)",
                            }}
                        >
                            <Grid3x3 size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => onLayout("list")}
                            aria-label="Hiển thị danh sách"
                            className="flex h-7 w-7 items-center justify-center rounded-full"
                            style={{
                                background: layout === "list" ? "var(--tv-primary)" : "transparent",
                                color: layout === "list" ? "#06281c" : "var(--tv-text-muted)",
                            }}
                        >
                            <List size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function applySort(tours, sort) {
    const arr = [...tours];
    switch (sort) {
        case "price-asc":
            return arr.sort((a, b) => a.price - b.price);
        case "price-desc":
            return arr.sort((a, b) => b.price - a.price);
        case "rating":
            return arr.sort((a, b) => b.rating - a.rating);
        case "newest":
            return arr.sort((a, b) => b.id - a.id);
        case "featured":
        default:
            return arr.sort((a, b) => {
                const score = (t) => (t.isHot ? 3 : 0) + (t.isPromotion ? 2 : 0) + (t.isLastMinute ? 1 : 0);
                return score(b) - score(a) || b.rating - a.rating;
            });
    }
}
