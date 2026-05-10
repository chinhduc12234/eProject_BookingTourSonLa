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
    address: "13 Trịnh Văn Bô, Hà Nội",
};

export const navLinks = [
    { label: "Trang chủ", to: "/" },
    { label: "Tour Tây Bắc", to: "/tour" },
    { label: "Giới thiệu", to: "/gioi-thieu" },
    { label: "FAQ", to: "/faq" },
    { label: "Liên hệ", to: "/lien-he" },
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
        desc: "Hỗ trợ trước chuyến đi, theo sát lịch trình và xử lý phát sinh trong suốt tour.",
    },
];

export const featuredTours = [
    {
        title: "Mộc Châu mùa hoa",
        slug: "moc-chau-mua-hoa",
        place: "Sơn La",
        route: "Hà Nội - Mộc Châu - Rừng thông Bản Áng - Đồi chè - Thác Dải Yếm",
        duration: "3 ngày 2 đêm",
        price: "2.490.000đ",
        image: "https://image.vietnam.travel/sites/default/files/2023-04/shutterstock_1473883487_0.jpg?v=1778223503",
        tags: ["Cao nguyên", "Đồi chè", "Thác Dải Yếm"],
        summary: "Hành trình nghỉ dưỡng nhẹ nhàng trên cao nguyên Mộc Châu, phù hợp cho gia đình, nhóm bạn và khách mới đi Tây Bắc.",
        bestTime: "Tháng 1 - 3 mùa hoa mận, tháng 10 - 12 mùa cải và dã quỳ",
        difficulty: "Dễ",
        suitable: "Gia đình, cặp đôi, nhóm bạn",
        highlights: ["Đồi chè Mộc Châu", "Rừng thông Bản Áng", "Thác Dải Yếm", "Trải nghiệm nông sản cao nguyên"],
        itinerary: [
            "Ngày 1: Khởi hành từ Hà Nội, dừng đèo Thung Khe, đến Mộc Châu nhận phòng và dạo cao nguyên.",
            "Ngày 2: Tham quan đồi chè, rừng thông Bản Áng, thác Dải Yếm và các điểm hoa theo mùa.",
            "Ngày 3: Mua đặc sản địa phương, nghỉ cà phê cao nguyên, trở về Hà Nội.",
        ],
        includes: ["Xe du lịch theo chương trình", "Khách sạn hoặc homestay tiêu chuẩn", "Bữa ăn theo lịch trình", "Hướng dẫn viên"],
        sourceUrl: "https://vietnam.travel/things-to-do/moc-chau-your-one-stop-nature-escape",
        departures: [
            { id: "MC260530", date: "2026-05-30", seats: 18, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "MC260613", date: "2026-06-13", seats: 9, status: "Sắp đầy", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "MC260704", date: "2026-07-04", seats: 14, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
        ],
    },
    {
        title: "Tà Xùa săn mây",
        slug: "ta-xua-san-may",
        place: "Bắc Yên",
        route: "Hà Nội - Bắc Yên - Tà Xùa - Sống lưng khủng long - Mỏm cá heo",
        duration: "2 ngày 1 đêm",
        price: "1.890.000đ",
        image: "https://nongthon.vietnamtourism.gov.vn/wp-content/uploads/2026/01/20251011_104533-scaled.jpg",
        tags: ["Săn mây", "Bình minh", "Cung đường núi"],
        summary: "Tour ngắn ngày cho khách muốn săn mây, ngắm bình minh và trải nghiệm không khí vùng cao Sơn La.",
        bestTime: "Tháng 12 - 3 xác suất gặp biển mây cao hơn",
        difficulty: "Trung bình",
        suitable: "Nhóm bạn, khách thích check-in và cung đường núi",
        highlights: ["Biển mây Tà Xùa", "Sống lưng khủng long", "Mỏm cá heo", "Cà phê ngắm mây"],
        itinerary: [
            "Ngày 1: Hà Nội đi Bắc Yên, lên Tà Xùa, ngắm hoàng hôn và nghỉ đêm homestay.",
            "Ngày 2: Dậy sớm săn mây, tham quan các điểm check-in chính, ăn trưa và về Hà Nội.",
        ],
        includes: ["Xe khứ hồi", "Homestay vùng cao", "Bữa ăn địa phương", "Hướng dẫn viên hỗ trợ săn mây"],
        sourceUrl: "https://nongthon.vietnamtourism.gov.vn/ta-xua-son-la-hanh-trinh-cham-vao-bien-may-noi-thien-duong-tay-bac/",
        departures: [
            { id: "TX260523", date: "2026-05-23", seats: 10, status: "Còn chỗ", start: "Hà Nội", transport: "Xe limousine" },
            { id: "TX260606", date: "2026-06-06", seats: 6, status: "Sắp đầy", start: "Hà Nội", transport: "Xe limousine" },
            { id: "TX260620", date: "2026-06-20", seats: 12, status: "Còn chỗ", start: "Hà Nội", transport: "Xe limousine" },
        ],
    },
    {
        title: "Sông Đà - Ngọc Chiến",
        slug: "song-da-ngoc-chien",
        place: "Sơn La",
        route: "Hà Nội - Mường La - Ngọc Chiến - Sông Đà",
        duration: "4 ngày 3 đêm",
        price: "3.690.000đ",
        image: "https://media-dwrm.mae.gov.vn/Image/6509b7f5-3d98-ec62-450e-890bfc931115/2025/7/11/muong-la-son-la_ab4356465f.jpg",
        tags: ["Suối khoáng", "Bản làng", "Cảnh quan"],
        summary: "Lịch trình chậm để nghỉ dưỡng, tắm khoáng, khám phá bản làng và cảnh quan hồ sông Đà.",
        bestTime: "Quanh năm, đẹp nhất vào mùa khô từ tháng 10 - 4",
        difficulty: "Dễ",
        suitable: "Gia đình, khách nghỉ dưỡng, nhóm cần lịch trình riêng",
        highlights: ["Tắm khoáng Ngọc Chiến", "Bản làng người Thái", "Cảnh quan Sông Đà", "Ẩm thực vùng cao"],
        itinerary: [
            "Ngày 1: Hà Nội đi Sơn La, nghỉ đêm tại Mường La hoặc khu vực lân cận.",
            "Ngày 2: Di chuyển Ngọc Chiến, trải nghiệm tắm khoáng và ẩm thực bản địa.",
            "Ngày 3: Khám phá bản làng, cảnh quan Sông Đà và các điểm chụp ảnh.",
            "Ngày 4: Nghỉ sáng, mua đặc sản và trở về Hà Nội.",
        ],
        includes: ["Xe du lịch", "Lưu trú homestay hoặc lodge", "Bữa ăn theo chương trình", "Vé điểm tham quan cơ bản"],
        sourceUrl: "https://2025.vietnam.travel/en/son-la-come-to-love/",
        departures: [
            { id: "SD260531", date: "2026-05-31", seats: 15, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "SD260621", date: "2026-06-21", seats: 8, status: "Sắp đầy", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "SD260719", date: "2026-07-19", seats: 10, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
        ],
    },
    {
        title: "Mù Cang Chải mùa vàng",
        slug: "mu-cang-chai-mua-vang",
        place: "Yên Bái",
        route: "Hà Nội - Nghĩa Lộ - Tú Lệ - Khau Phạ - Mù Cang Chải",
        duration: "3 ngày 2 đêm",
        price: "3.290.000đ",
        image: "https://image.vietnam.travel/sites/default/files/2023-05/Muacangchai-TITC1_0.jpg?v=1778253089",
        tags: ["Ruộng bậc thang", "Mùa vàng", "Đèo Khau Phạ"],
        summary: "Tour ngắm ruộng bậc thang nổi tiếng Tây Bắc, phù hợp mùa lúa chín và mùa nước đổ.",
        bestTime: "Cuối tháng 5 - đầu tháng 6 mùa nước đổ, tháng 9 - 10 mùa lúa chín",
        difficulty: "Trung bình",
        suitable: "Nhiếp ảnh, nhóm bạn, khách thích phong cảnh",
        highlights: ["Đèo Khau Phạ", "La Pán Tẩn", "Mâm Xôi", "Tú Lệ"],
        itinerary: [
            "Ngày 1: Hà Nội đi Nghĩa Lộ, dừng Tú Lệ và nghỉ đêm.",
            "Ngày 2: Qua đèo Khau Phạ, tham quan La Pán Tẩn, Mâm Xôi và các thung lũng ruộng bậc thang.",
            "Ngày 3: Dạo chợ vùng cao, mua đặc sản nếp Tú Lệ và trở về Hà Nội.",
        ],
        includes: ["Xe du lịch", "Lưu trú 2 đêm", "Bữa ăn theo chương trình", "Hướng dẫn viên địa phương"],
        sourceUrl: "https://vietnam.travel/node/1524",
        departures: [
            { id: "MCC260606", date: "2026-06-06", seats: 16, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "MCC260912", date: "2026-09-12", seats: 18, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "MCC260926", date: "2026-09-26", seats: 7, status: "Sắp đầy", start: "Hà Nội", transport: "Ô tô du lịch" },
        ],
    },
    {
        title: "Sa Pa - Fansipan - Mường Hoa",
        slug: "sapa-fansipan-muong-hoa",
        place: "Lào Cai",
        route: "Hà Nội - Sa Pa - Fansipan - Mường Hoa - Cát Cát",
        duration: "3 ngày 2 đêm",
        price: "3.990.000đ",
        image: "https://image.vietnam.travel/sites/default/files/2021-05/Sapa%20Travel%20Guide%20Vietnam%20Tourism.jpg?v=1778214855",
        tags: ["Fansipan", "Bản làng", "Ruộng bậc thang"],
        summary: "Hành trình kinh điển cho khách muốn trải nghiệm khí hậu vùng cao, thung lũng ruộng bậc thang và nóc nhà Đông Dương.",
        bestTime: "Tháng 3 - 5 trời trong, tháng 9 - 10 mùa lúa chín",
        difficulty: "Dễ đến trung bình",
        suitable: "Gia đình, nhóm bạn, khách lần đầu đi Tây Bắc",
        highlights: ["Đỉnh Fansipan", "Thung lũng Mường Hoa", "Bản Cát Cát", "Ẩm thực Sa Pa"],
        itinerary: [
            "Ngày 1: Hà Nội đi Sa Pa, nhận phòng, dạo trung tâm và nhà thờ đá.",
            "Ngày 2: Đi Fansipan, tham quan thung lũng Mường Hoa hoặc bản Cát Cát.",
            "Ngày 3: Tự do mua sắm đặc sản, cà phê ngắm núi và trở về Hà Nội.",
        ],
        includes: ["Xe Hà Nội - Sa Pa", "Khách sạn 2 đêm", "Bữa ăn theo chương trình", "Hướng dẫn viên"],
        sourceUrl: "https://vietnam.travel/places-to-go/northern-vietnam/sapa",
        departures: [
            { id: "SP260529", date: "2026-05-29", seats: 20, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô giường nằm" },
            { id: "SP260612", date: "2026-06-12", seats: 13, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô giường nằm" },
            { id: "SP260710", date: "2026-07-10", seats: 16, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô giường nằm" },
        ],
    },
    {
        title: "Mai Châu nghỉ dưỡng bản làng",
        slug: "mai-chau-nghi-duong-ban-lang",
        place: "Hòa Bình",
        route: "Hà Nội - Mai Châu - Bản Lác - Bản Pom Coọng",
        duration: "2 ngày 1 đêm",
        price: "1.790.000đ",
        image: "https://image.vietnam.travel/sites/default/files/2022-04/shutterstock_1992281294_0.jpg?v=1778234968",
        tags: ["Bản Thái", "Xe đạp", "Homestay"],
        summary: "Tour gần Hà Nội, nhẹ nhàng, nhiều trải nghiệm bản làng và phù hợp nghỉ cuối tuần.",
        bestTime: "Tháng 3 - 5 hoặc tháng 9 - 11",
        difficulty: "Dễ",
        suitable: "Gia đình, công ty nhỏ, khách muốn nghỉ cuối tuần",
        highlights: ["Bản Lác", "Bản Pom Coọng", "Đạp xe thung lũng", "Ẩm thực người Thái"],
        itinerary: [
            "Ngày 1: Hà Nội đi Mai Châu, ăn trưa, đạp xe quanh bản và xem biểu diễn văn nghệ buổi tối.",
            "Ngày 2: Dạo chợ, tham quan bản làng, mua thổ cẩm và trở về Hà Nội.",
        ],
        includes: ["Xe khứ hồi", "Homestay hoặc lodge", "Bữa ăn địa phương", "Xe đạp tham quan"],
        sourceUrl: "https://vietnam.travel/node/1388",
        departures: [
            { id: "MAI260523", date: "2026-05-23", seats: 20, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "MAI260530", date: "2026-05-30", seats: 11, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "MAI260613", date: "2026-06-13", seats: 18, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
        ],
    },
    {
        title: "Hồ Thác Bà xanh ngọc",
        slug: "ho-thac-ba-yen-bai",
        place: "Yên Bái",
        route: "Hà Nội - Yên Bình - Hồ Thác Bà - Ngòi Tu",
        duration: "2 ngày 1 đêm",
        price: "1.950.000đ",
        image: "https://image.vietnam.travel/sites/default/files/2023-08/188-Ye%CC%82n%20Ba%CC%81i-namhn1962%40gmail.com-ve%20dep%20thac%20ba_0.jpg?v=1778216829",
        tags: ["Du thuyền", "Kayak", "Làng Dao"],
        summary: "Lịch trình nghỉ xanh quanh hồ, kết hợp đi thuyền, kayak và tìm hiểu văn hóa cộng đồng ven hồ.",
        bestTime: "Có thể đi quanh năm, tháng 9 - 4 thời tiết dễ chịu hơn",
        difficulty: "Dễ",
        suitable: "Gia đình, cặp đôi, nhóm nghỉ dưỡng",
        highlights: ["Du thuyền hồ Thác Bà", "Đảo xanh", "Làng Ngòi Tu", "Ẩm thực cá hồ"],
        itinerary: [
            "Ngày 1: Hà Nội đi Yên Bái, lên thuyền tham quan hồ và nghỉ đêm gần Ngòi Tu.",
            "Ngày 2: Chèo kayak hoặc dạo bản, ăn trưa cá hồ và trở về Hà Nội.",
        ],
        includes: ["Xe khứ hồi", "Thuyền tham quan", "Lưu trú 1 đêm", "Bữa ăn theo chương trình"],
        sourceUrl: "https://vietnam.travel/things-to-do/thac-ba-lake-emerald-yen-bai",
        departures: [
            { id: "TB260524", date: "2026-05-24", seats: 12, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "TB260607", date: "2026-06-07", seats: 8, status: "Sắp đầy", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "TB260705", date: "2026-07-05", seats: 16, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
        ],
    },
    {
        title: "Điện Biên Phủ dấu ấn lịch sử",
        slug: "dien-bien-phu-lich-su",
        place: "Điện Biên",
        route: "Hà Nội - Điện Biên Phủ - Bảo tàng Chiến thắng - Đồi A1 - Mường Phăng",
        duration: "4 ngày 3 đêm",
        price: "4.290.000đ",
        image: "https://image.vietnam.travel/sites/default/files/2024-03/3_bao_tang_chien_thang_dien_bien_phu_da_in-xuan_tu.jpg?v=1778299304",
        tags: ["Lịch sử", "Bảo tàng", "Tây Bắc"],
        summary: "Tour kết hợp lịch sử, văn hóa và cảnh quan lòng chảo Điện Biên, phù hợp đoàn học tập và khách yêu di sản.",
        bestTime: "Tháng 3 - 5, đặc biệt dịp kỷ niệm tháng 5; tháng 9 - 11 trời mát",
        difficulty: "Dễ",
        suitable: "Đoàn trường, gia đình, doanh nghiệp, khách yêu lịch sử",
        highlights: ["Bảo tàng Chiến thắng Điện Biên Phủ", "Đồi A1", "Hầm Đờ Cát", "Sở chỉ huy Mường Phăng"],
        itinerary: [
            "Ngày 1: Hà Nội đi Sơn La, nghỉ đêm trên tuyến.",
            "Ngày 2: Di chuyển Điện Biên, tham quan bảo tàng và đồi A1.",
            "Ngày 3: Tham quan Mường Phăng, hầm chỉ huy và các điểm lịch sử chính.",
            "Ngày 4: Mua đặc sản, trở về Hà Nội hoặc bay về theo yêu cầu.",
        ],
        includes: ["Xe du lịch", "Khách sạn 3 đêm", "Vé điểm tham quan", "Hướng dẫn viên thuyết minh"],
        sourceUrl: "https://vietnam.travel/things-to-do/festival-event/visit-vietnam-year-dien-bien-2024",
        departures: [
            { id: "DB260604", date: "2026-06-04", seats: 18, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "DB260702", date: "2026-07-02", seats: 11, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "DB260806", date: "2026-08-06", seats: 14, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
        ],
    },
    {
        title: "Lai Châu - Sìn Suối Hồ cộng đồng",
        slug: "lai-chau-sin-suoi-ho",
        place: "Lai Châu",
        route: "Hà Nội - Sa Pa - Ô Quy Hồ - Lai Châu - Sìn Suối Hồ",
        duration: "4 ngày 3 đêm",
        price: "4.590.000đ",
        image: "https://image.vietnam.travel/sites/default/files/2023-03/shutterstock_2209305285_0.jpg?v=1778215157",
        tags: ["Du lịch cộng đồng", "Ô Quy Hồ", "Văn hóa H'Mông"],
        summary: "Tour đi sâu hơn vào Tây Bắc, tập trung văn hóa cộng đồng, bản làng và cung đường đèo hùng vĩ.",
        bestTime: "Tháng 3 - 5 mùa hoa, tháng 9 - 11 trời trong và mát",
        difficulty: "Trung bình",
        suitable: "Khách thích văn hóa bản địa, nhóm nhỏ, khách đã từng đi Sa Pa",
        highlights: ["Đèo Ô Quy Hồ", "Bản Sìn Suối Hồ", "Chợ địa phương", "Nghề thủ công H'Mông"],
        itinerary: [
            "Ngày 1: Hà Nội đi Sa Pa, nghỉ đêm vùng cao.",
            "Ngày 2: Qua Ô Quy Hồ sang Lai Châu, dừng các điểm ngắm cảnh.",
            "Ngày 3: Trải nghiệm Sìn Suối Hồ, tìm hiểu nghề thủ công và đời sống cộng đồng.",
            "Ngày 4: Trở về Hà Nội theo cung đường Sa Pa hoặc cao tốc.",
        ],
        includes: ["Xe du lịch", "Lưu trú 3 đêm", "Bữa ăn theo chương trình", "Hướng dẫn viên địa phương"],
        sourceUrl: "https://vietnam.travel/things-to-do/community-based-tourism-vietnam",
        departures: [
            { id: "LC260611", date: "2026-06-11", seats: 10, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "LC260709", date: "2026-07-09", seats: 9, status: "Sắp đầy", start: "Hà Nội", transport: "Ô tô du lịch" },
            { id: "LC260813", date: "2026-08-13", seats: 12, status: "Còn chỗ", start: "Hà Nội", transport: "Ô tô du lịch" },
        ],
    },
];

export function getTourBySlug(slug) {
    return featuredTours.find((tour) => tour.slug === slug);
}

export function getFirstDeparture(tour) {
    return tour?.departures?.[0];
}

export function getDepartureById(tour, departureId) {
    return tour?.departures?.find((departure) => departure.id === departureId) || getFirstDeparture(tour);
}

export function formatDate(date) {
    return new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
}

export function parsePrice(price) {
    return Number(String(price).replace(/\D/g, ""));
}

export function formatCurrency(value) {
    return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

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
    "Gợi ý đúng nhu cầu: nghỉ dưỡng, khám phá, gia đình hoặc doanh nghiệp.",
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
        title: "Tổng đài đặt vé",
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
        value: "Hà Nội",
        desc: "13 Trịnh Văn Bô",
    },
];

export const supportTopics = [
    "Hỗ trợ đặt tour cá nhân và gia đình",
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
