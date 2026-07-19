import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { getPublicTourDetail } from "../../api/publicTourApi";
import { getCurrentUserProfile, resolveUploadedFileUrl } from "../../api/userApi";
import BookingForm from "../../components/BookingForm";
import BookingStepBar from "../../components/BookingStepBar";
import DepartureSelector from "../../components/DepartureSelector";
import TourImage from "../../components/TourImage";
import { getBookingDraft, saveBookingDraft } from "../../utils/bookingDraft";
import PublicLayout from "../public/PublicLayout";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const formatDate = (value) => {
  if (!value) return "Chưa có lịch";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const isBookableDeparture = (departure) =>
  departure?.status !== "CLOSED" &&
  Number(departure.availableSeats || 0) > 0 &&
  (!departure.bookingDeadline ||
    new Date(departure.bookingDeadline) > new Date());

export default function TourBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedDepartureId = searchParams.get("departureId");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedDepartureId, setSelectedDepartureId] = useState("");

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
  const storedDraft = getBookingDraft();
  const hasPaymentDraft = Number(storedDraft?.tour?.id) === Number(tour.id);
  const bookingFlowSteps = [
    {
      key: "detail",
      label: "Chi tiết tour",
      description: "Xem thông tin, lịch trình và dịch vụ",
      href: `/tours/${tour.id}`,
    },
    {
      key: "booking",
      label: "Thông tin đặt tour",
      description: "Chọn lịch, số khách và thông tin liên hệ",
      href: `/booking/${tour.id}`,
    },
    {
      key: "payment",
      label: "Thanh toán",
      description: "Chọn cọc hoặc thanh toán toàn bộ",
      href: `/booking/${tour.id}/payment`,
      disabled: !hasPaymentDraft,
    },
    {
      key: "done",
      label: "Chờ xác nhận",
      description: "Đơn và giao dịch chờ bộ phận vận hành kiểm tra",
      disabled: true,
    },
  ];

  return (
    <PublicLayout>
      <section className="booking-flow booking-page bg-[#020617] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to={`/tours/${tour.id}`} className="btn-outline text-sm">
            <ArrowLeft size={17} />
            Quay lại chi tiết tour
          </Link>

          <div className="mt-5">
            <BookingStepBar steps={bookingFlowSteps} current={1} />
          </div>

          <div className="booking-dark-panel mt-6 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-[#7FB77E]/10">
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
                <div className="aspect-[16/10] w-full">
                  <TourImage
                    src={coverImage}
                    alt={tour.title}
                    loading="eager"
                    className="h-full w-full object-cover"
                    placeholderClassName="bg-[#0b1f17]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                <div className="booking-dark-panel rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5">
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
                      tourId={id}
                    />
                  </div>
                </div>

                <div className="booking-dark-panel rounded-2xl border border-[#A67C52]/20 bg-[#A67C52]/[0.06] p-5">
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
              key={`${userProfile?.id || userProfile?.email || "customer"}-${tour.id}`}
              tour={tour}
              tourId={id}
              selectedDeparture={selectedDeparture}
              selectedDepartureId={selectedDepartureId}
              userProfile={userProfile}
              onDraftReady={(draft) => {
                saveBookingDraft(draft);
                navigate(`/booking/${tour.id}/payment`);
              }}
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
