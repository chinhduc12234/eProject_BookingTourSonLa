import { motion } from "framer-motion";
import TravelLayout from "../../components/layout/TravelLayout";
import HeroSection from "../../components/home/HeroSection";
import CategoriesGrid from "../../components/home/CategoriesGrid";
import FeaturedSection from "../../components/home/FeaturedSection";
import DestinationsHighlight from "../../components/home/DestinationsHighlight";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import Testimonials from "../../components/home/Testimonials";
import BlogSection from "../../components/home/BlogSection";
import CtaBanner from "../../components/home/CtaBanner";
import { mockTours } from "../../data/mockTours";

export default function HomeTravelPage() {
    const featured = mockTours.filter((t) => t.isHot).slice(0, 6);
    const promotion = mockTours.filter((t) => t.isPromotion).slice(0, 3);
    const lastMinute = mockTours.filter((t) => t.isLastMinute).slice(0, 3);

    return (
        <TravelLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
            >
                <HeroSection />
                <CategoriesGrid />
                <FeaturedSection
                    eyebrow="Tour nổi bật"
                    title="Hành trình được yêu thích nhất"
                    description="Những tour có lượt đặt cao nhất, đánh giá tốt nhất từ khách hàng Tây Bắc Travel."
                    tours={featured}
                    viewAllLink="/tours"
                />
                <FeaturedSection
                    eyebrow="Khuyến mãi đặc biệt"
                    title="Ưu đãi giảm tới 30%"
                    description="Tiết kiệm chi phí mà vẫn có chuyến đi trọn vẹn. Số lượng có hạn."
                    tours={promotion}
                    viewAllLink="/promotions"
                    viewAllLabel="Xem tất cả ưu đãi"
                />
                <DestinationsHighlight />
                <FeaturedSection
                    eyebrow="Tour giờ chót"
                    title="Săn deal khởi hành tuần này"
                    description="Những tour còn chỗ và sắp khởi hành. Đặt ngay để có giá tốt nhất."
                    tours={lastMinute}
                    viewAllLink="/last-minute"
                />
                <WhyChooseUs />
                <Testimonials />
                <BlogSection />
                <CtaBanner />
            </motion.div>
        </TravelLayout>
    );
}
