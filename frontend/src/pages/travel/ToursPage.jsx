import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import TourGrid from "../../components/tour/TourGrid";
import FilterSidebar, {
    DEFAULT_FILTERS,
    applyFilters,
    getActiveCount,
} from "../../components/tour/FilterSidebar";
import SortBar, { applySort } from "../../components/tour/SortBar";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import { mockTours } from "../../data/mockTours";
import { useDebounce } from "../../hooks/useDebounce";
import { siteImage } from "../../utils/images";

const TOURS_HERO_BG = siteImage(
    "tours",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80",
);

export default function ToursPage() {
    const [searchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("q") || "");
    const debouncedSearch = useDebounce(search, 250);
    const [sort, setSort] = useState("featured");
    const [layout, setLayout] = useState("grid");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const [filters, setFilters] = useState(() => ({
        ...DEFAULT_FILTERS,
        category: searchParams.get("category") || "all",
        priceRange: searchParams.get("priceRange") || "all",
        duration: searchParams.get("duration") || "all",
        departure: searchParams.get("departure") || "all",
        destination: searchParams.get("destination") || "all",
    }));

    // Sync khi URL param đổi (vd: từ menu).
    useEffect(() => {
        setFilters((f) => ({
            ...f,
            category: searchParams.get("category") || f.category,
        }));
    }, [searchParams]);

    const filteredAndSorted = useMemo(() => {
        const filtered = applyFilters(mockTours, filters, debouncedSearch);
        return applySort(filtered, sort);
    }, [filters, debouncedSearch, sort]);

    const handleReset = () => {
        setFilters(DEFAULT_FILTERS);
        setSearch("");
    };

    const activeCount = getActiveCount(filters);

    return (
        <TravelLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <PageHero search={search} onSearch={setSearch} />

                <Container className="py-10">
                    <Breadcrumb items={[{ label: "Tour" }]} />

                    <button
                        type="button"
                        onClick={() => setMobileFilterOpen(true)}
                        className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold lg:hidden"
                        style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}
                    >
                        <Filter size={14} /> Bộ lọc
                        {activeCount > 0 && (
                            <span
                                className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                                style={{ background: "var(--tv-primary)", color: "#06281c" }}
                            >
                                {activeCount}
                            </span>
                        )}
                    </button>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
                        <div className="hidden lg:block">
                            <FilterSidebar filters={filters} onChange={setFilters} onReset={handleReset} />
                        </div>

                        <div className="space-y-5">
                            <SortBar
                                sort={sort}
                                onChange={setSort}
                                layout={layout}
                                onLayout={setLayout}
                                total={filteredAndSorted.length}
                            />

                            <TourGrid
                                tours={filteredAndSorted}
                                layout={layout}
                                emptyTitle="Không tìm thấy tour phù hợp"
                                emptyDescription="Hãy thử thay đổi bộ lọc hoặc xoá từ khoá tìm kiếm."
                            />
                        </div>
                    </div>
                </Container>

                {mobileFilterOpen && (
                    <div className="fixed inset-0 z-[60] lg:hidden">
                        <div className="absolute inset-0 bg-black/55" onClick={() => setMobileFilterOpen(false)} />
                        <div
                            className="absolute inset-y-0 right-0 w-[90%] max-w-sm overflow-y-auto p-5"
                            style={{ background: "var(--tv-bg)" }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-black" style={{ color: "var(--tv-text)" }}>Bộ lọc</h3>
                                <button onClick={() => setMobileFilterOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: "var(--tv-border-strong)", color: "var(--tv-text)" }}>
                                    <X size={16} />
                                </button>
                            </div>
                            <FilterSidebar filters={filters} onChange={setFilters} onReset={handleReset} />
                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(false)}
                                className="tv-btn-primary w-full justify-center mt-4"
                            >
                                Xem {filteredAndSorted.length} tour
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </TravelLayout>
    );
}

function PageHero({ search, onSearch }) {
    return (
        <section className="relative overflow-hidden py-16">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(13,32,24,0.85), rgba(13,32,24,0.6)), url('${TOURS_HERO_BG}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />
            <div className="relative mx-auto max-w-7xl px-4 text-center text-white sm:px-6 lg:px-8">
                <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
                    Khám phá tour
                </p>
                <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                    Tìm chuyến đi tiếp theo của bạn
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                    Hàng trăm lịch trình được tuyển chọn, lọc theo điểm đến, giá, thời lượng và đánh giá để bạn dễ dàng chọn lựa.
                </p>

                <div className="mx-auto mt-7 flex max-w-2xl items-center gap-2 rounded-full border border-white/30 bg-white/90 p-2 shadow-2xl">
                    <Search size={18} className="ml-3 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Tìm tour theo tên, điểm đến hoặc mã tour..."
                        className="h-10 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearch("")}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <Link
                        to="/destinations"
                        className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-black"
                        style={{ background: "linear-gradient(135deg, #7FB77E, #4f8f4d)", color: "#06281c" }}
                    >
                        Theo điểm
                    </Link>
                </div>
            </div>
        </section>
    );
}
