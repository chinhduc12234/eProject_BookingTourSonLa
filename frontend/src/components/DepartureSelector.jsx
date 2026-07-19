import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";

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
    <div
      id="departure-selector"
      tabIndex="-1"
      className="departure-selector grid gap-3 outline-none"
    >
      {departures.map((departure) => {
        const availableSeats = Number(departure.availableSeats || 0);
        const deadlineExpired =
          departure.bookingDeadline && new Date(departure.bookingDeadline) < new Date();
        const isClosed = departure.status === "CLOSED";
        const disabled =
          !tourId || isClosed || availableSeats <= 0 || deadlineExpired;
        const disabledReason =
          !tourId
            ? "Đang tải thông tin tour..."
            : isClosed
              ? "Lịch chưa mở đặt"
              : availableSeats <= 0
                ? "Hết chỗ"
                : deadlineExpired
                  ? "Quá hạn đặt chỗ"
                  : "";
        const selected = Number(selectedId) === Number(departure.id);
        const adultPrice = departure.adultPrice ?? tourPrice;
        const childPrice = departure.childPrice ?? adultPrice;
        const isPrivateDeparture = Boolean(
          departure.isPrivateDeparture ?? departure.privateDeparture
        );
        const departureType = isPrivateDeparture
          ? {
              label: "Tour riêng",
              description: "Dành riêng cho đoàn của bạn",
              badgeClass: "border-[#d4a878]/60 bg-[#d4a878]/20 text-[#ffe0ad]",
              dotClass: "bg-[#d4a878]",
            }
          : {
              label: "Tour ghép",
              description: "Ghép khách theo lịch mở bán",
              badgeClass: "border-[#7FB77E]/60 bg-[#7FB77E]/[0.18] text-[#c9ffc8]",
              dotClass: "bg-[#9de09c]",
            };

        return (
          <button
            key={departure.id}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
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
                isPrivateDeparture,
              };
              localStorage.setItem('booking_temp_departure', JSON.stringify(tempDeparture));
            }}
            className={[
              "departure-option group relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
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

            <div className="flex flex-col gap-3 pr-9 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
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

                <div
                  className={[
                    "mt-3 inline-flex max-w-full items-start gap-2 rounded-xl border px-3 py-2 text-left",
                    departureType.badgeClass,
                  ].join(" ")}
                >
                  <span
                    className={[
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      departureType.dotClass,
                    ].join(" ")}
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-black uppercase tracking-wider">
                      {departureType.label}
                    </span>
                    <span className="block text-[11px] font-semibold leading-4 opacity-85">
                      {departureType.description}
                    </span>
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
                "mt-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider",
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
