-- Chạy file này nếu database đã tạo từ bản SQL cũ (thiếu cột / unique)
-- MySQL 5.7+

ALTER TABLE `tour_images`
  ADD COLUMN `sort_order` int(11) DEFAULT '0' AFTER `is_thumbnail`;

ALTER TABLE `tour_departures`
  ADD UNIQUE KEY `uq_tour_departure_date` (`tour_id`, `departure_date`);
