# Cách thêm ảnh vào Tây Bắc Travel

> Chỉ cần thả ảnh vào đúng thư mục theo đúng tên — code sẽ TỰ ĐỘNG dùng.
> Không cần sửa code, không cần restart dev server (Vite HMR sẽ reload).

---

## Tổng quan

| Thư mục | Dùng cho | Quy tắc đặt tên |
|---|---|---|
| `tours/<slug>/` | Ảnh từng tour (nhiều ảnh) | Thư mục con theo slug tour, file bên trong tự do |
| `destinations/` | Ảnh điểm đến (1 ảnh/điểm) | Tên file = id điểm đến |
| `blogs/` | Ảnh bài viết blog | Tên file = slug bài viết |
| `hero/` | Ảnh nền hero của các trang | Tên file theo key trang |
| `avatars/` | Ảnh đại diện | Tự do |

Định dạng hỗ trợ: **jpg, jpeg, png, webp, avif**. Khuyến nghị dùng **webp** hoặc **jpg** (kích thước < 500 KB / ảnh).

---

## 1. Ảnh tour (`tours/`)

Mỗi tour có thư mục con riêng. Tên thư mục = **slug** của tour. Trong thư mục, đặt nhiều ảnh tuỳ thích — ảnh sẽ được sắp xếp theo tên file (alphabetic).

```
tours/
├── moc-chau-mua-hoa-man/
│   ├── 01-cover.jpg          ← ảnh đầu = ảnh đại diện
│   ├── 02-doi-che.jpg
│   ├── 03-rung-thong.jpg
│   ├── 04-thac-dai-yem.jpg
│   └── 05-hoa-man.jpg
├── ta-xua-san-may-bien-may/
│   ├── 01-bien-may.jpg
│   └── 02-song-lung.jpg
└── ...
```

**Mẹo:** đặt tên file bắt đầu bằng số (`01-`, `02-`...) để kiểm soát thứ tự hiển thị.

### Danh sách 24 slug tour:

| # | Slug | Điểm đến |
|---|---|---|
| 1 | `moc-chau-mua-hoa-man` | Mộc Châu, Sơn La |
| 2 | `ta-xua-san-may-bien-may` | Tà Xùa, Sơn La |
| 3 | `son-la-ngoc-chien-suoi-khoang` | Ngọc Chiến, Sơn La |
| 4 | `mu-cang-chai-mua-lua-vang` | Mù Cang Chải, Yên Bái |
| 5 | `sapa-fansipan-3-ngay-2-dem` | Sa Pa, Lào Cai |
| 6 | `mai-chau-ban-lac-nghi-cuoi-tuan` | Mai Châu, Hòa Bình |
| 7 | `dien-bien-phu-dau-an-lich-su` | Điện Biên |
| 8 | `ha-giang-cao-nguyen-da-dong-van` | Hà Giang |
| 9 | `lai-chau-sin-suoi-ho-cong-dong` | Lai Châu |
| 10 | `ho-thac-ba-yen-bai-2n1d` | Yên Bái |
| 11 | `cao-bang-thac-ban-gioc` | Cao Bằng |
| 12 | `ninh-binh-trang-an-hoa-lu` | Ninh Bình |
| 13 | `da-nang-hoi-an-ba-na-hills` | Đà Nẵng |
| 14 | `phu-quoc-grand-world-vinwonders` | Phú Quốc |
| 15 | `ha-long-cat-ba-3n2d` | Hạ Long |
| 16 | `da-lat-thanh-pho-ngan-hoa` | Đà Lạt |
| 17 | `hue-co-do-dai-noi` | Huế - Quảng Bình |
| 18 | `nha-trang-vinpearl-3n2d` | Nha Trang |
| 19 | `thai-lan-bangkok-pattaya` | Thái Lan |
| 20 | `singapore-malaysia-6n5d` | Singapore - Malaysia |
| 21 | `han-quoc-mua-hoa-anh-dao` | Hàn Quốc |
| 22 | `nhat-ban-cung-duong-vang` | Nhật Bản |
| 23 | `pha-luong-trekking-2-ngay` | Pha Luông, Sơn La |
| 24 | `y-ty-mua-lua-chin-lao-cai` | Y Tý, Lào Cai |

---

## 2. Ảnh điểm đến (`destinations/`)

Một ảnh duy nhất cho mỗi điểm đến. **Tên file = id điểm đến**.

```
destinations/
├── moc-chau.jpg
├── ta-xua.jpg
├── sapa.webp
└── ...
```

### 12 ID điểm đến:

`moc-chau`, `ta-xua`, `son-la`, `mu-cang-chai`, `sapa`, `mai-chau`, `ha-giang`, `dien-bien`, `cao-bang`, `y-ty`, `ninh-binh`, `ha-long`

---

## 3. Ảnh bài viết blog (`blogs/`)

Một ảnh / bài viết. **Tên file = slug bài viết**.

```
blogs/
├── kinh-nghiem-san-may-ta-xua.jpg
├── moc-chau-mua-hoa-man-trang.jpg
└── ...
```

### 6 slug blog:

- `kinh-nghiem-san-may-ta-xua`
- `moc-chau-mua-hoa-man-trang`
- `lich-trinh-tay-bac-7-ngay`
- `am-thuc-tay-bac-mon-an-khong-the-bo-qua`
- `kinh-nghiem-phuot-ha-giang`
- `do-dac-can-mang-khi-di-tay-bac`

---

## 4. Ảnh hero của các trang (`hero/`)

Ảnh background lớn ở đầu mỗi trang.

```
hero/
├── home.jpg            ← Trang chủ
├── tours.jpg           ← Trang danh sách tour
├── promotions.jpg      ← Trang khuyến mãi
├── last-minute.jpg     ← Trang giờ chót
├── destinations.jpg    ← Trang điểm đến
├── blog.jpg            ← Trang blog
├── contact.jpg         ← Trang liên hệ
└── cta.jpg             ← Banner CTA ở trang chủ
```

Khuyến nghị kích thước **1920×1080** hoặc lớn hơn (vì là background full-width).

---

## 5. Avatar khách hàng (`avatars/`)

Tự do. Hiện tại testimonials dùng `i.pravatar.cc` — nếu muốn thay, sửa trực tiếp trong `src/data/blogs.js`.

---

## Cách hoạt động

- `src/utils/images.js` dùng [`import.meta.glob`](https://vite.dev/guide/features.html#glob-import) của Vite để **tự động quét** các thư mục trên khi build/dev.
- Khi bạn thêm/xoá ảnh, Vite sẽ HMR (hot reload) ngay — không cần restart.
- Nếu một tour/điểm đến/blog **không có ảnh** trong thư mục tương ứng, app sẽ **dùng ảnh Unsplash mặc định** (đã set sẵn trong mock data).
- Ảnh sẽ được Vite tối ưu (hash filename, cache busting...) khi build production.

---

## FAQ

**Q: Tôi muốn dùng URL ảnh online (không phải file local)?**
A: Edit trực tiếp trong `src/data/mockTours.js` (trường `images`), `src/data/destinations.js` (trường `image`), hoặc `src/data/blogs.js` (trường `image`). Hoặc dùng `src/data/imageRegistry.js` (xem dưới) để override mà không sửa mock data gốc.

**Q: Tôi muốn ép thứ tự ảnh trong tour?**
A: Đặt tên file bắt đầu bằng số: `01-cover.jpg`, `02-...jpg`. Sort sẽ theo alphabetic nên số nhỏ đứng trước.

**Q: Có cần restart dev server khi thêm ảnh?**
A: Không. Vite sẽ tự reload. Nếu không thấy ảnh cập nhật, hard refresh trình duyệt (Ctrl+Shift+R).

**Q: Build bị fail vì ảnh quá lớn?**
A: Resize/compress ảnh xuống ≤ 1 MB (khuyến nghị ≤ 500 KB). Có thể dùng [squoosh.app](https://squoosh.app) hoặc [tinypng.com](https://tinypng.com).
