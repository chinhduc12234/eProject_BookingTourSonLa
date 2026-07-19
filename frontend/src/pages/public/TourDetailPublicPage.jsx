import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeInfo,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  ListChecks,
  Loader2,
  LogIn,
  Maximize2,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Tag,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { getPublicTourDetail } from "../../api/publicTourApi";
import { resolveUploadedFileUrl } from "../../api/userApi";
import DepartureSelector from "../../components/DepartureSelector";
import TourImage from "../../components/TourImage";
import PublicLayout from "./PublicLayout";
import { getRole, isLoggedIn } from "../../utils/auth";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const formatDate = (value) => {
  if (!value) return "Chưa có lịch";

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
};

const formatDateTime = (value) => {
  if (!value) return "Không giới hạn";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatTime = (value) => {
  if (!value) return "Đang cập nhật";
  return String(value).slice(0, 5);
};

const departureStatusText = {
  OPEN: "Đang nhận khách",
  FULL: "Hết chỗ",
  CLOSED: "Đã đóng",
};

const getDepartureType = (departure) => {
  const isPrivateDeparture = Boolean(
    departure?.isPrivateDeparture ?? departure?.privateDeparture
  );

  return isPrivateDeparture
    ? {
        label: "Tour riêng",
        badgeClass: "border-[#d4a878]/60 bg-[#d4a878]/20 text-[#ffe0ad]",
        dotClass: "bg-[#d4a878]",
      }
    : {
        label: "Tour ghép",
        badgeClass: "border-[#7FB77E]/60 bg-[#7FB77E]/[0.18] text-[#c9ffc8]",
        dotClass: "bg-[#9de09c]",
      };
};

const normalizeServiceItems = (value) => {
  const text = String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>\s*<li[^>]*>/gi, "\n")
    .replace(/<\/?(ul|ol|li)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .trim();

  if (!text) return [];

  return text
    .split(/\r?\n+/)
    .map((item) => item.replace(/^[\s\-•*]+/, "").trim())
    .filter(Boolean);
};

function DetailInfoTile({ Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020617]/35 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
        <Icon size={18} />
      </span>
      <div className="mt-3 text-[11px] font-black uppercase tracking-widest text-[#d4a878]">
        {label}
      </div>
      <div className="mt-1 text-base font-black leading-6 text-white">
        {value}
      </div>
      {hint && <div className="mt-2 text-xs leading-5 text-slate-400">{hint}</div>}
    </div>
  );
}

function ServiceContent({ value, emptyText }) {
  const items = normalizeServiceItems(value);

  if (items.length === 0) {
    return <div className="mt-4 text-sm leading-7 text-slate-300">{emptyText}</div>;
  }

  return (
    <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TourDetailPublicPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartureId, setSelectedDepartureId] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);

        const response = await getPublicTourDetail(id);
        const data = response.data;

        setDetail(data);

        const firstOpenDeparture = (data.departures || []).find(
          (departure) =>
            departure.status !== "CLOSED" &&
            Number(departure.availableSeats || 0) > 0 &&
            (!departure.bookingDeadline ||
              new Date(departure.bookingDeadline) > new Date()),
        );

        if (firstOpenDeparture) {
          setSelectedDepartureId(firstOpenDeparture.id);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải chi tiết tour",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  const authenticated = isLoggedIn();
  const role = getRole();

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#7FB77E]/30" />
              <Loader2 className="relative h-14 w-14 animate-spin text-[#7FB77E]" />
            </div>
            <p className="text-sm font-bold text-slate-300">Đang tải tour...</p>
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

  const { tour, images = [], days = [], departures = [] } = detail;
  const coverImage = resolveUploadedFileUrl(tour.thumbnail || images[0]?.imageUrl);
  const galleryImages = images
    .map((image) => ({
      id: image.id,
      imageUrl: resolveUploadedFileUrl(image.imageUrl),
      title: tour.title,
    }))
    .filter((image) => image.imageUrl);
  const normalizedGalleryIndex =
    galleryImages.length > 0 ? activeGalleryIndex % galleryImages.length : 0;
  const activeGalleryImage = galleryImages[normalizedGalleryIndex];

  return (
    <PublicLayout>
      <div className="tour-detail-page">
      {/* HERO */}
      <section className="relative bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link to="/tours" className="btn-outline text-sm">
            <ArrowLeft size={17} />
            Danh sách tour
          </Link>
        </div>

        <div className="relative min-h-[560px] overflow-hidden">
          <motion.div
            key={coverImage}
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <TourImage
              src={coverImage}
              alt={tour.title}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover"
              placeholderClassName="h-full bg-[#0b1f17]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/90 via-[#020617]/60 to-[#020617]/30" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#020617] to-transparent" />
          <div className="absolute -top-10 right-1/3 h-72 w-72 rounded-full bg-[#7FB77E]/20 blur-[120px]" />
          <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[#A67C52]/20 blur-[120px]" />

          <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-end px-4 pb-14 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9de09c] to-[#4f8f4d] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#020617]">
                  <Sparkles size={12} />
                  {tour.status === "OPEN" ? "Đang mở bán" : tour.status}
                </span>
                {tour.tourCode && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
                    <Tag size={12} className="text-[#d4a878]" />
                    {tour.tourCode}
                  </span>
                )}
              </div>

              <h1 className="mt-6 text-4xl font-black leading-tight text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
                {tour.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
                {tour.shortDescription ||
                  tour.description ||
                  "Thông tin tour đang được cập nhật."}
              </p>

              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
                }}
                className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
              >
                {[
                  {
                    Icon: Clock3,
                    label: "Thời lượng",
                    value: `${tour.durationDays} ngày ${tour.durationNights} đêm`,
                  },
                  {
                    Icon: MapPin,
                    label: "Khởi hành",
                    value: tour.departureLocation || "Sơn La",
                  },
                  {
                    Icon: CalendarDays,
                    label: "Lịch gần nhất",
                    value: formatDate(departures[0]?.departureDate),
                  },
                  {
                    Icon: Users,
                    label: "Giá từ",
                    value: formatCurrency(tour.price),
                    accent: true,
                  },
                ].map(({ Icon, label, value, accent }) => (
                  <motion.div
                    key={label}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                    }}
                    className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#7FB77E]/40 hover:bg-[#7FB77E]/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7FB77E]/15 text-[#9de09c]">
                      <Icon size={18} />
                    </span>
                    <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#d4a878]">
                      {label}
                    </div>
                    <div
                      className={[
                        "mt-1 text-base font-black sm:text-lg",
                        accent ? "text-gradient-gold" : "text-white",
                      ].join(" ")}
                    >
                      {value}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="bg-[#020617] py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div className="min-w-0 space-y-8">
            {/* GALLERY */}
            {galleryImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white">
                    Hình ảnh hành trình
                  </h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#d4a878]">
                    {galleryImages.length} ảnh
                  </span>
                </div>
                <div className="tour-gallery mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-3 shadow-soft-dark sm:p-4">
                  <div className="group relative overflow-hidden rounded-2xl bg-[#07120f]">
                    <motion.div
                      key={activeGalleryImage?.imageUrl}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.45 }}
                      className="aspect-[16/10] w-full sm:aspect-[16/9]"
                    >
                      <TourImage
                        src={activeGalleryImage?.imageUrl}
                        alt={activeGalleryImage?.title || tour.title}
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/75 via-transparent to-[#020617]/10" />

                    <button
                      type="button"
                      onClick={() => setLightboxImage(activeGalleryImage?.imageUrl)}
                      className="absolute bottom-4 left-4 inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-[#020617]/75 px-4 text-sm font-black text-white backdrop-blur-md transition hover:border-[#7FB77E]/60 hover:bg-[#07120f]"
                    >
                      <Maximize2 size={16} />
                      Xem ảnh lớn
                    </button>

                    {galleryImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveGalleryIndex(
                              (current) =>
                                (current - 1 + galleryImages.length) % galleryImages.length,
                            )
                          }
                          aria-label="Ảnh trước"
                          className="gallery-arrow left-3"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveGalleryIndex(
                              (current) => (current + 1) % galleryImages.length,
                            )
                          }
                          aria-label="Ảnh tiếp theo"
                          className="gallery-arrow right-3"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    <span className="absolute bottom-4 right-4 rounded-xl border border-white/15 bg-[#020617]/75 px-3 py-2 text-xs font-black text-white backdrop-blur-md">
                      {normalizedGalleryIndex + 1} / {galleryImages.length}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                    {galleryImages.map((image, idx) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setActiveGalleryIndex(idx)}
                        aria-label={`Xem ảnh ${idx + 1}: ${image.title}`}
                        aria-pressed={idx === normalizedGalleryIndex}
                        className={[
                          "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-36",
                          idx === normalizedGalleryIndex
                            ? "border-[#9de09c] shadow-soft-green"
                            : "border-transparent opacity-65 hover:opacity-100",
                        ].join(" ")}
                      >
                        <TourImage
                          src={image.imageUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="section-tag">
                    <BadgeInfo size={12} /> Tổng quan chi tiết
                  </span>
                  <h2 className="mt-3 text-2xl font-black text-white">
                    Thông tin cần biết trước khi đặt
                  </h2>
                </div>
                {tour.tourCode && (
                  <span className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-[#f4c27a]">
                    Mã tour: {tour.tourCode}
                  </span>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <DetailInfoTile
                  Icon={Clock3}
                  label="Thời lượng"
                  value={`${tour.durationDays || 0} ngày ${tour.durationNights || 0} đêm`}
                  hint="Lịch trình đã được chia theo từng ngày bên dưới."
                />
                <DetailInfoTile
                  Icon={MapPin}
                  label="Điểm xuất phát"
                  value={tour.departureLocation || "Sơn La"}
                  hint="Điểm đón cụ thể có thể nhập khi đặt tour."
                />
                <DetailInfoTile
                  Icon={Users}
                  label="Sức chứa tối đa"
                  value={`${tour.maxPeople || 0} khách`}
                  hint={`${departures.length} lịch khởi hành đang hiển thị.`}
                />
                <DetailInfoTile
                  Icon={CreditCard}
                  label="Giá tham khảo"
                  value={formatCurrency(tour.price)}
                  hint="Giá thực tế ưu tiên theo lịch khởi hành."
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="section-tag">
                    <CalendarDays size={12} /> Bảng lịch khởi hành
                  </span>
                  <h2 className="mt-3 text-2xl font-black text-white">
                    Ngày đi, giá và số chỗ còn lại
                  </h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#d4a878]">
                  {departures.length} lịch
                </span>
              </div>

              {departures.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-400">
                  Tour này chưa có lịch khởi hành khả dụng.
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  {departures.map((departure) => {
                    const isSelected =
                      Number(departure.id) === Number(selectedDepartureId);
                    const isOpen =
                      departure.status !== "CLOSED" &&
                      Number(departure.availableSeats || 0) > 0;
                    const departureType = getDepartureType(departure);

                    return (
                      <button
                        key={departure.id}
                        type="button"
                        onClick={() => isOpen && setSelectedDepartureId(departure.id)}
                        className={[
                          "grid gap-4 rounded-2xl border p-4 text-left transition md:grid-cols-[1fr_1fr_1fr_auto] md:items-center",
                          isSelected
                            ? "border-[#7FB77E] bg-[#7FB77E]/14 shadow-soft-green"
                            : "border-white/10 bg-[#020617]/35 hover:border-[#7FB77E]/40",
                          !isOpen ? "cursor-not-allowed opacity-65" : "",
                        ].join(" ")}
                      >
                        <div>
                          <div className="text-xs font-black uppercase tracking-widest text-[#d4a878]">
                            Ngày khởi hành
                          </div>
                          <div className="mt-1 text-base font-black text-white">
                            {formatDate(departure.departureDate)} · {formatTime(departure.departureTime)}
                          </div>
                          <span
                            className={[
                              "mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider",
                              departureType.badgeClass,
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "h-1.5 w-1.5 rounded-full",
                                departureType.dotClass,
                              ].join(" ")}
                            />
                            {departureType.label}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                            Giá người lớn / trẻ em
                          </div>
                          <div className="mt-1 text-sm font-black text-slate-200">
                            {formatCurrency(departure.adultPrice || tour.price)}
                            <span className="text-slate-500"> / </span>
                            {formatCurrency(departure.childPrice || departure.adultPrice || tour.price)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                            Hạn đặt
                          </div>
                          <div className="mt-1 text-sm font-bold text-slate-200">
                            {formatDateTime(departure.bookingDeadline)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-black",
                              isOpen
                                ? "bg-[#7FB77E]/15 text-[#9de09c]"
                                : "bg-rose-300/10 text-rose-100",
                            ].join(" ")}
                          >
                            {departureStatusText[departure.status] || departure.status}
                          </span>
                          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-black text-white">
                            {Number(departure.availableSeats || 0)} chỗ
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* INFO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6"
            >
              <h2 className="text-2xl font-black text-white">
                Thông tin tour
              </h2>
              <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">
                {tour.description || "Mô tả chi tiết đang được cập nhật."}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#7FB77E]/20 bg-[#7FB77E]/[0.06] p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7FB77E]/20 text-[#9de09c]">
                      <CheckCircle2 size={18} />
                    </span>
                    <span className="font-black text-white">
                      Dịch vụ bao gồm
                    </span>
                  </div>
                  <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">
                    <ServiceContent
                      value={tour.includedServices}
                      emptyText="Chưa có thông tin dịch vụ bao gồm."
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#A67C52]/20 bg-[#A67C52]/[0.06] p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A67C52]/20 text-[#d4a878]">
                      <ShieldCheck size={18} />
                    </span>
                    <span className="font-black text-white">
                      Chưa bao gồm
                    </span>
                  </div>
                  <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">
                    <ServiceContent
                      value={tour.excludedServices}
                      emptyText="Chưa có thông tin dịch vụ không bao gồm."
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="grid gap-4 md:grid-cols-2"
            >
              <div className="rounded-2xl border border-[#7FB77E]/20 bg-[#7FB77E]/[0.06] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/18 text-[#9de09c]">
                    <ListChecks size={19} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Quy trình đặt tour
                    </h2>
                    <p className="text-sm text-slate-400">
                      Các bước được trình bày rõ ràng trong suốt quá trình đặt tour.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 text-sm leading-7 text-slate-300">
                  {[
                    "Chọn lịch khởi hành còn chỗ và nhập thông tin liên hệ.",
                    "Kiểm tra danh sách hành khách, điểm đón và yêu cầu đặc biệt.",
                    "Chọn thanh toán cọc 30% hoặc thanh toán toàn bộ.",
                    "Nhận mã đơn và theo dõi trong lịch sử tài khoản.",
                  ].map((item, index) => (
                    <div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-[#020617]/30 p-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#9de09c] text-xs font-black text-[#020617]">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#A67C52]/20 bg-[#A67C52]/[0.06] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A67C52]/18 text-[#f3d7b0]">
                    <Route size={19} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Lưu ý vận hành
                    </h2>
                    <p className="text-sm text-slate-400">
                      Thông tin áp dụng khi điều hành và xác nhận tour.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 text-sm leading-7 text-slate-300">
                  {[
                    "Giá có thể khác theo từng lịch khởi hành và số lượng khách.",
                    "Thông tin hành khách nên nhập đầy đủ để điều hành liên hệ khi cần.",
                    "Nếu đi theo đoàn hoặc tour riêng, cần nhập tên đoàn/tổ chức.",
                    "Các yêu cầu ăn uống, sức khỏe, phòng riêng nên ghi ở phần yêu cầu đặc biệt.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-[#020617]/30 p-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#f3d7b0]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* TIMELINE */}
            <div>
              <h2 className="text-2xl font-black text-white">Lịch trình</h2>

              {days.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-slate-300">
                  Lịch trình đang được cập nhật.
                </div>
              ) : (
                <div className="mt-6 relative space-y-4">
                  <div className="absolute left-5 top-2 bottom-2 hidden w-px bg-gradient-to-b from-[#7FB77E]/60 via-[#7FB77E]/30 to-transparent sm:block" />
                  {days.map((day, idx) => (
                    <motion.div
                      key={day.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 sm:pl-16"
                    >
                      <span className="absolute left-2 top-6 hidden h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#9de09c] to-[#4f8f4d] text-xs font-black text-[#020617] shadow-soft-green sm:flex">
                        {day.dayNumber}
                      </span>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-black text-white sm:text-xl">
                          <span className="text-[#9de09c]">Ngày {day.dayNumber}:</span>{" "}
                          {day.title}
                        </h3>
                      </div>
                      {day.description && (
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {day.description}
                        </p>
                      )}

                      {day.activities?.length > 0 && (
                        <div className="mt-5 grid gap-3">
                          {day.activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="group rounded-xl border border-white/10 bg-[#020617]/50 p-4 transition hover:border-[#7FB77E]/30 hover:bg-[#020617]/70"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h4 className="font-black text-white">
                                    {activity.title}
                                  </h4>
                                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
                                    {activity.startTime && (
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7FB77E]/15 px-3 py-1 text-[#9de09c]">
                                        <Clock3 size={12} />
                                        {activity.startTime.slice(0, 5)}
                                      </span>
                                    )}
                                    {activity.locationName && (
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                                        <MapPin size={12} />
                                        {activity.locationName}
                                      </span>
                                    )}
                                    {activity.districtName && (
                                      <span className="rounded-full bg-white/10 px-3 py-1">
                                        {activity.districtName}
                                      </span>
                                    )}
                                    {activity.provinceName && (
                                      <span className="rounded-full bg-white/10 px-3 py-1">
                                        {activity.provinceName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {activity.description && (
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                  <CalendarDays size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-black text-white">
                    Lịch khởi hành
                  </h2>
                  <p className="text-xs text-slate-400">
                    Chọn ngày phù hợp với kế hoạch của bạn
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
            </motion.div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-black text-white">
                    Đặt tour dành cho khách hàng
                  </h2>
                  <p className="text-xs text-slate-400">
                    Khách vãng lai có thể xem và tìm kiếm tour. Đăng nhập để đặt tour.
                  </p>
                </div>
              </div>

              {authenticated && role === "CUSTOMER" ? (
                <>
                  <p className="mt-5 text-sm leading-7 text-slate-300">
                    Lịch đã chọn sẽ được chuyển sang trang đặt tour riêng để bạn
                    kiểm tra thông tin gọn hơn trước khi gửi yêu cầu.
                  </p>
                  <Link
                    to={`/booking/${tour.id}${
                      selectedDepartureId ? `?departureId=${selectedDepartureId}` : ""
                    }`}
                    className="btn-primary mt-5 w-full text-sm"
                  >
                    <CheckCircle2 size={17} />
                    Tiếp tục đặt tour
                  </Link>
                </>
              ) : authenticated ? (
                <div className="mt-5 rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                  Tài khoản hiện tại không phải tài khoản khách hàng. Vui lòng
                  dùng tài khoản khách hàng để đặt tour.
                </div>
              ) : (
                <>
                  <p className="mt-5 text-sm leading-7 text-slate-300">
                    Bạn cần đăng nhập hoặc đăng ký tài khoản khách hàng trước khi
                    đặt tour. Sau khi đăng nhập, hệ thống sẽ đưa bạn tới trang
                    đặt tour riêng.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Link
                      to={`/booking/${tour.id}${
                        selectedDepartureId
                          ? `?departureId=${selectedDepartureId}`
                          : ""
                      }`}
                      className="btn-primary text-sm"
                    >
                      <LogIn size={17} />
                      Đăng nhập để đặt
                    </Link>
                    <Link to="/register" className="btn-outline text-sm">
                      <UserPlus size={17} />
                      Đăng ký
                    </Link>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 backdrop-blur-md p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Đóng"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:border-[#7FB77E] hover:bg-[#7FB77E]/15"
          >
            <X size={20} />
          </button>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            onClick={(e) => e.stopPropagation()}
            className="h-[min(85vh,780px)] w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl"
          >
            <TourImage
              src={lightboxImage}
              alt={tour.title}
              loading="eager"
              className="h-full w-full object-contain"
              placeholderClassName="bg-[#0b1f17]"
            />
          </motion.div>
        </motion.div>
      )}
      </div>
    </PublicLayout>
  );
}
