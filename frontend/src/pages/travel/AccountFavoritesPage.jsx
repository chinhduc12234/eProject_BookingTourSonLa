import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import AccountLayout from "./AccountLayout";
import TourGrid from "../../components/tour/TourGrid";
import EmptyState from "../../components/common/EmptyState";
import { useFavorites } from "../../hooks/useFavorites";
import { mockTours } from "../../data/mockTours";

export default function AccountFavoritesPage() {
    const { favorites, clearFavorites } = useFavorites();
    const tours = mockTours.filter((t) => favorites.includes(t.slug));

    return (
        <AccountLayout title="Tour yêu thích" description="Các tour bạn đã đánh dấu yêu thích.">
            {tours.length === 0 ? (
                <EmptyState
                    icon={Heart}
                    title="Chưa có tour yêu thích"
                    description="Hãy nhấn vào biểu tượng trái tim trên thẻ tour để lưu lại các tour bạn quan tâm."
                    action={<Link to="/tours" className="tv-btn-primary">Khám phá tour</Link>}
                />
            ) : (
                <>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="text-sm font-bold" style={{ color: "var(--tv-text)" }}>
                            {tours.length} tour đã lưu
                        </div>
                        <button
                            onClick={() => {
                                if (window.confirm("Bạn muốn xoá tất cả tour yêu thích?")) clearFavorites();
                            }}
                            className="text-xs font-bold hover:opacity-80"
                            style={{ color: "var(--tv-danger)" }}
                        >
                            Xoá tất cả
                        </button>
                    </div>
                    <TourGrid tours={tours} />
                </>
            )}
        </AccountLayout>
    );
}
