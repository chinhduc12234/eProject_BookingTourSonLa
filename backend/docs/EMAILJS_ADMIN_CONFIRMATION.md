# Email admin xac nhan tour bang EmailJS

Luồng này tách riêng với email tạo booking ban đầu. Email tạo booking vẫn dùng nhóm biến `EMAILJS_*`; email admin xác nhận tour dùng nhóm biến `EMAILJS_ADMIN_CONFIRM_*`.

## Khi nao email duoc gui

Backend gui email sau khi admin cap nhat booking voi `confirm=true` va booking that su chuyen sang trang thai `CONFIRMED`.

Neu booking da la `CONFIRMED` va admin chi bam luu lai thong tin, backend khong gui lai email de tranh spam khach hang.

## Cau hinh template tren EmailJS

Trong template `template_2dzm4bn`, nen dat:

- **To Email**: `{{to_email}}`
- **To Name**: `{{to_name}}`
- **Subject**: `{{subject}}`
- **Content HTML**:

```html
{{{email_html}}}
```

Backend cung gui them cac bien rieng de template co the tuy bien:

- `booking_code`
- `customer_name`
- `customer_phone`
- `customer_email`
- `tour_name`
- `departure_date`
- `departure_time`
- `departure_location`
- `pickup_address`
- `booking_status`
- `payment_status`
- `adult_count`
- `child_count`
- `total_people`
- `adult_price`
- `child_price`
- `total_price`
- `paid_amount`
- `remaining_amount`
- `booking_url`
- `passenger_summary`

## Bien moi truong backend

```properties
EMAILJS_ADMIN_CONFIRM_ENABLED=true
EMAILJS_ADMIN_CONFIRM_SERVICE_ID=your_admin_confirm_service_id
EMAILJS_ADMIN_CONFIRM_TEMPLATE_ID=your_admin_confirm_template_id
EMAILJS_ADMIN_CONFIRM_PUBLIC_KEY=your_admin_confirm_public_key
EMAILJS_ADMIN_CONFIRM_PRIVATE_KEY=your_admin_confirm_private_key
```

Private Key chi dat o backend/secret manager, khong dua vao frontend.
