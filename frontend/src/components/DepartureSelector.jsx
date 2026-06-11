import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import toast from "react-hot-toast";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return null;

  return Number(value).toLocaleString("vi-VN") + " đ";
};

const formatDate = (value) => {
  if (!value) return "Chưa rõ ngày";

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
};

const formatTime = (value) => {
  if (!value) return "Chưa rõ giờ";

  return value.slice(0, 5);
};

export default function DepartureSelector({
  departures,
  selectedId,
  onSelect,
  tourPrice,
  tourId,
}) {
  if (!departures || departures.length === 0) {
    return (
      <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
        Tour này chưa có lịch khởi hành khả dụng.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {departures.map((departure) => {
        const availableSeats = Number(departure.availableSeats || 0);
        const deadlineExpired =
          departure.bookingDeadline && new Date(departure.bookingDeadline) < new Date();
        const disabled =
          !tourId || departure.status !== "OPEN" || availableSeats <= 0 || deadlineExpired;
        const disabledReason =
          !tourId
            ? "Đang tải thông tin tour..."
            : departure.status !== "OPEN"
              ? "Lịch chưa mở đặt"
              : availableSeats <= 0
                ? "Hết chỗ"
                : deadlineExpired
                  ? "Quá hạn đặt chỗ"
                  : "";
        const selected = Number(selectedId) === Number(departure.id);
        const adultPrice = departure.adultPrice ?? tourPrice;
        const childPrice = departure.childPrice ?? adultPrice;

        return (
          <button
            key={departure.id}
            type="button"
            disabled={disabled}
            onClick={() => {
              onSelect(departure.id);
              const tempDeparture = {
                id: departure.id,
                tourId: tourId,
                departureDate: departure.departureDate,
                departureTime: departure.departureTime,
                adultPrice: departure.adultPrice ?? tourPrice,
                childPrice: departure.childPrice ?? (departure.adultPrice ?? tourPrice),
                availableSeats: departure.availableSeats,
              };
              localStorage.setItem('booking_temp_departure', JSON.stringify(tempDeparture));
            }}
            className={[
              "group relative overflow-hidden rounded-xl border p-4 text-left transition-all",
              selected
                ? "border-[#7FB77E] bg-gradient-to-br from-[#7FB77E]/25 to-[#4f8f4d]/10 shadow-soft-green"
                : "border-white/10 bg-white/[0.04] hover:border-[#7FB77E]/50 hover:bg-[#7FB77E]/[0.07]",
              disabled ? "cursor-not-allowed opacity-50" : "",
            ].join(" ")}
          >
            {selected && (
              <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#7FB77E] text-[#020617]">
                <CheckCircle2 size={14} />
              </span>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-white">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={16} className="text-[#9de09c]" />
                    {formatDate(departure.departureDate)}
                  </span>
                  <span className="inline-flex items-center gap-2 text-slate-300">
                    <Clock3 size={16} className="text-[#9de09c]" />
                    {formatTime(departure.departureTime)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">
                    Người lớn: {formatCurrency(adultPrice)}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">
                    Trẻ em: {formatCurrency(childPrice)}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-1.5 text-sm font-bold text-white">
                <Users size={14} className="text-[#9de09c]" />
                {availableSeats} chỗ
              </div>
            </div>

            <div
              className={[
                "mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest",
                disabled ? "text-rose-300/80" : "text-[#d4a878]",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-1.5 w-1.5 rounded-full",
                  disabled ? "bg-rose-400" : "bg-[#9de09c]",
                ].join(" ")}
              />
              {disabled ? disabledReason || "Không thể đặt" : "Có thể đặt"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
