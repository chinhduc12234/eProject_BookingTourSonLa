-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3306
-- Thời gian đã tạo: Th6 11, 2026 lúc 11:12 AM
-- Phiên bản máy phục vụ: 5.7.24
-- Phiên bản PHP: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `booking_tour_sonla`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `activity_change_logs`
--

CREATE TABLE `activity_change_logs` (
  `id` bigint(20) NOT NULL,
  `booking_schedule_activity_id` bigint(20) NOT NULL,
  `changed_by` bigint(20) NOT NULL,
  `old_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_time` time DEFAULT NULL,
  `new_time` time DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) NOT NULL,
  `booking_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `tour_departure_id` bigint(20) NOT NULL,
  `booking_type` enum('INDIVIDUAL','GROUP','PRIVATE') COLLATE utf8mb4_unicode_ci DEFAULT 'INDIVIDUAL',
  `total_people` int(11) NOT NULL,
  `adult_count` int(11) DEFAULT '0',
  `child_count` int(11) DEFAULT '0',
  `adult_price_snapshot` decimal(12,2) DEFAULT NULL,
  `child_price_snapshot` decimal(12,2) DEFAULT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `special_request` text COLLATE utf8mb4_unicode_ci,
  `internal_note` text COLLATE utf8mb4_unicode_ci,
  `booking_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'UNPAID',
  `payment_deadline` datetime DEFAULT NULL,
  `booked_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` datetime DEFAULT NULL,
  `confirmed_by` bigint(20) DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deposit_amount` decimal(12,2) DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_amount` decimal(12,2) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_plan` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pickup_address` text COLLATE utf8mb4_unicode_ci,
  `refunded_amount` decimal(12,2) DEFAULT NULL,
  `refunded_at` datetime(6) DEFAULT NULL,
  `remaining_amount` decimal(12,2) DEFAULT NULL,
  `remaining_payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_at` datetime(6) DEFAULT NULL,
  `assigned_staff_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_contacts`
--

CREATE TABLE `booking_contacts` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pickup_address` text COLLATE utf8mb4_unicode_ci,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_customers`
--

CREATE TABLE `booking_customers` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `customer_type` enum('ADULT','CHILD','INFANT') COLLATE utf8mb4_unicode_ci DEFAULT 'ADULT',
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT 'OTHER',
  `is_group_leader` tinyint(1) DEFAULT '0',
  `checked_in` tinyint(1) DEFAULT '0',
  `checked_in_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `address` text COLLATE utf8mb4_unicode_ci,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `health_note` text COLLATE utf8mb4_unicode_ci,
  `identity_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_employees`
--

CREATE TABLE `booking_employees` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `employee_id` bigint(20) NOT NULL,
  `role_in_trip` enum('GUIDE','ASSISTANT','DRIVER','PHOTOGRAPHER') COLLATE utf8mb4_unicode_ci DEFAULT 'GUIDE',
  `note` text COLLATE utf8mb4_unicode_ci,
  `assignment_status` enum('ASSIGNED','ACCEPTED','REJECTED') COLLATE utf8mb4_unicode_ci DEFAULT 'ASSIGNED',
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `accepted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_organizations`
--

CREATE TABLE `booking_organizations` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `organization_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_address` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_schedule_activities`
--

CREATE TABLE `booking_schedule_activities` (
  `id` bigint(20) NOT NULL,
  `booking_schedule_day_id` bigint(20) NOT NULL,
  `original_activity_id` bigint(20) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `actual_start_time` datetime DEFAULT NULL,
  `actual_end_time` datetime DEFAULT NULL,
  `actual_location` text COLLATE utf8mb4_unicode_ci,
  `attachment_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `activity_status` enum('PENDING','DONE','SKIPPED','CHANGED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `actual_note` text COLLATE utf8mb4_unicode_ci,
  `completed_at` datetime DEFAULT NULL,
  `updated_by_employee` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_schedule_days`
--

CREATE TABLE `booking_schedule_days` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `day_number` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `districts`
--

CREATE TABLE `districts` (
  `id` bigint(20) NOT NULL,
  `province_id` bigint(20) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `districts`
--

INSERT INTO `districts` (`id`, `province_id`, `name`, `is_deleted`) VALUES
(1, 1, 'Thành Phố Sơn La', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) NOT NULL,
  `district_id` bigint(20) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `address` text COLLATE utf8mb4_unicode_ci,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `locations`
--

INSERT INTO `locations` (`id`, `district_id`, `name`, `description`, `address`, `latitude`, `longitude`, `image`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Nhà Khách Sơn La', 'To Rộng Thoáng', '123 chường trinh, nguyễn trãi, thành phố sơn la', NULL, NULL, 'https://i.vntrip.vn/584x290/smart/https://statics.vntrip.vn/data-v2/hotels/616507/img_max/616507_1625450807_z2593807142459_a30fd097487a4c61c56c0f4217d53337.jpg', 1, '2026-06-09 13:37:28', '2026-06-09 13:37:28', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `type` enum('BOOKING','PAYMENT','TOUR','SYSTEM') COLLATE utf8mb4_unicode_ci DEFAULT 'SYSTEM',
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint(20) DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `payment_method` enum('CASH','BANKING','MOMO','VNPAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_type` enum('DEPOSIT','PARTIAL','FULL','REFUND') COLLATE utf8mb4_unicode_ci DEFAULT 'FULL',
  `amount` decimal(12,2) NOT NULL,
  `payment_status` enum('PENDING','PAID','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `note` text COLLATE utf8mb4_unicode_ci,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` bigint(20) NOT NULL,
  `payment_id` bigint(20) NOT NULL,
  `transaction_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_order_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_response_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_message` text COLLATE utf8mb4_unicode_ci,
  `gateway_response` json DEFAULT NULL,
  `bank_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_amount` decimal(12,2) DEFAULT NULL,
  `transaction_time` datetime DEFAULT NULL,
  `is_success` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `provinces`
--

CREATE TABLE `provinces` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_deleted` bit(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `provinces`
--

INSERT INTO `provinces` (`id`, `name`, `is_deleted`) VALUES
(1, 'Sơn La', b'0');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `tour_id` bigint(20) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'ADMIN'),
(3, 'CUSTOMER'),
(2, 'EMPLOYEE');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tours`
--

CREATE TABLE `tours` (
  `id` bigint(20) NOT NULL,
  `tour_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` text COLLATE utf8mb4_unicode_ci,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `included_services` text COLLATE utf8mb4_unicode_ci,
  `excluded_services` text COLLATE utf8mb4_unicode_ci,
  `duration_days` int(11) NOT NULL,
  `duration_nights` int(11) NOT NULL,
  `departure_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_people` int(11) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `status` enum('DRAFT','OPEN','CLOSED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `created_by` bigint(20) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tour_activities`
--

CREATE TABLE `tour_activities` (
  `id` bigint(20) NOT NULL,
  `tour_day_id` bigint(20) NOT NULL,
  `location_id` bigint(20) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int(11) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tour_days`
--

CREATE TABLE `tour_days` (
  `id` bigint(20) NOT NULL,
  `tour_id` bigint(20) NOT NULL,
  `day_number` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tour_departures`
--

CREATE TABLE `tour_departures` (
  `id` bigint(20) NOT NULL,
  `tour_id` bigint(20) NOT NULL,
  `departure_date` date NOT NULL,
  `booking_deadline` datetime DEFAULT NULL,
  `departure_time` time DEFAULT NULL,
  `max_people` int(11) NOT NULL,
  `current_people` int(11) DEFAULT '0',
  `reserved_people` int(11) DEFAULT '0',
  `adult_price` decimal(12,2) DEFAULT NULL,
  `child_price` decimal(12,2) DEFAULT NULL,
  `is_private_departure` tinyint(1) DEFAULT '0',
  `status` enum('OPEN','FULL','CLOSED') COLLATE utf8mb4_unicode_ci DEFAULT 'OPEN',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tour_images`
--

CREATE TABLE `tour_images` (
  `id` bigint(20) NOT NULL,
  `tour_id` bigint(20) NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_thumbnail` tinyint(1) DEFAULT '0',
  `sort_order` int(11) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `role_id` bigint(20) NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT 'OTHER',
  `date_of_birth` date DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `role_id`, `full_name`, `email`, `phone`, `password`, `avatar`, `gender`, `date_of_birth`, `address`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Administrator', 'admin@gmail.com', '0123456789', '$2a$10$mXlQoYJag6ZFW/DYJ1Y0C.ebsmrwkh5K.gIYqvbSntHqIG4iM8PY.', NULL, 'OTHER', NULL, NULL, 1, '2026-06-09 13:35:37', '2026-06-09 13:35:37', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `activity_change_logs`
--
ALTER TABLE `activity_change_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_activity_change_logs_activity` (`booking_schedule_activity_id`),
  ADD KEY `fk_activity_change_logs_user` (`changed_by`);

--
-- Chỉ mục cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD KEY `fk_booking_confirmed_by` (`confirmed_by`),
  ADD KEY `idx_bookings_status` (`booking_status`),
  ADD KEY `idx_bookings_payment_status` (`payment_status`),
  ADD KEY `idx_booking_departure` (`tour_departure_id`),
  ADD KEY `idx_booking_user` (`user_id`),
  ADD KEY `idx_booking_type` (`booking_type`),
  ADD KEY `FKdw7qh4vpvnwe2mp89a7lr514l` (`assigned_staff_id`);

--
-- Chỉ mục cho bảng `booking_contacts`
--
ALTER TABLE `booking_contacts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`);

--
-- Chỉ mục cho bảng `booking_customers`
--
ALTER TABLE `booking_customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_customer_booking` (`booking_id`);

--
-- Chỉ mục cho bảng `booking_employees`
--
ALTER TABLE `booking_employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_booking_employee` (`booking_id`,`employee_id`),
  ADD KEY `fk_booking_employees_employee` (`employee_id`),
  ADD KEY `idx_booking_employees_status` (`assignment_status`),
  ADD KEY `idx_booking_employee_role` (`role_in_trip`);

--
-- Chỉ mục cho bảng `booking_organizations`
--
ALTER TABLE `booking_organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`);

--
-- Chỉ mục cho bảng `booking_schedule_activities`
--
ALTER TABLE `booking_schedule_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_booking_schedule_activities_day` (`booking_schedule_day_id`),
  ADD KEY `fk_booking_schedule_activities_original` (`original_activity_id`),
  ADD KEY `idx_schedule_activity_status` (`activity_status`),
  ADD KEY `idx_schedule_updated_by` (`updated_by_employee`);

--
-- Chỉ mục cho bảng `booking_schedule_days`
--
ALTER TABLE `booking_schedule_days`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_booking_schedule_day` (`booking_id`,`day_number`),
  ADD UNIQUE KEY `UKtqsqs41t7dbc7k17usvd9namn` (`booking_id`,`day_number`);

--
-- Chỉ mục cho bảng `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_districts_province` (`province_id`);

--
-- Chỉ mục cho bảng `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_locations_district` (`district_id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notifications_user` (`user_id`),
  ADD KEY `idx_notifications_is_read` (`is_read`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payment_booking` (`booking_id`),
  ADD KEY `idx_payment_status` (`payment_status`);

--
-- Chỉ mục cho bảng `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_code` (`transaction_code`),
  ADD KEY `idx_payment_transaction_payment` (`payment_id`),
  ADD KEY `idx_payment_transaction_code` (`transaction_code`);

--
-- Chỉ mục cho bảng `provinces`
--
ALTER TABLE `provinces`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_review_booking_user` (`booking_id`,`user_id`),
  ADD KEY `fk_reviews_user` (`user_id`),
  ADD KEY `fk_reviews_tour` (`tour_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `tours`
--
ALTER TABLE `tours`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tour_code` (`tour_code`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_tours_created_by` (`created_by`),
  ADD KEY `idx_tours_status` (`status`);

--
-- Chỉ mục cho bảng `tour_activities`
--
ALTER TABLE `tour_activities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tour_activity_sort` (`tour_day_id`,`sort_order`),
  ADD UNIQUE KEY `UK25u83bt2m071r3b2rp6w52jxk` (`tour_day_id`,`sort_order`),
  ADD KEY `fk_tour_activities_location` (`location_id`);

--
-- Chỉ mục cho bảng `tour_days`
--
ALTER TABLE `tour_days`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tour_day` (`tour_id`,`day_number`),
  ADD UNIQUE KEY `UKbn6fuild0awalxhpvrxkmil40` (`tour_id`,`day_number`);

--
-- Chỉ mục cho bảng `tour_departures`
--
ALTER TABLE `tour_departures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tour_departure` (`tour_id`,`departure_date`),
  ADD UNIQUE KEY `UK3i0rj71ifcpjd9gkxjvn8o1hw` (`tour_id`,`departure_date`),
  ADD KEY `idx_tour_departures_status` (`status`),
  ADD KEY `idx_tour_departures_date` (`departure_date`),
  ADD KEY `idx_departure_booking_deadline` (`booking_deadline`);

--
-- Chỉ mục cho bảng `tour_images`
--
ALTER TABLE `tour_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tour_images_tour_id` (`tour_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `idx_users_role` (`role_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `activity_change_logs`
--
ALTER TABLE `activity_change_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `booking_contacts`
--
ALTER TABLE `booking_contacts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `booking_customers`
--
ALTER TABLE `booking_customers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `booking_employees`
--
ALTER TABLE `booking_employees`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `booking_organizations`
--
ALTER TABLE `booking_organizations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `booking_schedule_activities`
--
ALTER TABLE `booking_schedule_activities`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `booking_schedule_days`
--
ALTER TABLE `booking_schedule_days`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `districts`
--
ALTER TABLE `districts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `provinces`
--
ALTER TABLE `provinces`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `tours`
--
ALTER TABLE `tours`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `tour_activities`
--
ALTER TABLE `tour_activities`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `tour_days`
--
ALTER TABLE `tour_days`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `tour_departures`
--
ALTER TABLE `tour_departures`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `tour_images`
--
ALTER TABLE `tour_images`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `activity_change_logs`
--
ALTER TABLE `activity_change_logs`
  ADD CONSTRAINT `fk_activity_change_logs_activity` FOREIGN KEY (`booking_schedule_activity_id`) REFERENCES `booking_schedule_activities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_activity_change_logs_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `FKdw7qh4vpvnwe2mp89a7lr514l` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_booking_confirmed_by` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_bookings_tour_departure` FOREIGN KEY (`tour_departure_id`) REFERENCES `tour_departures` (`id`),
  ADD CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `booking_contacts`
--
ALTER TABLE `booking_contacts`
  ADD CONSTRAINT `fk_booking_contacts_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `booking_customers`
--
ALTER TABLE `booking_customers`
  ADD CONSTRAINT `fk_booking_customers_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `booking_employees`
--
ALTER TABLE `booking_employees`
  ADD CONSTRAINT `fk_booking_employees_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_booking_employees_employee` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `booking_organizations`
--
ALTER TABLE `booking_organizations`
  ADD CONSTRAINT `fk_booking_organizations_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `booking_schedule_activities`
--
ALTER TABLE `booking_schedule_activities`
  ADD CONSTRAINT `fk_booking_schedule_activities_day` FOREIGN KEY (`booking_schedule_day_id`) REFERENCES `booking_schedule_days` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_booking_schedule_activities_employee` FOREIGN KEY (`updated_by_employee`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_booking_schedule_activities_original` FOREIGN KEY (`original_activity_id`) REFERENCES `tour_activities` (`id`);

--
-- Các ràng buộc cho bảng `booking_schedule_days`
--
ALTER TABLE `booking_schedule_days`
  ADD CONSTRAINT `fk_booking_schedule_days_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `districts`
--
ALTER TABLE `districts`
  ADD CONSTRAINT `fk_districts_province` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`);

--
-- Các ràng buộc cho bảng `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `fk_locations_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`);

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `fk_payment_transactions_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`),
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `tours`
--
ALTER TABLE `tours`
  ADD CONSTRAINT `fk_tours_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `tour_activities`
--
ALTER TABLE `tour_activities`
  ADD CONSTRAINT `fk_tour_activities_day` FOREIGN KEY (`tour_day_id`) REFERENCES `tour_days` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tour_activities_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`);

--
-- Các ràng buộc cho bảng `tour_days`
--
ALTER TABLE `tour_days`
  ADD CONSTRAINT `fk_tour_days_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tour_departures`
--
ALTER TABLE `tour_departures`
  ADD CONSTRAINT `fk_tour_departures_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tour_images`
--
ALTER TABLE `tour_images`
  ADD CONSTRAINT `fk_tour_images_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
