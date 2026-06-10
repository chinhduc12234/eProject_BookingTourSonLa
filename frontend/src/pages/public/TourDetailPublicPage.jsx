import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  LogIn,
  MapPin,
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
import PublicLayout from "./PublicLayout";
import { scenicGallery, scenicImages } from "./publicContent";
import { getRole, isLoggedIn } from "../../utils/auth";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const formatDate = (value) => {
  if (!value) return "Chưa có lịch";

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
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

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);

        const response = await getPublicTourDetail(id);
        const data = response.data;

        setDetail(data);

        const firstOpenDeparture = (data.departures || []).find(
          (departure) =>
            departure.status === "OPEN" &&
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
  const coverImage =
    resolveUploadedFileUrl(tour.thumbnail || images[0]?.imageUrl) ||
    scenicImages.mocChauTea;
  const galleryImages =
    images.length > 0
      ? images.map((image) => ({
          id: image.id,
          imageUrl: resolveUploadedFileUrl(image.imageUrl),
          title: tour.title,
        }))
      : scenicGallery.map((image, index) => ({
          id: `fallback-${index}`,
          imageUrl: image.image,
          title: image.title,
        }));

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link to="/tours" className="btn-outline text-sm">
            <ArrowLeft size={17} />
            Danh sách tour
          </Link>
        </div>

        <div className="relative min-h-[560px] overflow-hidden">
          <motion.img
            key={coverImage}
            src={coverImage}
            alt={tour.title}
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
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
          <div className="space-y-8">
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
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {galleryImages.slice(0, 4).map((image, idx) => (
                    <motion.button
                      key={image.id}
                      type="button"
                      onClick={() => setLightboxImage(image.imageUrl)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={[
                        "group relative overflow-hidden rounded-2xl",
                        idx === 0 ? "sm:col-span-2 sm:row-span-2" : "",
                      ].join(" ")}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute bottom-3 left-3 rounded-lg bg-[#020617]/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        Xem ảnh lớn
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

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
          <motion.img
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            src={lightboxImage}
            alt={tour.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-6xl rounded-2xl object-contain shadow-2xl"
          />
        </motion.div>
      )}
    </PublicLayout>
  );
}
