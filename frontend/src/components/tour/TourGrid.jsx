import TourCard from "./TourCard";
import EmptyState from "../common/EmptyState";

export default function TourGrid({ tours, layout = "grid", emptyTitle = "Không tìm thấy tour", emptyDescription }) {
    if (!tours || tours.length === 0) {
        return (
            <EmptyState
                title={emptyTitle}
                description={emptyDescription || "Hãy thử thay đổi bộ lọc hoặc xem các tour khác."}
            />
        );
    }

    if (layout === "list") {
        return (
            <div className="grid gap-5">
                {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} layout="list" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} layout="grid" />
            ))}
        </div>
    );
}
