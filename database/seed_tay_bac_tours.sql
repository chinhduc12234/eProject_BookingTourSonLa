-- Seed 5 tour Tây Bắc hoàn chỉnh cho môi trường local.
-- Nội dung tuyến điểm tham khảo từ các nguồn đã kiểm tra:
--   https://www.vietnam.travel/things-to-do/why-fansipan-must-do-sapa
--   https://vietnamtourism.gov.vn/en/post/20746
--   https://svhttdl.dienbien.gov.vn/portal/pages/2026-07-15/Cot-co-A-Pa-Chai-duoc-cong-nhan-diem-du-lich.aspx
--   https://dienbien.gov.vn/en/bai-viet/A-Pa-Chai-Long-Phu-border-gatebf8rlf
--   https://quyhoach.xaydung.gov.vn/vn/quy-hoach/10047/quy-hoach-phan-khu-xay-dung-do-thi-du-lich-y-ty--huyen-bat-xat--tinh-lao-cai.aspx
--   https://dulichdaiphong.vn/du-lich-moc-chau-3-ngay-2-dem/
--   https://phetravel.com/tour-sapa-3-ngay-2-dem-cat-cat-ham-rong-fansipan
--   https://thesinhcafetourist.com.vn/tour-a-pa-chai-dien-bien-4n3d/
-- Ảnh local lấy từ Wikimedia Commons/ảnh hiện có trong project; xem đường dẫn nguồn ở trên khi cần thay ảnh bản quyền.

SET NAMES utf8mb4;
START TRANSACTION;

-- 1. Hà Nội - Mộc Châu: đồi chè, Dải Yếm, Nà Ka, Bản Áng
INSERT INTO tours
  (tour_code, title, slug, thumbnail, short_description, description, included_services, excluded_services,
   duration_days, duration_nights, departure_location, max_people, price, status, created_by)
VALUES
  ('TBMC2026', 'Mộc Châu 3N2Đ - Đồi chè, Dải Yếm và Bản Áng', 'moc-chau-doi-che-dai-yem-ban-ang-3n2d',
   '/uploads/tours/seed-moc-chau.jpg',
   'Khám phá cao nguyên Mộc Châu với đồi chè trái tim, thung lũng mận Nà Ka, thác Dải Yếm và rừng thông Bản Áng.',
   'Hành trình 3 ngày 2 đêm khởi hành từ Hà Nội, đi qua đèo Thung Khe đến cao nguyên Mộc Châu. Du khách tham quan thác Dải Yếm, đồi chè trái tim, thung lũng mận Nà Ka, rừng thông Bản Áng và có thời gian trải nghiệm ẩm thực, sản vật địa phương.',
   'Xe du lịch đời mới; hướng dẫn viên; 2 đêm khách sạn/homestay tiêu chuẩn; 5 bữa chính và 2 bữa sáng; vé Dải Yếm, Bản Áng, Nà Ka; nước uống; bảo hiểm du lịch.',
   'Vé cầu kính Bạch Long và các trò chơi tại Mộc Châu Island; VAT; phòng đơn; đồ uống và chi phí cá nhân; tiền tip cho lái xe và hướng dẫn viên.',
   3, 2, 'Hà Nội', 20, 2960000, 'OPEN', 1)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), title = VALUES(title), thumbnail = VALUES(thumbnail),
  short_description = VALUES(short_description), description = VALUES(description),
  included_services = VALUES(included_services), excluded_services = VALUES(excluded_services),
  duration_days = VALUES(duration_days), duration_nights = VALUES(duration_nights),
  departure_location = VALUES(departure_location), max_people = VALUES(max_people), price = VALUES(price),
  status = VALUES(status), deleted_at = NULL;
SET @tour_id = LAST_INSERT_ID();

INSERT INTO tour_images (tour_id, image_url, is_thumbnail, sort_order)
SELECT @tour_id, '/uploads/tours/seed-moc-chau.jpg', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM tour_images WHERE tour_id = @tour_id AND image_url = '/uploads/tours/seed-moc-chau.jpg');

INSERT INTO tour_days (tour_id, day_number, title, description) VALUES
  (@tour_id, 1, 'Hà Nội - Thung Khe - Mộc Châu', 'Khởi hành theo Quốc lộ 6, ngắm đèo Thung Khe và nhận phòng tại Mộc Châu.'),
  (@tour_id, 2, 'Đồi chè - Nà Ka - Bản Áng', 'Trải nghiệm các điểm đặc trưng của cao nguyên Mộc Châu.'),
  (@tour_id, 3, 'Mộc Châu - Hà Nội', 'Tự chọn trải nghiệm Mộc Châu Island trước khi về Hà Nội.')
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 1;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Hà Nội', '05:30:00', '06:00:00', 'Đón khách tại Hà Nội', 'Xe và hướng dẫn viên đón khách tại điểm hẹn trung tâm Hà Nội.', 1),
  (@day_id, 'Đèo Thung Khe, Hòa Bình', '10:00:00', '10:45:00', 'Ngắm đèo Thung Khe', 'Dừng nghỉ, chụp ảnh đèo Đá Trắng và thưởng thức nông sản vùng cao.', 2),
  (@day_id, 'Thác Dải Yếm, Mộc Châu', '15:00:00', '16:30:00', 'Tham quan thác Dải Yếm', 'Khám phá thác nước nổi tiếng của Mộc Châu và khu vực cầu kính Tình Yêu.', 3),
  (@day_id, 'Mộc Châu', '19:00:00', '21:00:00', 'Bữa tối đặc sản Tây Bắc', 'Thưởng thức bê chao, cá suối, cải mèo và nghỉ đêm tại Mộc Châu.', 4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 2;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Đồi chè trái tim, Mộc Châu', '08:00:00', '09:30:00', 'Tham quan đồi chè', 'Tìm hiểu vùng chè và chụp ảnh giữa những luống chè uốn lượn.', 1),
  (@day_id, 'Thung lũng mận Nà Ka', '09:45:00', '11:30:00', 'Khám phá thung lũng Nà Ka', 'Tham quan vườn mận; trải nghiệm hái mận theo mùa.', 2),
  (@day_id, 'Rừng thông Bản Áng', '14:00:00', '16:30:00', 'Dạo rừng thông và hồ Bản Áng', 'Đi bộ nhẹ quanh hồ, tìm hiểu không gian văn hóa bản địa.', 3),
  (@day_id, 'Mộc Châu', '19:00:00', '20:30:00', 'Tự do khám phá phố núi', 'Tự do thưởng thức đặc sản và mua sữa, trà, mận Mộc Châu.', 4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 3;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Mộc Châu Island', '08:00:00', '10:30:00', 'Tự chọn Mộc Châu Island', 'Có thể mua vé riêng để tham quan cầu kính Bạch Long và Hang Chim Thần.', 1),
  (@day_id, 'Mộc Châu', '11:00:00', '12:00:00', 'Mua đặc sản địa phương', 'Mua trà, sữa, mận và sản vật vùng cao.', 2),
  (@day_id, 'Hà Nội', '13:00:00', '18:30:00', 'Trở về Hà Nội', 'Khởi hành về Hà Nội, kết thúc tour.', 3);

INSERT INTO tour_departures
  (tour_id, departure_date, booking_deadline, departure_time, max_people, current_people, reserved_people, adult_price, child_price, is_private_departure, status)
VALUES
  (@tour_id, '2026-08-15', '2026-08-12 17:00:00', '05:30:00', 20, 0, 0, 2960000, 2220000, 0, 'OPEN'),
  (@tour_id, '2026-09-12', '2026-09-09 17:00:00', '05:30:00', 20, 0, 0, 2960000, 2220000, 0, 'OPEN')
ON DUPLICATE KEY UPDATE booking_deadline = VALUES(booking_deadline), departure_time = VALUES(departure_time),
  max_people = VALUES(max_people), adult_price = VALUES(adult_price), child_price = VALUES(child_price),
  is_private_departure = VALUES(is_private_departure), status = VALUES(status), deleted_at = NULL;

-- 2. Sa Pa - Fansipan: Cát Cát, Mường Hoa, Fansipan
INSERT INTO tours
  (tour_code, title, slug, thumbnail, short_description, description, included_services, excluded_services,
   duration_days, duration_nights, departure_location, max_people, price, status, created_by)
VALUES
  ('TBSP2026', 'Sa Pa 3N2Đ - Cát Cát, Mường Hoa và Fansipan', 'sa-pa-cat-cat-muong-hoa-fansipan-3n2d',
   '/uploads/tours/seed-sa-pa.jpg',
   'Hành trình đến thị trấn sương mù, bản Cát Cát, thung lũng Mường Hoa và đỉnh Fansipan.',
   'Tour Sa Pa 3 ngày 2 đêm khởi hành từ Hà Nội, kết hợp trải nghiệm văn hóa H’Mông ở bản Cát Cát, ngắm ruộng bậc thang Mường Hoa và đi cáp treo lên Fansipan - đỉnh cao nhất Việt Nam.',
   'Xe limousine Hà Nội - Sa Pa khứ hồi; hướng dẫn viên; 2 đêm khách sạn tiêu chuẩn; 5 bữa chính và 2 bữa sáng; vé bản Cát Cát; vé tàu leo núi Mường Hoa; bảo hiểm và nước uống.',
   'Vé cáp treo Fansipan; phòng đơn; VAT; đồ uống; chi phí cá nhân và các dịch vụ ngoài chương trình.',
   3, 2, 'Hà Nội', 20, 3250000, 'OPEN', 1)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), title = VALUES(title), thumbnail = VALUES(thumbnail),
  short_description = VALUES(short_description), description = VALUES(description),
  included_services = VALUES(included_services), excluded_services = VALUES(excluded_services),
  duration_days = VALUES(duration_days), duration_nights = VALUES(duration_nights),
  departure_location = VALUES(departure_location), max_people = VALUES(max_people), price = VALUES(price),
  status = VALUES(status), deleted_at = NULL;
SET @tour_id = LAST_INSERT_ID();
INSERT INTO tour_images (tour_id, image_url, is_thumbnail, sort_order)
SELECT @tour_id, '/uploads/tours/seed-sa-pa.jpg', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM tour_images WHERE tour_id = @tour_id AND image_url = '/uploads/tours/seed-sa-pa.jpg');
INSERT INTO tour_days (tour_id, day_number, title, description) VALUES
  (@tour_id, 1, 'Hà Nội - Sa Pa - Cát Cát', 'Di chuyển cao tốc đến Sa Pa, tham quan bản Cát Cát và trung tâm thị trấn.'),
  (@tour_id, 2, 'Fansipan - Mường Hoa', 'Chinh phục nóc nhà Đông Dương bằng hệ thống tàu và cáp treo.'),
  (@tour_id, 3, 'Lao Chải - Tả Van - Hà Nội', 'Trekking nhẹ trong thung lũng Mường Hoa và trở về Hà Nội.')
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 1;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Hà Nội', '06:30:00', '07:00:00', 'Đón khách tại Hà Nội', 'Khởi hành đi Sa Pa bằng xe limousine.', 1),
  (@day_id, 'Sa Pa', '12:30:00', '13:30:00', 'Ăn trưa và nhận phòng', 'Dùng bữa trưa, nhận phòng và nghỉ ngơi.', 2),
  (@day_id, 'Bản Cát Cát', '14:00:00', '17:00:00', 'Khám phá bản Cát Cát', 'Tìm hiểu văn hóa H’Mông, thác Cát Cát và nghề thủ công truyền thống.', 3),
  (@day_id, 'Nhà thờ đá Sa Pa', '19:00:00', '20:30:00', 'Dạo trung tâm Sa Pa', 'Tự do khám phá chợ đêm và ẩm thực phố núi.', 4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 2;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Ga Hoàng Liên', '08:00:00', '09:00:00', 'Tàu leo núi Mường Hoa', 'Đi tàu từ trung tâm Sa Pa, ngắm thung lũng Mường Hoa.', 1),
  (@day_id, 'Fansipan', '09:00:00', '13:00:00', 'Chinh phục Fansipan', 'Mua vé cáp treo riêng để lên đỉnh Fansipan cao 3.143 m và quần thể tâm linh.', 2),
  (@day_id, 'Sa Pa', '14:30:00', '17:00:00', 'Nghỉ ngơi và tự do', 'Tự do cà phê, mua thổ cẩm và đặc sản Sa Pa.', 3);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 3;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Lao Chải - Tả Van', '07:30:00', '11:30:00', 'Trekking thung lũng Mường Hoa', 'Đi bộ cung Lao Chải - Tả Van, ngắm ruộng bậc thang và bản làng người Giáy, Dao.', 1),
  (@day_id, 'Sa Pa', '11:30:00', '13:00:00', 'Ăn trưa và trả phòng', 'Dùng bữa trưa, trả phòng khách sạn.', 2),
  (@day_id, 'Hà Nội', '13:30:00', '20:30:00', 'Trở về Hà Nội', 'Kết thúc hành trình tại Hà Nội.', 3);
INSERT INTO tour_departures
  (tour_id, departure_date, booking_deadline, departure_time, max_people, current_people, reserved_people, adult_price, child_price, is_private_departure, status)
VALUES
  (@tour_id, '2026-08-22', '2026-08-19 17:00:00', '06:30:00', 20, 0, 0, 3250000, 2440000, 0, 'OPEN'),
  (@tour_id, '2026-10-10', '2026-10-07 17:00:00', '06:30:00', 20, 0, 0, 3250000, 2440000, 0, 'OPEN')
ON DUPLICATE KEY UPDATE booking_deadline = VALUES(booking_deadline), departure_time = VALUES(departure_time),
  max_people = VALUES(max_people), adult_price = VALUES(adult_price), child_price = VALUES(child_price),
  is_private_departure = VALUES(is_private_departure), status = VALUES(status), deleted_at = NULL;

-- 3. Tà Xùa: săn mây, Mỏm Cá Heo, Đỉnh Gió, Sống lưng khủng long
INSERT INTO tours
  (tour_code, title, slug, thumbnail, short_description, description, included_services, excluded_services,
   duration_days, duration_nights, departure_location, max_people, price, status, created_by)
VALUES
  ('TBTX2026', 'Tà Xùa 2N1Đ - Săn mây Sống lưng khủng long', 'ta-xua-san-may-song-lung-khung-long-2n1d',
   '/uploads/tours/tour-a0fba59b-5f0c-4001-bacb-39456eee8911.jpg',
   'Săn biển mây Tà Xùa, check-in Mỏm Cá Heo, Cây Cô Đơn và Đỉnh Gió tại Bắc Yên, Sơn La.',
   'Tour 2 ngày 1 đêm theo cung Hà Nội - Phù Yên - Bắc Yên - Tà Xùa, phù hợp người yêu nhiếp ảnh và trekking nhẹ. Lịch trình có thể điều chỉnh theo thời tiết vì biển mây là hiện tượng tự nhiên.',
   'Xe du lịch; hướng dẫn viên địa phương; 1 đêm homestay; 3 bữa chính và 1 bữa sáng; trung chuyển điểm săn mây; bảo hiểm; nước uống.',
   'Phòng đơn; đồ uống; chi phí cá nhân; các hoạt động mạo hiểm ngoài chương trình; phụ phí nếu thời tiết khiến phải đổi điểm.',
   2, 1, 'Hà Nội', 14, 1890000, 'OPEN', 1)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), title = VALUES(title), thumbnail = VALUES(thumbnail),
  short_description = VALUES(short_description), description = VALUES(description),
  included_services = VALUES(included_services), excluded_services = VALUES(excluded_services),
  duration_days = VALUES(duration_days), duration_nights = VALUES(duration_nights),
  departure_location = VALUES(departure_location), max_people = VALUES(max_people), price = VALUES(price),
  status = VALUES(status), deleted_at = NULL;
SET @tour_id = LAST_INSERT_ID();
INSERT INTO tour_images (tour_id, image_url, is_thumbnail, sort_order)
SELECT @tour_id, '/uploads/tours/tour-a0fba59b-5f0c-4001-bacb-39456eee8911.jpg', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM tour_images WHERE tour_id = @tour_id AND image_url = '/uploads/tours/tour-a0fba59b-5f0c-4001-bacb-39456eee8911.jpg');
INSERT INTO tour_days (tour_id, day_number, title, description) VALUES
  (@tour_id, 1, 'Hà Nội - Bắc Yên - Tà Xùa', 'Đi qua Phù Yên, chụp ảnh Mỏm Cá Heo, Cây Cô Đơn và ngắm hoàng hôn Đỉnh Gió.'),
  (@tour_id, 2, 'Săn mây - Hà Nội', 'Dậy sớm săn mây, trải nghiệm Sống lưng khủng long và về Hà Nội.')
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 1;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Hà Nội', '06:00:00', '06:30:00', 'Khởi hành đi Tà Xùa', 'Đón khách tại Hà Nội, đi theo hướng Phù Yên - Bắc Yên.', 1),
  (@day_id, 'Phù Yên', '11:30:00', '12:30:00', 'Ăn trưa đặc sản Tây Bắc', 'Nghỉ ăn trưa tại nhà hàng địa phương.', 2),
  (@day_id, 'Mỏm Cá Heo và Cây Cô Đơn', '14:30:00', '16:30:00', 'Check-in các điểm biểu tượng', 'Ngắm núi rừng và chụp ảnh tại Mỏm Cá Heo, Cây Cô Đơn.', 3),
  (@day_id, 'Đỉnh Gió, Tà Xùa', '17:00:00', '18:00:00', 'Ngắm hoàng hôn trên biển mây', 'Tùy điều kiện thời tiết, ngắm hoàng hôn và nhận phòng homestay.', 4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 2;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Tà Xùa', '05:30:00', '07:30:00', 'Săn mây bình minh', 'Ngắm biển mây tại các điểm cao; hiện tượng phụ thuộc thời tiết thực tế.', 1),
  (@day_id, 'Sống lưng khủng long', '08:00:00', '10:30:00', 'Trekking nhẹ trên sống lưng', 'Đi bộ theo cung ngắm núi; khách cần giày bám và tuân thủ hướng dẫn an toàn.', 2),
  (@day_id, 'Bắc Yên', '11:00:00', '12:00:00', 'Ăn trưa và khởi hành về', 'Trả phòng, dùng bữa trưa và về Hà Nội.', 3),
  (@day_id, 'Hà Nội', '13:00:00', '18:30:00', 'Kết thúc tour', 'Trả khách tại điểm hẹn ở Hà Nội.', 4);
INSERT INTO tour_departures
  (tour_id, departure_date, booking_deadline, departure_time, max_people, current_people, reserved_people, adult_price, child_price, is_private_departure, status)
VALUES
  (@tour_id, '2026-08-08', '2026-08-05 17:00:00', '06:00:00', 14, 0, 0, 1890000, 1420000, 0, 'OPEN'),
  (@tour_id, '2026-09-05', '2026-09-02 17:00:00', '06:00:00', 14, 0, 0, 1890000, 1420000, 0, 'OPEN')
ON DUPLICATE KEY UPDATE booking_deadline = VALUES(booking_deadline), departure_time = VALUES(departure_time),
  max_people = VALUES(max_people), adult_price = VALUES(adult_price), child_price = VALUES(child_price),
  is_private_departure = VALUES(is_private_departure), status = VALUES(status), deleted_at = NULL;

-- 4. Điện Biên - A Pa Chải: lịch sử, đèo Pha Đin, cột cờ cực Tây
INSERT INTO tours
  (tour_code, title, slug, thumbnail, short_description, description, included_services, excluded_services,
   duration_days, duration_nights, departure_location, max_people, price, status, created_by)
VALUES
  ('TBDB2026', 'Điện Biên - A Pa Chải 4N3Đ - Chạm cực Tây Tổ quốc', 'dien-bien-a-pa-chai-cuc-tay-4n3d',
   '/uploads/tours/seed-dien-bien.jpg',
   'Khám phá Điện Biên Phủ, đèo Pha Đin, Mường Nhé, cột cờ A Pa Chải và mốc giao điểm Việt Nam - Lào - Trung Quốc.',
   'Hành trình 4 ngày 3 đêm theo tuyến Hà Nội - Mộc Châu - Điện Biên - Mường Nhé - Sín Thầu - A Pa Chải. Cột cờ A Pa Chải nằm trên dãy Khoan La San ở độ cao 1.459 m, cách mốc giao điểm khoảng 1,3 km. Chuyến đi cần đăng ký và tuân thủ hướng dẫn của lực lượng biên phòng.',
   'Xe du lịch; hướng dẫn viên; 3 đêm khách sạn/homestay; các bữa ăn theo lịch trình; trung chuyển chặng A Pa Chải; phí hướng dẫn địa phương; bảo hiểm; nước uống.',
   'Vé máy bay; phòng đơn; VAT; đồ uống và chi phí cá nhân; chi phí phát sinh do thời tiết; giấy tờ/chi phí ngoài chương trình theo quy định khu vực biên giới.',
   4, 3, 'Hà Nội', 16, 3850000, 'OPEN', 1)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), title = VALUES(title), thumbnail = VALUES(thumbnail),
  short_description = VALUES(short_description), description = VALUES(description),
  included_services = VALUES(included_services), excluded_services = VALUES(excluded_services),
  duration_days = VALUES(duration_days), duration_nights = VALUES(duration_nights),
  departure_location = VALUES(departure_location), max_people = VALUES(max_people), price = VALUES(price),
  status = VALUES(status), deleted_at = NULL;
SET @tour_id = LAST_INSERT_ID();
INSERT INTO tour_images (tour_id, image_url, is_thumbnail, sort_order)
SELECT @tour_id, '/uploads/tours/seed-dien-bien.jpg', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM tour_images WHERE tour_id = @tour_id AND image_url = '/uploads/tours/seed-dien-bien.jpg');
INSERT INTO tour_days (tour_id, day_number, title, description) VALUES
  (@tour_id, 1, 'Hà Nội - Mộc Châu - Điện Biên', 'Đi qua Thung Khe, Mộc Châu và đèo Pha Đin đến thành phố Điện Biên Phủ.'),
  (@tour_id, 2, 'Điện Biên Phủ - Mường Phăng', 'Thăm các di tích chiến trường và Sở chỉ huy chiến dịch Điện Biên Phủ.'),
  (@tour_id, 3, 'Mường Nhé - Sín Thầu - A Pa Chải', 'Di chuyển đến vùng cực Tây, làm thủ tục và chinh phục cột cờ, mốc giao điểm.'),
  (@tour_id, 4, 'A Pa Chải - Hà Nội', 'Rời vùng biên, trở về Hà Nội theo cung Pha Đin - Tuần Giáo.')
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 1;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Hà Nội', '06:00:00', '06:30:00', 'Khởi hành đi Điện Biên', 'Đón khách và đi theo tuyến Tây Bắc.', 1),
  (@day_id, 'Đèo Thung Khe', '09:00:00', '09:45:00', 'Dừng chân Thung Khe', 'Ngắm thung lũng Mai Châu từ đèo Đá Trắng.', 2),
  (@day_id, 'Đèo Pha Đin', '15:00:00', '15:45:00', 'Chinh phục đèo Pha Đin', 'Dừng chụp ảnh tại một trong tứ đại đỉnh đèo miền Bắc.', 3),
  (@day_id, 'Điện Biên Phủ', '18:00:00', '20:00:00', 'Nhận phòng và ăn tối', 'Nghỉ đêm tại thành phố Điện Biên Phủ.', 4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 2;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Bảo tàng Chiến thắng Điện Biên Phủ', '08:00:00', '09:30:00', 'Thăm bảo tàng', 'Tìm hiểu tư liệu và hiện vật của Chiến dịch Điện Biên Phủ.', 1),
  (@day_id, 'Đồi A1 và Hầm Đờ Cát', '09:45:00', '11:30:00', 'Thăm di tích chiến trường', 'Tham quan đồi A1 và các điểm di tích trung tâm.', 2),
  (@day_id, 'Mường Phăng', '14:00:00', '16:30:00', 'Sở chỉ huy chiến dịch', 'Thăm khu di tích Sở chỉ huy Chiến dịch Điện Biên Phủ.', 3),
  (@day_id, 'Điện Biên Phủ', '19:00:00', '20:30:00', 'Tự do buổi tối', 'Thưởng thức ẩm thực và nghỉ ngơi.', 4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 3;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Mường Nhé', '05:30:00', '11:30:00', 'Đến vùng cực Tây', 'Di chuyển sớm qua cung đường biên giới và dùng bữa trưa tại Mường Nhé.', 1),
  (@day_id, 'Đồn Biên phòng A Pa Chải', '12:30:00', '13:30:00', 'Phổ biến quy định biên giới', 'Làm thủ tục, nghe hướng dẫn an toàn trước khi lên cột cờ.', 2),
  (@day_id, 'Cột cờ A Pa Chải', '14:00:00', '17:00:00', 'Chạm cực Tây Tổ quốc', 'Tham quan cột cờ và mốc giao điểm ba nước theo quy định địa phương.', 3),
  (@day_id, 'Mường Nhé', '18:30:00', '20:00:00', 'Nghỉ đêm vùng biên', 'Dùng bữa tối và nghỉ tại Mường Nhé.', 4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 4;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Mường Nhé', '05:30:00', '06:30:00', 'Ăn sáng và trả phòng', 'Chuẩn bị hành lý, khởi hành về Hà Nội.', 1),
  (@day_id, 'Tuần Giáo - Pha Đin', '11:30:00', '13:30:00', 'Ăn trưa trên đường về', 'Nghỉ trưa và dùng bữa tại nhà hàng địa phương.', 2),
  (@day_id, 'Hà Nội', '14:00:00', '20:30:00', 'Kết thúc hành trình', 'Về đến Hà Nội, trả khách tại điểm hẹn.', 3);
INSERT INTO tour_departures
  (tour_id, departure_date, booking_deadline, departure_time, max_people, current_people, reserved_people, adult_price, child_price, is_private_departure, status)
VALUES
  (@tour_id, '2026-09-18', '2026-09-13 17:00:00', '06:00:00', 16, 0, 0, 3850000, 2890000, 0, 'OPEN'),
  (@tour_id, '2026-11-06', '2026-11-01 17:00:00', '06:00:00', 16, 0, 0, 3850000, 2890000, 0, 'OPEN')
ON DUPLICATE KEY UPDATE booking_deadline = VALUES(booking_deadline), departure_time = VALUES(departure_time),
  max_people = VALUES(max_people), adult_price = VALUES(adult_price), child_price = VALUES(child_price),
  is_private_departure = VALUES(is_private_departure), status = VALUES(status), deleted_at = NULL;

-- 5. Y Tý - Bát Xát: ruộng bậc thang Thề Pả, bản Choản Thèn, Mường Hum
INSERT INTO tours
  (tour_code, title, slug, thumbnail, short_description, description, included_services, excluded_services,
   duration_days, duration_nights, departure_location, max_people, price, status, created_by)
VALUES
  ('TBYT2026', 'Y Tý - Bát Xát 3N2Đ - Ruộng bậc thang và bản Hà Nhì', 'y-ty-bat-xat-ruong-bac-thang-ban-ha-nhi-3n2d',
   '/uploads/tours/tour-c168717b-4149-4043-b3b1-454b54123d87.jpg',
   'Đến Y Tý ở độ cao vùng biên, ngắm ruộng bậc thang Thề Pả, săn mây và trải nghiệm văn hóa Hà Nhì.',
   'Hành trình 3 ngày 2 đêm đi từ Hà Nội qua Lào Cai, Mường Hum và Bát Xát đến Y Tý. Du khách trekking bản Choản Thèn, ngắm ruộng bậc thang Thề Pả, ghé Cầu Thiên Sinh và tìm hiểu nhà trình tường, đời sống của cộng đồng Hà Nhì vùng biên.',
   'Xe du lịch; hướng dẫn viên địa phương; 2 đêm homestay; bữa ăn theo lịch trình; trekking bản làng; bảo hiểm; nước uống.',
   'Phòng đơn; VAT; đồ uống; chi phí cá nhân; xe máy/xe ôm địa phương ngoài chương trình; chi phí phát sinh do đường biên giới và thời tiết.',
   3, 2, 'Hà Nội', 14, 3490000, 'OPEN', 1)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), title = VALUES(title), thumbnail = VALUES(thumbnail),
  short_description = VALUES(short_description), description = VALUES(description),
  included_services = VALUES(included_services), excluded_services = VALUES(excluded_services),
  duration_days = VALUES(duration_days), duration_nights = VALUES(duration_nights),
  departure_location = VALUES(departure_location), max_people = VALUES(max_people), price = VALUES(price),
  status = VALUES(status), deleted_at = NULL;
SET @tour_id = LAST_INSERT_ID();
INSERT INTO tour_images (tour_id, image_url, is_thumbnail, sort_order)
SELECT @tour_id, '/uploads/tours/tour-c168717b-4149-4043-b3b1-454b54123d87.jpg', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM tour_images WHERE tour_id = @tour_id AND image_url = '/uploads/tours/tour-c168717b-4149-4043-b3b1-454b54123d87.jpg');
INSERT INTO tour_days (tour_id, day_number, title, description) VALUES
  (@tour_id, 1, 'Hà Nội - Lào Cai - Mường Hum - Y Tý', 'Theo cao tốc Hà Nội - Lào Cai, qua Mường Hum và lên Y Tý vùng biên.'),
  (@tour_id, 2, 'Y Tý - Choản Thèn - Thề Pả', 'Trekking bản Hà Nhì, ngắm ruộng bậc thang và săn mây tùy thời tiết.'),
  (@tour_id, 3, 'Y Tý - Bát Xát - Hà Nội', 'Thăm các điểm vùng cao trên đường xuống và trở về Hà Nội.')
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 1;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Hà Nội', '05:30:00', '06:00:00', 'Khởi hành đi Y Tý', 'Đón khách tại Hà Nội, đi cao tốc Nội Bài - Lào Cai.', 1),
  (@day_id, 'Mường Hum, Bát Xát', '11:30:00', '13:00:00', 'Ăn trưa vùng cao', 'Nghỉ trưa và thưởng thức món địa phương.', 2),
  (@day_id, 'Y Tý', '15:00:00', '17:00:00', 'Nhận phòng và ngắm mây', 'Lên Y Tý, nhận phòng homestay và ngắm cảnh vùng núi.', 3),
  (@day_id, 'Y Tý', '19:00:00', '20:30:00', 'Bữa tối Hà Nhì', 'Thưởng thức bữa tối tại homestay, nghỉ đêm Y Tý.', 4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 2;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'Bản Choản Thèn', '07:30:00', '09:30:00', 'Khám phá bản Hà Nhì', 'Tìm hiểu nhà trình tường, văn hóa và đời sống cộng đồng địa phương.', 1),
  (@day_id, 'Thung lũng Thề Pả', '09:45:00', '12:00:00', 'Ngắm ruộng bậc thang', 'Trekking nhẹ qua ruộng bậc thang được công nhận là danh thắng cấp quốc gia.', 2),
  (@day_id, 'Cầu Thiên Sinh', '14:00:00', '15:30:00', 'Thăm điểm biên giới', 'Tham quan khu vực Cầu Thiên Sinh theo hướng dẫn địa phương.', 3),
  (@day_id, 'Ngải Thầu Thượng', '16:00:00', '18:00:00', 'Săn mây hoàng hôn', 'Ngắm mây và núi rừng từ điểm cao; phụ thuộc điều kiện thời tiết.', 4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id = @tour_id AND day_number = 3;
INSERT INTO tour_activities (tour_day_id, location_name, start_time, end_time, title, description, sort_order) VALUES
  (@day_id, 'A Lù - Bát Xát', '07:00:00', '10:00:00', 'Cung đường ruộng bậc thang', 'Dừng chụp ảnh tại các cung đường vùng cao và ruộng bậc thang.', 1),
  (@day_id, 'Bát Xát', '10:30:00', '12:00:00', 'Ăn trưa và trả phòng', 'Dùng bữa trưa, mua đặc sản và trả phòng.', 2),
  (@day_id, 'Hà Nội', '13:00:00', '20:30:00', 'Trở về Hà Nội', 'Kết thúc hành trình tại Hà Nội.', 3);
INSERT INTO tour_departures
  (tour_id, departure_date, booking_deadline, departure_time, max_people, current_people, reserved_people, adult_price, child_price, is_private_departure, status)
VALUES
  (@tour_id, '2026-08-29', '2026-08-25 17:00:00', '05:30:00', 14, 0, 0, 3490000, 2620000, 0, 'OPEN'),
  (@tour_id, '2026-10-24', '2026-10-20 17:00:00', '05:30:00', 14, 0, 0, 3490000, 2620000, 0, 'OPEN')
ON DUPLICATE KEY UPDATE booking_deadline = VALUES(booking_deadline), departure_time = VALUES(departure_time),
  max_people = VALUES(max_people), adult_price = VALUES(adult_price), child_price = VALUES(child_price),
  is_private_departure = VALUES(is_private_departure), status = VALUES(status), deleted_at = NULL;

COMMIT;
