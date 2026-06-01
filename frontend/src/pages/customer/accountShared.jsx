export const emptyProfileForm = {
  fullName: "",
  email: "",
  phone: "",
  avatar: "",
  gender: "OTHER",
  dateOfBirth: "",
  address: "",
};

export const bookingStatusMeta = {
  PENDING: {
    label: "Chờ xác nhận",
    className: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  },
  IN_PROGRESS: {
    label: "Đang diễn ra",
    className: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "border-[#7FB77E]/40 bg-[#7FB77E]/15 text-[#d9f5d8]",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "border-rose-300/30 bg-rose-300/10 text-rose-100",
  },
};

export const paymentStatusMeta = {
  UNPAID: {
    label: "Chưa thanh toán",
    className: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  },
  PENDING_REVIEW: {
    label: "Xét duyệt",
    className: "border-amber-200/40 bg-amber-200/15 text-amber-50",
  },
  PARTIAL: {
    label: "Đã cọc",
    className: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  },
  PAID: {
    label: "Đã thanh toán",
    className: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    className: "border-slate-300/30 bg-slate-300/10 text-slate-100",
  },
  PARTIALLY_REFUNDED: {
    label: "Hoàn một phần",
    className: "border-violet-300/30 bg-violet-300/10 text-violet-100",
  },
  FORFEITED: {
    label: "Mất cọc",
    className: "border-orange-300/30 bg-orange-300/10 text-orange-100",
  },
  FAILED: {
    label: "Thanh toán lỗi",
    className: "border-rose-300/30 bg-rose-300/10 text-rose-100",
  },
};

export const bookingSteps = [
  { key: "PENDING", label: "Gửi yêu cầu" },
  { key: "CONFIRMED", label: "Xác nhận" },
  { key: "IN_PROGRESS", label: "Khởi hành" },
  { key: "COMPLETED", label: "Hoàn thành" },
];

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

export const normalizeProfileForm = (profile) => ({
  fullName: profile?.fullName || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  avatar: profile?.avatar || "",
  gender: profile?.gender || "OTHER",
  dateOfBirth: profile?.dateOfBirth || "",
  address: profile?.address || "",
});

export const getMeta = (map, key) =>
  map[key] || {
    label: key || "Chưa cập nhật",
    className: "border-white/10 bg-white/[0.06] text-slate-200",
  };

export function StatusPill({ meta }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-bold",
        meta.className,
      ].join(" ")}
    >
      {meta.label}
    </span>
  );
}

export function getInitials(name) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
