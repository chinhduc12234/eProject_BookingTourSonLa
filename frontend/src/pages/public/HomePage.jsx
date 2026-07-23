import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Compass,
    Loader2,
    MapPin,
    Pause,
    Play,
    RefreshCcw,
    Search,
    Sparkles,
} from "lucide-react";
import { getPublicTours } from "../../api/publicTourApi";
import TourCard from "../../components/TourCard";
import PublicLayout from "./PublicLayout";
import {
    destinationGroups,
    heroSlides,
    heroPromises,
    quickSearch,
    scenicGallery,
    scenicImages,
    serviceHighlights,
    trustBadges,
    whyChooseUs,
} from "./publicContent";

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: "easeOut", delay: i * 0.08 },
    }),
};

const marqueeWords = [
    "Mộc Châu",
    "Tà Xùa",
    "Sông Đà",
    "Mường La",
    "Ngọc Chiến",
    "Pha Luông",
    "Mai Châu",
    "Sơn La",
];

export default function HomePage() {
    const [featuredTours, setFeaturedTours] = useState([]);
    const [featuredLoading, setFeaturedLoading] = useState(false);
    const [featuredError, setFeaturedError] = useState("");
    const [featuredReloadKey, setFeaturedReloadKey] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);
    const [heroManualPaused, setHeroManualPaused] = useState(false);
    const [heroHovered, setHeroHovered] = useState(false);
    const touchStartX = useRef(null);
    const reduceMotion = useReducedMotion();
    const heroPaused = heroManualPaused || heroHovered;

    useEffect(() => {
        if (reduceMotion || heroPaused) return undefined;

        const timeout = setTimeout(
            () => setHeroIndex((idx) => (idx + 1) % heroSlides.length),
            7000,
        );
        return () => clearTimeout(timeout);
    }, [heroIndex, heroPaused, reduceMotion]);

    const showPreviousHero = () => {
        setHeroIndex((current) => (current - 1 + heroSlides.length) % heroSlides.length);
    };

    const showNextHero = () => {
        setHeroIndex((current) => (current + 1) % heroSlides.length);
    };

    const handleHeroTouchEnd = (event) => {
        if (touchStartX.current === null) return;

        const distance = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) < 48) return;

        if (distance > 0) showPreviousHero();
        else showNextHero();
    };

    useEffect(() => {
        const loadFeaturedTours = async () => {
            try {
                setFeaturedLoading(true);
                setFeaturedError("");

                const response = await getPublicTours({
                    page: 0,
                    size: 3,
                    keyword: "",
                });

                setFeaturedTours(response.data.content || []);
            } catch (error) {
                setFeaturedTours([]);
                setFeaturedError(
                    error?.response?.data?.message || "Chưa tải được tour đang mở bán.",
                );
            } finally {
                setFeaturedLoading(false);
            }
        };

        loadFeaturedTours();
    }, [featuredReloadKey]);

    return (
        <PublicLayout>
            <div className="home-page">
            {/* HERO */}
            <section
                className="home-hero relative overflow-hidden"
                aria-roledescription="slideshow"
                aria-label="Cảnh đẹp Sơn La"
                onMouseEnter={() => setHeroHovered(true)}
                onMouseLeave={() => setHeroHovered(false)}
                onTouchStart={(event) => {
                    touchStartX.current = event.touches[0].clientX;
                }}
                onTouchEnd={handleHeroTouchEnd}
            >
                {heroSlides.map((slide, idx) => (
                    <motion.img
                        key={slide.image}
                        src={slide.image}
                        alt={idx === heroIndex ? slide.alt : ""}
                        aria-hidden={idx !== heroIndex}
                        loading={idx === 0 ? "eager" : "lazy"}
                        fetchPriority={idx === 0 ? "high" : "auto"}
                        decoding="async"
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = scenicImages.mocChauTea;
                        }}
                        className="home-hero-image absolute inset-0 h-full w-full object-cover object-center will-change-transform"
                        initial={{ opacity: 0, scale: 1.12 }}
                        animate={{
                            opacity: idx === heroIndex ? 1 : 0,
                            scale: idx === heroIndex ? 1.04 : 1.12,
                        }}
                        transition={{ duration: reduceMotion ? 0 : 1.6, ease: "easeOut" }}
                    />
                ))}
                <div className="hero-theme-overlay absolute inset-0" />
                <div className="hero-theme-bottom absolute inset-0" />
                <div className="absolute inset-0 bg-grid-fade opacity-60" />

                <div className="relative mx-auto grid min-h-[calc(100svh-80px)] max-w-7xl items-center gap-10 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-24">
                    <motion.div initial="hidden" animate="show" variants={fadeUp}>
                        <motion.span
                            className="section-tag"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Sparkles size={14} className="text-[#9de09c]" />
                            Đặt tour du lịch Tây Bắc
                        </motion.span>

                        <motion.h1
                            custom={1}
                            initial="hidden"
                            animate="show"
                            variants={fadeUp}
                            className="mt-6 max-w-3xl text-4xl font-black leading-[1.08] text-white sm:text-5xl lg:text-6xl"
                        >
                            Lên lịch cho hành trình{" "}
                            <span className="text-gradient-mountain animate-gradient-pan">
                                núi rừng Tây Bắc
                            </span>
                            .
                        </motion.h1>

                        <motion.p
                            custom={2}
                            initial="hidden"
                            animate="show"
                            variants={fadeUp}
                            className="mt-6 max-w-2xl text-lg leading-8 text-slate-200"
                        >
                            Khám phá Mộc Châu, Tà Xùa, Sông Đà và các bản làng Sơn La với lịch trình
                            rõ ràng, dịch vụ đồng hành và trải nghiệm địa phương được chọn lọc.
                        </motion.p>

                        <motion.div
                            custom={3}
                            initial="hidden"
                            animate="show"
                            variants={fadeUp}
                            className="mt-8 flex flex-col gap-3 sm:flex-row"
                        >
                            <Link to="/tours" className="btn-primary px-6 text-sm">
                                Khám phá tour
                                <ArrowRight size={18} />
                            </Link>
                            <Link to="/tours" className="btn-outline px-6 text-sm">
                                <CalendarDays size={18} />
                                Xem lịch khởi hành
                            </Link>
                        </motion.div>

                        <motion.div
                            custom={4}
                            initial="hidden"
                            animate="show"
                            variants={fadeUp}
                            className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3"
                        >
                            {heroPromises.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                <motion.div
                                    key={item.label}
                                    whileHover={{ y: -4 }}
                                    className={[
                                        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md",
                                        idx === 2 ? "col-span-2 sm:col-span-1" : "",
                                    ].join(" ")}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#7FB77E]/0 via-transparent to-[#A67C52]/0 opacity-0 transition-opacity duration-500 group-hover:from-[#7FB77E]/20 group-hover:to-[#A67C52]/15 group-hover:opacity-100" />
                                    <div className="relative flex items-center gap-2 text-sm font-black text-white">
                                        <Icon size={18} className="text-[#9de09c]" aria-hidden="true" />
                                        {item.title}
                                    </div>
                                    <div className="relative mt-2 text-xs font-semibold leading-5 text-[#d9c1a5]">
                                        {item.label}
                                    </div>
                                </motion.div>
                                );
                            })}
                        </motion.div>

                        {/* hero indicators */}
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                            {heroSlides.map((slide, idx) => (
                                <button
                                    key={slide.image}
                                    type="button"
                                    aria-label={`Hiển thị ảnh: ${slide.alt}`}
                                    aria-pressed={idx === heroIndex}
                                    onClick={() => setHeroIndex(idx)}
                                    className={[
                                        "relative h-1.5 overflow-hidden rounded-full transition-all",
                                        idx === heroIndex
                                            ? "w-10 bg-white/25"
                                            : "w-4 bg-white/25 hover:bg-white/40",
                                    ].join(" ")}
                                >
                                    {idx === heroIndex && (
                                        <span
                                            key={`${heroIndex}-${heroPaused}`}
                                            className="hero-progress absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#9de09c] to-[#A67C52]"
                                            data-paused={heroPaused || reduceMotion ? "true" : "false"}
                                        />
                                    )}
                                </button>
                            ))}
                            </div>
                            <div className="h-4 w-px bg-white/20" />
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-200">
                                {heroSlides[heroIndex]?.place}
                            </span>
                            <div className="ml-auto flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setHeroManualPaused((current) => !current)}
                                    aria-label={heroManualPaused ? "Tiếp tục trình chiếu" : "Tạm dừng trình chiếu"}
                                    aria-pressed={heroManualPaused}
                                    className="hero-control"
                                >
                                    {heroManualPaused ? <Play size={16} /> : <Pause size={16} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={showPreviousHero}
                                    aria-label="Ảnh Tây Bắc trước"
                                    className="hero-control"
                                >
                                    <ChevronLeft size={17} />
                                </button>
                                <button
                                    type="button"
                                    onClick={showNextHero}
                                    aria-label="Ảnh Tây Bắc tiếp theo"
                                    className="hero-control"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* HERO QUICK SEARCH */}
                    <motion.div
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.18 }}
                        className="relative"
                    >
                        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-[#7FB77E]/30 via-transparent to-[#A67C52]/30 blur-2xl" />
                        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#020617]/75 p-6 shadow-soft-dark backdrop-blur-xl">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#9de09c] to-[#4f8f4d] text-[#020617] shadow-soft-green animate-pulse-glow">
                                    <Search size={22} />
                                </span>
                                <div>
                                    <h2 className="text-xl font-black text-white">
                                        Tìm tour phù hợp
                                    </h2>
                                    <p className="text-sm text-slate-300">
                                        Chọn nhanh nhu cầu cho chuyến đi sắp tới.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {quickSearch.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: 18 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.3 + idx * 0.08 }}
                                            className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.05] p-4 transition-all hover:border-[#7FB77E]/40 hover:bg-[#7FB77E]/10"
                                        >
                                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c] transition-transform group-hover:scale-110">
                                                <Icon size={20} />
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold uppercase tracking-widest text-[#d4a878]">
                                                    {item.label}
                                                </div>
                                                <div className="mt-1 truncate text-sm font-bold text-white">
                                                    {item.value}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <Link
                                to="/tours"
                                className="btn-gold mt-5 w-full text-sm"
                            >
                                Xem lịch khởi hành
                                <CalendarDays size={16} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* DESTINATION MARQUEE */}
            <section className="home-marquee-section relative overflow-hidden border-y border-white/5 bg-[#04120d] py-6">
                <div className="home-marquee-track marquee-track gap-12 text-2xl font-black uppercase tracking-widest">
                    {[...marqueeWords, ...marqueeWords].map((word, idx) => (
                        <span key={idx} className="flex items-center gap-12 whitespace-nowrap">
                            <span className="home-marquee-word">{word}</span>
                            <Compass size={22} className="home-marquee-icon" />
                        </span>
                    ))}
                </div>
            </section>

            {/* IMMERSIVE GALLERY */}
            <section className="relative overflow-hidden bg-[#020617] py-20">
                <div className="absolute inset-0 bg-grid-fade opacity-35" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.55 }}
                        >
                            <span className="section-tag">
                                <Sparkles size={12} /> Ảnh thật Sơn La
                            </span>
                            <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
                                Cảm giác hành trình bắt đầu{" "}
                                <span className="text-gradient-gold">từ khung hình</span>
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-slate-300">
                                Bộ ảnh được chọn theo đúng tinh thần website: cao nguyên chè,
                                thác nước, núi rừng và nhịp sống địa phương.
                            </p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-80px" }}
                            variants={{
                                hidden: {},
                                show: { transition: { staggerChildren: 0.09 } },
                            }}
                            className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4"
                        >
                            {scenicGallery.map((item, idx) => (
                                <motion.article
                                    key={item.title}
                                    variants={{
                                        hidden: { opacity: 0, y: 24 },
                                        show: {
                                            opacity: 1,
                                            y: 0,
                                            transition: { duration: 0.5, ease: "easeOut" },
                                        },
                                    }}
                                    whileHover={{ y: -6 }}
                                    className={[
                                        "on-photo group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-soft-dark",
                                        idx === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : "",
                                        idx === 2 ? "lg:col-span-2" : "",
                                    ].join(" ")}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        loading={idx === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                        onError={(event) => {
                                            event.currentTarget.onerror = null;
                                            event.currentTarget.src = scenicImages.mocChauTea;
                                        }}
                                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                                    />
                                    <div className="photo-caption-scrim absolute inset-0" />
                                    <div className="absolute inset-x-0 bottom-0 p-5">
                                        <div className="photo-eyebrow text-[10px] font-black uppercase tracking-[0.2em]">
                                            {item.eyebrow}
                                        </div>
                                        <h3 className="mt-1 text-xl font-black text-white">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-200 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                                            {item.desc}
                                        </p>
                                    </div>
                                </motion.article>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FEATURED TOURS */}
            <section className="relative bg-[#020617] py-20">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7FB77E]/40 to-transparent" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="section-tag">
                                <Sparkles size={12} /> Tour nổi bật
                            </span>
                            <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
                                Gợi ý hành trình{" "}
                                <span className="text-gradient-green">Tây Bắc</span>
                            </h2>
                            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                                Dữ liệu tour đang mở bán được tải trực tiếp từ hệ thống để bạn
                                xem lịch trình và ngày khởi hành hiện có.
                            </p>
                        </motion.div>
                        <Link
                            to="/tours"
                            className="group inline-flex items-center gap-2 text-sm font-bold text-[#d4a878] transition-colors hover:text-[#f4c27a]"
                        >
                            Xem tất cả tour
                            <ArrowRight
                                size={16}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </Link>
                    </div>

                    {featuredLoading ? (
                        <div className="mt-10 flex min-h-[260px] items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-[#7FB77E]" />
                        </div>
                    ) : featuredError ? (
                        <div className="mt-10 rounded-2xl border border-rose-300/25 bg-rose-300/[0.07] py-12 text-center text-slate-200" role="alert">
                            <p className="font-bold">{featuredError}</p>
                            <button
                                type="button"
                                onClick={() => setFeaturedReloadKey((value) => value + 1)}
                                className="btn-outline mt-5 text-sm"
                            >
                                <RefreshCcw size={16} /> Thử tải lại
                            </button>
                        </div>
                    ) : featuredTours.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] py-16 text-center text-slate-300">
                            Chưa có tour đang mở bán.
                        </div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={{
                                hidden: {},
                                show: { transition: { staggerChildren: 0.12 } },
                            }}
                            className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {featuredTours.map((tour) => (
                                <motion.div
                                    key={tour.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 26 },
                                        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                                    }}
                                >
                                    <TourCard tour={tour} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* SERVICES */}
            <section className="relative overflow-hidden bg-gradient-to-b from-[#f7faf6] via-[#eef6ed] to-[#f7faf6] py-20 text-slate-900">
                <div className="absolute inset-0 bg-dots-fade opacity-50" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.55 }}
                        >
                            <span className="section-tag-light">
                                <Sparkles size={12} /> Dịch vụ
                            </span>
                            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                                Đặt tour nhanh, thông tin rõ,{" "}
                                <span className="text-gradient-green">đồng hành sát</span>.
                            </h2>
                            <ul className="mt-6 space-y-3">
                                {whyChooseUs.map((item, idx) => (
                                    <motion.li
                                        key={item}
                                        initial={{ opacity: 0, x: -12 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.45, delay: idx * 0.08 }}
                                        className="flex items-start gap-3 text-sm leading-7 text-slate-700"
                                    >
                                        <span className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7FB77E] text-white">
                                            <Check size={14} strokeWidth={3} aria-hidden="true" />
                                        </span>
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to="/tours"
                                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#020617] px-5 text-sm font-black text-white transition hover:bg-[#0b1f17]"
                                >
                                    Xem tour mở bán <ArrowRight size={16} />
                                </Link>
                                <Link
                                    to="/faq"
                                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700 transition hover:border-[#7FB77E] hover:text-[#4f8f4d]"
                                >
                                    Câu hỏi thường gặp
                                </Link>
                            </div>
                        </motion.div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {serviceHighlights.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.55, delay: idx * 0.1 }}
                                        whileHover={{ y: -6 }}
                                        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#7FB77E]/60 hover:shadow-soft-green"
                                    >
                                        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-[#7FB77E]/20 to-[#A67C52]/10 blur-xl transition-all group-hover:scale-150" />
                                        <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#edf7ec] to-[#c8e6c5] text-[#4f8f4d]">
                                            <Icon size={22} />
                                        </span>
                                        <h3 className="relative mt-6 text-lg font-black">
                                            {item.title}
                                        </h3>
                                        <p className="relative mt-3 text-sm leading-6 text-slate-600">
                                            {item.desc}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* DESTINATIONS */}
            <section className="relative overflow-hidden bg-[#020617] py-20">
                <div className="absolute inset-0 bg-grid-fade opacity-40" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className="max-w-2xl"
                    >
                        <span className="section-tag">
                            <MapPin size={12} /> Điểm đến
                        </span>
                        <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
                            Cảnh quan & văn hóa{" "}
                            <span className="text-gradient-gold">đặc trưng Tây Bắc</span>
                        </h2>
                    </motion.div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {destinationGroups.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.55, delay: idx * 0.1 }}
                                    whileHover={{ y: -8 }}
                                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-6 transition-all hover:border-[#7FB77E]/50"
                                >
                                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#7FB77E]/25 via-[#A67C52]/15 to-transparent blur-2xl transition-all duration-500 group-hover:scale-150" />
                                    <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                                        <Icon size={26} />
                                    </span>
                                    <h3 className="relative mt-6 text-xl font-black text-white">
                                        {item.title}
                                    </h3>
                                    <p className="relative mt-3 text-sm leading-6 text-slate-300">
                                        {item.desc}
                                    </p>
                                    <div className="relative mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d4a878] transition-all group-hover:translate-x-1">
                                        Khám phá <ArrowRight size={14} />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="mt-10 grid gap-3 md:grid-cols-3">
                        {trustBadges.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-sm"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#A67C52]/20 text-[#d4a878]">
                                        <Icon size={17} />
                                    </span>
                                    <span className="text-sm font-bold text-slate-200">
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative overflow-hidden bg-[#020617] py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1f17] via-[#04120d] to-[#0b1f17] p-10 sm:p-14"
                    >
                        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#7FB77E]/30 blur-[100px]" />
                        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#A67C52]/30 blur-[100px]" />
                        <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                            <div>
                                <span className="section-tag">
                                    <Sparkles size={12} /> Sẵn sàng lên đường?
                                </span>
                                <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
                                    Để Tây Bắc Travel sắp xếp hành trình{" "}
                                    <span className="text-gradient-mountain animate-gradient-pan">
                                        của bạn
                                    </span>
                                </h2>
                                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                                    Chia sẻ nhu cầu để đội tư vấn đối chiếu tour đang mở bán và
                                    trao đổi lịch trình, chi phí cùng các lưu ý liên quan.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
                                <Link to="/lien-he" className="btn-primary w-full text-sm sm:w-auto md:w-full md:justify-center">
                                    Gửi yêu cầu tư vấn
                                    <ArrowRight size={16} />
                                </Link>
                                <Link to="/tours" className="btn-outline w-full text-sm sm:w-auto md:w-full md:justify-center">
                                    Xem lịch khởi hành
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            </div>
        </PublicLayout>
    );
}
