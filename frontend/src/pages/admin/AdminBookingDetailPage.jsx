import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
  TicketCheck,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";

import {
  getAdminBookingDetail,
  updateAdminBooking,
} from "../../api/bookingApi";
import { getAllStaff } from "../../api/staffApi";
import { resolveUploadedFileUrl } from "../../api/userApi";
import {
  Badge,
  DetailPaymentRow,
  InfoCard,
  TextBlock,
  bookingTypeText,
  customerTypeText,
  formatCurrency,
  formatDate,
  formatDateTime,
  getMeta,
  paymentMeta,
  paymentMethodText,
  paymentPlanText,
  statusMeta,
} from "./bookingShared";

export default function AdminBookingDetailPage() {
  const { bookingId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffOptions, setStaffOptions] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const [detailResponse, staffResponse] = await Promise.all([
        getAdminBookingDetail(bookingId),
        getAllStaff({
          page: 0,
          size: 100,
          isActive: true,
          sortBy: "fullName",
          direction: "asc",
        }),
      ]);

      const nextDetail = detailResponse.data;
      setDetail(nextDetail);
      setSelectedStaffId(
        nextDetail.assignedStaffId ? String(nextDetail.assignedStaffId) : "",
      );
      setInternalNote(nextDetail.internalNote || "");
      setStaffOptions(staffResponse.data.content || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tải chi tiết booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getAdminBookingDetail(bookingId),
      getAllStaff({
        page: 0,
        size: 100,
        isActive: true,
        sortBy: "fullName",
        direction: "asc",
      }),
    ])
      .then(([detailResponse, staffResponse]) => {
        if (!mounted) return;

        const nextDetail = detailResponse.data;
        setDetail(nextDetail);
        setSelectedStaffId(
          nextDetail.assignedStaffId ? String(nextDetail.assignedStaffId) : "",
        );
        setInternalNote(nextDetail.internalNote || "");
        setStaffOptions(staffResponse.data.content || []);
      })
      .catch((error) => {
        if (mounted) {
          toast.error(error?.response?.data?.message || "Không thể tải chi tiết booking");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const handleAdminAction = async ({
    confirm = false,
    confirmPayment = false,
    paymentStatus,
  }) => {
    if (!detail) return;

    if (confirm && !selectedStaffId) {
      toast.error("Vui lòng chọn nhân viên phụ trách trước khi xác nhận tour");
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        internalNote,
        confirm,
        confirmPayment,
      };

      if (paymentStatus) {
        payload.paymentStatus = paymentStatus;
      }

      if (selectedStaffId) {
        payload.assignedStaffId = Number(selectedStaffId);
      }

      const response = await updateAdminBooking(detail.id, payload);
      setDetail(response.data);
      setSelectedStaffId(
        response.data.assignedStaffId ? String(response.data.assignedStaffId) : "",
      );
      setInternalNote(response.data.internalNote || "");
      toast.success(
        paymentStatus === "FAILED"
          ? "Đã từ chối thanh toán"
          : confirmPayment
          ? "Đã xác nhận thanh toán"
          : confirm
            ? "Đã gán nhân viên và xác nhận tour"
            : "Đã lưu phân công",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật booking");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 text-slate-900 md:p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <TicketCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h1 className="mt-4 text-2xl font-black">Không tìm thấy booking</h1>
          <Link
            to="/admin/bookings"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-emerald-700"
          >
            <ArrowLeft size={17} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const hasGroup = Number(detail.totalPeople || 0) > 1;
  const isCancelled = detail.status === "CANCELLED";
  const isTourConfirmed = detail.status === "CONFIRMED";
  const isPaymentPendingReview = detail.paymentStatus === "PENDING_REVIEW";
  const confirmedPaymentLabel =
    Number(detail.remainingAmount || 0) > 0 ? "Đã cọc" : "Đã thanh toán";

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              to="/admin/bookings"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <ArrowLeft size={17} />
              Danh sách booking
            </Link>
            <div className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              {detail.bookingCode}
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Chi tiết booking
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Xem thông tin tour, khách đi tour, thanh toán và phân công nhân viên.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge meta={getMeta(statusMeta, detail.status)} />
            <Badge meta={getMeta(paymentMeta, detail.paymentStatus)} />
            <button
              type="button"
              onClick={loadDetail}
              disabled={loading || actionLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
            >
              <RefreshCcw size={16} />
              Làm mới
            </button>
          </div>
        </div>

        {isCancelled && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
            Đặt lịch đã hủy. Chính sách hoàn tiền bên dưới đang phản ánh theo ngày khởi hành của booking này.
          </div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                <div className="min-h-64 bg-slate-100">
                  {detail.tourThumbnail ? (
                    <img
                      src={resolveUploadedFileUrl(detail.tourThumbnail)}
                      alt={detail.tourName}
                      className="h-full min-h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-64 items-center justify-center text-slate-300">
                      <TicketCheck size={42} />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Tour đã đặt
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    {detail.tourName}
                  </h2>
                  {detail.tourShortDescription && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {detail.tourShortDescription}
                    </p>
                  )}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <InfoCard
                      icon={CalendarDays}
                      label="Khởi hành"
                      value={`${formatDate(detail.departureDate)} ${
                        detail.departureTime ? detail.departureTime.slice(0, 5) : ""
                      }`}
                    />
                    <InfoCard
                      icon={MapPin}
                      label="Điểm đi"
                      value={detail.departureLocation || "Chưa cập nhật"}
                    />
                    <InfoCard
                      icon={ClipboardList}
                      label="Thời lượng"
                      value={`${detail.durationDays || 0} ngày ${
                        detail.durationNights || 0
                      } đêm`}
                    />
                    <InfoCard
                      icon={CreditCard}
                      label="Tổng tiền"
                      value={formatCurrency(detail.totalPrice)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard
                icon={UserRound}
                label="Khách hàng"
                value={detail.customerName}
              />
              <InfoCard
                icon={Users}
                label="Số khách"
                value={`${detail.totalPeople || 0} khách - NL ${
                  detail.adultCount || 0
                } / TE ${detail.childCount || 0}`}
              />
              <InfoCard
                icon={Phone}
                label="Số điện thoại"
                value={detail.phone || "Chưa cập nhật"}
              />
              <InfoCard
                icon={Mail}
                label="Email"
                value={detail.email || "Chưa cập nhật"}
              />
              <InfoCard
                icon={ShieldCheck}
                label="Loại booking"
                value={bookingTypeText[detail.bookingType] || detail.bookingType}
              />
              <InfoCard
                icon={MapPin}
                label="Điểm đón"
                value={detail.pickupAddress || "Chưa có địa chỉ đón"}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextBlock title="Mô tả tour" value={detail.tourDescription} />
              <TextBlock title="Dịch vụ bao gồm" value={detail.includedServices} />
              <TextBlock title="Dịch vụ không bao gồm" value={detail.excludedServices} />
              <TextBlock
                title="Ghi chú/yêu cầu của khách"
                value={[detail.note, detail.specialRequest].filter(Boolean).join("\n")}
              />
            </div>

            {detail.scheduleDays?.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <ClipboardList size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Lịch trình tour
                    </h2>
                    <p className="text-sm font-semibold text-slate-500">
                      Lịch trình được snapshot riêng cho booking này.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {detail.scheduleDays.map((day) => (
                    <div
                      key={day.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                        Ngày {day.dayNumber}
                      </div>
                      <h3 className="mt-1 font-black text-slate-950">
                        {day.title}
                      </h3>
                      {day.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {day.description}
                        </p>
                      )}

                      {day.activities?.length > 0 && (
                        <div className="mt-4 grid gap-3">
                          {day.activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="rounded-xl border border-slate-200 bg-white p-3"
                            >
                              <div className="text-xs font-black text-slate-400">
                                {activity.startTime
                                  ? activity.startTime.slice(0, 5)
                                  : "Chưa rõ giờ"}
                                {activity.endTime
                                  ? ` - ${activity.endTime.slice(0, 5)}`
                                  : ""}
                              </div>
                              <div className="mt-1 font-black text-slate-900">
                                {activity.title}
                              </div>
                              {activity.description && (
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.customers?.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-slate-950">
                  Danh sách khách đi tour
                </h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {detail.customers.map((customer, index) => (
                    <div
                      key={customer.id || index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-black text-slate-950">
                          {customer.fullName}
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          {customer.groupLeader && hasGroup
                            ? "Trưởng đoàn"
                            : "Hành khách"}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-1 text-sm text-slate-600">
                        <span>
                          {customerTypeText[customer.customerType] ||
                            customer.customerType}
                        </span>
                        <span>{customer.phone || "Chưa có SĐT"}</span>
                        <span className="break-all">
                          {customer.email || "Chưa có email"}
                        </span>
                        {customer.healthNote && (
                          <span>Sức khỏe: {customer.healthNote}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700">
                  <UserCog size={20} />
                </span>
                <div>
                  <h2 className="font-black text-slate-950">
                    Phân công nhân viên
                  </h2>
                  <p className="text-sm font-semibold text-slate-500">
                    Chọn nhân viên phụ trách rồi xác nhận tour.
                  </p>
                </div>
              </div>

              <label className="mt-5 block text-sm font-black text-slate-700">
                Nhân viên phụ trách
              </label>
              <select
                value={selectedStaffId}
                onChange={(event) => setSelectedStaffId(event.target.value)}
                disabled={actionLoading || isCancelled}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-emerald-500 disabled:opacity-60"
              >
                <option value="">Chọn nhân viên</option>
                {staffOptions.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName} - {staff.phone}
                  </option>
                ))}
              </select>

              {detail.assignedStaffName && (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm">
                  <div className="font-black text-emerald-800">
                    Đang giao cho {detail.assignedStaffName}
                  </div>
                  <div className="mt-1 text-emerald-700">
                    {detail.assignedStaffPhone || detail.assignedStaffEmail}
                  </div>
                </div>
              )}

              <label className="mt-5 block text-sm font-black text-slate-700">
                Ghi chú nội bộ
              </label>
              <textarea
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                disabled={actionLoading}
                rows={4}
                placeholder="Ví dụ: khách cần hỗ trợ đón tại khách sạn..."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 disabled:opacity-60"
              />

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => handleAdminAction({ confirm: false })}
                  disabled={actionLoading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={17} />
                  )}
                  Lưu phân công
                </button>

                <button
                  type="button"
                  onClick={() => handleAdminAction({ confirm: true })}
                  disabled={actionLoading || isTourConfirmed || isCancelled}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {actionLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  {isTourConfirmed ? "Tour đã xác nhận" : "Gán nhân viên & xác nhận"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-black text-slate-950">Duyệt thanh toán</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Khách gửi xác nhận chuyển khoản trước, admin kiểm tra giao dịch rồi mới chốt trạng thái thanh toán.
              </p>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <DetailPaymentRow
                  label="Trạng thái"
                  value={<Badge meta={getMeta(paymentMeta, detail.paymentStatus)} />}
                />
                <DetailPaymentRow
                  label="Tổng tiền"
                  value={formatCurrency(detail.totalPrice)}
                />
                <DetailPaymentRow
                  label="Đã ghi nhận"
                  value={formatCurrency(detail.paidAmount)}
                />
                <DetailPaymentRow
                  label="Cọc 30%"
                  value={formatCurrency(detail.depositAmount)}
                />
                <DetailPaymentRow
                  label="Còn lại"
                  value={formatCurrency(detail.remainingAmount)}
                />
                {Number(detail.refundedAmount || 0) > 0 && (
                  <DetailPaymentRow
                    label="Đã hoàn"
                    value={formatCurrency(detail.refundedAmount)}
                  />
                )}
                {Number(detail.forfeitedDepositAmount || 0) > 0 && (
                  <DetailPaymentRow
                    label="Cọc đã giữ"
                    value={formatCurrency(detail.forfeitedDepositAmount)}
                  />
                )}
                {detail.paymentPlan && (
                  <DetailPaymentRow
                    label="Gói thanh toán"
                    value={paymentPlanText[detail.paymentPlan] || detail.paymentPlan}
                  />
                )}
                {detail.paymentMethod && (
                  <DetailPaymentRow
                    label="Phương thức"
                    value={paymentMethodText[detail.paymentMethod] || detail.paymentMethod}
                  />
                )}
                {detail.remainingPaymentMethod && (
                  <DetailPaymentRow
                    label="Phần còn lại"
                    value={
                      paymentMethodText[detail.remainingPaymentMethod] ||
                      detail.remainingPaymentMethod
                    }
                  />
                )}
                <DetailPaymentRow
                  label="Hạn thanh toán"
                  value={formatDateTime(detail.paymentDeadline)}
                />
                <DetailPaymentRow
                  label="Thanh toán lúc"
                  value={formatDateTime(detail.paidAt)}
                />
                {detail.refundedAt && (
                  <DetailPaymentRow
                    label="Hoàn tiền lúc"
                    value={formatDateTime(detail.refundedAt)}
                  />
                )}
                {detail.paymentReference && (
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs font-black uppercase text-slate-400">
                      Mã giao dịch
                    </div>
                    <div className="mt-1 break-all font-black text-slate-900">
                      {detail.paymentReference}
                    </div>
                  </div>
                )}
                {isPaymentPendingReview && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-900">
                    <div className="font-black">Khách đã gửi xác nhận thanh toán</div>
                    <p className="mt-1 text-sm leading-6">
                      Kiểm tra chuyển khoản rồi xác nhận để hệ thống chuyển sang trạng thái {confirmedPaymentLabel}.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAdminAction({ confirmPayment: true })}
                      disabled={actionLoading || isCancelled}
                      className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {actionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CreditCard size={16} />
                      )}
                      Xác nhận thanh toán
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminAction({ paymentStatus: "FAILED" })}
                      disabled={actionLoading || isCancelled}
                      className="ml-2 mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CreditCard size={16} />
                      )}
                      Từ chối thanh toán
                    </button>
                  </div>
                )}
                {detail.refundPolicyNote && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-amber-900">
                    <div className="text-xs font-black uppercase text-amber-600">
                      Chính sách hoàn tiền
                    </div>
                    <div className="mt-1 font-semibold leading-6">
                      {detail.refundPolicyNote}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
