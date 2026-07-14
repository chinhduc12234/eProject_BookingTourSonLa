import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import {
  assignAdminGroupTourStaff,
  confirmAdminGroupTour,
  getAdminGroupTours,
} from "../../api/bookingApi";
import { getAllStaff } from "../../api/staffApi";
import {
  Badge,
  formatCurrency,
  formatDate,
  formatTime,
  getMeta,
  paymentMeta,
  statusMeta,
} from "./bookingShared";

const groupStatusMeta = {
  WAITING: {
    label: "Đang ghép khách",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  CONFIRMED: {
    label: "Đã xác nhận đoàn",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  IN_PROGRESS: {
    label: "Đang khởi hành",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
  CANCELLED: {
    label: "Không còn booking",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

const groupStatusOptions = [
  { value: "", label: "Tất cả trạng thái đoàn" },
  { value: "WAITING", label: "Đang ghép khách" },
  { value: "CONFIRMED", label: "Đã xác nhận đoàn" },
  { value: "IN_PROGRESS", label: "Đang khởi hành" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "CANCELLED", label: "Không còn booking" },
];

const normalizePageContent = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
};

export default function GroupTourManagementPage() {
  const [groupTours, setGroupTours] = useState([]);
  const [staff, setStaff] = useState([]);
  const [staffSelections, setStaffSelections] = useState({});
  const [expandedDepartureId, setExpandedDepartureId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 8;

  const loadGroupTours = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getAdminGroupTours({
        page,
        size: pageSize,
        keyword,
      });
      const content = normalizePageContent(response);

      setGroupTours(content);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
      setStaffSelections((current) => {
        const next = { ...current };
        content.forEach((item) => {
          if (next[item.departureId] === undefined) {
            next[item.departureId] = item.assignedStaffId
              ? String(item.assignedStaffId)
              : "";
          }
        });
        return next;
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Không thể tải danh sách tour ghép",
      );
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    loadGroupTours();
  }, [loadGroupTours]);

  useEffect(() => {
    let mounted = true;

    getAllStaff({ page: 0, size: 100, isActive: true })
      .then((response) => {
        if (mounted) setStaff(normalizePageContent(response));
      })
      .catch(() => {
        if (mounted) {
          toast.error("Không thể tải danh sách nhân viên đang hoạt động");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const visibleTours = useMemo(
    () =>
      statusFilter
        ? groupTours.filter((item) => item.groupStatus === statusFilter)
        : groupTours,
    [groupTours, statusFilter],
  );

  const summary = useMemo(
    () => ({
      waiting: groupTours.filter((item) => item.groupStatus === "WAITING").length,
      confirmed: groupTours.filter((item) => item.groupStatus === "CONFIRMED").length,
      occupied: groupTours.reduce(
        (sum, item) => sum + Number(item.occupiedPeople || 0),
        0,
      ),
      available: groupTours.reduce(
        (sum, item) => sum + Number(item.availableSeats || 0),
        0,
      ),
    }),
    [groupTours],
  );

  const replaceGroupTour = (updated) => {
    setGroupTours((current) =>
      current.map((item) =>
        item.departureId === updated.departureId ? updated : item,
      ),
    );
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(0);
    setKeyword(searchInput.trim());
  };

  const saveStaffAssignment = async (tour) => {
    const employeeId = Number(staffSelections[tour.departureId]);

    if (!employeeId) {
      toast.error("Vui lòng chọn nhân viên phụ trách");
      return;
    }

    const actionKey = `staff-${tour.departureId}`;
    setBusyAction(actionKey);

    try {
      const response = await assignAdminGroupTourStaff(
        tour.departureId,
        employeeId,
      );
      replaceGroupTour(response.data);
      toast.success("Đã phân công nhân viên cho toàn bộ đoàn ghép");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể phân công nhân viên",
      );
    } finally {
      setBusyAction("");
    }
  };

  const confirmGroupTour = async (tour) => {
    const result = await Swal.fire({
      title: "Xác nhận khởi hành tour ghép?",
      text:
        tour.availableSeats > 0
          ? `Đoàn vẫn còn ${tour.availableSeats} chỗ. Tất cả booking đang chờ sẽ được xác nhận thủ công.`
          : "Đoàn đã đủ chỗ. Tất cả booking đang chờ sẽ được xác nhận.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận đoàn",
      cancelButtonText: "Kiểm tra lại",
      confirmButtonColor: "#047857",
    });

    if (!result.isConfirmed) return;

    const actionKey = `confirm-${tour.departureId}`;
    setBusyAction(actionKey);

    try {
      const response = await confirmAdminGroupTour(tour.departureId);
      replaceGroupTour(response.data);
      toast.success("Tour ghép đã chuyển sang trạng thái xác nhận");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể xác nhận tour ghép",
      );
    } finally {
      setBusyAction("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faf7] p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-[28px] bg-slate-950 px-5 py-7 text-white shadow-xl md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                <UsersRound size={15} /> Vận hành đoàn ghép
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                Quản lý tour ghép
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 md:text-base">
                Mỗi thẻ là một đoàn theo lịch khởi hành. Hệ thống tự xác nhận
                khi đủ chỗ; quản trị viên vẫn có thể xác nhận sớm và phân công
                một nhân viên phụ trách chung cho toàn đoàn.
              </p>
            </div>

            <button
              type="button"
              onClick={loadGroupTours}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-black transition hover:bg-white/20 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <RefreshCcw size={18} />
              )}
              Làm mới dữ liệu
            </button>
          </div>
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Đoàn ghép", value: totalElements, Icon: CalendarDays },
            { label: "Đang chờ đủ khách", value: summary.waiting, Icon: UsersRound },
            { label: "Đã xác nhận", value: summary.confirmed, Icon: ShieldCheck },
            {
              label: "Khách / chỗ trống trong trang",
              value: `${summary.occupied} / ${summary.available}`,
              Icon: CalendarCheck2,
            },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm"
            >
              <Icon size={22} className="text-emerald-700" />
              <div className="mt-4 text-3xl font-black">{value}</div>
              <div className="mt-1 text-sm font-bold text-slate-500">{label}</div>
            </div>
          ))}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={submitSearch}
            className="grid gap-3 lg:grid-cols-[1fr_240px_auto]"
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm tên tour, mã booking hoặc khách hàng..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 font-semibold outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold outline-none transition focus:border-emerald-500 focus:bg-white"
            >
              {groupStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-black text-white transition hover:bg-slate-950"
            >
              <Search size={17} /> Tìm đoàn
            </button>
          </form>
        </section>

        <section className="mt-5 space-y-4">
          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
          ) : visibleTours.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
              <UsersRound className="mx-auto text-slate-300" size={46} />
              <h2 className="mt-4 text-xl font-black">Chưa có đoàn ghép phù hợp</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Đoàn sẽ xuất hiện tại đây khi có khách đặt lịch tour ghép.
              </p>
            </div>
          ) : (
            visibleTours.map((tour) => {
              const progress = tour.maxPeople
                ? Math.min(
                    100,
                    Math.round((tour.occupiedPeople / tour.maxPeople) * 100),
                  )
                : 0;
              const expanded = expandedDepartureId === tour.departureId;
              const selectedStaffId =
                staffSelections[tour.departureId] ??
                (tour.assignedStaffId ? String(tour.assignedStaffId) : "");
              const assigning = busyAction === `staff-${tour.departureId}`;
              const confirming = busyAction === `confirm-${tour.departureId}`;
              const canConfirm =
                tour.pendingBookingCount > 0 &&
                !["IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
                  tour.groupStatus,
                );

              return (
                <article
                  key={tour.departureId}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="grid gap-6 p-5 lg:grid-cols-[1.25fr_0.85fr] lg:p-6">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                            Lịch ghép #{tour.departureId}
                          </div>
                          <h2 className="mt-2 text-xl font-black text-slate-950 md:text-2xl">
                            {tour.tourName}
                          </h2>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
                            <span className="rounded-full bg-slate-100 px-3 py-1.5">
                              {formatDate(tour.departureDate)}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1.5">
                              {formatTime(tour.departureTime)}
                            </span>
                            <Badge meta={getMeta(groupStatusMeta, tour.groupStatus)} />
                          </div>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right text-emerald-950">
                          <div className="text-2xl font-black">
                            {tour.occupiedPeople}/{tour.maxPeople}
                          </div>
                          <div className="text-xs font-black uppercase tracking-wide text-emerald-700">
                            khách đã giữ chỗ
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-500">
                          <span>Tiến độ lấp đầy</span>
                          <span>{progress}% · còn {tour.availableSeats} chỗ</span>
                        </div>
                        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {[
                          ["Booking hoạt động", tour.bookingCount],
                          ["Đang chờ", tour.pendingBookingCount],
                          ["Đã xác nhận", tour.confirmedBookingCount],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl bg-slate-50 p-3">
                            <div className="text-xl font-black">{value}</div>
                            <div className="mt-1 text-xs font-bold text-slate-500">
                              {label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 font-black text-slate-950">
                        <UserRoundCheck size={19} className="text-emerald-700" />
                        Nhân viên phụ trách đoàn
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                        Nhân viên được đồng bộ vào tất cả booking đang hoạt động
                        và các booking mới của đoàn.
                      </p>

                      <select
                        value={selectedStaffId}
                        onChange={(event) =>
                          setStaffSelections((current) => ({
                            ...current,
                            [tour.departureId]: event.target.value,
                          }))
                        }
                        className="mt-4 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none focus:border-emerald-500"
                      >
                        <option value="">Chọn nhân viên phụ trách</option>
                        {staff.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.fullName} · {employee.phone || employee.email}
                          </option>
                        ))}
                      </select>

                      {tour.assignedStaffName && (
                        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-900">
                          Đang phụ trách: {tour.assignedStaffName}
                        </div>
                      )}

                      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => saveStaffAssignment(tour)}
                          disabled={assigning || !selectedStaffId}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-black text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-50"
                        >
                          {assigning ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <Save size={17} />
                          )}
                          Lưu phân công
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmGroupTour(tour)}
                          disabled={!canConfirm || confirming}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-slate-950 disabled:bg-slate-300"
                        >
                          {confirming ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}
                          {tour.availableSeats > 0
                            ? "Xác nhận thủ công"
                            : "Xác nhận đoàn"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDepartureId(expanded ? null : tour.departureId)
                    }
                    className="flex w-full items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-4 text-left text-sm font-black text-slate-700 transition hover:bg-emerald-50 lg:px-6"
                  >
                    <span>Danh sách booking trong đoàn ({tour.bookings?.length || 0})</span>
                    {expanded ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
                  </button>

                  {expanded && (
                    <div className="border-t border-slate-100 p-4 lg:p-6">
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="admin-responsive-table w-full text-left text-sm">
                          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                            <tr>
                              <th className="px-4 py-3">Booking</th>
                              <th className="px-4 py-3">Khách hàng</th>
                              <th className="px-4 py-3">Số khách</th>
                              <th className="px-4 py-3">Tổng tiền</th>
                              <th className="px-4 py-3">Trạng thái</th>
                              <th className="px-4 py-3">Thanh toán</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(tour.bookings || []).map((booking) => (
                              <tr key={booking.id}>
                                <td data-label="Booking" className="px-4 py-3 font-black">
                                  {booking.bookingCode}
                                </td>
                                <td data-label="Khách hàng" className="px-4 py-3">
                                  <div className="font-bold">{booking.customerName}</div>
                                  <div className="mt-1 text-xs text-slate-500">
                                    {booking.phone || booking.email}
                                  </div>
                                </td>
                                <td data-label="Số khách" className="px-4 py-3 font-black">
                                  {booking.totalPeople || 0}
                                </td>
                                <td data-label="Tổng tiền" className="px-4 py-3 font-black text-amber-700">
                                  {formatCurrency(booking.totalPrice)}
                                </td>
                                <td data-label="Trạng thái" className="px-4 py-3">
                                  <Badge meta={getMeta(statusMeta, booking.status)} />
                                </td>
                                <td data-label="Thanh toán" className="px-4 py-3">
                                  <Badge
                                    meta={getMeta(
                                      paymentMeta,
                                      booking.paymentStatus,
                                    )}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>

        <footer className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-bold text-slate-500">
            Hiển thị {visibleTours.length} / {totalElements} đoàn ghép
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold disabled:opacity-40"
            >
              Trước
            </button>
            <span className="text-sm font-black">
              {page + 1} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
