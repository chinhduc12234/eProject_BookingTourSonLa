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
    { label: "Tour du lịch", to: "/tours" },
    { label: "Giới thiệu", to: "/gioi-thieu" },
    { label: "FAQ", to: "/faq" },
    { label: "Liên hệ", to: "/lien-he" },
];

export const scenicImages = {
    mocChauTea:
        "https://upload.wikimedia.org/wikipedia/commons/7/71/Moc-chau-tea-doi-2094890_960_720.jpg",
    mocChauTeaClose:
        "https://c.pxhere.com/photos/b2/ea/moc_chau_son_la_vietnam_plantation_tea_field_agriculture-569124.jpg!d",
    daiYemWaterfall:
        "https://upload.wikimedia.org/wikipedia/commons/e/e9/Thacdaiyem.jpg",
    sonLaLandscape:
        "https://upload.wikimedia.org/wikipedia/commons/d/d2/S%C6%A1n_La_Province.JPG",
    taXuaRidge:
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/S%E1%BB%91ng_l%C6%B0ng_kh%E1%BB%A7ng_long_T%C3%A0_X%C3%B9a.jpg?width=1600",
};

export const heroSlides = [
    {
        image: scenicImages.mocChauTea,
        alt: "Đồi chè Mộc Châu trong sương sớm",
        place: "Mộc Châu · Sơn La",
    },
    {
        image: scenicImages.taXuaRidge,
        alt: "Sống lưng khủng long Tà Xùa giữa núi rừng",
        place: "Tà Xùa · Bắc Yên",
    },
    {
        image: scenicImages.daiYemWaterfall,
        alt: "Thác Dải Yếm giữa màu xanh Mộc Châu",
        place: "Mường Sang · Mộc Châu",
    },
    {
        image: scenicImages.sonLaLandscape,
        alt: "Cảnh quan núi rừng tại huyện Mường La, Sơn La",
        place: "Mường La · Sơn La",
    },
];

export const heroBackdrops = heroSlides.map((slide) => slide.image);

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
        title: "Sống lưng Tà Xùa",
        eyebrow: "Bắc Yên",
        desc: "Cung núi nổi tiếng giữa biển mây, dành cho hành trình săn bình minh và khám phá thiên nhiên.",
        image: scenicImages.taXuaRidge,
    },
    {
        title: "Nếp sống cao nguyên",
        eyebrow: "Bản địa",
        desc: "Nhịp sống xanh giữa vườn chè, bản làng và những cung đường chậm.",
        image: scenicImages.mocChauTeaClose,
    },
    {
        title: "Triền chè Mộc Châu",
        eyebrow: "Nông nghiệp bản địa",
        desc: "Những luống chè xanh nối nhau tạo nên nhịp cảnh quan đặc trưng của cao nguyên.",
        image: scenicImages.mocChauTeaClose,
    },
    {
        title: "Núi rừng Sơn La",
        eyebrow: "Tây Bắc",
        desc: "Những lớp núi nối nhau mở ra nhịp hành trình khoáng đạt và nhiều điểm dừng giàu bản sắc.",
        image: scenicImages.sonLaLandscape,
    },
];

export const photoCredits = [
    { label: "Mộc Châu · ToanNguyen (CC0)", url: "https://commons.wikimedia.org/wiki/File:Moc-chau-tea-doi-2094890_960_720.jpg" },
    { label: "Đồi chè Mộc Châu · PxHere (CC0)", url: "https://pxhere.com/en/photo/569124" },
    { label: "Thác Dải Yếm · ePi.Longo (CC BY-SA 2.0)", url: "https://commons.wikimedia.org/wiki/File:Thacdaiyem.jpg" },
    { label: "Mường La · Tycho (CC BY-SA 3.0)", url: "https://commons.wikimedia.org/wiki/File:S%C6%A1n_La_Province.JPG" },
    { label: "Tà Xùa · NKSTTSSHNVN (CC BY-SA 4.0)", url: "https://commons.wikimedia.org/wiki/File:S%E1%BB%91ng_l%C6%B0ng_kh%E1%BB%A7ng_long_T%C3%A0_X%C3%B9a.jpg" },
];

export const heroPromises = [
    { icon: CalendarDays, title: "Lịch mở bán rõ ràng", label: "Theo dữ liệu tour hiện có" },
    { icon: ShieldCheck, title: "Đặt tour minh bạch", label: "Giá và trạng thái dễ kiểm tra" },
    { icon: CheckCircle2, title: "Theo dõi xuyên suốt", label: "Từ mã đơn đến hành trình" },
];

export const quickSearch = [
    { icon: MapPin, label: "Điểm đến", value: "Mộc Châu, Tà Xùa, Sơn La" },
    { icon: CalendarDays, label: "Khởi hành", value: "Cuối tuần và ngày lễ" },
    { icon: Users, label: "Nhóm khách", value: "Cá nhân, gia đình hoặc đoàn" },
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

export const companyPillars = [
    { value: "Thực địa", label: "Lịch trình ưu tiên tính khả thi và an toàn" },
    { value: "Minh bạch", label: "Giá, dịch vụ và điều kiện được trình bày rõ" },
    { value: "Bản địa", label: "Tôn trọng cảnh quan và văn hóa địa phương" },
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
        desc: "Trở thành nền tảng đặt tour Tây Bắc đáng tin cậy cho du khách cá nhân, nhóm và doanh nghiệp.",
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
        desc: "Kênh liên hệ theo thông tin đang công bố",
    },
    {
        icon: Mail,
        title: "Email hỗ trợ",
        value: "support@taybactravel.vn",
        desc: "Gửi nội dung để đội ngũ tiếp nhận và phản hồi",
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
        answer: "Mỗi lịch khởi hành có hạn đặt chỗ riêng. Bạn hãy kiểm tra trạng thái, số chỗ còn lại và hạn booking hiển thị trong chi tiết tour trước khi gửi đơn.",
    },
    {
        question: "Giá tour đã bao gồm những gì?",
        answer: "Phạm vi bao gồm và không bao gồm được trình bày riêng trong chi tiết từng tour. Hãy đối chiếu hai mục này trước khi chọn lịch khởi hành.",
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
    { icon: Star, label: "Thông tin tour lấy từ hệ thống" },
    { icon: Clock, label: "Lịch khởi hành theo dữ liệu mở bán" },
    { icon: ShieldCheck, label: "Quy trình đặt tour rõ ràng" },
];
