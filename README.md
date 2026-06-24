# BookingTourSonLa

BookingTourSonLa gồm backend Spring Boot và frontend React/Vite cho nghiệp vụ đặt tour Sơn La.

## Yêu cầu môi trường

- Java 21
- Node.js và npm
- MySQL
- Database `booking_tour_sonla` được khởi tạo từ `database/booking_tour_sonla.sql`

## Cấu hình backend

Backend đọc cấu hình qua biến môi trường. Tham khảo `backend/.env.example`.

Biến quan trọng:

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (mặc định local MAMP là `root/root`)
- `JWT_SECRET`: bắt buộc nên đặt trong UAT/production, tối thiểu 32 byte
- `CORS_ALLOWED_ORIGIN_PATTERNS`: danh sách origin frontend, phân tách bằng dấu phẩy
- `APP_ADMIN_PASSWORD`: mật khẩu admin seed; mặc định local là `123456`
- `UPLOAD_DIR`: thư mục lưu file upload
- `EMAILJS_ENABLED`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`: gửi email xác nhận sau khi khách đặt tour thành công
- `APP_PUBLIC_URL`: địa chỉ frontend dùng cho nút xem chi tiết trong email

Chạy backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Hướng dẫn cấu hình template EmailJS: `backend/docs/EMAILJS_BOOKING_CONFIRMATION.md`.

Kiểm tra health:

```powershell
Invoke-WebRequest http://localhost:8080/actuator/health
```

## Cấu hình frontend

Frontend đọc API base URL qua `VITE_API_BASE_URL`. Tham khảo `frontend/.env.example`.

Chạy frontend:

```powershell
cd frontend
npm install
npm run dev
```

Build production:

```powershell
cd frontend
npm run build
```

## Luồng quyền chính

- Customer: xem tour, đặt tour, xem booking của mình, thanh toán/hủy booking của mình.
- Employee: chỉ truy cập module nhân viên và booking đã được phân công.
- Admin: quản lý tour, lịch khởi hành, booking, nhân viên, tỉnh/huyện/địa điểm.

## Ghi chú thanh toán

Thanh toán hiện tại là luồng mô phỏng/thủ công trong hệ thống. Customer chọn thanh toán và hệ thống cập nhật trạng thái nội bộ (`PAID` hoặc `PARTIAL`); chưa có kết nối cổng thanh toán thực tế như VNPay/MoMo/ngân hàng. Xem thêm `KNOWN_LIMITATIONS.md`.
