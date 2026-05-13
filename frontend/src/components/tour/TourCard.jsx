import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BadgePercent,
    CalendarDays,
    Clock,
    Flame,
    Heart,
    MapPin,
    Plane,
    Star,
    Timer,
    Train,
    Users,
} from "lucide-react";
import { useFavorites } from "../../hooks/useFavorites";
import { formatCurrency, formatDateShort } from "../../utils/formatters";

const TRANSPORT_ICONS = {
    "Máy bay": Plane,
    "Tàu hỏa": Train,
};

function getTransportIcon(name) {
    return TRANSPORT_ICONS[name] || null;
}

export default function TourCard({ tour, layout = "grid" }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const fav = isFavorite(tour.slug);
    const TransportIcon = getTransportIcon(tour.transport);
    const firstDep = tour.nextDepartures?.[0];

    if (layout === "list") {
        return (
            <motion.article
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45 }}
                className="tv-card tv-card-hover overflow-hidden grid md:grid-cols-[260px_1fr]"
            >
                <Link to={`/tours/${tour.slug}`} className="relative h-56 md:h-full overflow-hidden tv-image-hover">
                    <img src={tour.images[0]} alt={tour.title} className="h-full w-full object-cover" loading="lazy" />
                    <Badges tour={tour} />
                </Link>
                <div className="flex flex-col p-5">
                    <Meta tour={tour} TransportIcon={TransportIcon} />
                    <Link to={`/tours/${tour.slug}`} className="mt-3 text-xl font-black leading-snug hover:opacity-80" style={{ color: "var(--tv-text)" }}>
                        {tour.title}
                    </Link>
                    <p className="mt-2 line-clamp-2 text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                        {tour.overview}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold sm:grid-cols-4" style={{ color: "var(--tv-text-muted)" }}>
                        <Pill icon={Clock} label={tour.duration} />
                        <Pill icon={MapPin} label={tour.departure} />
                        <Pill icon={Users} label={`Còn ${tour.seatsLeft} chỗ`} />
                        <Pill icon={CalendarDays} label={firstDep ? formatDateShort(firstDep.date) : "—"} />
                    </div>
                    <Footer tour={tour} fav={fav} onToggleFav={() => toggleFavorite(tour.slug)} />
                </div>
            </motion.article>
        );
    }

    return (
        <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45 }}
            className="tv-card tv-card-hover overflow-hidden flex flex-col"
        >
            <Link to={`/tours/${tour.slug}`} className="relative h-56 overflow-hidden tv-image-hover">
                <img src={tour.images[0]} alt={tour.title} className="h-full w-full object-cover" loading="lazy" />
                <Badges tour={tour} />

                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(tour.slug);
                    }}
                    aria-label="Yêu thích tour"
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-transform hover:scale-110"
                    style={{
                        background: fav ? "var(--tv-danger)" : "rgba(255,255,255,0.9)",
                        color: fav ? "#fff" : "#dc2626",
                    }}
                >
                    <Heart size={16} fill={fav ? "#fff" : "transparent"} />
                </button>

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/65 to-transparent px-4 pb-3 pt-8 text-white">
                    <span className="inline-flex items-center gap-1 text-xs font-bold">
                        <MapPin size={12} /> {tour.destination}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold">
                        <Star size={12} fill="#facc15" stroke="#facc15" /> {tour.rating} ({tour.reviewCount})
                    </span>
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between text-xs font-bold" style={{ color: "var(--tv-text-muted)" }}>
                    <span className="inline-flex items-center gap-1">
                        <Clock size={13} /> {tour.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        {TransportIcon ? <TransportIcon size={13} /> : null}
                        {tour.transport}
                    </span>
                </div>

                <Link to={`/tours/${tour.slug}`} className="mt-3 line-clamp-2 text-lg font-black leading-snug hover:opacity-80" style={{ color: "var(--tv-text)" }}>
                    {tour.title}
                </Link>

                <div className="mt-3 flex flex-wrap gap-1">
                    {tour.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-text-muted)" }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {firstDep && (
                    <div
                        className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold"
                        style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-text-muted)" }}
                    >
                        <CalendarDays size={14} style={{ color: "var(--tv-primary)" }} />
                        Khởi hành {formatDateShort(firstDep.date)} · còn {tour.seatsLeft} chỗ
                    </div>
                )}

                <Footer tour={tour} compact />
            </div>
        </motion.article>
    );
}

function Pill({ icon: Icon, label }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <Icon size={13} style={{ color: "var(--tv-primary)" }} />
            {label}
        </span>
    );
}

function Badges({ tour }) {
    return (
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {tour.isHot && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    <Flame size={11} /> Hot
                </span>
            )}
            {tour.isPromotion && tour.discount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    <BadgePercent size={11} /> -{tour.discount}%
                </span>
            )}
            {tour.isLastMinute && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    <Timer size={11} /> Giờ chót
                </span>
            )}
        </div>
    );
}

function Meta({ tour, TransportIcon }) {
    return (
        <div className="flex items-center justify-between text-xs font-bold" style={{ color: "var(--tv-text-muted)" }}>
            <span className="inline-flex items-center gap-1">
                <Clock size={13} /> {tour.duration}
            </span>
            <span className="inline-flex items-center gap-1">
                {TransportIcon ? <TransportIcon size={13} /> : null}
                {tour.transport}
            </span>
            <span className="inline-flex items-center gap-1">
                <Star size={13} fill="#facc15" stroke="#facc15" /> {tour.rating}
            </span>
        </div>
    );
}

function Footer({ tour, fav, onToggleFav, compact = false }) {
    return (
        <div
            className={`mt-4 flex items-center justify-between gap-2 ${compact ? "border-t pt-4" : ""}`}
            style={{ borderColor: "var(--tv-border)" }}
        >
            <div>
                {tour.oldPrice && (
                    <span className="block text-xs line-through" style={{ color: "var(--tv-text-soft)" }}>
                        {formatCurrency(tour.oldPrice)}
                    </span>
                )}
                <span className="block text-xl font-black" style={{ color: "var(--tv-primary-deep)" }}>
                    {formatCurrency(tour.price)}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {onToggleFav && (
                    <button
                        type="button"
                        onClick={onToggleFav}
                        className="flex h-9 w-9 items-center justify-center rounded-full border"
                        style={{
                            borderColor: "var(--tv-border-strong)",
                            background: fav ? "var(--tv-danger)" : "transparent",
                            color: fav ? "#fff" : "var(--tv-danger)",
                        }}
                    >
                        <Heart size={14} fill={fav ? "#fff" : "transparent"} />
                    </button>
                )}
                <Link
                    to={`/tours/${tour.slug}`}
                    className="rounded-full px-4 py-2 text-xs font-black"
                    style={{
                        background: "var(--tv-gradient-primary)",
                        color: "#06281c",
                    }}
                >
                    Xem chi tiết
                </Link>
            </div>
        </div>
    );
}
