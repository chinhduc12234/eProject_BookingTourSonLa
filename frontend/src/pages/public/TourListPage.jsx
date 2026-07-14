import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  Banknote,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Loader2,
  MapPin,
  MapPinned,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { getPublicTours } from "../../api/publicTourApi";
import TourCard from "../../components/TourCard";
import PublicLayout from "./PublicLayout";
import { scenicImages } from "./publicContent";

const PAGE_SIZE = 9;
const API_PAGE_SIZE = 100;

const initialFilters = {
  destination: "",
  departureLocation: "",
  priceRange: "",
  minPrice: "",
  maxPrice: "",
  duration: "",
  schedule: "",
  departureMonth: "",
  minSeats: "",
  sort: "RELEVANCE",
};

const destinationPresets = [
  { value: "moc chau", label: "Mộc Châu" },
  { value: "ta xua", label: "Tà Xùa" },
  { value: "bac yen", label: "Bắc Yên" },
  { value: "son la", label: "Sơn La" },
  { value: "muong la", label: "Mường La" },
  { value: "ngoc chien", label: "Ngọc Chiến" },
  { value: "quynh nhai", label: "Quỳnh Nhai" },
  { value: "phu yen", label: "Phù Yên" },
  { value: "yen chau", label: "Yên Châu" },
  { value: "mai son", label: "Mai Sơn" },
  { value: "song ma", label: "Sông Mã" },
  { value: "thuan chau", label: "Thuận Châu" },
];

const priceRanges = [
  { value: "UNDER_1M", label: "Dưới 1 triệu" },
  { value: "1M_2M", label: "1 - 2 triệu" },
  { value: "2M_4M", label: "2 - 4 triệu" },
  { value: "OVER_4M", label: "Trên 4 triệu" },
];

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const getTourPrice = (tour) =>
  Number(tour.lowestAdultPrice ?? tour.price ?? 0);

const getTourSearchText = (tour) =>
  normalizeText(
    [
      tour.title,
      tour.tourCode,
      tour.slug,
      tour.shortDescription,
      tour.departureLocation,
    ].join(" "),
  );

const formatMonthLabel = (value) => {
  const [year, month] = value.split("-");
  return `Tháng ${Number(month)}/${year}`;
};

const formatDepartureLocation = (value) =>
  String(value || "").trim().toUpperCase() === "HN" ? "Hà Nội" : value;

export default function TourListPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const firstResponse = await getPublicTours({
          page: 0,
          size: API_PAGE_SIZE,
          keyword: "",
        });
        const firstPage = firstResponse.data;
        const remainingPageCount = Math.max(
          0,
          Number(firstPage.totalPages || 0) - 1,
        );
        const remainingResponses =
          remainingPageCount > 0
            ? await Promise.all(
                Array.from({ length: remainingPageCount }, (_, index) =>
                  getPublicTours({
                    page: index + 1,
                    size: API_PAGE_SIZE,
                    keyword: "",
                  }),
                ),
              )
            : [];

        setTours([
          ...(firstPage.content || []),
          ...remainingResponses.flatMap(
            (response) => response.data.content || [],
          ),
        ]);
      } catch (error) {
        const message = error?.response?.data?.message || "Không thể tải danh sách tour";
        setLoadError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, [reloadKey]);

  const departureLocations = useMemo(
    () =>
      [...new Set(tours.map((tour) => tour.departureLocation).filter(Boolean))]
        .sort((left, right) => left.localeCompare(right, "vi")),
    [tours],
  );

  const departureMonths = useMemo(
    () =>
      [
        ...new Set(
          tours
            .map((tour) => tour.firstDepartureDate?.slice(0, 7))
            .filter(Boolean),
        ),
      ].sort(),
    [tours],
  );

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([key, value]) => key !== "sort" && String(value).trim() !== "",
      ).length + (keyword ? 1 : 0),
    [filters, keyword],
  );

  const filteredTours = useMemo(() => {
    const normalizedKeyword = normalizeText(keyword);
    const minimumPrice = Number(filters.minPrice || 0);
    const maximumPrice = filters.maxPrice
      ? Number(filters.maxPrice)
      : Number.POSITIVE_INFINITY;
    const minimumSeats = Number(filters.minSeats || 0);

    const matchedTours = tours.filter((tour) => {
      const searchText = getTourSearchText(tour);
      const price = getTourPrice(tour);
      const durationDays = Number(tour.durationDays || 0);
      const departureCount = Number(tour.departureCount || 0);
      const availableSeats = Number(tour.availableSeats || 0);

      if (normalizedKeyword && !searchText.includes(normalizedKeyword)) {
        return false;
      }

      if (filters.destination && !searchText.includes(filters.destination)) {
        return false;
      }

      if (
        filters.departureLocation &&
        tour.departureLocation !== filters.departureLocation
      ) {
        return false;
      }

      if (filters.priceRange === "UNDER_1M" && price >= 1000000) return false;
      if (
        filters.priceRange === "1M_2M" &&
        (price < 1000000 || price > 2000000)
      ) {
        return false;
      }
      if (
        filters.priceRange === "2M_4M" &&
        (price < 2000000 || price > 4000000)
      ) {
        return false;
      }
      if (filters.priceRange === "OVER_4M" && price <= 4000000) return false;
      if (price < minimumPrice || price > maximumPrice) return false;

      if (filters.duration === "SHORT" && durationDays > 2) return false;
      if (
        filters.duration === "MEDIUM" &&
        (durationDays < 3 || durationDays > 4)
      ) {
        return false;
      }
      if (filters.duration === "LONG" && durationDays < 5) return false;

      if (
        filters.schedule === "AVAILABLE" &&
        (departureCount <= 0 || availableSeats <= 0)
      ) {
        return false;
      }
      if (filters.schedule === "NO_SCHEDULE" && departureCount > 0) {
        return false;
      }

      if (
        filters.departureMonth &&
        !tour.firstDepartureDate?.startsWith(filters.departureMonth)
      ) {
        return false;
      }

      if (minimumSeats > 0 && availableSeats < minimumSeats) return false;

      return true;
    });

    return [...matchedTours].sort((left, right) => {
      if (filters.sort === "PRICE_ASC") {
        return getTourPrice(left) - getTourPrice(right);
      }
      if (filters.sort === "PRICE_DESC") {
        return getTourPrice(right) - getTourPrice(left);
      }
      if (filters.sort === "DURATION_ASC") {
        return Number(left.durationDays || 0) - Number(right.durationDays || 0);
      }
      if (filters.sort === "DEPARTURE_ASC") {
        if (!left.firstDepartureDate) return 1;
        if (!right.firstDepartureDate) return -1;
        return left.firstDepartureDate.localeCompare(right.firstDepartureDate);
      }
      if (filters.sort === "SEATS_DESC") {
        return Number(right.availableSeats || 0) - Number(left.availableSeats || 0);
      }
      return 0;
    });
  }, [filters, keyword, tours]);

  const totalElements = filteredTours.length;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);
  const visibleTours = filteredTours.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );
  const activeFilterItems = useMemo(() => {
    const items = [];
    const destination = destinationPresets.find(
      (item) => item.value === filters.destination,
    );
    const priceRange = priceRanges.find(
      (item) => item.value === filters.priceRange,
    );

    if (keyword) {
      items.push({ key: "keyword", label: `Từ khóa: ${keyword}` });
    }
    if (destination) {
      items.push({ key: "destination", label: destination.label });
    }
    if (filters.departureLocation) {
      items.push({
        key: "departureLocation",
        label: `Từ ${formatDepartureLocation(filters.departureLocation)}`,
      });
    }
    if (priceRange) {
      items.push({ key: "priceRange", label: priceRange.label });
    }
    if (filters.minPrice || filters.maxPrice) {
      const minLabel = filters.minPrice
        ? Number(filters.minPrice).toLocaleString("vi-VN")
        : "0";
      const maxLabel = filters.maxPrice
        ? Number(filters.maxPrice).toLocaleString("vi-VN")
        : "không giới hạn";
      items.push({
        key: "customPrice",
        label: `Giá ${minLabel}đ - ${maxLabel}${filters.maxPrice ? "đ" : ""}`,
      });
    }
    if (filters.duration) {
      items.push({
        key: "duration",
        label:
          filters.duration === "SHORT"
            ? "1 - 2 ngày"
            : filters.duration === "MEDIUM"
              ? "3 - 4 ngày"
              : "Từ 5 ngày",
      });
    }
    if (filters.schedule) {
      items.push({
        key: "schedule",
        label:
          filters.schedule === "AVAILABLE"
            ? "Còn lịch và còn chỗ"
            : "Chưa mở lịch",
      });
    }
    if (filters.departureMonth) {
      items.push({
        key: "departureMonth",
        label: formatMonthLabel(filters.departureMonth),
      });
    }
    if (filters.minSeats) {
      items.push({
        key: "minSeats",
        label: `Ít nhất ${filters.minSeats} chỗ`,
      });
    }

    return items;
  }, [filters, keyword]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(0);
    setKeyword(search.trim());
  };

  const updateFilter = (field, value) => {
    setPage(0);
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === "priceRange" && value
        ? { minPrice: "", maxPrice: "" }
        : {}),
      ...(field === "minPrice" || field === "maxPrice"
        ? { priceRange: "" }
        : {}),
    }));
  };

  const clearActiveFilter = (key) => {
    setPage(0);

    if (key === "keyword") {
      setSearch("");
      setKeyword("");
      return;
    }

    if (key === "customPrice") {
      setFilters((current) => ({
        ...current,
        minPrice: "",
        maxPrice: "",
      }));
      return;
    }

    updateFilter(key, "");
  };

  const resetSearch = () => {
    setSearch("");
    setKeyword("");
    setFilters(initialFilters);
    setPage(0);
  };

  return (
    <PublicLayout>
      <div className="tour-list-page">
      {/* HERO */}
      <section className="tour-list-hero relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${scenicImages.mocChauTea}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020617]/85 to-[#020617]/40" />
        <div className="absolute inset-0 bg-grid-fade opacity-40" />
        <div className="absolute -bottom-10 left-1/3 h-60 w-60 rounded-full bg-[#7FB77E]/25 blur-[120px]" />
        <div className="absolute -top-10 right-1/4 h-60 w-60 rounded-full bg-[#A67C52]/25 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-tag">
                <Sparkles size={12} /> Tour đang mở bán
              </span>
              <h1 className="mt-4 text-5xl font-black leading-tight text-white sm:text-6xl">
                Chọn lịch trình{" "}
                <span className="text-gradient-green">Sơn La</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Giá, lịch khởi hành và số chỗ còn lại được lấy trực tiếp từ hệ thống.
                Cập nhật theo thời gian thực để bạn yên tâm lên kế hoạch.
              </p>
            </motion.div>

            <Link to="/" className="btn-outline text-sm">
              <ChevronLeft size={16} /> Về trang chủ
            </Link>
          </div>

          {/* SEARCH BAR */}
          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={submitSearch}
            className="tour-filter-panel relative mt-10 overflow-hidden rounded-3xl border border-white/15 bg-[#020617]/78 p-3 backdrop-blur-xl shadow-soft-dark md:p-4"
          >
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-[#7FB77E]/40 via-transparent to-[#A67C52]/40 opacity-50 blur-md" />
            <div className="relative grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9de09c]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo tên tour, điểm đến..."
                  className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-400 transition focus:border-[#7FB77E] focus:bg-[#7FB77E]/10 focus:ring-4 focus:ring-[#7FB77E]/15"
                />
              </div>

              <button type="submit" className="btn-primary text-sm">
                <Search size={16} />
                Tìm kiếm
              </button>

              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                aria-expanded={filtersOpen}
                aria-controls="tour-advanced-filters"
                className={[
                  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-black transition",
                  filtersOpen || activeFilterCount > 0
                    ? "border-[#7FB77E]/60 bg-[#7FB77E]/14 text-[#d9f5d8]"
                    : "border-white/15 bg-white/[0.05] text-white hover:border-[#7FB77E]/45",
                ].join(" ")}
              >
                <SlidersHorizontal size={17} />
                Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#9de09c] px-1.5 text-xs text-[#020617]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={resetSearch}
                className="btn-outline text-sm"
              >
                <RefreshCcw size={16} />
                Xóa bộ lọc
              </button>
            </div>

            {filtersOpen && (
              <motion.div
                id="tour-advanced-filters"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="relative overflow-hidden"
              >
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <Banknote size={17} className="text-[#9de09c]" />
                        Khoảng giá phổ biến
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        Giá tính theo người lớn, ưu tiên giá thấp nhất của lịch khởi hành.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            updateFilter(
                              "priceRange",
                              filters.priceRange === item.value ? "" : item.value,
                            )
                          }
                          className={[
                            "rounded-xl border px-3 py-2 text-xs font-black transition",
                            filters.priceRange === item.value
                              ? "border-[#9de09c] bg-[#9de09c] text-[#020617]"
                              : "border-white/10 bg-white/[0.045] text-slate-200 hover:border-[#7FB77E]/55 hover:bg-[#7FB77E]/10",
                          ].join(" ")}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="tour-filter-group">
                      <span className="tour-filter-label">
                        <MapPinned size={15} /> Khu vực / điểm đến
                      </span>
                      <select
                        value={filters.destination}
                        onChange={(event) =>
                          updateFilter("destination", event.target.value)
                        }
                        className="tour-filter-field"
                      >
                        <option value="">Tất cả điểm đến</option>
                        {destinationPresets.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="tour-filter-group">
                      <span className="tour-filter-label">
                        <MapPin size={15} /> Nơi khởi hành
                      </span>
                      <select
                        value={filters.departureLocation}
                        onChange={(event) =>
                          updateFilter("departureLocation", event.target.value)
                        }
                        className="tour-filter-field"
                      >
                        <option value="">Tất cả nơi khởi hành</option>
                        {departureLocations.map((location) => (
                          <option key={location} value={location}>
                            {formatDepartureLocation(location)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="tour-filter-group">
                      <span className="tour-filter-label">
                        <Clock3 size={15} /> Thời lượng
                      </span>
                      <select
                        value={filters.duration}
                        onChange={(event) =>
                          updateFilter("duration", event.target.value)
                        }
                        className="tour-filter-field"
                      >
                        <option value="">Mọi thời lượng</option>
                        <option value="SHORT">1 - 2 ngày</option>
                        <option value="MEDIUM">3 - 4 ngày</option>
                        <option value="LONG">Từ 5 ngày</option>
                      </select>
                    </label>

                    <label className="tour-filter-group">
                      <span className="tour-filter-label">
                        <CalendarRange size={15} /> Tình trạng lịch
                      </span>
                      <select
                        value={filters.schedule}
                        onChange={(event) =>
                          updateFilter("schedule", event.target.value)
                        }
                        className="tour-filter-field"
                      >
                        <option value="">Tất cả tình trạng</option>
                        <option value="AVAILABLE">Còn lịch và còn chỗ</option>
                        <option value="NO_SCHEDULE">Chưa mở lịch</option>
                      </select>
                    </label>

                    <label className="tour-filter-group">
                      <span className="tour-filter-label">
                        <CalendarRange size={15} /> Tháng khởi hành
                      </span>
                      <select
                        value={filters.departureMonth}
                        onChange={(event) =>
                          updateFilter("departureMonth", event.target.value)
                        }
                        className="tour-filter-field"
                        disabled={departureMonths.length === 0}
                      >
                        <option value="">
                          {departureMonths.length > 0
                            ? "Tất cả các tháng"
                            : "Chưa có lịch sắp tới"}
                        </option>
                        {departureMonths.map((month) => (
                          <option key={month} value={month}>
                            {formatMonthLabel(month)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="tour-filter-group">
                      <span className="tour-filter-label">
                        <Users size={15} /> Số chỗ cần
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={filters.minSeats}
                        onChange={(event) =>
                          updateFilter("minSeats", event.target.value)
                        }
                        placeholder="Ví dụ: 4 khách"
                        className="tour-filter-field"
                      />
                    </label>

                    <div className="tour-filter-group">
                      <span className="tour-filter-label">
                        <Banknote size={15} /> Giá tùy chỉnh
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="0"
                          step="100000"
                          value={filters.minPrice}
                          onChange={(event) =>
                            updateFilter("minPrice", event.target.value)
                          }
                          placeholder="Từ"
                          aria-label="Giá thấp nhất"
                          className="tour-filter-field"
                        />
                        <input
                          type="number"
                          min="0"
                          step="100000"
                          value={filters.maxPrice}
                          onChange={(event) =>
                            updateFilter("maxPrice", event.target.value)
                          }
                          placeholder="Đến"
                          aria-label="Giá cao nhất"
                          className="tour-filter-field"
                        />
                      </div>
                    </div>

                    <label className="tour-filter-group">
                      <span className="tour-filter-label">
                        <ArrowUpDown size={15} /> Sắp xếp kết quả
                      </span>
                      <select
                        value={filters.sort}
                        onChange={(event) =>
                          updateFilter("sort", event.target.value)
                        }
                        className="tour-filter-field"
                      >
                        <option value="RELEVANCE">Mặc định</option>
                        <option value="PRICE_ASC">Giá thấp đến cao</option>
                        <option value="PRICE_DESC">Giá cao đến thấp</option>
                        <option value="DURATION_ASC">Thời lượng ngắn trước</option>
                        <option value="DEPARTURE_ASC">Khởi hành sớm nhất</option>
                        <option value="SEATS_DESC">Nhiều chỗ trống nhất</option>
                      </select>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.form>
        </div>
      </section>

      {/* CONTENT */}
      <section className="bg-[#020617] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-200">
                <Filter size={16} className="text-[#9de09c]" />
                {totalElements} tour phù hợp
                <span className="text-xs font-semibold text-slate-400">
                  / {tours.length} tour
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d4a878]">
              <MapPin size={14} /> Sơn La · Tây Bắc
            </div>
          </div>

          {activeFilterItems.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-black uppercase tracking-widest text-slate-400">
                Đang lọc:
              </span>
              {activeFilterItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => clearActiveFilter(item.key)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#7FB77E]/30 bg-[#7FB77E]/10 px-3 py-1.5 text-xs font-bold text-[#d9f5d8] transition hover:border-rose-300/40 hover:bg-rose-300/10 hover:text-rose-100"
                  title={`Bỏ bộ lọc ${item.label}`}
                >
                  {item.label}
                  <X size={13} />
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="mt-12 flex min-h-[420px] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#7FB77E]/30" />
                  <Loader2 className="relative h-14 w-14 animate-spin text-[#7FB77E]" />
                </div>
                <p className="text-sm font-bold text-slate-300">
                  Đang tải tour...
                </p>
              </div>
            </div>
          ) : loadError ? (
            <div className="mt-10 rounded-2xl border border-rose-300/25 bg-rose-300/[0.07] py-16 text-center" role="alert">
              <RefreshCcw size={30} className="mx-auto text-rose-200" />
              <p className="mt-4 text-lg font-black text-white">Chưa tải được danh sách tour</p>
              <p className="mx-auto mt-2 max-w-lg px-4 text-sm leading-6 text-slate-300">{loadError}</p>
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="btn-outline mt-6 text-sm"
              >
                <RefreshCcw size={16} /> Thử tải lại
              </button>
            </div>
          ) : visibleTours.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7FB77E]/10 text-[#9de09c]">
                <Search size={28} />
              </div>
              <p className="mt-5 text-lg font-black text-white">
                Không có tour phù hợp
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Thử nới khoảng giá, đổi khu vực hoặc xóa bớt điều kiện lọc.
              </p>
              <button
                type="button"
                onClick={resetSearch}
                className="btn-outline mt-6 text-sm"
              >
                Xem tất cả tour
              </button>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
              className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {visibleTours.map((tour) => (
                <motion.div
                  key={tour.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                  }}
                >
                  <TourCard tour={tour} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white transition hover:border-[#7FB77E]/60 hover:bg-[#7FB77E]/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Trang trước"
              >
                <ChevronLeft size={18} />
                Trước
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const isCurrent = idx === page;
                  const showPage =
                    idx === 0 ||
                    idx === totalPages - 1 ||
                    Math.abs(idx - page) <= 1;
                  if (!showPage) {
                    if (idx === 1 || idx === totalPages - 2) {
                      return (
                        <span
                          key={idx}
                          className="px-1 text-sm font-bold text-slate-500"
                        >
                          …
                        </span>
                      );
                    }
                    return null;
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPage(idx)}
                      className={[
                        "h-11 min-w-[2.75rem] rounded-xl px-3 text-sm font-black transition",
                        isCurrent
                          ? "bg-gradient-to-br from-[#9de09c] to-[#4f8f4d] text-[#020617] shadow-soft-green"
                          : "border border-white/10 bg-white/[0.04] text-white hover:border-[#7FB77E]/60 hover:bg-[#7FB77E]/10",
                      ].join(" ")}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white transition hover:border-[#7FB77E]/60 hover:bg-[#7FB77E]/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Trang sau"
              >
                Sau
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
      </div>
    </PublicLayout>
  );
}
