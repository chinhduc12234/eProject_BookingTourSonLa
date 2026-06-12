import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { getBookingDetail, getMyBookings } from "../../api/bookingApi";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../../api/userApi";
import PublicLayout from "../public/PublicLayout";
import { logout, saveAuth } from "../../utils/auth";

const emptyProfileForm = {
  fullName: "",
  email: "",
  phone: "",
  gender: "OTHER",
  dateOfBirth: "",
  address: "",
};

const bookingStatusMeta = {
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

const paymentStatusMeta = {
  UNPAID: {
    label: "Chưa thanh toán",
    className: "border-amber-300/30 bg-amber-300/10 text-amber-100",
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

const bookingSteps = [
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CONFIRMED", label: "Xác nhận" },
  { key: "IN_PROGRESS", label: "Khởi hành" },
  { key: "COMPLETED", label: "Hoàn thành" },
];

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const formatDateTime = (value) => {
  if (!value) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const normalizeProfileForm = (profile) => ({
  fullName: profile?.fullName || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  gender: profile?.gender || "OTHER",
  dateOfBirth: profile?.dateOfBirth || "",
  address: profile?.address || "",
});

const getMeta = (map, key) =>
  map[key] || {
    label: key || "Chưa cập nhật",
    className: "border-white/10 bg-white/[0.06] text-slate-200",
  };

function StatusPill({ meta }) {
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

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadAccount = async () => {
      try {
        setLoading(true);
        const [profileResponse, bookingResponse] = await Promise.all([
          getCurrentUserProfile(),
          getMyBookings(),
        ]);

        if (!mounted) return;

        const profileData = profileResponse.data;
        const bookingData = bookingResponse.data || [];

        setProfile(profileData);
        setProfileForm(normalizeProfileForm(profileData));
        setBookings(bookingData);

        if (bookingData.length > 0) {
          setSelectedBookingId(bookingData[0].id);
          const detailResponse = await getBookingDetail(bookingData[0].id);
          if (mounted) setSelectedBooking(detailResponse.data);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Không thể tải thông tin tài khoản",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAccount();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(
      (booking) =>
        booking.status === "PENDING" || booking.status === "CONFIRMED",
    ).length;
    const paidBookings = bookings.filter(
      (booking) => booking.paymentStatus === "PAID",
    ).length;
    const totalSpent = bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice || 0),
      0,
    );

    return {
      totalBookings,
      confirmedBookings,
      paidBookings,
      totalSpent,
    };
  }, [bookings]);

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        gender: profileForm.gender || "OTHER",
        dateOfBirth: profileForm.dateOfBirth || null,
        address: profileForm.address.trim(),
      };

      const response = await updateCurrentUserProfile(payload);
      const nextProfile = response.data;

      setProfile(nextProfile);
      setProfileForm(normalizeProfileForm(nextProfile));
      saveAuth(nextProfile);

      toast.success("Đã cập nhật thông tin tài khoản");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể cập nhật thông tin",
      );
    } finally {
      setSaving(false);
    }
  };

  const loadBookingDetail = async (bookingId) => {
    try {
      setDetailLoading(true);
      setSelectedBookingId(bookingId);
      const response = await getBookingDetail(bookingId);
      setSelectedBooking(response.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể tải chi tiết booking",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const statusMeta = getMeta(
    bookingStatusMeta,
    selectedBooking?.status,
  );
  const paymentMeta = getMeta(
    paymentStatusMeta,
    selectedBooking?.paymentStatus,
  );
  const selectedStatusIndex = bookingSteps.findIndex(
    (step) => step.key === selectedBooking?.status,
  );

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#7FB77E]" />
            <p className="text-sm font-bold text-slate-300">
              Đang tải tài khoản...
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="bg-[#020617] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-[#7FB77E]/10"
          >
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-[#7FB77E]/30 bg-[#7FB77E]/15 text-[#d9f5d8]">
                  <UserRound size={30} />
                </div>

                <div>
                  <span className="section-tag">
                    <ShieldCheck size={12} /> Tài khoản khách hàng
                  </span>
                  <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                    {profile?.fullName || "Khách hàng"}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1">
                      <Mail size={14} className="text-[#9de09c]" />
                      {profile?.email}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1">
                      <Phone size={14} className="text-[#d4a878]" />
                      {profile?.phone}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-black text-white transition hover:border-rose-300/50 hover:bg-rose-300/10 hover:text-rose-100"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>

            <div className="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Booking",
                  value: summary.totalBookings,
                  Icon: CalendarDays,
                },
                {
                  label: "Đang xử lý",
                  value: summary.confirmedBookings,
                  Icon: Clock3,
                },
                {
                  label: "Đã thanh toán",
                  value: summary.paidBookings,
                  Icon: CreditCard,
                },
                {
                  label: "Tổng giá trị",
                  value: formatCurrency(summary.totalSpent),
                  Icon: CheckCircle2,
                },
              ].map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 border-white/10 p-5 sm:border-l first:border-l-0"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                    <Icon size={20} />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-400">
                      {label}
                    </div>
                    <div className="mt-1 text-xl font-black text-white">
                      {value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.35fr]">
            <motion.form
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              onSubmit={handleProfileSubmit}
              className="h-fit rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                  <UserRound size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Chỉnh sửa thông tin
                  </h2>
                  <p className="text-sm text-slate-400">
                    Thông tin này sẽ được tự điền khi đặt tour.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#d4a878]">
                    Họ và tên
                  </label>
                  <input
                    value={profileForm.fullName}
                    onChange={(event) =>
                      updateProfileField("fullName", event.target.value)
                    }
                    className="field-input"
                    placeholder="Nhập họ tên"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-[#d4a878]">
                      Email đăng nhập
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(event) =>
                        updateProfileField("email", event.target.value)
                      }
                      className="field-input"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-[#d4a878]">
                      Số điện thoại
                    </label>
                    <input
                      value={profileForm.phone}
                      onChange={(event) =>
                        updateProfileField("phone", event.target.value)
                      }
                      className="field-input"
                      placeholder="09xxxxxxxx"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-[#d4a878]">
                      Giới tính
                    </label>
                    <select
                      value={profileForm.gender}
                      onChange={(event) =>
                        updateProfileField("gender", event.target.value)
                      }
                      className="h-12 w-full rounded-xl border border-white/10 bg-white px-4 text-slate-950 outline-none transition focus:border-[#7FB77E] focus:ring-4 focus:ring-[#7FB77E]/15"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-[#d4a878]">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(event) =>
                        updateProfileField("dateOfBirth", event.target.value)
                      }
                      className="field-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-[#d4a878]">
                    Địa chỉ
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.address}
                    onChange={(event) =>
                      updateProfileField("address", event.target.value)
                    }
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#7FB77E] focus:bg-[#7FB77E]/10 focus:ring-4 focus:ring-[#7FB77E]/15"
                    placeholder="Địa chỉ liên hệ hoặc điểm đón mặc định"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary mt-2 w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"
            >
              <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A67C52]/15 text-[#d4a878]">
                      <CalendarDays size={20} />
                    </span>
                    <div>
                      <h2 className="text-xl font-black text-white">
                        Lịch sử booking
                      </h2>
                      <p className="text-sm text-slate-400">
                        Theo dõi các tour đã đặt.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-300">
                    {bookings.length}
                  </span>
                </div>

                {bookings.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.06] text-slate-400">
                      <CalendarDays size={24} />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-300">
                      Bạn chưa có booking nào.
                    </p>
                    <Link to="/tours" className="btn-primary mt-5 text-sm">
                      Xem tour
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 max-h-[720px] space-y-3 overflow-y-auto pr-1">
                    {bookings.map((booking) => {
                      const itemStatus = getMeta(
                        bookingStatusMeta,
                        booking.status,
                      );
                      const itemPayment = getMeta(
                        paymentStatusMeta,
                        booking.paymentStatus,
                      );
                      const selected = selectedBookingId === booking.id;

                      return (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => loadBookingDetail(booking.id)}
                          className={[
                            "w-full rounded-xl border p-4 text-left transition",
                            selected
                              ? "border-[#7FB77E]/50 bg-[#7FB77E]/10"
                              : "border-white/10 bg-white/[0.03] hover:border-[#7FB77E]/40 hover:bg-white/[0.06]",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-[#d4a878]">
                                {booking.bookingCode}
                              </div>
                              <h3 className="mt-1 line-clamp-2 font-black text-white">
                                {booking.tourName}
                              </h3>
                            </div>
                            <Eye
                              size={18}
                              className={
                                selected ? "text-[#9de09c]" : "text-slate-400"
                              }
                            />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusPill meta={itemStatus} />
                            <StatusPill meta={itemPayment} />
                          </div>

                          <div className="mt-4 grid gap-2 text-sm text-slate-300">
                            <div className="flex items-center justify-between gap-3">
                              <span>Ngày đi</span>
                              <span className="font-bold text-white">
                                {formatDate(booking.departureDate)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Số khách</span>
                              <span className="font-bold text-white">
                                {Number(booking.adultCount || 0) +
                                  Number(booking.childCount || 0)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Tổng tiền</span>
                              <span className="font-black text-[#f4c27a]">
                                {formatCurrency(booking.totalPrice)}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Chi tiết trạng thái
                    </h2>
                    <p className="text-sm text-slate-400">
                      Xem tiến độ và thông tin thanh toán.
                    </p>
                  </div>
                </div>

                {detailLoading ? (
                  <div className="flex min-h-[360px] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#7FB77E]" />
                  </div>
                ) : selectedBooking ? (
                  <div className="mt-5 space-y-5">
                    <div className="rounded-xl border border-white/10 bg-[#020617]/45 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#d4a878]">
                            {selectedBooking.bookingCode}
                          </div>
                          <h3 className="mt-1 text-xl font-black text-white">
                            {selectedBooking.tourName}
                          </h3>
                          <p className="mt-2 text-sm text-slate-400">
                            Đặt lúc {formatDateTime(selectedBooking.bookedAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <StatusPill meta={statusMeta} />
                          <StatusPill meta={paymentMeta} />
                        </div>
                      </div>
                    </div>

                    {selectedBooking.status === "CANCELLED" ? (
                      <div className="flex items-start gap-3 rounded-xl border border-rose-300/30 bg-rose-300/10 p-4 text-rose-100">
                        <XCircle size={20} className="mt-0.5 shrink-0" />
                        <div>
                          <div className="font-black">Đặt lịch đã hủy</div>
                          <p className="mt-1 text-sm text-rose-100/80">
                            Liên hệ bộ phận hỗ trợ nếu bạn cần kiểm tra hoàn
                            tiền hoặc đặt lại lịch khác.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-4">
                        {bookingSteps.map((step, index) => {
                          const done = selectedStatusIndex >= index;
                          return (
                            <div
                              key={step.key}
                              className={[
                                "rounded-xl border p-3",
                                done
                                  ? "border-[#7FB77E]/40 bg-[#7FB77E]/15"
                                  : "border-white/10 bg-white/[0.03]",
                              ].join(" ")}
                            >
                              <div
                                className={[
                                  "flex h-9 w-9 items-center justify-center rounded-lg",
                                  done
                                    ? "bg-[#7FB77E] text-[#020617]"
                                    : "bg-white/[0.06] text-slate-400",
                                ].join(" ")}
                              >
                                {done ? (
                                  <CheckCircle2 size={18} />
                                ) : (
                                  <Clock3 size={18} />
                                )}
                              </div>
                              <div
                                className={[
                                  "mt-3 text-sm font-black",
                                  done ? "text-white" : "text-slate-400",
                                ].join(" ")}
                              >
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        {
                          Icon: CalendarDays,
                          label: "Ngày khởi hành",
                          value: `${formatDate(selectedBooking.departureDate)} ${
                            selectedBooking.departureTime
                              ? selectedBooking.departureTime.slice(0, 5)
                              : ""
                          }`,
                        },
                        {
                          Icon: Users,
                          label: "Số khách",
                          value: `${selectedBooking.totalPeople || 0} khách`,
                        },
                        {
                          Icon: CreditCard,
                          label: "Tổng tiền",
                          value: formatCurrency(selectedBooking.totalPrice),
                        },
                        {
                          Icon: Phone,
                          label: "Liên hệ",
                          value: selectedBooking.phone || "Chưa cập nhật",
                        },
                      ].map(({ Icon, label, value }) => (
                        <div
                          key={label}
                          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <Icon size={18} className="text-[#9de09c]" />
                          <div className="mt-3 text-xs font-bold text-slate-400">
                            {label}
                          </div>
                          <div className="mt-1 font-black text-white">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <h3 className="font-black text-white">
                        Thông tin khách hàng
                      </h3>
                      <div className="mt-4 grid gap-3 text-sm text-slate-300">
                        <div className="flex gap-3">
                          <UserRound
                            size={16}
                            className="mt-0.5 shrink-0 text-[#9de09c]"
                          />
                          <span>{selectedBooking.customerName}</span>
                        </div>
                        <div className="flex gap-3">
                          <Mail
                            size={16}
                            className="mt-0.5 shrink-0 text-[#d4a878]"
                          />
                          <span className="break-all">
                            {selectedBooking.email}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0 text-[#9de09c]"
                          />
                          <span>
                            {selectedBooking.pickupAddress ||
                              "Chưa có địa chỉ đón"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {(selectedBooking.note ||
                      selectedBooking.specialRequest) && (
                      <div className="rounded-xl border border-[#A67C52]/20 bg-[#A67C52]/[0.06] p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            size={18}
                            className="mt-0.5 shrink-0 text-[#d4a878]"
                          />
                          <div className="text-sm leading-6 text-slate-200">
                            {selectedBooking.note && (
                              <p>
                                <span className="font-black text-white">
                                  Ghi chú:
                                </span>{" "}
                                {selectedBooking.note}
                              </p>
                            )}
                            {selectedBooking.specialRequest && (
                              <p className="mt-2">
                                <span className="font-black text-white">
                                  Yêu cầu:
                                </span>{" "}
                                {selectedBooking.specialRequest}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedBooking.customers?.length > 0 && (
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <h3 className="font-black text-white">
                          Danh sách khách đi tour
                        </h3>
                        <div className="mt-4 space-y-3">
                          {selectedBooking.customers.map((customer, index) => (
                            <div
                              key={customer.id || index}
                              className="rounded-xl border border-white/10 bg-[#020617]/45 p-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="font-black text-white">
                                  {customer.fullName}
                                </div>
                                <span className="rounded-full bg-[#7FB77E]/15 px-3 py-1 text-xs font-bold text-[#9de09c]">
                                  {customer.groupLeader &&
                                  Number(selectedBooking.totalPeople || 0) > 1
                                    ? "Trưởng đoàn"
                                    : "Hành khách"}
                                </span>
                              </div>
                              <div className="mt-2 grid gap-1 text-sm text-slate-400 sm:grid-cols-2">
                                <span>{customer.customerType}</span>
                                <span>{customer.phone || "Chưa có SĐT"}</span>
                                <span className="break-all">
                                  {customer.email || "Chưa có email"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.06] text-slate-400">
                      <Eye size={24} />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-300">
                      Chọn một booking để xem chi tiết.
                    </p>
                  </div>
                )}
              </section>
            </motion.div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
