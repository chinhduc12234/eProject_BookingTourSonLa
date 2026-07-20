-- Dữ liệu mẫu cho màn hình quản trị.
-- Có thể chạy lại nhiều lần: các bản ghi đã có sẽ được bỏ qua.
SET NAMES utf8mb4;

-- 10 nhân viên mẫu. Mật khẩu của tất cả tài khoản: 123456
INSERT IGNORE INTO users
    (role_id, full_name, email, phone, password, gender, date_of_birth, address, is_active)
SELECT r.id, s.full_name, s.email, s.phone, s.password, s.gender, s.date_of_birth, s.address, 1
FROM roles r
JOIN (
    SELECT 'Nguyễn Minh Anh' AS full_name, 'nhanvien01@taybactravel.test' AS email, '0981000001' AS phone,
           '$2a$10$mXlQoYJag6ZFW/DJY1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.' AS password, 'FEMALE' AS gender,
           '1995-03-12' AS date_of_birth, 'Thành phố Sơn La, tỉnh Sơn La' AS address
    UNION ALL SELECT 'Trần Hoàng Nam', 'nhanvien02@taybactravel.test', '0981000002', '$2a$10$mXlQoYJag6ZFW/DJY1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.', 'MALE', '1992-07-25', 'Thành phố Điện Biên Phủ, tỉnh Điện Biên'
    UNION ALL SELECT 'Lê Thu Hà', 'nhanvien03@taybactravel.test', '0981000003', '$2a$10$mXlQoYJag6ZFW/DJY1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.', 'FEMALE', '1997-11-08', 'Thành phố Lai Châu, tỉnh Lai Châu'
    UNION ALL SELECT 'Phạm Đức Long', 'nhanvien04@taybactravel.test', '0981000004', '$2a$10$mXlQoYJag6ZFW/DJY1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.', 'MALE', '1990-01-19', 'Thành phố Lào Cai, tỉnh Lào Cai'
    UNION ALL SELECT 'Vũ Ngọc Mai', 'nhanvien05@taybactravel.test', '0981000005', '$2a$10$mXlQoYJag6ZFW/DJY1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.', 'FEMALE', '1996-05-30', 'Thành phố Hòa Bình, tỉnh Hòa Bình'
    UNION ALL SELECT 'Đỗ Quang Huy', 'nhanvien06@taybactravel.test', '0981000006', '$2a$10$mXlQoYJag6ZFW/DJY1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.', 'MALE', '1993-09-14', 'Thành phố Hà Giang, tỉnh Hà Giang'
    UNION ALL SELECT 'Bùi Khánh Linh', 'nhanvien07@taybactravel.test', '0981000007', '$2a$10$mXlQoYJag6ZFW/DJY1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.', 'FEMALE', '1998-02-21', 'Thành phố Cao Bằng, tỉnh Cao Bằng'
    UNION ALL SELECT 'Ngô Tuấn Kiệt', 'nhanvien08@taybactravel.test', '0981000008', '$2a$10$mXlQoYJag6ZFW/DJY1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.', 'MALE', '1991-12-03', 'Thành phố Bắc Kạn, tỉnh Bắc Kạn'
    UNION ALL SELECT 'Đặng Thanh Vân', 'nhanvien09@taybactravel.test', '0981000009', '$2a$10$mXlQoYJag6ZFW/DJY1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.', 'FEMALE', '1994-06-17', 'Thành phố Tuyên Quang, tỉnh Tuyên Quang'
    UNION ALL SELECT 'Hồ Gia Bảo', 'nhanvien10@taybactravel.test', '0981000010', '$2a$10$mXlQoYJag6ZFW/DJY1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.', 'MALE', '1996-10-27', 'Thành phố Việt Trì, tỉnh Phú Thọ'
) s ON r.name = 'EMPLOYEE';

-- 10 tỉnh mẫu thuộc khu vực Tây Bắc và miền núi phía Bắc.
INSERT INTO provinces (name, is_deleted)
SELECT s.name, 0
FROM (
    SELECT 'Lai Châu' AS name
    UNION ALL SELECT 'Điện Biên'
    UNION ALL SELECT 'Lào Cai'
    UNION ALL SELECT 'Hòa Bình'
    UNION ALL SELECT 'Yên Bái'
    UNION ALL SELECT 'Hà Giang'
    UNION ALL SELECT 'Cao Bằng'
    UNION ALL SELECT 'Bắc Kạn'
    UNION ALL SELECT 'Tuyên Quang'
    UNION ALL SELECT 'Phú Thọ'
) s
WHERE NOT EXISTS (
    SELECT 1 FROM provinces p WHERE p.name = s.name AND COALESCE(p.is_deleted, 0) = 0
);

-- 10 quận/huyện mẫu, mỗi tỉnh một quận/huyện để bảo đảm đúng quan hệ dữ liệu.
INSERT INTO districts (province_id, name, is_deleted)
SELECT p.id, s.district_name, 0
FROM (
    SELECT 'Lai Châu' AS province_name, 'Huyện Tam Đường' AS district_name
    UNION ALL SELECT 'Điện Biên', 'Huyện Mường Nhé'
    UNION ALL SELECT 'Lào Cai', 'Thị xã Sa Pa'
    UNION ALL SELECT 'Hòa Bình', 'Huyện Mai Châu'
    UNION ALL SELECT 'Yên Bái', 'Huyện Mù Cang Chải'
    UNION ALL SELECT 'Hà Giang', 'Huyện Đồng Văn'
    UNION ALL SELECT 'Cao Bằng', 'Huyện Trùng Khánh'
    UNION ALL SELECT 'Bắc Kạn', 'Huyện Ba Bể'
    UNION ALL SELECT 'Tuyên Quang', 'Huyện Na Hang'
    UNION ALL SELECT 'Phú Thọ', 'Huyện Thanh Sơn'
) s
JOIN provinces p ON p.name = s.province_name AND COALESCE(p.is_deleted, 0) = 0
WHERE NOT EXISTS (
    SELECT 1
    FROM districts d
    WHERE d.province_id = p.id
      AND d.name = s.district_name
      AND COALESCE(d.is_deleted, 0) = 0
);

-- 10 địa điểm mẫu, mỗi quận/huyện một địa điểm.
INSERT INTO locations
    (district_id, name, description, address, latitude, longitude, is_active)
SELECT d.id, s.location_name, s.description, s.address, s.latitude, s.longitude, 1
FROM (
    SELECT 'Huyện Tam Đường' AS district_name, 'Đồi chè Tân Uyên' AS location_name,
           'Điểm tham quan thiên nhiên và trải nghiệm văn hóa vùng cao.' AS description,
           'Xã Tả Lèng, huyện Tam Đường, tỉnh Lai Châu' AS address, 22.3521000 AS latitude, 103.5730000 AS longitude
    UNION ALL SELECT 'Huyện Mường Nhé', 'Cực Tây A Pa Chải', 'Điểm check-in biên giới và cung đường trekking Tây Bắc.', 'Xã Sín Thầu, huyện Mường Nhé, tỉnh Điện Biên', 22.3579000, 102.1436000
    UNION ALL SELECT 'Thị xã Sa Pa', 'Bản Cát Cát', 'Bản làng người H’Mông với ruộng bậc thang và thác nước.', 'Xã Hoàng Liên, thị xã Sa Pa, tỉnh Lào Cai', 22.3247000, 103.9004000
    UNION ALL SELECT 'Huyện Mai Châu', 'Bản Lác Mai Châu', 'Không gian homestay, ẩm thực và văn hóa cộng đồng Thái.', 'Xã Chiềng Châu, huyện Mai Châu, tỉnh Hòa Bình', 20.6613000, 105.0712000
    UNION ALL SELECT 'Huyện Mù Cang Chải', 'Đèo Khau Phạ', 'Một trong những cung đường ngắm ruộng bậc thang nổi bật của Tây Bắc.', 'Quốc lộ 32, huyện Mù Cang Chải, tỉnh Yên Bái', 21.7686000, 104.3078000
    UNION ALL SELECT 'Huyện Đồng Văn', 'Phố cổ Đồng Văn', 'Khu phố cổ và chợ phiên mang đậm bản sắc cao nguyên đá.', 'Thị trấn Đồng Văn, huyện Đồng Văn, tỉnh Hà Giang', 23.2773000, 105.3589000
    UNION ALL SELECT 'Huyện Trùng Khánh', 'Thác Bản Giốc', 'Thác nước nổi tiếng nằm trên tuyến du lịch phía Bắc.', 'Xã Đàm Thủy, huyện Trùng Khánh, tỉnh Cao Bằng', 22.8535000, 106.7248000
    UNION ALL SELECT 'Huyện Ba Bể', 'Hồ Ba Bể', 'Hồ nước ngọt tự nhiên, phù hợp tham quan sinh thái và chèo thuyền.', 'Xã Nam Mẫu, huyện Ba Bể, tỉnh Bắc Kạn', 22.2427000, 105.6087000
    UNION ALL SELECT 'Huyện Na Hang', 'Khu du lịch sinh thái Na Hang', 'Lòng hồ, núi đá và cảnh quan sinh thái đặc trưng miền núi phía Bắc.', 'Thị trấn Na Hang, huyện Na Hang, tỉnh Tuyên Quang', 22.3546000, 105.3826000
    UNION ALL SELECT 'Huyện Thanh Sơn', 'Vườn quốc gia Xuân Sơn', 'Điểm du lịch sinh thái với rừng nguyên sinh, hang động và bản làng.', 'Xã Xuân Sơn, huyện Thanh Sơn, tỉnh Phú Thọ', 21.1076000, 104.9561000
) s
JOIN districts d ON d.name = s.district_name AND COALESCE(d.is_deleted, 0) = 0
WHERE NOT EXISTS (
    SELECT 1 FROM locations l WHERE l.district_id = d.id AND l.name = s.location_name AND l.deleted_at IS NULL
);
