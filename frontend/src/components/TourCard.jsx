import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock3, Users } from "lucide-react";
import { resolveUploadedFileUrl } from "../api/userApi";
import TourImage from "./TourImage";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "Liên hệ";

  return Number(value).toLocaleString("vi-VN") + " đ";
};

const formatDate = (value) => {
  if (!value) return "Chưa có lịch";

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
};

export default function TourCard({ tour }) {
  const price = tour.lowestAdultPrice ?? tour.price;
  const hasDeparture = Number(tour.departureCount || 0) > 0;
  const statusLabel = tour.status === "OPEN" ? "Đang mở bán" : tour.status;
  const thumbnail = resolveUploadedFileUrl(tour.thumbnail);

  return (
    <article className="tour-card group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.025] shadow-soft-dark transition-all duration-500 hover:-translate-y-2 hover:border-[#7FB77E]/50 hover:shadow-soft-green">
      <Link to={`/tours/${tour.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/11] overflow-hidden bg-slate-800">
          <TourImage
            src={thumbnail}
            alt={tour.title}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            placeholderClassName="aspect-[16/11] bg-[#102219] text-[#c9e9c7]"
          />

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#7FB77E]/0 transition-opacity duration-500 group-hover:to-[#7FB77E]/20" />

          {/* status badge */}
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#020617]/85 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white backdrop-blur-md ring-1 ring-white/15">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7FB77E]" />
            </span>
            {statusLabel}
          </div>

          {/* code badge */}
          {tour.tourCode && (
            <div className="absolute right-4 top-4 rounded-lg bg-white/10 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md ring-1 ring-white/15">
              {tour.tourCode}
            </div>
          )}

          {/* bottom title overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="line-clamp-2 text-xl font-black leading-tight text-white drop-shadow-lg sm:text-2xl">
              {tour.title}
            </h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="line-clamp-2 min-h-[44px] text-sm leading-6 text-slate-300">
            {tour.shortDescription || "Thông tin tour đang được cập nhật."}
          </p>

          <div className="mt-4 grid gap-2.5 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9de09c]">
                <Clock3 size={14} />
                Thời lượng
              </span>
              <span className="font-bold text-white">
                {tour.durationDays}N {tour.durationNights}Đ
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9de09c]">
                <CalendarDays size={14} />
                Khởi hành
              </span>
              <span className="font-bold text-white">
                {formatDate(tour.firstDepartureDate)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9de09c]">
                <Users size={14} />
                Còn chỗ
              </span>
              <span
                className={
                  hasDeparture
                    ? "font-bold text-white"
                    : "font-bold text-[#f4c27a]"
                }
              >
                {hasDeparture
                  ? `${tour.availableSeats} chỗ`
                  : "Chưa mở lịch"}
              </span>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Giá từ
              </p>
              <p className="mt-1 text-2xl font-black text-gradient-gold">
                {formatCurrency(price)}
              </p>
            </div>
            <span className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#9de09c] to-[#4f8f4d] px-4 text-sm font-black text-[#020617] transition-all duration-300 group-hover:shadow-soft-green">
              Xem chi tiết
              <ArrowRight size={18} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
