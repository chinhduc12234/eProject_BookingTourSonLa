# Email cam on sau khi nhan vien hoan thanh tour

Luong nay tach rieng voi:

- email tao booking ban dau: `EMAILJS_*`
- email admin xac nhan tour: `EMAILJS_ADMIN_CONFIRM_*`

Email cam on sau tour dung nhom bien `EMAILJS_TOUR_COMPLETED_*`.

## Khi nao email duoc gui

Backend gui email sau khi nhan vien bam nut **Xac nhan hoan thanh tour** o timeline va booking that su chuyen sang trang thai `COMPLETED`.

Neu booking da `COMPLETED`, backend khong gui lai email de tranh spam khach hang.

## Cau hinh template tren EmailJS

Trong template `template_539sij9`, dat:

- **To Email**: `{{to_email}}`
- **To Name**: `{{to_name}}`
- **Subject**: `{{subject}}`
- **From Name**: `{{brand_name}}`
- **Reply To**: `{{customer_email}}`
- **Content HTML**:

```html
{{{email_html}}}
```

Backend cung gui them cac bien de tuy bien template:

- `booking_code`
- `customer_name`
- `customer_email`
- `customer_phone`
- `tour_name`
- `departure_date`
- `duration`
- `total_people`
- `total_price`
- `employee_name`
- `booking_url`
- `review_url`
- `feedback_url`

## Bien moi truong backend

```properties
EMAILJS_TOUR_COMPLETED_ENABLED=true
EMAILJS_TOUR_COMPLETED_SERVICE_ID=your_tour_completed_service_id
EMAILJS_TOUR_COMPLETED_TEMPLATE_ID=your_tour_completed_template_id
EMAILJS_TOUR_COMPLETED_PUBLIC_KEY=your_tour_completed_public_key
EMAILJS_TOUR_COMPLETED_PRIVATE_KEY=your_tour_completed_private_key
APP_FEEDBACK_URL=http://localhost:5173/lien-he
```

`APP_FEEDBACK_URL` la link khach bam de gui danh gia. Mac dinh backend se dung `/lien-he` neu bien nay de trong.
