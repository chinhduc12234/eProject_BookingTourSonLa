const img = (id, w = 1080, h = 720) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const destinations = [
    {
        id: "moc-chau",
        name: "Mộc Châu",
        region: "Sơn La",
        image: img("1528127269322-539801943592"),
        tagline: "Cao nguyên trắng giữa lòng Tây Bắc",
        description:
            "Mộc Châu nổi tiếng với những đồi chè xanh mướt, rừng mận trắng tinh khôi và những bản làng dân tộc đậm chất Tây Bắc.",
        tourCount: 5,
        bestSeason: "Tháng 1 - 3, Tháng 10 - 12",
    },
    {
        id: "ta-xua",
        name: "Tà Xùa",
        region: "Sơn La",
        image: img("1469854523086-cc02fe5d8800"),
        tagline: "Thiên đường săn mây Bắc Yên",
        description:
            "Tà Xùa là điểm săn mây huyền thoại với Sống lưng khủng long, Mỏm cá heo và biển mây bồng bềnh bất tận.",
        tourCount: 3,
        bestSeason: "Tháng 12 - 3",
    },
    {
        id: "son-la",
        name: "Sơn La",
        region: "Sơn La",
        image: img("1444090542259-0af8fa96557e"),
        tagline: "Cửa ngõ Tây Bắc",
        description:
            "TP. Sơn La và Ngọc Chiến nổi bật với suối khoáng nóng, bản làng người Thái và cảnh quan sông Đà thơ mộng.",
        tourCount: 4,
        bestSeason: "Quanh năm",
    },
    {
        id: "mu-cang-chai",
        name: "Mù Cang Chải",
        region: "Yên Bái",
        image: img("1531882015-9d3d6e9fdc6c"),
        tagline: "Kiệt tác ruộng bậc thang",
        description:
            "Mù Cang Chải - di sản quốc gia với những thửa ruộng bậc thang vàng óng vào mùa lúa chín và đèo Khau Phạ huyền thoại.",
        tourCount: 3,
        bestSeason: "Tháng 9 - 10 mùa lúa chín",
    },
    {
        id: "sapa",
        name: "Sa Pa",
        region: "Lào Cai",
        image: img("1518684079-3c830dcef090"),
        tagline: "Thị trấn mờ sương",
        description:
            "Sa Pa - điểm đến kinh điển với đỉnh Fansipan nóc nhà Đông Dương, thung lũng Mường Hoa và bản làng dân tộc.",
        tourCount: 6,
        bestSeason: "Tháng 3 - 5, Tháng 9 - 11",
    },
    {
        id: "mai-chau",
        name: "Mai Châu",
        region: "Hòa Bình",
        image: img("1506905925346-21bda4d32df4"),
        tagline: "Thung lũng bình yên",
        description:
            "Mai Châu - bản Lác, bản Pom Coọng với những ngôi nhà sàn truyền thống của người Thái, thích hợp nghỉ cuối tuần.",
        tourCount: 4,
        bestSeason: "Quanh năm",
    },
    {
        id: "ha-giang",
        name: "Hà Giang",
        region: "Hà Giang",
        image: img("1486870591958-9b9d0d1dda99"),
        tagline: "Cao nguyên đá kỳ vĩ",
        description:
            "Hà Giang - cao nguyên đá Đồng Văn, đèo Mã Pí Lèng và những con đường đèo huyền thoại của Đông Bắc.",
        tourCount: 5,
        bestSeason: "Tháng 9 - 11, Tháng 1 - 3",
    },
    {
        id: "dien-bien",
        name: "Điện Biên",
        region: "Điện Biên",
        image: img("1418065460487-3e41a6c84dc5"),
        tagline: "Dấu ấn lịch sử oai hùng",
        description:
            "Điện Biên Phủ - nơi lưu giữ ký ức chiến thắng lừng lẫy năm châu chấn động địa cầu, lòng chảo Mường Thanh.",
        tourCount: 2,
        bestSeason: "Tháng 3 - 5, Tháng 9 - 11",
    },
    {
        id: "cao-bang",
        name: "Cao Bằng",
        region: "Cao Bằng",
        image: img("1465056836041-7f43ac27dcb5"),
        tagline: "Non nước hữu tình",
        description:
            "Cao Bằng - thác Bản Giốc đẹp nhất Đông Nam Á, động Ngườm Ngao và Pác Bó - cội nguồn cách mạng.",
        tourCount: 3,
        bestSeason: "Tháng 9 - 11",
    },
    {
        id: "y-ty",
        name: "Y Tý",
        region: "Lào Cai",
        image: img("1565967511849-76a60a516170"),
        tagline: "Vùng đất cuối trời",
        description:
            "Y Tý - vùng đất 'cuối trời' của Lào Cai với ruộng bậc thang đẹp xao xuyến và biển mây huyền ảo của bản Hà Nhì.",
        tourCount: 2,
        bestSeason: "Tháng 9 - 10",
    },
    {
        id: "ninh-binh",
        name: "Ninh Bình",
        region: "Ninh Bình",
        image: img("1551655510-555dc3be8633"),
        tagline: "Vịnh Hạ Long trên cạn",
        description:
            "Ninh Bình - quần thể danh thắng Tràng An, Tam Cốc, Bích Động và cố đô Hoa Lư hơn nghìn năm tuổi.",
        tourCount: 3,
        bestSeason: "Tháng 1 - 5",
    },
    {
        id: "ha-long",
        name: "Hạ Long",
        region: "Quảng Ninh",
        image: img("1469854523086-cc02fe5d8800"),
        tagline: "Kỳ quan thiên nhiên thế giới",
        description:
            "Vịnh Hạ Long - di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ giữa biển xanh ngọc.",
        tourCount: 4,
        bestSeason: "Tháng 4 - 10",
    },
];

// Auto-override ảnh nếu có file src/assets/images/destinations/<id>.jpg
import { pickDestinationImage } from "../utils/images";

destinations.forEach((d) => {
    const local = pickDestinationImage(d.id, null);
    if (local) d.image = local;
});

export function getDestinationById(id) {
    return destinations.find((d) => d.id === id);
}
