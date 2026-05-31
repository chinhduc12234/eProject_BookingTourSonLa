import {
    Award,
    CalendarDays,
    CheckCircle2,
    Clock,
    Compass,
    Headphones,
    HeartHandshake,
    Leaf,
    Mail,
    MapPin,
    Mountain,
    Phone,
    ShieldCheck,
    Sparkles,
    Star,
    Users,
} from "lucide-react";

export const brand = {
    name: "Tay Bac Travel",
    displayName: "Tây Bắc Travel",
    phone: "1900 6868",
    email: "support@taybactravel.vn",
    address: "Đường Tô Hiệu, thành phố Sơn La",
};

export const navLinks = [
    { label: "Trang chủ", to: "/" },
    { label: "Tour", to: "/tours" },
    { label: "Giới thiệu", to: "/gioi-thieu" },
    { label: "FAQ", to: "/faq" },
    { label: "Liên hệ", to: "/lien-he" },
];

export const scenicImages = {
    mocChauTea:
        "https://cdn.pixabay.com/photo/2017/02/24/13/17/tea-plantation-2094890_1280.jpg",
    mocChauTeaClose:
        "https://c.pxhere.com/photos/b2/ea/moc_chau_son_la_vietnam_plantation_tea_field_agriculture-569124.jpg!d",
    daiYemWaterfall:
        "https://upload.wikimedia.org/wikipedia/commons/e/e9/Thacdaiyem.jpg",
    sonLaLandscape:
        "https://upload.wikimedia.org/wikipedia/commons/d/d2/S%C6%A1n_La_Province.JPG",
};

export const heroBackdrops = [
    scenicImages.mocChauTea,
    scenicImages.sonLaLandscape,
    scenicImages.daiYemWaterfall,
    scenicImages.mocChauTeaClose,
];

export const scenicGallery = [
    {
        title: "Đồi chè Mộc Châu",
        eyebrow: "Cao nguyên",
        desc: "Những triền chè uốn lượn trong sương sớm, hợp với lịch trình nghỉ dưỡng và check-in nhẹ.",
        image: scenicImages.mocChauTea,
    },
    {
        title: "Thác Dải Yếm",
        eyebrow: "Mường Sang",
        desc: "Điểm dừng thiên nhiên mát lành cho các tuyến Mộc Châu cuối tuần.",
        image: scenicImages.daiYemWaterfall,
    },
    {
        title: "Cảnh quan Mường La",
        eyebrow: "Sơn La",
        desc: "Không gian núi và thung lũng mở rộng cho các hành trình khám phá dài ngày.",
        image: scenicImages.sonLaLandscape,
    },
    {
        title: "Nếp sống cao nguyên",
        eyebrow: "Bản địa",
        desc: "Nhịp sống xanh giữa vườn chè, bản làng và những cung đường chậm.",
        image: scenicImages.mocChauTeaClose,
    },
];

export const photoCredits = [
    { label: "Pixabay", url: "https://pixabay.com/photos/tea-plantation-moc-chau-son-la-2094890/" },
    { label: "PxHere", url: "https://pxhere.com/en/photo/569124" },
    { label: "Wikimedia Commons", url: "https://commons.wikimedia.org/wiki/File:Thacdaiyem.jpg" },
    { label: "Wikimedia Commons", url: "https://commons.wikimedia.org/wiki/File:S%C6%A1n_La_Province.JPG" },
];

export const heroStats = [
    { value: "120+", label: "lịch trình Tây Bắc" },
    { value: "18k+", label: "lượt khách phục vụ" },
    { value: "4.8/5", label: "đánh giá trung bình" },
];

export const quickSearch = [
    { icon: MapPin, label: "Điểm đến", value: "Mộc Châu, Tà Xùa, Sơn La" },
    { icon: CalendarDays, label: "Khởi hành", value: "Cuối tuần và ngày lễ" },
    { icon: Users, label: "Số khách", value: "2 - 20 khách" },
];

export const serviceHighlights = [
    {
        icon: Compass,
        title: "Lịch trình có chọn lọc",
        desc: "Tập trung các cung đường núi rừng, bản làng, cao nguyên chè và điểm săn mây đặc trưng Tây Bắc.",
    },
    {
        icon: ShieldCheck,
        title: "Điều hành an toàn",
        desc: "Kiểm tra thời tiết, phương tiện, lưu trú và điểm dừng chân trước mỗi chuyến đi.",
    },
    {
        icon: Headphones,
        title: "Hỗ trợ theo hành trình",
        desc: "Tư vấn trước chuyến đi, theo sát lịch trình và xử lý phát sinh trong suốt tour.",
    },
];

export const featuredTours = [
    {
        title: "Mộc Châu mùa hoa",
        place: "Sơn La",
        duration: "3 ngày 2 đêm",
        price: "2.490.000đ",
        image: scenicImages.mocChauTea,
        tags: ["Cao nguyên", "Hoa mùa", "Check-in"],
    },
    {
        title: "Tà Xùa săn mây",
        place: "Bắc Yên",
        duration: "2 ngày 1 đêm",
        price: "1.890.000đ",
        image: scenicImages.sonLaLandscape,
        tags: ["Săn mây", "Trekking", "Bình minh"],
    },
    {
        title: "Sông Đà - Ngọc Chiến",
        place: "Sơn La",
        duration: "4 ngày 3 đêm",
        price: "3.690.000đ",
        image: scenicImages.daiYemWaterfall,
        tags: ["Suối khoáng", "Bản làng", "Cảnh quan"],
    },
];

export const destinationGroups = [
    {
        title: "Núi rừng và cao nguyên",
        desc: "Mộc Châu, Tà Xùa, Pha Luông, Mường La.",
        icon: Mountain,
    },
    {
        title: "Văn hóa bản địa",
        desc: "Bản Thái, bản Mông, ẩm thực địa phương và nghề thủ công.",
        icon: Sparkles,
    },
    {
        title: "Nghỉ dưỡng thiên nhiên",
        desc: "Suối khoáng, homestay núi, hồ thủy điện và những cung đường chậm.",
        icon: Leaf,
    },
];

export const whyChooseUs = [
    "Tư vấn đúng nhu cầu: nghỉ dưỡng, khám phá, gia đình hoặc doanh nghiệp.",
    "Giá tour minh bạch, lịch trình rõ ràng, thông tin dịch vụ dễ đối chiếu.",
    "Hướng dẫn viên am hiểu địa phương và ưu tiên trải nghiệm có trách nhiệm.",
    "Thiết kế tour riêng cho nhóm bạn, công ty, lớp học và gia đình.",
];

export const companyStats = [
    { value: "9 năm", label: "vận hành tour vùng núi" },
    { value: "35+", label: "đối tác lưu trú và vận chuyển" },
    { value: "60+", label: "hướng dẫn viên, điều hành, cộng tác viên địa phương" },
];

export const companyValues = [
    {
        icon: HeartHandshake,
        title: "Sứ mệnh",
        desc: "Kết nối du khách với Tây Bắc bằng những hành trình an toàn, chân thực và tôn trọng bản sắc địa phương.",
    },
    {
        icon: Award,
        title: "Tầm nhìn",
        desc: "Trở thành nền tảng booking tour Tây Bắc đáng tin cậy cho du khách cá nhân, nhóm và doanh nghiệp.",
    },
    {
        icon: CheckCircle2,
        title: "Cam kết",
        desc: "Thông tin rõ ràng, dịch vụ đúng thỏa thuận, ưu tiên trải nghiệm bền vững và lợi ích cộng đồng.",
    },
];

export const teamGroups = [
    {
        role: "Điều hành tour",
        desc: "Lập lịch trình, điều phối xe, khách sạn, nhà hàng và phương án dự phòng.",
    },
    {
        role: "Tư vấn viên",
        desc: "Tiếp nhận nhu cầu, gợi ý điểm đến, ngân sách và thời điểm khởi hành phù hợp.",
    },
    {
        role: "Hướng dẫn viên địa phương",
        desc: "Đồng hành trên cung đường, giới thiệu văn hóa bản địa và hỗ trợ an toàn.",
    },
];

export const contactCards = [
    {
        icon: Phone,
        title: "Tổng đài tư vấn",
        value: "1900 6868",
        desc: "08:00 - 21:00 hằng ngày",
    },
    {
        icon: Mail,
        title: "Email hỗ trợ",
        value: "support@taybactravel.vn",
        desc: "Phản hồi trong 24 giờ làm việc",
    },
    {
        icon: MapPin,
        title: "Văn phòng",
        value: "Thành phố Sơn La",
        desc: "Đường Tô Hiệu, gần trung tâm hành chính",
    },
];

export const supportTopics = [
    "Tư vấn tour cá nhân và gia đình",
    "Báo giá tour doanh nghiệp",
    "Hỗ trợ đổi lịch và thông tin thanh toán",
    "Tiếp nhận phản hồi sau chuyến đi",
];

export const faqItems = [
    {
        question: "Tôi có thể đặt tour Tây Bắc trước bao lâu?",
        answer: "Nên đặt trước 7 - 14 ngày để có lựa chọn tốt về xe, phòng và hướng dẫn viên. Với đoàn lớn hoặc đi vào mùa cao điểm, nên đặt trước 3 - 4 tuần.",
    },
    {
        question: "Giá tour đã bao gồm những gì?",
        answer: "Giá niêm yết thông thường gồm xe theo lịch trình, lưu trú, bữa ăn theo chương trình, vé tham quan và hướng dẫn viên. Các chi phí cá nhân sẽ được ghi riêng trong thông tin tour.",
    },
    {
        question: "Tour có phù hợp cho gia đình có trẻ nhỏ không?",
        answer: "Có. Đội tư vấn sẽ gợi ý lịch trình nhẹ, thời gian di chuyển hợp lý, lưu trú tiện nghi và các điểm tham quan phù hợp với trẻ em.",
    },
    {
        question: "Nếu thời tiết xấu thì lịch trình xử lý thế nào?",
        answer: "Điều hành tour sẽ theo dõi thời tiết trước và trong chuyến đi. Khi cần, lịch trình sẽ được điều chỉnh sang điểm an toàn hơn nhưng vẫn giữ chất lượng trải nghiệm.",
    },
    {
        question: "Có thiết kế tour riêng cho công ty không?",
        answer: "Có. Có thể thiết kế tour team building, nghỉ dưỡng, khảo sát thị trường hoặc tri ân khách hàng theo ngân sách và mục tiêu riêng.",
    },
    {
        question: "Cần chuẩn bị gì khi đi Mộc Châu hoặc Tà Xùa?",
        answer: "Nên mang giày dễ đi bộ, áo ấm, áo mưa mỏng, giấy tờ tùy thân, thuốc cá nhân và pin dự phòng. Với lịch trình săn mây, nên chuẩn bị thêm áo khoác gió.",
    },
];

export const trustBadges = [
    { icon: Star, label: "Đánh giá thật từ khách hàng" },
    { icon: Clock, label: "Xác nhận lịch trình nhanh" },
    { icon: ShieldCheck, label: "Quy trình đặt tour rõ ràng" },
];
