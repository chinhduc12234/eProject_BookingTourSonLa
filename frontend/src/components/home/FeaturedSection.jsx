import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import TourGrid from "../tour/TourGrid";
import SectionTitle from "../common/SectionTitle";

export default function FeaturedSection({
    eyebrow,
    title,
    description,
    tours,
    viewAllLink,
    viewAllLabel = "Xem tất cả",
}) {
    return (
        <section className="py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionTitle
                    eyebrow={eyebrow}
                    title={title}
                    description={description}
                    action={
                        viewAllLink && (
                            <Link
                                to={viewAllLink}
                                className="inline-flex items-center gap-1 text-sm font-bold hover:opacity-80"
                                style={{ color: "var(--tv-primary-deep)" }}
                            >
                                {viewAllLabel} <ArrowRight size={14} />
                            </Link>
                        )
                    }
                />
                <div className="mt-8">
                    <TourGrid tours={tours} />
                </div>
            </div>
        </section>
    );
}
