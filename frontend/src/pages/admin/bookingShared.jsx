export const bookingStatuses = [
  { value: "", label: "Tất cả booking" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "IN_PROGRESS", label: "Đang đi tour" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export const paymentStatuses = [
  { value: "", label: "Tất cả thanh toán" },
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "PENDING_REVIEW", label: "Kiểm tra" },
  { value: "PARTIAL", label: "Đã cọc" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "PARTIALLY_REFUNDED", label: "Hoàn một phần" },
  { value: "FORFEITED", label: "Mất cọc" },
  { value: "FAILED", label: "Thanh toán lỗi" },
];

export const scheduleActivityStatuses = [
  { value: "PENDING", label: "Chờ thực hiện" },
  { value: "DONE", label: "Hoàn thành" },
  { value: "CHANGED", label: "Có thay đổi" },
  { value: "SKIPPED", label: "Bỏ qua" },
];

export const statusMeta = {
  PENDING: {
    label: "Chờ xác nhận",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  IN_PROGRESS: {
    label: "Đang đi tour",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export const scheduleActivityStatusMeta = {
  PENDING: {
    label: "Chờ thực hiện",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  DONE: {
    label: "Hoàn thành",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  CHANGED: {
    label: "Có thay đổi",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  SKIPPED: {
    label: "Bỏ qua",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export const paymentMeta = {
  UNPAID: {
    label: "Chưa thanh toán",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  PENDING_REVIEW: {
    label: "Kiểm tra",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  PARTIAL: {
    label: "Đã cọc",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  PAID: {
    label: "Đã thanh toán",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
  PARTIALLY_REFUNDED: {
    label: "Hoàn một phần",
    className: "border-violet-200 bg-violet-50 text-violet-800",
  },
  FORFEITED: {
    label: "Mất cọc",
    className: "border-orange-200 bg-orange-50 text-orange-800",
  },
  FAILED: {
    label: "Thanh toán lỗi",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

export const bookingTypeText = {
  INDIVIDUAL: "Cá nhân",
  GROUP: "Theo đoàn",
  PRIVATE: "Tour riêng",
};

export const customerTypeText = {
  ADULT: "Người lớn",
  CHILD: "Trẻ em",
  INFANT: "Em bé",
};

export const paymentPlanText = {
  FULL: "Thanh toán 100%",
  DEPOSIT: "Đặt cọc 30%",
};

export const paymentMethodText = {
  BANK_TRANSFER_QR: "Chuyển khoản QR",
  BANK_TRANSFER_LATER: "Chuyển khoản phần còn lại",
  CASH_ON_DEPARTURE: "Tiền mặt khi khởi hành",
  ONLINE: "Thanh toán online",
};

export const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

export const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (value) => {
  if (!value) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

export const formatTime = (value) => {
  if (!value) return "Chưa rõ giờ";
  if (typeof value === "string" && value.includes(":")) {
    return value.slice(0, 5);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const getMeta = (map, key) =>
  map[key] || {
    label: key || "Chưa cập nhật",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };

export function Badge({ meta }) {
  return (
    <span
      className={[
        "inline-flex min-h-9 items-center justify-center rounded-full border px-3 text-xs font-black",
        meta.className,
      ].join(" ")}
    >
      {meta.label}
    </span>
  );
}

export function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <Icon size={18} className="text-emerald-700" />
      <div className="mt-3 text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 font-black text-slate-950">{value}</div>
    </div>
  );
}

export function TextBlock({ title, value }) {
  if (!value) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-black text-slate-900">{title}</div>
      <div className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
        {value}
      </div>
    </div>
  );
}

export function DetailPaymentRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <b className="text-right text-slate-950">{value}</b>
    </div>
  );
}
