# TESTING

## Kiểm thử tự động

Backend:

```powershell
cd backend
.\mvnw.cmd test
```

Frontend:

```powershell
cd frontend
npm run build
```

## Checklist UAT tối thiểu

### Auth

- Đăng ký customer mới với email/số điện thoại hợp lệ.
- Đăng nhập customer/admin/employee.
- Thử đăng nhập bằng tài khoản đã bị khóa hoặc soft-delete, kỳ vọng bị từ chối.
- Đổi email hồ sơ customer và xác nhận token mới vẫn dùng được.

### RBAC

- Customer không truy cập được `/admin` và API `/api/admin/**`.
- Customer không truy cập được API `/api/users/admin/staff`.
- Customer không truy cập được API `/api/employee/**`.
- Employee chỉ xem được booking được phân công.
- Admin truy cập được quản lý tour, booking, nhân viên.

### Booking

- Customer đặt tour với số khách hợp lệ và còn chỗ.
- Thử đặt quá số chỗ trống, kỳ vọng bị từ chối.
- Thử đặt sau `bookingDeadline`, kỳ vọng bị từ chối.
- Customer chỉ xem/hủy/thanh toán booking của chính mình.
- Admin gán nhân viên rồi xác nhận booking.
- Employee cập nhật lịch trình booking đã được phân công.
- Hủy booking trước ngày khởi hành và kiểm tra trạng thái hoàn tiền nội bộ.

### Payment

- Thanh toán toàn bộ: kiểm tra `paymentStatus=PAID`.
- Thanh toán đặt cọc: kiểm tra `paymentStatus=PARTIAL` và `remainingAmount`.
- Thanh toán phần còn lại: kiểm tra `paymentStatus=PAID`.
- Ghi nhận đây là thanh toán mô phỏng/thủ công, chưa kiểm tra callback gateway.

## Kiểm tra môi trường production/UAT

- Không đặt secret trong source code.
- Đặt `JWT_SECRET` ổn định, tối thiểu 32 byte.
- Đặt `DB_PASSWORD` và `APP_ADMIN_PASSWORD` bằng secret manager hoặc biến môi trường bảo mật.
- CORS chỉ trỏ đến domain frontend hợp lệ.
- Health endpoint `/actuator/health` trả về `UP`.
