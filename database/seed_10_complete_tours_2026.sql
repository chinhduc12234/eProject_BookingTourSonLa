-- Hoàn thiện 10 tour TOUR0001..TOUR0010 đang có trong database local.
-- Ngày dữ liệu: 24/07/2026 (Asia/Ho_Chi_Minh).
-- Ảnh thật được lưu tại backend/uploads/tours/seed-2026; nguồn và giấy phép:
-- database/TOUR_IMAGE_SOURCES.md.
--
-- Script có chủ đích thay toàn bộ gallery, lịch trình và đợt khởi hành của
-- đúng 10 tour trên. Tại thời điểm tạo script, các tour này chưa có booking.

SET NAMES utf8mb4;
START TRANSACTION;

-- Xóa dữ liệu chi tiết còn dang dở của wizard. tour_activities tự xóa theo tour_days.
DELETE ti
FROM tour_images ti
JOIN tours t ON t.id = ti.tour_id
WHERE t.tour_code IN (
  'TOUR0001','TOUR0002','TOUR0003','TOUR0004','TOUR0005',
  'TOUR0006','TOUR0007','TOUR0008','TOUR0009','TOUR0010'
);

DELETE td
FROM tour_days td
JOIN tours t ON t.id = td.tour_id
WHERE t.tour_code IN (
  'TOUR0001','TOUR0002','TOUR0003','TOUR0004','TOUR0005',
  'TOUR0006','TOUR0007','TOUR0008','TOUR0009','TOUR0010'
);

DELETE dep
FROM tour_departures dep
JOIN tours t ON t.id = dep.tour_id
WHERE t.tour_code IN (
  'TOUR0001','TOUR0002','TOUR0003','TOUR0004','TOUR0005',
  'TOUR0006','TOUR0007','TOUR0008','TOUR0009','TOUR0010'
);

-- ---------------------------------------------------------------------------
-- TOUR0001 - Mộc Châu 3 ngày 2 đêm
-- ---------------------------------------------------------------------------
UPDATE tours SET
  title = 'Mộc Châu 3N2Đ - Đồi chè, Dải Yếm và Bản Áng',
  slug = 'moc-chau-doi-che-dai-yem-ban-ang-3n2d',
  thumbnail = '/uploads/tours/seed-2026/tour-01-moc-chau-tea.jpg',
  short_description = 'Khám phá cao nguyên Mộc Châu với đồi chè xanh, thác Dải Yếm, thung lũng Nà Ka và rừng thông Bản Áng.',
  description = 'Hành trình 3 ngày 2 đêm từ Hà Nội theo Quốc lộ 6 đến cao nguyên Mộc Châu. Tour kết hợp cảnh quan đồi chè, thác Dải Yếm, không gian nông nghiệp Nà Ka, rừng thông Bản Áng và trải nghiệm ẩm thực, văn hóa cộng đồng địa phương. Thứ tự điểm tham quan có thể đổi theo thời tiết nhưng vẫn bảo đảm đủ chương trình.',
  included_services = 'Xe du lịch khứ hồi; hướng dẫn viên; 2 đêm khách sạn hoặc homestay tiêu chuẩn; 2 bữa sáng và 5 bữa chính; vé thác Dải Yếm, Bản Áng và các điểm có trong chương trình; nước uống; bảo hiểm du lịch.',
  excluded_services = 'Vé cầu kính Bạch Long và trò chơi tự chọn; phòng đơn; VAT; đồ uống gọi riêng; chi phí cá nhân; tiền tip.',
  duration_days = 3, duration_nights = 2, departure_location = 'Hà Nội',
  max_people = 20, price = 2960000, status = 'OPEN', deleted_at = NULL
WHERE tour_code = 'TOUR0001';
SELECT id INTO @tour_id FROM tours WHERE tour_code = 'TOUR0001';
INSERT INTO tour_images (tour_id,image_url,is_thumbnail,sort_order) VALUES
  (@tour_id,'/uploads/tours/seed-2026/tour-01-moc-chau-tea.jpg',1,0),
  (@tour_id,'/uploads/tours/seed-2026/tour-01-dai-yem.jpg',0,1),
  (@tour_id,'/uploads/tours/seed-2026/tour-01-nha-san.jpg',0,2);
INSERT INTO tour_days (tour_id,day_number,title,description) VALUES
  (@tour_id,1,'Hà Nội - Thung Khe - thác Dải Yếm','Di chuyển theo Quốc lộ 6, dừng ở đèo Thung Khe và tham quan thác Dải Yếm.'),
  (@tour_id,2,'Đồi chè - Nà Ka - rừng thông Bản Áng','Một ngày khám phá cảnh quan nông nghiệp và không gian văn hóa Mộc Châu.'),
  (@tour_id,3,'Mộc Châu - Hà Nội','Tham quan, mua đặc sản địa phương và trở về Hà Nội.');
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=1;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Hà Nội','05:30','06:00','Đón khách','Xe và hướng dẫn viên đón khách tại điểm hẹn trung tâm Hà Nội.',1),
  (@day_id,'Đèo Thung Khe, Hòa Bình','09:30','10:15','Dừng chân Thung Khe','Ngắm thung lũng Mai Châu, nghỉ giải lao và chụp ảnh cung đường Tây Bắc.',2),
  (@day_id,'Thác Dải Yếm, Mộc Châu','14:30','16:30','Tham quan thác Dải Yếm','Đi bộ trong khu danh thắng, ngắm thác và tìm hiểu câu chuyện địa phương.',3),
  (@day_id,'Mộc Châu','18:30','20:30','Nhận phòng và ăn tối','Dùng bữa với món vùng cao, nghỉ đêm tại Mộc Châu.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=2;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Đồi chè Mộc Châu','07:30','09:30','Dạo đồi chè','Tìm hiểu vùng nguyên liệu chè và chụp ảnh giữa các luống chè.',1),
  (@day_id,'Thung lũng Nà Ka','09:45','11:30','Khám phá Nà Ka','Tham quan thung lũng và vườn cây theo mùa; hoạt động hái quả chỉ thực hiện khi nhà vườn cho phép.',2),
  (@day_id,'Rừng thông Bản Áng','14:00','16:30','Đi bộ quanh hồ Bản Áng','Tản bộ dưới rừng thông, tham quan bản và không gian sinh hoạt cộng đồng.',3),
  (@day_id,'Mộc Châu','19:00','20:30','Tự do phố núi','Thưởng thức đặc sản và mua sản phẩm chè, sữa tại khu trung tâm.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=3;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Mộc Châu','07:30','09:30','Buổi sáng cao nguyên','Tự do cà phê hoặc chọn tham quan Mộc Châu Island bằng chi phí riêng.',1),
  (@day_id,'Mộc Châu','10:00','11:30','Mua đặc sản','Ghé điểm giới thiệu chè, sữa và nông sản có nguồn gốc địa phương.',2),
  (@day_id,'Hà Nội','12:30','18:30','Trở về Hà Nội','Khởi hành về Hà Nội, trả khách tại điểm hẹn và kết thúc tour.',3);

-- ---------------------------------------------------------------------------
-- TOUR0002 - Sa Pa 3 ngày 2 đêm
-- ---------------------------------------------------------------------------
UPDATE tours SET
  title = 'Sa Pa 3N2Đ - Cát Cát, Mường Hoa và Fansipan',
  slug = 'sa-pa-cat-cat-muong-hoa-fansipan-3n2d',
  thumbnail = '/uploads/tours/seed-2026/tour-02-fansipan.jpg',
  short_description = 'Hành trình Sa Pa qua bản Cát Cát, thung lũng Mường Hoa và đỉnh Fansipan 3.143 m.',
  description = 'Tour 3 ngày 2 đêm từ Hà Nội đến Sa Pa, kết hợp cảnh quan Hoàng Liên Sơn với trải nghiệm văn hóa bản Cát Cát, ruộng bậc thang Mường Hoa và hành trình cáp treo Fansipan. Chương trình dành thời gian nghỉ hợp lý để thích nghi độ cao; hoạt động trên Fansipan phụ thuộc vận hành cáp treo và thời tiết.',
  included_services = 'Xe limousine hoặc xe du lịch khứ hồi; hướng dẫn viên; 2 đêm khách sạn; 2 bữa sáng và 5 bữa chính; vé bản Cát Cát; vé tàu Mường Hoa theo chương trình; nước uống; bảo hiểm du lịch.',
  excluded_services = 'Vé cáp treo Fansipan; tàu hỏa leo núi đoạn đỉnh; phòng đơn; VAT; đồ uống; chi phí cá nhân và dịch vụ ngoài chương trình.',
  duration_days = 3, duration_nights = 2, departure_location = 'Hà Nội',
  max_people = 20, price = 3250000, status = 'OPEN', deleted_at = NULL
WHERE tour_code = 'TOUR0002';
SELECT id INTO @tour_id FROM tours WHERE tour_code = 'TOUR0002';
INSERT INTO tour_images (tour_id,image_url,is_thumbnail,sort_order) VALUES
  (@tour_id,'/uploads/tours/seed-2026/tour-02-fansipan.jpg',1,0),
  (@tour_id,'/uploads/tours/seed-2026/tour-02-cat-cat.jpg',0,1),
  (@tour_id,'/uploads/tours/seed-2026/tour-02-muong-hoa.jpg',0,2);
INSERT INTO tour_days (tour_id,day_number,title,description) VALUES
  (@tour_id,1,'Hà Nội - Sa Pa - bản Cát Cát','Đến Sa Pa, nhận phòng và khám phá bản Cát Cát.'),
  (@tour_id,2,'Fansipan - thung lũng Mường Hoa','Chinh phục Fansipan và ngắm thung lũng từ tuyến tàu leo núi.'),
  (@tour_id,3,'Lao Chải - Tả Van - Hà Nội','Trekking nhẹ qua bản làng và trở về Hà Nội.');
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=1;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Hà Nội','06:00','06:30','Đón khách','Khởi hành đi Sa Pa theo cao tốc Nội Bài - Lào Cai.',1),
  (@day_id,'Sa Pa','12:30','13:45','Ăn trưa và nhận phòng','Dùng bữa trưa, nhận phòng và nghỉ ngơi.',2),
  (@day_id,'Bản Cát Cát','14:30','17:00','Khám phá Cát Cát','Tìm hiểu văn hóa H’Mông, nghề thủ công, suối và thác trong bản.',3),
  (@day_id,'Trung tâm Sa Pa','19:00','21:00','Dạo phố núi','Ăn tối và tự do khám phá khu Nhà thờ đá, chợ đêm.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=2;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Ga Sa Pa','07:30','08:30','Tàu Mường Hoa','Đi tàu leo núi qua thung lũng Mường Hoa đến khu vực ga cáp treo.',1),
  (@day_id,'Fansipan','08:30','12:30','Chinh phục Fansipan','Khách chọn mua cáp treo, tham quan quần thể tâm linh và cột mốc 3.143 m.',2),
  (@day_id,'Sa Pa','14:00','16:00','Nghỉ ngơi sau hành trình','Trở về khách sạn nghỉ, tự do thưởng thức cà phê ngắm núi.',3),
  (@day_id,'Sa Pa','18:30','20:30','Bữa tối đặc sản','Dùng bữa tối và nghỉ đêm thứ hai tại Sa Pa.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=3;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Lao Chải - Tả Van','07:30','11:00','Trekking Mường Hoa','Đi bộ cung ngắn qua ruộng bậc thang và bản của người H’Mông, Giáy.',1),
  (@day_id,'Sa Pa','11:30','13:00','Ăn trưa, trả phòng','Trở về trung tâm, dùng bữa trưa và trả phòng.',2),
  (@day_id,'Hà Nội','13:30','20:30','Trở về Hà Nội','Di chuyển về Hà Nội và kết thúc chương trình.',3);

-- ---------------------------------------------------------------------------
-- TOUR0003 - Tà Xùa 2 ngày 1 đêm
-- ---------------------------------------------------------------------------
UPDATE tours SET
  title = 'Tà Xùa 2N1Đ - Săn mây Sống lưng khủng long',
  slug = 'ta-xua-san-may-song-lung-khung-long-2n1d',
  thumbnail = '/uploads/tours/seed-2026/tour-03-ta-xua-mist.png',
  short_description = 'Cung Bắc Yên - Tà Xùa với Mỏm Cá Heo, Cây Cô Đơn, Đỉnh Gió và Sống lưng khủng long.',
  description = 'Tour 2 ngày 1 đêm từ Hà Nội đến Tà Xùa, phù hợp người yêu cảnh quan và chụp ảnh. Biển mây là hiện tượng tự nhiên, thường thuận lợi hơn từ tháng 11 đến tháng 4 nên chương trình không cam kết có mây; hướng dẫn viên sẽ chọn điểm ngắm an toàn theo thời tiết thực tế.',
  included_services = 'Xe du lịch; hướng dẫn viên; 1 đêm homestay; 1 bữa sáng và 3 bữa chính; xe trung chuyển địa phương theo chương trình; nước uống; bảo hiểm du lịch.',
  excluded_services = 'Phòng riêng; VAT; đồ uống; chi phí cá nhân; hoạt động mạo hiểm ngoài chương trình; chi phí phát sinh do thời tiết hoặc cấm đường.',
  duration_days = 2, duration_nights = 1, departure_location = 'Hà Nội',
  max_people = 14, price = 1890000, status = 'OPEN', deleted_at = NULL
WHERE tour_code = 'TOUR0003';
SELECT id INTO @tour_id FROM tours WHERE tour_code = 'TOUR0003';
INSERT INTO tour_images (tour_id,image_url,is_thumbnail,sort_order) VALUES
  (@tour_id,'/uploads/tours/seed-2026/tour-03-ta-xua-mist.png',1,0),
  (@tour_id,'/uploads/tours/seed-2026/tour-03-dinosaur-ridge.jpg',0,1),
  (@tour_id,'/uploads/tours/seed-2026/tour-03-clouds.png',0,2);
INSERT INTO tour_days (tour_id,day_number,title,description) VALUES
  (@tour_id,1,'Hà Nội - Bắc Yên - Tà Xùa','Đến Tà Xùa, tham quan các điểm ngắm cảnh gần trung tâm xã.'),
  (@tour_id,2,'Sống lưng khủng long - Hà Nội','Đón bình minh, đi bộ cung an toàn và trở về Hà Nội.');
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=1;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Hà Nội','05:30','06:00','Khởi hành','Đón khách và đi Bắc Yên theo cung Quốc lộ 32.',1),
  (@day_id,'Bắc Yên','11:30','13:00','Ăn trưa','Dùng bữa trưa, đổi xe trung chuyển phù hợp đường núi.',2),
  (@day_id,'Mỏm Cá Heo - Cây Cô Đơn','14:30','17:00','Check-in Tà Xùa','Tham quan các điểm ngắm cảnh khi điều kiện đường và thời tiết an toàn.',3),
  (@day_id,'Tà Xùa','18:30','21:00','Nhận homestay','Ăn tối, nghỉ sớm để chuẩn bị đón bình minh.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=2;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Đỉnh Gió','05:00','06:30','Đón bình minh','Ngắm bình minh; khả năng xuất hiện biển mây phụ thuộc hoàn toàn thời tiết.',1),
  (@day_id,'Sống lưng khủng long','07:00','09:30','Đi bộ ngắm cảnh','Đi theo lối quy định, không tiếp cận đoạn trơn trượt khi hướng dẫn viên cảnh báo.',2),
  (@day_id,'Bắc Yên','10:30','12:30','Ăn trưa','Trả phòng, xuống Bắc Yên dùng bữa và nghỉ.',3),
  (@day_id,'Hà Nội','13:00','19:00','Trở về Hà Nội','Kết thúc tour tại điểm đón ban đầu.',4);

-- ---------------------------------------------------------------------------
-- TOUR0004 - Điện Biên, A Pa Chải 4 ngày 3 đêm
-- ---------------------------------------------------------------------------
UPDATE tours SET
  title = 'Điện Biên - A Pa Chải 4N3Đ - Chạm cực Tây Tổ quốc',
  slug = 'dien-bien-a-pa-chai-cuc-tay-4n3d',
  thumbnail = '/uploads/tours/seed-2026/tour-04-muong-thanh.jpg',
  short_description = 'Khám phá di tích Điện Biên Phủ, đèo Pha Đin và cột mốc ngã ba biên giới A Pa Chải.',
  description = 'Hành trình 4 ngày 3 đêm kết nối thung lũng Mường Thanh với xã Sín Thầu và khu vực A Pa Chải. Chặng biên giới chỉ thực hiện khi được cơ quan có thẩm quyền cho phép; khách phải mang giấy tờ tùy thân bản gốc, tuân thủ hướng dẫn của lực lượng biên phòng và đủ sức khỏe đi bộ đường dốc.',
  included_services = 'Xe du lịch và xe địa hình theo chặng; hướng dẫn viên; 3 đêm lưu trú; 3 bữa sáng và 7 bữa chính; vé các di tích trong chương trình; hỗ trợ thủ tục đoàn tại khu vực biên giới; nước uống; bảo hiểm du lịch.',
  excluded_services = 'Chi phí giấy tờ cá nhân; porter hoặc xe ôm phát sinh; phòng đơn; VAT; đồ uống; chi phí cá nhân; khoản phát sinh khi khu vực biên giới tạm đóng.',
  duration_days = 4, duration_nights = 3, departure_location = 'Hà Nội',
  max_people = 16, price = 3850000, status = 'OPEN', deleted_at = NULL
WHERE tour_code = 'TOUR0004';
SELECT id INTO @tour_id FROM tours WHERE tour_code = 'TOUR0004';
INSERT INTO tour_images (tour_id,image_url,is_thumbnail,sort_order) VALUES
  (@tour_id,'/uploads/tours/seed-2026/tour-04-muong-thanh.jpg',1,0),
  (@tour_id,'/uploads/tours/seed-2026/tour-04-a1-tank.jpg',0,1),
  (@tour_id,'/uploads/tours/seed-2026/tour-04-a1-bunker.jpg',0,2);
INSERT INTO tour_days (tour_id,day_number,title,description) VALUES
  (@tour_id,1,'Hà Nội - Pha Đin - Điện Biên Phủ','Đi theo Quốc lộ 6 qua Sơn La và đèo Pha Đin.'),
  (@tour_id,2,'Điện Biên Phủ - Mường Nhé','Tham quan quần thể di tích rồi di chuyển đến Mường Nhé.'),
  (@tour_id,3,'Sín Thầu - A Pa Chải - Điện Biên Phủ','Thực hiện chặng cực Tây theo điều phối của biên phòng và trở lại thành phố.'),
  (@tour_id,4,'Điện Biên Phủ - Hà Nội','Trả phòng, di chuyển về Hà Nội.');
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=1;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Hà Nội','05:00','05:30','Đón khách','Kiểm tra giấy tờ tùy thân và khởi hành sớm.',1),
  (@day_id,'Sơn La','11:30','12:30','Ăn trưa','Dừng nghỉ, dùng bữa trên hành trình.',2),
  (@day_id,'Đèo Pha Đin','14:00','14:45','Ngắm đèo Pha Đin','Dừng tại vị trí an toàn để quan sát cung đèo lịch sử.',3),
  (@day_id,'Điện Biên Phủ','18:00','20:00','Nhận phòng','Ăn tối và nghỉ đêm tại thành phố Điện Biên Phủ.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=2;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Đồi A1','07:30','09:00','Tham quan Đồi A1','Tìm hiểu cứ điểm và các dấu tích còn lại của chiến dịch.',1),
  (@day_id,'Bảo tàng Chiến thắng Điện Biên Phủ','09:15','11:00','Thăm bảo tàng','Xem hệ thống trưng bày và bức tranh panorama theo giờ mở cửa.',2),
  (@day_id,'Mường Nhé','12:30','18:00','Di chuyển đến Mường Nhé','Đi theo tuyến được phép, ăn tối và nghỉ đêm tại Mường Nhé.',3);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=3;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Đồn Biên phòng A Pa Chải','05:30','07:00','Làm thủ tục đoàn','Xuất trình giấy tờ và nghe phổ biến quy định khu vực biên giới.',1),
  (@day_id,'Cột mốc A Pa Chải','07:00','12:00','Chinh phục cực Tây','Di chuyển và đi bộ theo hướng dẫn; lộ trình có thể rút ngắn vì an toàn.',2),
  (@day_id,'Mường Nhé','12:30','14:00','Ăn trưa, nghỉ phục hồi','Dùng bữa trước khi rời khu vực biên giới.',3),
  (@day_id,'Điện Biên Phủ','14:00','20:00','Trở lại thành phố','Ăn tối và nghỉ đêm thứ ba tại Điện Biên Phủ.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=4;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Điện Biên Phủ','06:30','07:30','Trả phòng','Ăn sáng, kiểm tra hành lý và lên xe.',1),
  (@day_id,'Sơn La','12:00','13:00','Ăn trưa dọc đường','Nghỉ trưa trên tuyến về Hà Nội.',2),
  (@day_id,'Hà Nội','13:00','21:00','Kết thúc hành trình','Trả khách tại điểm hẹn, thời gian có thể thay đổi theo giao thông.',3);

-- ---------------------------------------------------------------------------
-- TOUR0005 - Y Tý, Bát Xát 3 ngày 2 đêm
-- ---------------------------------------------------------------------------
UPDATE tours SET
  title = 'Y Tý - Bát Xát 3N2Đ - Ruộng bậc thang và bản Hà Nhì',
  slug = 'y-ty-bat-xat-ruong-bac-thang-ban-ha-nhi-3n2d',
  thumbnail = '/uploads/tours/seed-2026/tour-05-y-ty.jpg',
  short_description = 'Khám phá Y Tý, ruộng bậc thang Thề Pả, bản Choản Thèn và văn hóa cộng đồng Hà Nhì.',
  description = 'Tour 3 ngày 2 đêm đến vùng cao Bát Xát, nơi có ruộng bậc thang, nhà trình tường và đời sống cộng đồng Hà Nhì. Màu sắc ruộng thay đổi theo mùa vụ; chương trình không cam kết ruộng lúa chín. Cung đường có thể điều chỉnh khi mưa lớn hoặc sạt lở.',
  included_services = 'Xe du lịch và xe trung chuyển phù hợp đường vùng cao; hướng dẫn viên; 2 đêm homestay hoặc nhà nghỉ; 2 bữa sáng và 5 bữa chính; phí tham quan theo chương trình; nước uống; bảo hiểm du lịch.',
  excluded_services = 'Phòng đơn; VAT; đồ uống; thuê trang phục; chi phí chụp ảnh tại điểm tư nhân; chi phí cá nhân; phát sinh do thời tiết.',
  duration_days = 3, duration_nights = 2, departure_location = 'Hà Nội',
  max_people = 14, price = 3490000, status = 'OPEN', deleted_at = NULL
WHERE tour_code = 'TOUR0005';
SELECT id INTO @tour_id FROM tours WHERE tour_code = 'TOUR0005';
INSERT INTO tour_images (tour_id,image_url,is_thumbnail,sort_order) VALUES
  (@tour_id,'/uploads/tours/seed-2026/tour-05-y-ty.jpg',1,0),
  (@tour_id,'/uploads/tours/seed-2026/tour-05-phin-ngan.jpg',0,1),
  (@tour_id,'/uploads/tours/seed-2026/tour-05-rice-fields.jpg',0,2);
INSERT INTO tour_days (tour_id,day_number,title,description) VALUES
  (@tour_id,1,'Hà Nội - Lào Cai - Bát Xát - Y Tý','Theo sông Hồng lên Bát Xát, tới Y Tý vào cuối ngày.'),
  (@tour_id,2,'Thề Pả - Choản Thèn','Khám phá ruộng bậc thang và không gian văn hóa Hà Nhì.'),
  (@tour_id,3,'Mường Hum - Lũng Pô - Hà Nội','Thăm chợ hoặc trung tâm Mường Hum theo ngày hoạt động, dừng ở khu vực Lũng Pô rồi trở về.');
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=1;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Hà Nội','05:30','06:00','Khởi hành','Đi theo cao tốc Nội Bài - Lào Cai.',1),
  (@day_id,'Lào Cai','11:30','13:00','Ăn trưa','Dùng bữa và đổi phương tiện nếu điều kiện đường yêu cầu.',2),
  (@day_id,'Bát Xát','13:00','17:30','Cung đường biên giới','Di chuyển qua các xã vùng cao, dừng ngắm cảnh tại vị trí an toàn.',3),
  (@day_id,'Y Tý','18:00','20:30','Nhận phòng','Ăn tối và nghỉ đêm tại Y Tý.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=2;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Thề Pả','07:00','09:30','Ngắm ruộng bậc thang','Đi bộ nhẹ trên đường làng, quan sát ruộng theo mùa.',1),
  (@day_id,'Bản Choản Thèn','09:45','11:30','Tìm hiểu bản Hà Nhì','Tham quan cảnh quan bản, nhà trình tường với sự đồng thuận của cộng đồng.',2),
  (@day_id,'Y Tý','14:00','16:30','Trekking ngắn','Đi cung ngắn do hướng dẫn viên chọn theo thời tiết và thể lực đoàn.',3),
  (@day_id,'Y Tý','18:30','20:30','Bữa tối vùng cao','Dùng bữa, giao lưu tự nguyện và nghỉ đêm thứ hai.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=3;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Mường Hum','07:00','09:00','Ghé Mường Hum','Tham quan khu trung tâm; chợ phiên chỉ tổ chức đúng ngày địa phương quy định.',1),
  (@day_id,'Lũng Pô, Bát Xát','09:45','11:00','Dừng chân Lũng Pô','Ngắm khu vực hợp lưu và tìm hiểu tuyến biên giới từ điểm được phép.',2),
  (@day_id,'Lào Cai','12:30','13:30','Ăn trưa','Dùng bữa trước khi về Hà Nội.',3),
  (@day_id,'Hà Nội','14:00','19:30','Trở về Hà Nội','Kết thúc tour tại điểm đón ban đầu.',4);

-- ---------------------------------------------------------------------------
-- TOUR0006 - Mai Châu 2 ngày 1 đêm
-- ---------------------------------------------------------------------------
UPDATE tours SET
  title = 'Mai Châu 2N1Đ - Bản Lác và đèo Thung Khe',
  slug = 'mai-chau-ban-lac-thung-khe-2n1d',
  thumbnail = '/uploads/tours/seed-2026/tour-06-mai-chau.jpg',
  short_description = 'Khám phá thung lũng Mai Châu, Bản Lác, Poom Coọng và trải nghiệm nhà sàn, ẩm thực người Thái.',
  description = 'Chương trình 2 ngày 1 đêm từ Hà Nội, dành thời gian đạp xe hoặc đi bộ giữa cánh đồng và các bản cộng đồng ở Mai Châu. Khách lưu trú nhà sàn hoặc homestay tiêu chuẩn, thưởng thức món địa phương và tìm hiểu nghề dệt truyền thống.',
  included_services = 'Xe du lịch khứ hồi; hướng dẫn viên; 1 đêm homestay; 1 bữa sáng và 3 bữa chính; xe đạp theo chương trình; vé điểm tham quan; nước uống; bảo hiểm du lịch.',
  excluded_services = 'Phòng riêng nâng hạng; VAT; đồ uống; biểu diễn riêng; mua sắm thổ cẩm; chi phí cá nhân và tiền tip.',
  duration_days = 2, duration_nights = 1, departure_location = 'Hà Nội',
  max_people = 20, price = 1690000, status = 'OPEN', deleted_at = NULL
WHERE tour_code = 'TOUR0006';
SELECT id INTO @tour_id FROM tours WHERE tour_code = 'TOUR0006';
INSERT INTO tour_images (tour_id,image_url,is_thumbnail,sort_order) VALUES
  (@tour_id,'/uploads/tours/seed-2026/tour-06-mai-chau.jpg',1,0),
  (@tour_id,'/uploads/tours/seed-2026/tour-06-ban-lac.jpg',0,1),
  (@tour_id,'/uploads/tours/seed-2026/tour-06-stilt-house.jpg',0,2);
INSERT INTO tour_days (tour_id,day_number,title,description) VALUES
  (@tour_id,1,'Hà Nội - Thung Khe - Bản Lác','Đến Mai Châu, khám phá Bản Lác và nghỉ homestay.'),
  (@tour_id,2,'Poom Coọng - Mai Châu - Hà Nội','Đạp xe qua cánh đồng, thăm bản và trở về.');
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=1;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Hà Nội','07:00','07:30','Đón khách','Khởi hành đi Hòa Bình.',1),
  (@day_id,'Đèo Thung Khe','10:00','10:40','Ngắm thung lũng','Dừng tại điểm cho phép, chụp ảnh toàn cảnh Mai Châu.',2),
  (@day_id,'Bản Lác','12:00','16:30','Ăn trưa và thăm bản','Nhận chỗ nghỉ, đi bộ tìm hiểu nhà sàn và nghề dệt.',3),
  (@day_id,'Mai Châu','18:30','21:00','Bữa tối cộng đồng','Dùng bữa; xem chương trình văn nghệ nếu địa phương tổ chức.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=2;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Poom Coọng - Bản Lác','07:00','09:30','Đạp xe thung lũng','Đạp xe cung bằng phẳng qua cánh đồng và đường bản.',1),
  (@day_id,'Hang Mỏ Luông','09:45','11:00','Tham quan hang','Thăm hang khi điều kiện mở cửa và an toàn cho phép.',2),
  (@day_id,'Mai Châu','11:30','13:00','Ăn trưa, trả phòng','Dùng bữa và chuẩn bị về Hà Nội.',3),
  (@day_id,'Hà Nội','13:30','17:30','Kết thúc tour','Trả khách tại điểm hẹn trung tâm.',4);

-- ---------------------------------------------------------------------------
-- TOUR0007 - Thành phố Sơn La 2 ngày 1 đêm
-- ---------------------------------------------------------------------------
UPDATE tours SET
  title = 'Sơn La 2N1Đ - Nhà tù Sơn La và hồ thủy điện',
  slug = 'son-la-nha-tu-ho-thuy-dien-2n1d',
  thumbnail = '/uploads/tours/seed-2026/tour-07-son-la-prison.jpg',
  short_description = 'Tham quan Di tích Nhà tù Sơn La, Bảo tàng Sơn La và vùng hồ thủy điện trên hành trình văn hóa - lịch sử.',
  description = 'Tour 2 ngày 1 đêm kết hợp di sản lịch sử tại đồi Khau Cả với cảnh quan sông núi Sơn La. Đoàn thăm Nhà tù Sơn La, bảo tàng, Quảng trường Tây Bắc và điểm quan sát vùng hồ thủy điện theo quy định vận hành thực tế.',
  included_services = 'Xe du lịch; hướng dẫn viên; 1 đêm khách sạn; 1 bữa sáng và 3 bữa chính; vé các điểm trong chương trình; nước uống; bảo hiểm du lịch.',
  excluded_services = 'Thuyền tham quan vùng hồ nếu phát sinh; phòng đơn; VAT; đồ uống; chi phí cá nhân; dịch vụ ngoài chương trình.',
  duration_days = 2, duration_nights = 1, departure_location = 'Hà Nội',
  max_people = 20, price = 1790000, status = 'OPEN', deleted_at = NULL
WHERE tour_code = 'TOUR0007';
SELECT id INTO @tour_id FROM tours WHERE tour_code = 'TOUR0007';
INSERT INTO tour_images (tour_id,image_url,is_thumbnail,sort_order) VALUES
  (@tour_id,'/uploads/tours/seed-2026/tour-07-son-la-prison.jpg',1,0),
  (@tour_id,'/uploads/tours/seed-2026/tour-07-reservoir.jpg',0,1),
  (@tour_id,'/uploads/tours/seed-2026/tour-07-province.jpg',0,2);
INSERT INTO tour_days (tour_id,day_number,title,description) VALUES
  (@tour_id,1,'Hà Nội - Thành phố Sơn La','Tham quan Nhà tù Sơn La, bảo tàng và trung tâm thành phố.'),
  (@tour_id,2,'Vùng hồ thủy điện - Hà Nội','Ngắm cảnh vùng hồ, tìm hiểu công trình và trở về.');
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=1;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Hà Nội','05:30','06:00','Khởi hành','Đi Sơn La theo Quốc lộ 6.',1),
  (@day_id,'Thành phố Sơn La','12:00','13:30','Ăn trưa, nhận phòng','Nghỉ ngơi sau chặng đường dài.',2),
  (@day_id,'Di tích Nhà tù Sơn La','14:00','16:00','Thăm di tích','Tìm hiểu hệ thống trại giam, cây đào Tô Hiệu và câu chuyện lịch sử.',3),
  (@day_id,'Bảo tàng Sơn La - Quảng trường Tây Bắc','16:00','18:00','Khám phá thành phố','Tham quan trưng bày văn hóa và không gian công cộng trung tâm.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=2;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Vùng hồ thủy điện Sơn La','07:00','10:00','Ngắm vùng hồ','Di chuyển đến điểm được phép, nghe giới thiệu về công trình và đời sống tái định cư.',1),
  (@day_id,'Thành phố Sơn La','10:30','12:30','Ăn trưa, trả phòng','Mua đặc sản có nguồn gốc rõ ràng trước khi rời thành phố.',2),
  (@day_id,'Hà Nội','13:00','19:00','Trở về Hà Nội','Kết thúc chương trình tại điểm hẹn.',3);

-- ---------------------------------------------------------------------------
-- TOUR0008 - Pha Đin, Điện Biên 2 ngày 1 đêm
-- ---------------------------------------------------------------------------
UPDATE tours SET
  title = 'Pha Đin - Điện Biên 2N1Đ - Cung đường lịch sử',
  slug = 'pha-din-dien-bien-cung-duong-lich-su-2n1d',
  thumbnail = '/uploads/tours/seed-2026/tour-08-pha-din.jpg',
  short_description = 'Theo Quốc lộ 6 qua đèo Pha Đin đến Điện Biên, thăm Đồi A1, hầm Đờ Cát và Bảo tàng Chiến thắng.',
  description = 'Hành trình 2 ngày 1 đêm có quãng đường di chuyển dài, khởi hành sớm từ Hà Nội. Tour tập trung vào cung đèo Pha Đin và các địa chỉ lịch sử tiêu biểu của Chiến dịch Điện Biên Phủ; phù hợp khách có sức khỏe tốt và chấp nhận thời gian ngồi xe nhiều.',
  included_services = 'Xe du lịch; hướng dẫn viên; 1 đêm khách sạn; 1 bữa sáng và 3 bữa chính; vé di tích, bảo tàng trong chương trình; nước uống; bảo hiểm du lịch.',
  excluded_services = 'Phòng đơn; VAT; đồ uống; chi phí cá nhân; xe điện hoặc dịch vụ tự chọn tại điểm; tiền tip.',
  duration_days = 2, duration_nights = 1, departure_location = 'Hà Nội',
  max_people = 18, price = 2190000, status = 'OPEN', deleted_at = NULL
WHERE tour_code = 'TOUR0008';
SELECT id INTO @tour_id FROM tours WHERE tour_code = 'TOUR0008';
INSERT INTO tour_images (tour_id,image_url,is_thumbnail,sort_order) VALUES
  (@tour_id,'/uploads/tours/seed-2026/tour-08-pha-din.jpg',1,0),
  (@tour_id,'/uploads/tours/seed-2026/tour-08-pha-din-1.jpg',0,1),
  (@tour_id,'/uploads/tours/seed-2026/tour-08-pha-din-2.jpg',0,2);
INSERT INTO tour_days (tour_id,day_number,title,description) VALUES
  (@tour_id,1,'Hà Nội - Pha Đin - Điện Biên Phủ','Đi xuyên Tây Bắc, dừng đèo Pha Đin và tới Điện Biên cuối ngày.'),
  (@tour_id,2,'Di tích Điện Biên Phủ - Hà Nội','Thăm các điểm lịch sử chính rồi trở về Hà Nội.');
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=1;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Hà Nội','04:30','05:00','Đón khách sớm','Kiểm tra danh sách và khởi hành.',1),
  (@day_id,'Sơn La','11:30','12:30','Ăn trưa','Dừng nghỉ trên hành trình.',2),
  (@day_id,'Đèo Pha Đin','14:00','15:00','Khám phá Pha Đin','Ngắm cảnh và nghe thuyết minh về cung đường lịch sử.',3),
  (@day_id,'Điện Biên Phủ','18:30','20:30','Nhận phòng','Ăn tối và nghỉ đêm.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=2;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Đồi A1 - hầm Đờ Cát','06:30','08:30','Thăm di tích chiến trường','Tham quan theo tuyến và giữ gìn hiện vật.',1),
  (@day_id,'Bảo tàng Chiến thắng Điện Biên Phủ','08:45','10:30','Thăm bảo tàng','Tìm hiểu chiến dịch qua hiện vật và không gian trưng bày.',2),
  (@day_id,'Điện Biên Phủ','10:45','11:45','Ăn trưa sớm','Chuẩn bị chặng về Hà Nội.',3),
  (@day_id,'Hà Nội','12:00','22:00','Trở về Hà Nội','Thời gian trả khách có thể thay đổi theo giao thông.',4);

-- ---------------------------------------------------------------------------
-- TOUR0009 - Bắc Hà 3 ngày 2 đêm
-- ---------------------------------------------------------------------------
UPDATE tours SET
  title = 'Bắc Hà 3N2Đ - Chợ phiên và dinh Hoàng A Tưởng',
  slug = 'bac-ha-cho-phien-dinh-hoang-a-tuong-3n2d',
  thumbnail = '/uploads/tours/seed-2026/tour-09-bac-ha-market.jpg',
  short_description = 'Trải nghiệm chợ phiên Bắc Hà sáng Chủ nhật, dinh Hoàng A Tưởng và các bản vùng cao Lào Cai.',
  description = 'Tour 3 ngày 2 đêm được xếp lịch khởi hành thứ Bảy để tham dự chợ phiên Bắc Hà vào sáng Chủ nhật. Ngoài chợ, đoàn tham quan dinh Hoàng A Tưởng, cảnh quan cao nguyên trắng và bản làng. Nếu chợ tạm dừng theo thông báo địa phương, tour thay bằng trải nghiệm văn hóa tương đương.',
  included_services = 'Xe du lịch; hướng dẫn viên; 2 đêm khách sạn hoặc homestay; 2 bữa sáng và 5 bữa chính; vé dinh Hoàng A Tưởng và điểm theo chương trình; nước uống; bảo hiểm du lịch.',
  excluded_services = 'Mua sắm tại chợ; thuê trang phục; phòng đơn; VAT; đồ uống; chi phí cá nhân; tiền tip.',
  duration_days = 3, duration_nights = 2, departure_location = 'Hà Nội',
  max_people = 16, price = 3290000, status = 'OPEN', deleted_at = NULL
WHERE tour_code = 'TOUR0009';
SELECT id INTO @tour_id FROM tours WHERE tour_code = 'TOUR0009';
INSERT INTO tour_images (tour_id,image_url,is_thumbnail,sort_order) VALUES
  (@tour_id,'/uploads/tours/seed-2026/tour-09-bac-ha-market.jpg',1,0),
  (@tour_id,'/uploads/tours/seed-2026/tour-09-hoang-a-tuong.jpg',0,1),
  (@tour_id,'/uploads/tours/seed-2026/tour-09-bac-ha-scenery.jpg',0,2);
INSERT INTO tour_days (tour_id,day_number,title,description) VALUES
  (@tour_id,1,'Hà Nội - Lào Cai - Bắc Hà','Đến cao nguyên Bắc Hà, nhận phòng và dạo thị trấn.'),
  (@tour_id,2,'Chợ phiên Bắc Hà - dinh Hoàng A Tưởng','Trải nghiệm chợ sáng Chủ nhật và di sản kiến trúc địa phương.'),
  (@tour_id,3,'Bản vùng cao - Hà Nội','Thăm bản, ngắm cảnh và trở về Hà Nội.');
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=1;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Hà Nội','06:00','06:30','Khởi hành thứ Bảy','Đi Lào Cai theo cao tốc.',1),
  (@day_id,'Lào Cai','11:30','13:00','Ăn trưa','Nghỉ và tiếp tục lên Bắc Hà.',2),
  (@day_id,'Bắc Hà','15:30','17:30','Dạo thị trấn','Làm quen không gian cao nguyên và chuẩn bị cho phiên chợ.',3),
  (@day_id,'Bắc Hà','18:30','20:30','Ăn tối, nhận phòng','Nghỉ đêm tại Bắc Hà.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=2;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Chợ phiên Bắc Hà','06:30','10:00','Đi chợ phiên Chủ nhật','Quan sát hoạt động giao thương, ẩm thực và sản vật; tôn trọng việc chụp ảnh người dân.',1),
  (@day_id,'Dinh Hoàng A Tưởng','10:15','11:45','Tham quan dinh','Tìm hiểu công trình xây dựng đầu thế kỷ XX và lịch sử Bắc Hà.',2),
  (@day_id,'Bản Phố, Bắc Hà','14:00','16:30','Thăm bản vùng cao','Đi bộ nhẹ, tìm hiểu nghề truyền thống và cảnh quan nông nghiệp.',3),
  (@day_id,'Bắc Hà','18:30','20:30','Nghỉ đêm thứ hai','Dùng bữa tối và tự do.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=3;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Thung lũng Bắc Hà','07:00','09:30','Ngắm cao nguyên','Dừng tại các điểm cảnh quan an toàn theo mùa.',1),
  (@day_id,'Lào Cai','11:30','13:00','Ăn trưa','Nghỉ trước khi về Hà Nội.',2),
  (@day_id,'Hà Nội','13:30','19:00','Trở về Hà Nội','Kết thúc tour tại điểm hẹn.',3);

-- ---------------------------------------------------------------------------
-- TOUR0010 - Mường La, Ngọc Chiến 2 ngày 1 đêm
-- ---------------------------------------------------------------------------
UPDATE tours SET
  title = 'Mường La 2N1Đ - Hồ thủy điện và Ngọc Chiến',
  slug = 'muong-la-ngoc-chien-ho-thuy-dien-2n1d',
  thumbnail = '/uploads/tours/seed-2026/tour-10-son-la-dam.jpg',
  short_description = 'Đến Mường La ngắm hồ thủy điện Sơn La, trải nghiệm bản làng và suối khoáng nóng Ngọc Chiến.',
  description = 'Tour 2 ngày 1 đêm đưa khách qua thành phố Sơn La đến Mường La và xã Ngọc Chiến. Chương trình kết hợp cảnh quan vùng hồ, kiến trúc bản làng, ẩm thực địa phương và tắm khoáng nóng; ưu tiên sử dụng dịch vụ cộng đồng, tuân thủ nội quy bể khoáng.',
  included_services = 'Xe du lịch; hướng dẫn viên; 1 đêm homestay; 1 bữa sáng và 3 bữa chính; vé tắm khoáng một lượt; phí tham quan theo chương trình; nước uống; bảo hiểm du lịch.',
  excluded_services = 'Phòng riêng; tắm khoáng hoặc dịch vụ bổ sung; VAT; đồ uống; chi phí cá nhân; mua sắm; tiền tip.',
  duration_days = 2, duration_nights = 1, departure_location = 'Hà Nội',
  max_people = 14, price = 2290000, status = 'OPEN', deleted_at = NULL
WHERE tour_code = 'TOUR0010';
SELECT id INTO @tour_id FROM tours WHERE tour_code = 'TOUR0010';
INSERT INTO tour_images (tour_id,image_url,is_thumbnail,sort_order) VALUES
  (@tour_id,'/uploads/tours/seed-2026/tour-10-son-la-dam.jpg',1,0),
  (@tour_id,'/uploads/tours/seed-2026/tour-10-mountain-dawn.jpeg',0,1),
  (@tour_id,'/uploads/tours/seed-2026/tour-10-phu-song-soung.jpeg',0,2);
INSERT INTO tour_days (tour_id,day_number,title,description) VALUES
  (@tour_id,1,'Hà Nội - Mường La - Ngọc Chiến','Đi qua Sơn La, ngắm vùng hồ và nghỉ tại Ngọc Chiến.'),
  (@tour_id,2,'Ngọc Chiến - Mường La - Hà Nội','Thăm bản, trải nghiệm khoáng nóng và trở về.');
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=1;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Hà Nội','05:00','05:30','Khởi hành','Đón khách và đi Sơn La.',1),
  (@day_id,'Thành phố Sơn La','11:30','12:30','Ăn trưa','Nghỉ trước khi đi Mường La.',2),
  (@day_id,'Mường La','14:00','15:30','Ngắm vùng hồ thủy điện','Dừng ở điểm quan sát được phép, nghe giới thiệu về công trình.',3),
  (@day_id,'Ngọc Chiến','17:00','20:30','Nhận homestay, tắm khoáng','Ăn tối và sử dụng bể khoáng theo nội quy sức khỏe, an toàn.',4);
SELECT id INTO @day_id FROM tour_days WHERE tour_id=@tour_id AND day_number=2;
INSERT INTO tour_activities (tour_day_id,location_name,start_time,end_time,title,description,sort_order) VALUES
  (@day_id,'Ngọc Chiến','06:30','09:00','Dạo bản buổi sáng','Tìm hiểu nhà sàn, ruộng và đời sống cộng đồng với hướng dẫn viên.',1),
  (@day_id,'Mường La','10:00','12:00','Trở lại Mường La','Dừng mua sản vật có nguồn gốc rõ ràng, dùng bữa trưa.',2),
  (@day_id,'Hà Nội','12:30','20:00','Trở về Hà Nội','Kết thúc tour tại điểm đón; giờ về phụ thuộc giao thông.',3);

-- ---------------------------------------------------------------------------
-- Các đợt khởi hành mở bán.
-- TOUR0009 chỉ khởi hành thứ Bảy để ngày 2 đúng phiên chợ Bắc Hà Chủ nhật.
-- Đợt 01/08 có hạn đặt 30/07/2026, nhờ đó khách vẫn đặt được tới hết 30/07.
-- ---------------------------------------------------------------------------
INSERT INTO tour_departures
  (tour_id,departure_date,booking_deadline,departure_time,max_people,current_people,reserved_people,adult_price,child_price,is_private_departure,status)
SELECT t.id,d.departure_date,d.booking_deadline,d.departure_time,t.max_people,0,0,t.price,
       ROUND(t.price * 0.75,-4),0,'OPEN'
FROM tours t
JOIN (
  SELECT 'TOUR0001' code, DATE('2026-07-26') departure_date, TIMESTAMP('2026-07-25 18:00:00') booking_deadline, TIME('05:30:00') departure_time
  UNION ALL SELECT 'TOUR0001','2026-07-28','2026-07-27 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0001','2026-07-30','2026-07-29 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0002','2026-07-26','2026-07-25 18:00:00','06:00:00'
  UNION ALL SELECT 'TOUR0002','2026-07-28','2026-07-27 18:00:00','06:00:00'
  UNION ALL SELECT 'TOUR0002','2026-07-30','2026-07-29 18:00:00','06:00:00'
  UNION ALL SELECT 'TOUR0003','2026-07-26','2026-07-25 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0003','2026-07-28','2026-07-27 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0003','2026-07-30','2026-07-29 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0004','2026-07-26','2026-07-25 18:00:00','05:00:00'
  UNION ALL SELECT 'TOUR0004','2026-07-28','2026-07-27 18:00:00','05:00:00'
  UNION ALL SELECT 'TOUR0004','2026-07-30','2026-07-29 18:00:00','05:00:00'
  UNION ALL SELECT 'TOUR0005','2026-07-26','2026-07-25 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0005','2026-07-28','2026-07-27 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0005','2026-07-30','2026-07-29 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0006','2026-07-26','2026-07-25 18:00:00','07:00:00'
  UNION ALL SELECT 'TOUR0006','2026-07-28','2026-07-27 18:00:00','07:00:00'
  UNION ALL SELECT 'TOUR0006','2026-07-30','2026-07-29 18:00:00','07:00:00'
  UNION ALL SELECT 'TOUR0007','2026-07-26','2026-07-25 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0007','2026-07-28','2026-07-27 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0007','2026-07-30','2026-07-29 18:00:00','05:30:00'
  UNION ALL SELECT 'TOUR0008','2026-07-26','2026-07-25 18:00:00','04:30:00'
  UNION ALL SELECT 'TOUR0008','2026-07-28','2026-07-27 18:00:00','04:30:00'
  UNION ALL SELECT 'TOUR0008','2026-07-30','2026-07-29 18:00:00','04:30:00'
  UNION ALL SELECT 'TOUR0009','2026-07-25','2026-07-24 20:00:00','06:00:00'
  UNION ALL SELECT 'TOUR0009','2026-08-01','2026-07-30 20:00:00','06:00:00'
  UNION ALL SELECT 'TOUR0009','2026-08-08','2026-08-06 20:00:00','06:00:00'
  UNION ALL SELECT 'TOUR0010','2026-07-26','2026-07-25 18:00:00','05:00:00'
  UNION ALL SELECT 'TOUR0010','2026-07-28','2026-07-27 18:00:00','05:00:00'
  UNION ALL SELECT 'TOUR0010','2026-07-30','2026-07-29 18:00:00','05:00:00'
) d ON d.code = t.tour_code
WHERE t.deleted_at IS NULL;

COMMIT;

-- Báo cáo nhanh sau seed.
SELECT
  t.id,
  t.tour_code,
  t.title,
  t.duration_days,
  COUNT(DISTINCT ti.id) AS image_count,
  COUNT(DISTINCT td.id) AS day_count,
  COUNT(DISTINCT dep.id) AS departure_count
FROM tours t
LEFT JOIN tour_images ti ON ti.tour_id=t.id
LEFT JOIN tour_days td ON td.tour_id=t.id
LEFT JOIN tour_departures dep ON dep.tour_id=t.id AND dep.deleted_at IS NULL
WHERE t.tour_code IN (
  'TOUR0001','TOUR0002','TOUR0003','TOUR0004','TOUR0005',
  'TOUR0006','TOUR0007','TOUR0008','TOUR0009','TOUR0010'
)
GROUP BY t.id,t.tour_code,t.title,t.duration_days
ORDER BY t.tour_code;
