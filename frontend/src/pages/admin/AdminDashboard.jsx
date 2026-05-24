import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
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

import { getAdminBookings } from "../../api/bookingApi";
import { getDistricts } from "../../api/districtApi";
import { getLocations } from "../../api/locationApi";
import { getProvinces } from "../../api/provinceApi";
import { getAllStaff } from "../../api/staffApi";
import { getTours } from "../../api/tourApi";

const statConfig = [
  {
    key: "bookings",
    label: "Booking",
    desc: "Yêu cầu đặt tour",
    Icon: TicketCheck,
    to: "/admin/bookings",
    tone: "bg-fuchsia-50 text-fuchsia-700",
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
    title: "Quản lý booking",
    desc: "Xác nhận đặt chỗ, cập nhật thanh toán và theo dõi số khách đã giữ chỗ.",
    to: "/admin/bookings",
    Icon: TicketCheck,
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
    getAllStaff({ page: 0, size: 1 }),
    getProvinces(0, 1),
    getDistricts({ page: 0, size: 1 }),
    getLocations({ page: 0, size: 1 }),
  ]);

const parseStats = (results) => ({
  tours: getTotal(results[0]),
  bookings: getTotal(results[1]),
  staff: getTotal(results[2]),
  provinces: getTotal(results[3]),
  districts: getTotal(results[4]),
  locations: getTotal(results[5]),
});

const countFailed = (results) =>
  results.filter((result) => result.status === "rejected").length;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tours: null,
    bookings: null,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-full bg-[#f8fafc] p-5 text-slate-900 md:p-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              <ShieldCheck size={14} />
              Admin
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Bảng điều khiển quản trị
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
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

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {statConfig.map(({ key, label, desc, Icon, to, tone }) => (
            <Link
              key={key}
              to={to}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
                  <Icon size={22} />
                </span>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
              <div className="mt-5 text-3xl font-black text-slate-950">
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
                ? `${failedCount} nhóm dữ liệu chưa tải được. Kiểm tra backend hoặc quyền admin nếu số liệu hiển thị "Lỗi".`
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
