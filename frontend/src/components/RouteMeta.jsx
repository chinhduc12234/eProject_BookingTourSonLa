import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const defaultMeta = {
  title: "Tây Bắc Travel",
  description:
    "Khám phá và đặt tour Sơn La, Mộc Châu, Tà Xùa cùng Tây Bắc Travel.",
  robots: "index,follow",
};

const routeMeta = [
  {
    match: (path) => path === "/",
    title: "Du lịch Tây Bắc sống động | Tây Bắc Travel",
    description:
      "Khám phá tour Sơn La, Mộc Châu, Tà Xùa và những hành trình Tây Bắc được chọn lọc.",
  },
  {
    match: (path) => path === "/tours",
    title: "Tour và lịch khởi hành | Tây Bắc Travel",
    description:
      "Tìm tour Tây Bắc theo điểm đến, thời gian, ngân sách và lịch khởi hành đang mở bán.",
  },
  {
    match: (path) => /^\/tours\/[^/]+$/.test(path),
    title: "Chi tiết hành trình | Tây Bắc Travel",
    description:
      "Xem lịch trình, hình ảnh, giá và lịch khởi hành của tour Tây Bắc.",
  },
  {
    match: (path) => path.startsWith("/booking"),
    title: "Đặt tour an toàn | Tây Bắc Travel",
    description:
      "Hoàn tất thông tin hành khách, lịch khởi hành và thanh toán cho chuyến đi.",
    robots: "noindex,nofollow",
  },
  {
    match: (path) => path.startsWith("/tai-khoan") || path === "/payment",
    title: "Tài khoản khách hàng | Tây Bắc Travel",
    description: "Theo dõi hồ sơ, booking và thanh toán của bạn.",
    robots: "noindex,nofollow",
  },
  {
    match: (path) => path === "/thank-you",
    title: "Đặt tour thành công | Tây Bắc Travel",
    description: "Xác nhận booking và các bước tiếp theo cho hành trình của bạn.",
    robots: "noindex,nofollow",
  },
  {
    match: (path) => path.startsWith("/admin"),
    title: "Trung tâm điều hành | Tây Bắc Travel",
    description: "Không gian quản trị và điều hành tour Tây Bắc Travel.",
    robots: "noindex,nofollow",
  },
  {
    match: (path) => path.startsWith("/employee"),
    title: "Không gian nhân viên | Tây Bắc Travel",
    description: "Theo dõi phân công và cập nhật tiến độ tour.",
    robots: "noindex,nofollow",
  },
  {
    match: (path) => path === "/login",
    title: "Đăng nhập | Tây Bắc Travel",
    description: "Đăng nhập để quản lý hành trình và công việc của bạn.",
    robots: "noindex,follow",
  },
  {
    match: (path) => path === "/register",
    title: "Đăng ký tài khoản | Tây Bắc Travel",
    description: "Tạo tài khoản để đặt tour và theo dõi hành trình Tây Bắc.",
  },
  {
    match: (path) => path === "/gioi-thieu",
    title: "Về Tây Bắc Travel",
    description: "Tìm hiểu cách Tây Bắc Travel xây dựng những hành trình địa phương rõ ràng và an toàn.",
  },
  {
    match: (path) => path === "/lien-he",
    title: "Liên hệ tư vấn | Tây Bắc Travel",
    description: "Gửi yêu cầu để được tư vấn hành trình Tây Bắc phù hợp.",
  },
  {
    match: (path) => path === "/faq",
    title: "Câu hỏi thường gặp | Tây Bắc Travel",
    description: "Giải đáp về đặt tour, thanh toán, lịch khởi hành và chính sách dịch vụ.",
  },
  {
    match: (path) => path === "/khong-co-quyen",
    title: "Không có quyền truy cập | Tây Bắc Travel",
    description: "Tài khoản hiện tại không có quyền mở khu vực này.",
    robots: "noindex,nofollow",
  },
];

function ensureMeta(name) {
  let element = document.head.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  return element;
}

export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const matched = routeMeta.find((item) => item.match(pathname));
    const meta = matched || {
      ...defaultMeta,
      title: "Không tìm thấy trang | Tây Bắc Travel",
      description: "Trang bạn yêu cầu không tồn tại hoặc đã được di chuyển.",
      robots: "noindex,nofollow",
    };

    document.title = meta.title;
    ensureMeta("description").setAttribute("content", meta.description);
    ensureMeta("robots").setAttribute(
      "content",
      meta.robots || defaultMeta.robots,
    );
  }, [pathname]);

  return null;
}
