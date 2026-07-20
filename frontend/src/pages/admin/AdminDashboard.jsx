import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarRange,
  ChevronRight,
  Compass,
  Loader2,
  Map,
  MapPinned,
  Mountain,
  RefreshCcw,
  ShieldCheck,
  TicketCheck,
  UsersRound,
} from "lucide-react";

import { getAdminBookings, getAdminGroupTours } from "../../api/bookingApi";
import { getDistricts } from "../../api/districtApi";
import { getLocations } from "../../api/locationApi";
import { getProvinces } from "../../api/provinceApi";
import { getAllStaff } from "../../api/staffApi";
import { getTours } from "../../api/tourApi";
import { getAuthName } from "../../utils/auth";

const statConfig = [
  {
    key: "bookings",
    label: "Đơn tour riêng",
    desc: "Yêu cầu lịch trình riêng",
    Icon: TicketCheck,
    to: "/admin/bookings",
    tone: "bg-fuchsia-50 text-fuchsia-700",
  },
  {
    key: "groupTours",
    label: "Đoàn tour ghép",
    desc: "Lịch ghép đang vận hành",
    Icon: CalendarRange,
    to: "/admin/group-tours",
    tone: "bg-teal-50 text-teal-700",
  },
  {
    key: "tours",
    label: "Tour",
    desc: "Lịch trình đang quản lý",
    Icon: Mountain,
    to: "/admin/tours",
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "staff",
    label: "Nhân viên",
    desc: "Tài khoản vận hành",
    Icon: UsersRound,
    to: "/admin/staff",
    tone: "bg-sky-50 text-sky-700",
  },
  {
    key: "provinces",
    label: "Tỉnh thành",
    desc: "Khu vực du lịch",
    Icon: Map,
    to: "/admin/provinces",
    tone: "bg-amber-50 text-amber-700",
  },
  {
    key: "districts",
    label: "Quận huyện",
    desc: "Phân vùng địa lý",
    Icon: Compass,
    to: "/admin/districts",
    tone: "bg-violet-50 text-violet-700",
  },
  {
    key: "locations",
    label: "Địa điểm",
    desc: "Điểm đến nổi bật",
    Icon: MapPinned,
    to: "/admin/locations",
    tone: "bg-rose-50 text-rose-700",
  },
];

const quickActions = [
  {
    title: "Quản lý tour ghép",
    desc: "Theo dõi tiến độ đủ chỗ, phân công nhân viên chung và xác nhận toàn bộ đoàn.",
    to: "/admin/group-tours",
    Icon: CalendarRange,
  },
  {
    title: "Quản lý đơn tour riêng",
    desc: "Xử lý riêng từng đoàn, cập nhật thanh toán, phân công nhân viên và xác nhận lịch trình.",
    to: "/admin/bookings",
    Icon: TicketCheck,
  },
  {
    title: "Quản lý tour",
    desc: "Tạo tour, sửa ảnh đại diện, giá, trạng thái và đi vào chi tiết lịch trình.",
    to: "/admin/tours",
    Icon: Mountain,
  },
  {
    title: "Quản lý nhân viên",
    desc: "Thêm tài khoản nhân viên, cập nhật thông tin liên hệ và trạng thái hoạt động.",
    to: "/admin/staff",
    Icon: UsersRound,
  },
  {
    title: "Quản lý địa điểm",
    desc: "Cập nhật tỉnh, huyện và các địa điểm dùng cho tour công khai.",
    to: "/admin/locations",
    Icon: MapPinned,
  },
];

const getTotal = (result) => {
  if (result.status !== "fulfilled") return null;

  const data = result.value?.data;

  if (typeof data?.totalElements === "number") return data.totalElements;
  if (Array.isArray(data?.content)) return data.content.length;
  if (Array.isArray(data)) return data.length;

  return 0;
};

const fetchDashboardStats = () =>
  Promise.allSettled([
    getTours({ page: 0, size: 1 }),
    getAdminBookings({ page: 0, size: 1 }),
    getAdminGroupTours({ page: 0, size: 1 }),
    getAllStaff({ page: 0, size: 1 }),
    getProvinces(0, 1),
    getDistricts({ page: 0, size: 1 }),
    getLocations({ page: 0, size: 1 }),
  ]);

const parseStats = (results) => ({
  tours: getTotal(results[0]),
  bookings: getTotal(results[1]),
  groupTours: getTotal(results[2]),
  staff: getTotal(results[3]),
  provinces: getTotal(results[4]),
  districts: getTotal(results[5]),
  locations: getTotal(results[6]),
});

const countFailed = (results) =>
  results.filter((result) => result.status === "rejected").length;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tours: null,
    bookings: null,
    groupTours: null,
    staff: null,
    provinces: null,
    districts: null,
    locations: null,
  });
  const [loading, setLoading] = useState(true);
  const [failedCount, setFailedCount] = useState(0);

  const loadStats = async () => {
    setLoading(true);

    const results = await fetchDashboardStats();

    setStats(parseStats(results));
    setFailedCount(countFailed(results));
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    fetchDashboardStats().then((results) => {
      if (!mounted) return;

      setStats(parseStats(results));
      setFailedCount(countFailed(results));
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const totalManaged = useMemo(
    () =>
      Object.values(stats).reduce(
        (sum, value) => sum + (typeof value === "number" ? value : 0),
        0,
      ),
    [stats],
  );

  const adminName = getAuthName() || "Quản trị viên";

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  const heroChips = [
    { label: "Tổng dữ liệu quản lý", value: loading ? "--" : totalManaged },
    { label: "Tour", value: loading ? "--" : stats.tours ?? "Lỗi" },
    { label: "Đơn tour riêng", value: loading ? "--" : stats.bookings ?? "Lỗi" },
    { label: "Đoàn tour ghép", value: loading ? "--" : stats.groupTours ?? "Lỗi" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-full bg-[#f8fafc] p-5 text-slate-900 md:p-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative mb-8 min-h-[260px] overflow-hidden rounded-3xl shadow-xl shadow-slate-900/15 md:min-h-[320px]">
          <img
            src="/images/taybac/son-la-landscape.jpg"
            alt="Toàn cảnh núi rừng Sơn La, Tây Bắc"
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          <div className="relative flex h-full flex-col justify-center gap-5 px-6 py-9 md:px-10 md:py-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                <ShieldCheck size={14} />
                Xin chào, {adminName}
              </div>
              <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-white drop-shadow-md md:text-4xl">
                Trung tâm điều hành Tây Bắc Travel
              </h1>
              <p className="mt-3 max-w-xl text-sm font-semibold capitalize leading-6 text-slate-100/95 md:text-base">
                {todayLabel}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {heroChips.map((chip) => (
                <div
                  key={chip.label}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  <div className="text-2xl font-black text-white">{chip.value}</div>
                  <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-200">
                    {chip.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-950">
              Tổng quan số liệu vận hành
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Theo dõi nhanh dữ liệu vận hành và đi tới các khu vực quản lý tour,
              nhân viên, tỉnh huyện và địa điểm.
            </p>
          </div>

          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
            Làm mới
          </button>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statConfig.map(({ key, label, desc, Icon, to, tone }) => (
            <Link
              key={key}
              to={to}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset ring-black/5 transition-transform duration-200 group-hover:scale-105 ${tone}`}
                >
                  <Icon size={22} />
                </span>
                <ChevronRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-500"
                />
              </div>
              <div className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                {loading ? "--" : stats[key] ?? "Lỗi"}
              </div>
              <div className="mt-1 text-sm font-black text-slate-700">{label}</div>
              <p className="mt-2 text-sm leading-5 text-slate-500">{desc}</p>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-[#f8fafc] shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7FB77E] text-[#06130d]">
                <BarChart3 size={24} />
              </span>
              <div>
                <div className="text-sm font-bold text-slate-300">Tổng dữ liệu đang quản lý</div>
                <div className="text-3xl font-black">{loading ? "--" : totalManaged}</div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-slate-300">
              {failedCount > 0
                ? `${failedCount} nhóm dữ liệu chưa tải được. Kiểm tra máy chủ hoặc quyền quản trị nếu số liệu hiển thị "Lỗi".`
                : "Các nhóm dữ liệu quản trị đã sẵn sàng. Chọn menu bên trái hoặc lối tắt bên dưới để thao tác."}
            </div>
          </div>

          <div className="grid gap-4">
            {quickActions.map(({ title, desc, to, Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-black text-slate-950">{title}</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{desc}</p>
                </div>
                <ChevronRight size={20} className="shrink-0 text-slate-300 transition group-hover:text-emerald-600" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
