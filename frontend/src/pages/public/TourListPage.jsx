import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import { getPublicTours } from "../../api/publicTourApi";
import TourCard from "../../components/TourCard";
import PublicLayout from "./PublicLayout";
import { scenicImages } from "./publicContent";

export default function TourListPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 9;

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);

        const response = await getPublicTours({
          page,
          size: pageSize,
          keyword,
        });

        setTours(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải danh sách tour",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, [page, keyword]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(0);
    setKeyword(search.trim());
  };

  const resetSearch = () => {
    setSearch("");
    setKeyword("");
    setPage(0);
  };

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
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
            className="relative mt-10 overflow-hidden rounded-2xl border border-white/15 bg-[#020617]/70 p-3 backdrop-blur-xl shadow-soft-dark md:p-4"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#7FB77E]/40 via-transparent to-[#A67C52]/40 opacity-50 blur-md" />
            <div className="relative grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
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
                onClick={resetSearch}
                className="btn-outline text-sm"
              >
                <RefreshCcw size={16} />
                Reset
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* CONTENT */}
      <section className="bg-[#020617] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-200">
              <Filter size={16} className="text-[#9de09c]" />
              {totalElements} tour phù hợp
              {keyword && (
                <span className="rounded-md bg-[#7FB77E]/15 px-2 py-0.5 text-xs font-bold text-[#9de09c]">
                  "{keyword}"
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d4a878]">
              <MapPin size={14} /> Sơn La · Tây Bắc
            </div>
          </div>

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
          ) : tours.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7FB77E]/10 text-[#9de09c]">
                <Search size={28} />
              </div>
              <p className="mt-5 text-lg font-black text-white">
                Không có tour phù hợp
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Thử thay đổi từ khoá hoặc xem toàn bộ danh sách tour.
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
              {tours.map((tour) => (
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
    </PublicLayout>
  );
}
