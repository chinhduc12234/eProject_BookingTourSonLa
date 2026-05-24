import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { getPublicTourDetail } from "../../api/publicTourApi";
import { getCurrentUserProfile, resolveUploadedFileUrl } from "../../api/userApi";
import BookingForm from "../../components/BookingForm";
import DepartureSelector from "../../components/DepartureSelector";
import PublicLayout from "../public/PublicLayout";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const formatDate = (value) => {
  if (!value) return "Chưa có lịch";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const isBookableDeparture = (departure) =>
  departure?.status === "OPEN" &&
  Number(departure.availableSeats || 0) > 0 &&
  (!departure.bookingDeadline ||
    new Date(departure.bookingDeadline) > new Date());

export default function TourBookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requestedDepartureId = searchParams.get("departureId");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedDepartureId, setSelectedDepartureId] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadBookingPage = async () => {
      try {
        setLoading(true);
        const [detailResponse, profileResponse] = await Promise.all([
          getPublicTourDetail(id),
          getCurrentUserProfile(),
        ]);

        if (!mounted) return;

        const data = detailResponse.data;
        const requestedDeparture = (data.departures || []).find(
          (departure) =>
            Number(departure.id) === Number(requestedDepartureId) &&
            isBookableDeparture(departure),
        );
        const firstOpenDeparture = (data.departures || []).find(isBookableDeparture);

        setDetail(data);
        setUserProfile(profileResponse.data);
        setSelectedDepartureId(
          requestedDeparture?.id || firstOpenDeparture?.id || "",
        );
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải trang đặt tour",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBookingPage();

    return () => {
      mounted = false;
    };
  }, [id, requestedDepartureId]);

  const selectedDeparture = useMemo(() => {
    return (detail?.departures || []).find(
      (departure) => Number(departure.id) === Number(selectedDepartureId),
    );
  }, [detail, selectedDepartureId]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#7FB77E]" />
            <p className="text-sm font-bold text-slate-300">
              Đang tải trang đặt tour...
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!detail?.tour) {
    return (
      <PublicLayout>
        <div className="bg-[#020617] px-4 py-24 text-center text-slate-300">
          Không tìm thấy tour.
        </div>
      </PublicLayout>
    );
  }

  const { tour, images = [], departures = [] } = detail;
  const coverImage = resolveUploadedFileUrl(tour.thumbnail || images[0]?.imageUrl);
  const bookingDetailPath = bookingSuccess?.id
    ? `/tai-khoan/booking/${bookingSuccess.id}`
    : "/tai-khoan/booking";

  return (
    <PublicLayout>
      <section className="bg-[#020617] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to={`/tours/${tour.id}`} className="btn-outline text-sm">
            <ArrowLeft size={17} />
            Quay lại chi tiết tour
          </Link>

          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-[#7FB77E]/10">
            <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_360px] lg:items-center">
              <div>
                <span className="section-tag">
                  <ShieldCheck size={12} /> Đặt tour
                </span>
                <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                  {tour.title}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1">
                    <MapPin size={14} className="text-[#9de09c]" />
                    {tour.departureLocation || "Sơn La"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1">
                    <CalendarDays size={14} className="text-[#d4a878]" />
                    {formatDate(selectedDeparture?.departureDate)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1">
                    <Users size={14} className="text-[#9de09c]" />
                    {selectedDeparture?.availableSeats ?? 0} chỗ còn lại
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#020617]/50">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={tour.title}
                    className="aspect-[16/10] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center text-slate-500">
                    Chưa có ảnh tour
                  </div>
                )}
              </div>
            </div>
          </div>

          {bookingSuccess ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-[#7FB77E]/40 bg-[#7FB77E]/15 p-6 text-center shadow-soft-green">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#7FB77E] text-[#020617]">
                <CheckCircle2 size={28} />
              </span>
              <h2 className="mt-4 text-2xl font-black text-white">
                Đặt tour thành công
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Mã booking của bạn là{" "}
                <span className="font-black text-[#9de09c]">
                  {bookingSuccess.bookingCode}
                </span>
                . Vui lòng theo dõi trạng thái trong tài khoản.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-bold text-slate-400">Trạng thái</div>
                  <div className="mt-1 font-black text-white">
                    {bookingSuccess.status}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-bold text-slate-400">Thanh toán</div>
                  <div className="mt-1 font-black text-white">
                    {bookingSuccess.paymentStatus}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-bold text-slate-400">Tổng tiền</div>
                  <div className="mt-1 font-black text-[#f4c27a]">
                    {formatCurrency(bookingSuccess.totalPrice)}
                  </div>
                </div>
              </div>
              <Link to={bookingDetailPath} className="btn-primary mt-6 text-sm">
                Xem chi tiết trạng thái
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                      <CalendarDays size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-white">
                        Lịch khởi hành
                      </h2>
                      <p className="text-xs text-slate-400">
                        Chọn lịch trước khi gửi yêu cầu đặt tour.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <DepartureSelector
                      departures={departures}
                      selectedId={selectedDepartureId}
                      onSelect={setSelectedDepartureId}
                      tourPrice={tour.price}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#A67C52]/20 bg-[#A67C52]/[0.06] p-5">
                  <div className="text-xs font-black uppercase tracking-widest text-[#d4a878]">
                    Giá từ
                  </div>
                  <div className="mt-2 text-3xl font-black text-gradient-gold">
                    {formatCurrency(selectedDeparture?.adultPrice || tour.price)}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Giá cuối cùng được tính theo số lượng người lớn, trẻ em và lịch
                    khởi hành bạn chọn.
                  </p>
                </div>
              </aside>

              <BookingForm
                tour={tour}
                selectedDeparture={selectedDeparture}
                selectedDepartureId={selectedDepartureId}
                userProfile={userProfile}
                onSuccess={setBookingSuccess}
              />
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
