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
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  IN_PROGRESS: {
    label: "Đang diễn ra",
    className: "border-sky-200 bg-sky-50 text-sky-900",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "border-emerald-200 bg-emerald-100 text-emerald-900",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "border-rose-200 bg-rose-50 text-rose-900",
  },
};

export const paymentStatusMeta = {
  UNPAID: {
    label: "Chưa thanh toán",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  PENDING_REVIEW: {
    label: "Chờ duyệt thanh toán",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  PARTIAL: {
    label: "Đã đặt cọc",
    className: "border-sky-200 bg-sky-50 text-sky-900",
  },
  PAID: {
    label: "Đã thanh toán",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    className: "border-slate-200 bg-slate-100 text-slate-800",
  },
  PARTIALLY_REFUNDED: {
    label: "Hoàn một phần",
    className: "border-violet-200 bg-violet-50 text-violet-900",
  },
  FORFEITED: {
    label: "Mất cọc",
    className: "border-orange-200 bg-orange-50 text-orange-900",
  },
  FAILED: {
    label: "Thanh toán lỗi",
    className: "border-rose-200 bg-rose-50 text-rose-900",
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
    className: "border-slate-200 bg-slate-50 text-slate-800",
  };

export function StatusPill({ meta }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-black shadow-sm",
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
