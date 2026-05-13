const img = (id, w = 960, h = 600) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const blogs = [
    {
        id: 1,
        slug: "kinh-nghiem-san-may-ta-xua",
        title: "Kinh nghiệm săn mây Tà Xùa cho người mới",
        excerpt:
            "Tà Xùa là thiên đường săn mây của Tây Bắc. Bài viết tổng hợp thời điểm đi, điểm săn mây đẹp nhất và cách chuẩn bị cho chuyến đi.",
        category: "Cẩm nang",
        author: "Mai Anh",
        date: "2026-05-01",
        readingTime: 8,
        image: img("1469854523086-cc02fe5d8800"),
        tags: ["Tà Xùa", "Săn mây", "Tây Bắc"],
        content:
            "Tà Xùa nổi tiếng với 'thiên đường mây' bồng bềnh. Để săn mây đẹp, bạn nên đi vào tháng 11 đến tháng 3 năm sau. Thời điểm vàng để săn mây thường là 5h-7h sáng và 16h-18h chiều...",
    },
    {
        id: 2,
        slug: "moc-chau-mua-hoa-man-trang",
        title: "Mộc Châu mùa hoa mận trắng - thời điểm vàng để đi",
        excerpt:
            "Mộc Châu nở rộ hoa mận trắng từ cuối tháng 1 đến giữa tháng 2. Đây là thời điểm đẹp nhất để khám phá cao nguyên.",
        category: "Điểm đến",
        author: "Hoàng Long",
        date: "2026-04-15",
        readingTime: 6,
        image: img("1528127269322-539801943592"),
        tags: ["Mộc Châu", "Hoa mận", "Mùa"],
        content:
            "Đầu xuân, Mộc Châu khoác lên mình tấm áo trắng tinh khôi của hoa mận. Những thung lũng Nà Ka, Phiêng Khoang trở thành điểm check-in vạn người mê...",
    },
    {
        id: 3,
        slug: "lich-trinh-tay-bac-7-ngay",
        title: "Lịch trình du lịch Tây Bắc 7 ngày trọn vẹn",
        excerpt:
            "Hành trình 7 ngày khám phá Tây Bắc: Mộc Châu - Tà Xùa - Sa Pa - Mù Cang Chải - Y Tý - Hà Giang. Lịch trình chi tiết, chi phí dự tính.",
        category: "Lịch trình",
        author: "Quỳnh Anh",
        date: "2026-04-01",
        readingTime: 12,
        image: img("1531882015-9d3d6e9fdc6c"),
        tags: ["Tây Bắc", "Lịch trình", "7 ngày"],
        content:
            "Tây Bắc luôn là điểm đến mơ ước của các tín đồ du lịch. Với 7 ngày, bạn có thể trải nghiệm trọn vẹn vẻ đẹp của vùng cao Tây Bắc...",
    },
    {
        id: 4,
        slug: "am-thuc-tay-bac-mon-an-khong-the-bo-qua",
        title: "10 món ăn Tây Bắc không thể bỏ qua",
        excerpt:
            "Từ thắng cố, lợn cắp nách, gà nướng mắc khén đến cá nướng pa pỉnh tộp - Tây Bắc có rất nhiều món ngon đặc trưng.",
        category: "Ẩm thực",
        author: "Văn Tú",
        date: "2026-03-20",
        readingTime: 7,
        image: img("1565967511849-76a60a516170"),
        tags: ["Ẩm thực", "Tây Bắc", "Đặc sản"],
        content: "Ẩm thực Tây Bắc luôn để lại ấn tượng sâu sắc với du khách...",
    },
    {
        id: 5,
        slug: "kinh-nghiem-phuot-ha-giang",
        title: "Kinh nghiệm phượt Hà Giang cho người mới",
        excerpt:
            "Phượt Hà Giang đang là xu hướng. Bài viết tổng hợp cung đường, điểm dừng chân và kinh nghiệm an toàn cho người mới.",
        category: "Cẩm nang",
        author: "Hùng Phạm",
        date: "2026-03-10",
        readingTime: 10,
        image: img("1486870591958-9b9d0d1dda99"),
        tags: ["Hà Giang", "Phượt", "Cẩm nang"],
        content: "Hà Giang là điểm phượt mơ ước. Với cung đường đẹp như tranh, bạn cần chuẩn bị kỹ...",
    },
    {
        id: 6,
        slug: "do-dac-can-mang-khi-di-tay-bac",
        title: "Đồ đạc cần mang khi đi Tây Bắc",
        excerpt:
            "Tây Bắc có khí hậu khá đặc biệt. Cùng tổng hợp những đồ đạc, vật dụng cần thiết để chuyến đi trọn vẹn.",
        category: "Cẩm nang",
        author: "Linh Trần",
        date: "2026-02-28",
        readingTime: 5,
        image: img("1518684079-3c830dcef090"),
        tags: ["Cẩm nang", "Tây Bắc", "Đồ đạc"],
        content: "Khí hậu Tây Bắc thay đổi nhiều, đặc biệt vùng cao có thể rất lạnh vào đêm...",
    },
];

// Auto-override ảnh nếu có file src/assets/images/blogs/<slug>.jpg
import { pickBlogImage } from "../utils/images";

blogs.forEach((b) => {
    const local = pickBlogImage(b.slug, null);
    if (local) b.image = local;
});

export const testimonials = [
    {
        name: "Nguyễn Mai Anh",
        avatar: "https://i.pravatar.cc/120?img=47",
        role: "Khách hàng",
        location: "Hà Nội",
        rating: 5,
        tourTitle: "Mộc Châu - Mùa hoa mận trắng",
        comment:
            "Tour rất chu đáo, hướng dẫn viên nhiệt tình, đồ ăn ngon. Mộc Châu mùa hoa mận đẹp đến mê hồn. Sẽ tiếp tục đặt tour với Tây Bắc Travel.",
    },
    {
        name: "Phạm Quang Hùng",
        avatar: "https://i.pravatar.cc/120?img=12",
        role: "Khách hàng",
        location: "TP.HCM",
        rating: 5,
        tourTitle: "Tà Xùa - Săn mây biển trời",
        comment:
            "Lần đầu săn mây Tà Xùa, may mắn gặp biển mây 'kinh điển'. Đội ngũ HDV chuyên nghiệp, lịch trình hợp lý. Recommend!",
    },
    {
        name: "Trần Thanh Hà",
        avatar: "https://i.pravatar.cc/120?img=32",
        role: "Khách hàng",
        location: "Đà Nẵng",
        rating: 4.5,
        tourTitle: "Sa Pa - Fansipan - Mường Hoa",
        comment:
            "Chuyến đi tuyệt vời với gia đình. Fansipan thực sự là trải nghiệm khó quên. Cảm ơn đội tour đã hỗ trợ rất tốt khi có người trong đoàn bị say độ cao.",
    },
    {
        name: "Lê Văn Tú",
        avatar: "https://i.pravatar.cc/120?img=51",
        role: "Khách hàng doanh nghiệp",
        location: "Hà Nội",
        rating: 5,
        tourTitle: "Tour team building Mai Châu",
        comment:
            "Đặt tour công ty 80 người. Mọi thứ được tổ chức rất chuyên nghiệp từ A đến Z. Đặc biệt là chương trình team building rất sáng tạo.",
    },
];

export const homeCategories = [
    { id: "tay-bac", title: "Tour Tây Bắc", icon: "🏔️", count: "15+ tour" },
    { id: "son-la", title: "Tour Sơn La", icon: "🌸", count: "4 tour" },
    { id: "moc-chau", title: "Tour Mộc Châu", icon: "🌿", count: "3 tour" },
    { id: "san-may", title: "Tour săn mây", icon: "☁️", count: "5 tour" },
    { id: "nghi-duong", title: "Tour nghỉ dưỡng", icon: "🌅", count: "6 tour" },
    { id: "gia-dinh", title: "Tour gia đình", icon: "👨‍👩‍👧", count: "8 tour" },
];

export const whyChooseUs = [
    {
        icon: "ShieldCheck",
        title: "Cam kết chất lượng",
        desc: "Mọi tour đều được kiểm duyệt nghiêm ngặt về an toàn, lịch trình và dịch vụ.",
    },
    {
        icon: "BadgePercent",
        title: "Giá tốt nhất",
        desc: "Cam kết giá tour cạnh tranh nhất thị trường. Hoàn tiền nếu tìm được giá tốt hơn.",
    },
    {
        icon: "Headphones",
        title: "Hỗ trợ 24/7",
        desc: "Đội ngũ tư vấn và hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn.",
    },
    {
        icon: "Sparkles",
        title: "Trải nghiệm độc đáo",
        desc: "Mỗi tour đều có những trải nghiệm bản địa độc đáo không thể tìm thấy ở nơi khác.",
    },
];
