import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Sparkles, Sun } from "lucide-react";
import TravelLayout from "../../components/layout/TravelLayout";
import Container from "../../components/common/Container";
import Breadcrumb from "../../components/common/Breadcrumb";
import TourGrid from "../../components/tour/TourGrid";
import { getDestinationById } from "../../data/destinations";
import { mockTours } from "../../data/mockTours";

export default function DestinationDetailPage() {
    const { slug } = useParams();
    const destination = getDestinationById(slug);

    if (!destination) return <Navigate to="/destinations" replace />;

    const relatedTours = mockTours.filter(
        (t) =>
            t.destinationId === destination.id ||
            t.destination.toLowerCase().includes(destination.name.toLowerCase()),
    );

    return (
        <TravelLayout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <section
                    className="relative h-[55vh] min-h-[420px] overflow-hidden"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(13,32,24,0.55), rgba(13,32,24,0.7)), url('${destination.image}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 text-white sm:px-6 lg:px-8">
                        <span className="inline-flex max-w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
                            <MapPin size={12} /> {destination.region}
                        </span>
                        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{destination.name}</h1>
                        <p className="mt-3 max-w-2xl text-lg opacity-90">{destination.tagline}</p>
                    </div>
                </section>

                <Container className="py-10">
                    <Breadcrumb
                        items={[
                            { label: "Điểm đến", to: "/destinations" },
                            { label: destination.name },
                        ]}
                    />

                    <div className="mt-6 grid gap-5 lg:grid-cols-3">
                        <article className="tv-card p-6 lg:col-span-2">
                            <h2 className="text-2xl font-black" style={{ color: "var(--tv-text)" }}>Về {destination.name}</h2>
                            <p className="mt-3 text-sm leading-7" style={{ color: "var(--tv-text-muted)" }}>
                                {destination.description}
                            </p>
                            <p className="mt-3 text-sm leading-7" style={{ color: "var(--tv-text-muted)" }}>
                                {destination.name} là một trong những điểm đến yêu thích nhất tại {destination.region}. Khí hậu mát mẻ,
                                cảnh quan thiên nhiên hùng vĩ cùng văn hoá bản địa độc đáo tạo nên trải nghiệm đáng nhớ cho mọi du khách.
                            </p>
                        </article>

                        <div className="tv-card p-6 grid gap-3">
                            <InfoTile icon={Sparkles} label="Số tour" value={`${destination.tourCount} tour`} />
                            <InfoTile icon={Sun} label="Mùa đẹp" value={destination.bestSeason} />
                            <InfoTile icon={CalendarDays} label="Khu vực" value={destination.region} />
                        </div>
                    </div>

                    <section className="mt-12">
                        <div className="mb-6">
                            <p className="tv-section-title">Tour gợi ý</p>
                            <h2 className="mt-2 text-2xl font-black md:text-3xl" style={{ color: "var(--tv-text)" }}>
                                Tour {destination.name} dành cho bạn
                            </h2>
                        </div>
                        <TourGrid
                            tours={relatedTours.length ? relatedTours : mockTours.slice(0, 3)}
                            emptyTitle="Hiện chưa có tour cho điểm đến này"
                        />
                    </section>
                </Container>
            </motion.div>
        </TravelLayout>
    );
}

function InfoTile({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border p-3" style={{ borderColor: "var(--tv-border)" }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--tv-bg-subtle)", color: "var(--tv-primary-deep)" }}>
                <Icon size={16} />
            </span>
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--tv-text-soft)" }}>{label}</div>
                <div className="mt-0.5 text-sm font-bold" style={{ color: "var(--tv-text)" }}>{value}</div>
            </div>
        </div>
    );
}
