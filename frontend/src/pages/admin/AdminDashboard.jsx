import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarRange,
  ChartPie,
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

const statConfig = [
  {
    key: "bookings",
    label: "Đơn tour riêng",
    desc: "Yêu cầu lịch trình riêng",
    Icon: TicketCheck,
    to: "/admin/bookings",
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "groupTours",
    label: "Đoàn tour ghép",
    desc: "Lịch ghép đang vận hành",
    Icon: CalendarRange,
    to: "/admin/group-tours",
    tone: "bg-emerald-50 text-emerald-700",
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
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "provinces",
    label: "Tỉnh thành",
    desc: "Khu vực du lịch",
    Icon: Map,
    to: "/admin/provinces",
    tone: "bg-amber-50 text-amber-800",
  },
  {
    key: "districts",
    label: "Quận huyện",
    desc: "Phân vùng địa lý",
    Icon: Compass,
    to: "/admin/districts",
    tone: "bg-amber-50 text-amber-800",
  },
  {
    key: "locations",
    label: "Địa điểm",
    desc: "Điểm đến nổi bật",
    Icon: MapPinned,
    to: "/admin/locations",
    tone: "bg-amber-50 text-amber-800",
  },
];

const statByKey = Object.fromEntries(
  statConfig.map((item) => [item.key, item]),
);

const dashboardSections = [
  {
    key: "operations",
    title: "Điều hành tour",
    desc: "Theo dõi và xử lý các đoàn đang vận hành",
    Icon: CalendarRange,
    keys: ["groupTours", "bookings"],
    tone: "is-operations",
  },
  {
    key: "catalog",
    title: "Sản phẩm & điểm đến",
    desc: "Quản lý nội dung tour và địa điểm công khai",
    Icon: Mountain,
    keys: ["tours", "locations"],
    tone: "is-catalog",
  },
  {
    key: "organization",
    title: "Tổ chức & địa bàn",
    desc: "Nhân sự cùng hệ thống tỉnh, quận huyện",
    Icon: UsersRound,
    keys: ["staff", "provinces", "districts"],
    tone: "is-organization",
  },
];

const quickActions = [
  {
    eyebrow: "Điều hành",
    title: "Điều hành tour ghép",
    desc: "Theo dõi tiến độ đủ chỗ, phân công nhân viên chung và xác nhận toàn bộ đoàn.",
    to: "/admin/group-tours",
    Icon: CalendarRange,
  },
  {
    eyebrow: "Điều hành",
    title: "Xử lý đơn tour riêng",
    desc: "Xử lý riêng từng đoàn, cập nhật thanh toán, phân công nhân viên và xác nhận lịch trình.",
    to: "/admin/bookings",
    Icon: TicketCheck,
  },
  {
    eyebrow: "Sản phẩm",
    title: "Cập nhật danh sách tour",
    desc: "Tạo tour, sửa ảnh đại diện, giá, trạng thái và đi vào chi tiết lịch trình.",
    to: "/admin/tours",
    Icon: Mountain,
  },
  {
    eyebrow: "Tổ chức",
    title: "Quản lý nhân sự",
    desc: "Thêm tài khoản nhân viên, cập nhật thông tin liên hệ và trạng thái hoạt động.",
    to: "/admin/staff",
    Icon: UsersRound,
  },
  {
    eyebrow: "Danh mục",
    title: "Thiết lập điểm đến",
    desc: "Cập nhật tỉnh, huyện và các địa điểm dùng cho tour công khai.",
    to: "/admin/locations",
    Icon: MapPinned,
  },
  {
    eyebrow: "Phân tích",
    title: "Xem thống kê & báo cáo",
    desc: "Theo dõi doanh thu, booking, trạng thái tour và các chỉ số điều hành quan trọng.",
    to: "/admin/statistics",
    Icon: ChartPie,
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
              Quản trị viên
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

        <section className="mt-8" aria-labelledby="admin-overview-title">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              Sơ đồ quản trị
            </p>
            <h2 id="admin-overview-title" className="mt-2 text-2xl font-black text-slate-950">
              Tổng quan theo từng nhóm công việc
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Chọn đúng khu vực cần xử lý thay vì tìm trong một danh sách chức năng dài.
            </p>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {dashboardSections.map((section) => {
              const SectionIcon = section.Icon;

              return (
                <article
                  key={section.key}
                  className={`admin-dashboard-section ${section.tone} rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5`}
                >
                  <header className="flex items-start gap-3">
                    <span className="admin-dashboard-section-icon">
                      <SectionIcon size={21} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <h3 className="text-base font-black text-slate-950">{section.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{section.desc}</p>
                    </span>
                  </header>

                  <div className="mt-4 grid gap-2">
                    {section.keys.map((key) => {
                      const item = statByKey[key];
                      const ItemIcon = item.Icon;

                      return (
                        <Link
                          key={key}
                          to={item.to}
                          className="admin-dashboard-module group grid min-h-[76px] grid-cols-[44px_minmax(0,1fr)_auto_18px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                        >
                          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}>
                            <ItemIcon size={19} aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <strong className="block text-sm font-black text-slate-800">
                              {item.label}
                            </strong>
                            <small className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
                              {item.desc}
                            </small>
                          </span>
                          <span
                            className="text-2xl font-black tabular-nums text-slate-950"
                            aria-label={`${item.label}: ${loading ? "đang tải" : stats[key] ?? "lỗi"}`}
                          >
                            {loading ? "--" : stats[key] ?? "Lỗi"}
                          </span>
                          <ChevronRight
                            size={18}
                            className="text-slate-300 transition group-hover:text-emerald-600"
                            aria-hidden="true"
                          />
                        </Link>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-[#f8fafc] shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7FB77E] text-[#06130d]">
                <BarChart3 size={24} aria-hidden="true" />
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

            <Link
              to="/admin/statistics"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-white transition hover:border-[#7FB77E]/50 hover:bg-[#7FB77E]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a878]"
            >
              Mở báo cáo tổng hợp
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div>
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                Tác vụ thường dùng
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950">Đi nhanh đến công việc cần xử lý</h2>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {quickActions.map(({ eyebrow, title, desc, to, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex min-h-[118px] items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <small className="block text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">
                      {eyebrow}
                    </small>
                    <strong className="mt-1 block text-sm font-black text-slate-950">{title}</strong>
                    <span className="mt-1.5 block text-xs leading-5 text-slate-500">{desc}</span>
                  </span>
                  <ChevronRight
                    size={18}
                    className="mt-1 shrink-0 text-slate-300 transition group-hover:text-emerald-600"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
