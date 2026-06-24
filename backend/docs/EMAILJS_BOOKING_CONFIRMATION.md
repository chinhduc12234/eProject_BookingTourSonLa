# Email xác nhận đặt tour bằng EmailJS

Backend gửi email sau khi transaction tạo booking đã commit. Lỗi gửi email không làm thất bại booking.

## 1. Cấu hình template trên EmailJS

Trong template đã tạo, đặt:

- **To Email**: `{{to_email}}`
- **To Name**: `{{to_name}}`
- **Subject**: `{{subject}}`
- **Content**: mở chế độ chỉnh HTML và chỉ nhập:

```html
{{{email_html}}}
```

Ba dấu ngoặc nhọn là cần thiết để EmailJS render khối HTML do backend tạo.
Phải có đúng **ba dấu `{` ở đầu và ba dấu `}` ở cuối**. Chuỗi
`{{email_html}}}` trong trình chỉnh sửa là sai vì chỉ có hai dấu `{` ở đầu.

Nếu muốn dùng nội dung văn bản dự phòng thay cho HTML, nhập:

```text
{{message}}
```

Quan trọng: không hard-code địa chỉ nhận trong trường **To Email**. Nếu trường này đang là email cố định hoặc `{{email}}` của template mẫu, hãy đổi thành `{{to_email}}`; nếu không EmailJS có thể gửi sai người hoặc không gửi.

Các biến backend gửi:

- `to_email`
- `to_name`
- `subject`
- `booking_code`
- `email_html`

## 2. Biến môi trường backend

Sao chép `backend/.env.example` thành `backend/.env` hoặc cấu hình trong IDE/hệ thống triển khai:

```properties
EMAILJS_ENABLED=true
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
APP_PUBLIC_URL=http://localhost:5173
```

Không commit `backend/.env`. Private Key chỉ được đặt ở backend/secret manager, tuyệt đối không đưa vào React.

Nếu API trả `Account not found`, Public Key hiện tại không còn được EmailJS nhận diện.
Mở **EmailJS Dashboard → Account → General → API Keys**, sao chép lại **Public Key**,
cập nhật `EMAILJS_PUBLIC_KEY` và khởi động lại backend. Private Key không bắt buộc
cho endpoint gửi email; nếu sử dụng thì phải thuộc cùng tài khoản với Public Key.

Vì email được gửi từ Spring Boot, trong **EmailJS Dashboard → Account → Security**
phải bật **Allow EmailJS API for non-browser applications**. Nếu tùy chọn này tắt,
EmailJS sẽ trả HTTP 403 dù Public Key và Private Key đều chính xác.

## 3. Nội dung email

Email gồm:

- mã booking và trạng thái thanh toán;
- tour, ngày/giờ đi, thời lượng, nơi khởi hành;
- thông tin người đặt, đoàn/tổ chức và điểm đón;
- danh sách hành khách;
- giá người lớn/trẻ em, tổng tiền, đã thanh toán và còn lại;
- ghi chú, yêu cầu đặc biệt;
- nút mở chi tiết booking trong tài khoản.

Giấy tờ định danh và dữ liệu sức khỏe không được gửi đầy đủ qua email để hạn chế lộ dữ liệu nhạy cảm.

## 4. Gửi lại email

Khách hàng có thể mở trang chi tiết booking và bấm **Gửi lại email xác nhận**. API
`POST /api/bookings/{id}/resend-confirmation-email` chỉ cho phép chính chủ booking sử dụng,
đồng thời luôn đồng bộ địa chỉ nhận từ tài khoản đang đăng nhập trước khi gửi.
