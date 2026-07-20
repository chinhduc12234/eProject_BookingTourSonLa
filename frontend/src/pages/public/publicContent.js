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

// Ảnh thật về Sơn La / Tây Bắc, tải sẵn trong /public/images/taybac (giấy phép CC0 / Public domain / CC BY-SA).
// Chỉ dùng để trang trí website; ảnh của từng tour vẫn lấy từ dữ liệu backend.
export const scenicImages = {
    // Cao nguyên & đồi
    mocChauHills: "/images/taybac/moc-chau-hills.jpg",
    mocChauTown: "/images/taybac/moc-chau-town.jpg",
    terraces: "/images/taybac/terraces.jpg",
    muCangChai: "/images/taybac/mu-cang-chai.jpg",
    // Tà Xùa & Bắc Yên
    taXuaRidge: "/images/taybac/ta-xua-ridge.jpg",
    taXuaCloud: "/images/taybac/ta-xua-cloud.jpg",
    taXuaMountains: "/images/taybac/ta-xua-mountains.jpg",
    bacYen: "/images/taybac/bac-yen.jpg",
    // Sơn La
    sonLaLandscape: "/images/taybac/son-la-landscape.jpg",
    sonLaReservoir: "/images/taybac/son-la-reservoir.jpg",
    daiYemWaterfall: "/images/taybac/dai-yem-waterfall.jpg",
};

// Bí danh tương thích ngược cho các trang đang tham chiếu tên cũ.
scenicImages.mocChauTea = scenicImages.mocChauHills;
scenicImages.mocChauTeaClose = scenicImages.terraces;

export const heroSlides = [
    {
        image: scenicImages.mocChauHills,
        alt: "Cao nguyên Mộc Châu với những triền đồi xanh mướt",
        place: "Mộc Châu · Sơn La",
    },
    {
        image: scenicImages.taXuaCloud,
        alt: "Săn biển mây trên đỉnh Tà Xùa lúc bình minh",
        place: "Tà Xùa · Bắc Yên",
    },
    {
        image: scenicImages.taXuaRidge,
        alt: "Sống lưng khủng long Tà Xùa nổi giữa biển mây",
        place: "Tà Xùa · Bắc Yên",
    },
    {
        image: scenicImages.terraces,
        alt: "Ruộng bậc thang vàng óng mùa lúa chín ở Tây Bắc",
        place: "Ruộng bậc thang · Tây Bắc",
    },
    {
        image: scenicImages.sonLaLandscape,
        alt: "Cảnh quan núi rừng hùng vĩ tỉnh Sơn La",
        place: "Mường La · Sơn La",
    },
];

export const heroBackdrops = heroSlides.map((slide) => slide.image);

export const scenicGallery = [
    {
        title: "Cao nguyên Mộc Châu",
        eyebrow: "Cao nguyên",
        desc: "Những triền đồi xanh mướt trải dài trong sương sớm, hợp với lịch trình nghỉ dưỡng và check-in nhẹ nhàng.",
        image: scenicImages.mocChauHills,
    },
    {
        title: "Thác Dải Yếm",
        eyebrow: "Mường Sang",
        desc: "Dòng thác trắng xóa giữa màu xanh núi rừng, điểm dừng thiên nhiên mát lành cho tuyến Mộc Châu cuối tuần.",
        image: scenicImages.daiYemWaterfall,
    },
    {
        title: "Sống lưng khủng long Tà Xùa",
        eyebrow: "Bắc Yên",
        desc: "Cung sống núi nổi tiếng giữa biển mây, dành cho hành trình săn bình minh và khám phá thiên nhiên.",
        image: scenicImages.taXuaRidge,
    },
    {
        title: "Săn mây Tà Xùa",
        eyebrow: "Biển mây",
        desc: "Khoảnh khắc mây trời bồng bềnh dưới chân, trải nghiệm khó quên của những sớm mai Tây Bắc.",
        image: scenicImages.taXuaCloud,
    },
    {
        title: "Ruộng bậc thang Tây Bắc",
        eyebrow: "Mùa lúa chín",
        desc: "Những thửa ruộng bậc thang vàng óng nối nhau, tạo nên nhịp cảnh quan đặc trưng của vùng cao.",
        image: scenicImages.terraces,
    },
    {
        title: "Núi rừng Sơn La",
        eyebrow: "Tây Bắc",
        desc: "Những lớp núi nối nhau mở ra hành trình khoáng đạt và nhiều điểm dừng giàu bản sắc.",
        image: scenicImages.sonLaLandscape,
    },
];

export const photoCredits = [
    { label: "Mộc Châu · Unsplash (CC0)", url: "https://commons.wikimedia.org/wiki/File:M%E1%BB%99c_Ch%C3%A2u_District,_Vietnam_(Unsplash).jpg" },
    { label: "Thác Dải Yếm · ePi.Longo (CC BY-SA 2.0)", url: "https://commons.wikimedia.org/wiki/File:Thacdaiyem.jpg" },
    { label: "Tà Xùa · NKS (CC BY-SA 4.0)", url: "https://commons.wikimedia.org/wiki/File:S%E1%BB%91ng_l%C6%B0ng_kh%E1%BB%A7ng_long_T%C3%A0_X%C3%B9a.jpg" },
    { label: "Săn mây Tà Xùa · Unsplash (CC0)", url: "https://commons.wikimedia.org/wiki/File:Man_alone_in_T%E1%BA%A3_X%C3%B9a_03-03-2017.jpg" },
    { label: "Ruộng bậc thang Mù Cang Chải · Unsplash (CC0)", url: "https://commons.wikimedia.org/wiki/File:Terraces_in_Che_Cu_Nha_commune,_Mu_Cang_Chai_(Unsplash).jpg" },
    { label: "Sơn La · Tycho (CC BY-SA 3.0)", url: "https://commons.wikimedia.org/wiki/File:S%C6%A1n_La_Province.JPG" },
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
        image: scenicImages.taXuaMountains,
    },
    {
        title: "Văn hóa bản địa",
        desc: "Bản Thái, bản Mông, ẩm thực địa phương và nghề thủ công.",
        icon: Sparkles,
        image: scenicImages.mocChauTown,
    },
    {
        title: "Nghỉ dưỡng thiên nhiên",
        desc: "Suối khoáng, homestay núi, hồ thủy điện và những cung đường chậm.",
        icon: Leaf,
        image: scenicImages.sonLaReservoir,
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
