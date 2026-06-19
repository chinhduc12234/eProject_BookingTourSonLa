# KNOWN_LIMITATIONS

## Thanh toán

- Chưa tích hợp cổng thanh toán thật.
- Chưa có callback/webhook để xác minh giao dịch từ ngân hàng, VNPay, MoMo hoặc nhà cung cấp khác.
- `paymentReference` đang được sinh nội bộ để theo dõi giao dịch mô phỏng.
- Bảng `payments` và `payment_transactions` có trong SQL dump nhưng code hiện tại chủ yếu lưu trạng thái thanh toán trực tiếp trên `bookings`.

Khuyến nghị tích hợp gateway sau UAT:

- Tạo service riêng cho nhà cung cấp thanh toán.
- Lưu giao dịch vào bảng payment transaction.
- Xác minh chữ ký callback/webhook.
- Idempotency theo mã booking/giao dịch.
- Admin chỉ duyệt thủ công khi gateway chưa xác nhận tự động.

## Database

- `spring.jpa.hibernate.ddl-auto` vẫn mặc định `update` để giữ tương thích môi trường hiện tại.
- Production nên đặt `JPA_DDL_AUTO=validate` và quản lý schema bằng migration tool như Flyway hoặc Liquibase.

## Kiểm thử

- Đã có kiểm thử JWT mức unit.
- Chưa có test tích hợp đầy đủ với database cho RBAC và booking capacity.
- UAT nên chạy checklist trong `TESTING.md` trước khi go-live.

## Upload

- File upload đang lưu local theo `UPLOAD_DIR`.
- Production nên dùng shared storage hoặc object storage nếu chạy nhiều instance.
