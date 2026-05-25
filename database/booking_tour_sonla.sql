-- =========================================================
-- DATABASE: BOOKING TOUR SON LA
-- CHARACTER SET UTF8MB4 FOR VIETNAMESE
-- =========================================================

CREATE DATABASE IF NOT EXISTS booking_tour_sonla
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE booking_tour_sonla;

-- =========================================================
-- DISABLE FOREIGN KEY CHECK
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- DROP TABLES
-- =========================================================

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS activity_change_logs;
DROP TABLE IF EXISTS booking_schedule_activities;
DROP TABLE IF EXISTS booking_schedule_days;
DROP TABLE IF EXISTS booking_employees;
DROP TABLE IF EXISTS booking_customers;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS tour_departures;
DROP TABLE IF EXISTS tour_activities;
DROP TABLE IF EXISTS tour_days;
DROP TABLE IF EXISTS tour_images;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS provinces;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- ROLES
-- =========================================================

CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles(name)
VALUES
('ADMIN'),
('EMPLOYEE'),
('CUSTOMER');

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    role_id BIGINT NOT NULL,

    full_name VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(20) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    avatar VARCHAR(500),

    gender ENUM(
        'MALE',
        'FEMALE',
        'OTHER'
    ) DEFAULT 'OTHER',

    date_of_birth DATE,

    address TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    deleted_at DATETIME NULL,

    CONSTRAINT fk_users_role
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
);

-- =========================================================
-- PROVINCES
-- =========================================================

CREATE TABLE provinces (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(255) NOT NULL
);

-- =========================================================
-- DISTRICTS
-- =========================================================

CREATE TABLE districts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    province_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,

    is_deleted BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_districts_province
    FOREIGN KEY (province_id)
    REFERENCES provinces(id)
);

-- =========================================================
-- LOCATIONS
-- =========================================================

CREATE TABLE locations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    district_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,

    description TEXT,

    address TEXT,

    latitude DECIMAL(10,7),

    longitude DECIMAL(10,7),

    image VARCHAR(500),

    is_active BOOLEAN DEFAULT TRUE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    deleted_at DATETIME NULL,

    CONSTRAINT fk_locations_district
    FOREIGN KEY (district_id)
    REFERENCES districts(id)
);

-- =========================================================
-- TOURS
-- =========================================================

CREATE TABLE tours (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    tour_code VARCHAR(20) NOT NULL UNIQUE,

    title VARCHAR(255) NOT NULL,

    slug VARCHAR(255) NOT NULL UNIQUE,

    thumbnail TEXT,

    short_description TEXT,

    description LONGTEXT,

    included_services TEXT,

    excluded_services TEXT,

    duration_days INT NOT NULL,

    duration_nights INT NOT NULL,

    departure_location VARCHAR(255),

    max_people INT NOT NULL,

    price DECIMAL(12,2) NOT NULL,

    status ENUM(
        'DRAFT',
        'OPEN',
        'CLOSED'
    ) DEFAULT 'DRAFT',

    created_by BIGINT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    deleted_at DATETIME NULL,

    CONSTRAINT fk_tours_created_by
    FOREIGN KEY (created_by)
    REFERENCES users(id),

    CONSTRAINT chk_tour_code
    CHECK (
        tour_code REGEXP '^[A-Z0-9_-]{3,20}$'
    )
);

-- =========================================================
-- TOUR IMAGES
-- =========================================================

CREATE TABLE tour_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    tour_id BIGINT NOT NULL,

    image_url VARCHAR(500) NOT NULL,

    is_thumbnail BOOLEAN DEFAULT FALSE,

    sort_order INT DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tour_images_tour
    FOREIGN KEY (tour_id)
    REFERENCES tours(id)
    ON DELETE CASCADE
);

-- =========================================================
-- TOUR DAYS
-- =========================================================

CREATE TABLE tour_days (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    tour_id BIGINT NOT NULL,

    day_number INT NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tour_days_tour
    FOREIGN KEY (tour_id)
    REFERENCES tours(id)
    ON DELETE CASCADE,

    CONSTRAINT uq_tour_day
    UNIQUE (tour_id, day_number)
);

-- =========================================================
-- TOUR ACTIVITIES
-- =========================================================

CREATE TABLE tour_activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    tour_day_id BIGINT NOT NULL,

    location_id BIGINT NULL,

    start_time TIME,

    end_time TIME,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    sort_order INT DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tour_activities_day
    FOREIGN KEY (tour_day_id)
    REFERENCES tour_days(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_tour_activities_location
    FOREIGN KEY (location_id)
    REFERENCES locations(id),

    CONSTRAINT uq_tour_activity_sort
    UNIQUE (tour_day_id, sort_order)
);

-- =========================================================
-- TOUR DEPARTURES
-- =========================================================

CREATE TABLE tour_departures (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    tour_id BIGINT NOT NULL,

    departure_date DATE NOT NULL,

    booking_deadline DATETIME NULL,

    departure_time TIME NULL,

    max_people INT NOT NULL,

    current_people INT DEFAULT 0,

    reserved_people INT DEFAULT 0,

    adult_price DECIMAL(12,2) NULL,

    child_price DECIMAL(12,2) NULL,

    is_private_departure BOOLEAN DEFAULT FALSE,

    status ENUM(
        'OPEN',
        'FULL',
        'CLOSED'
    ) DEFAULT 'OPEN',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    deleted_at DATETIME NULL COMMENT 'Soft delete timestamp',

    CONSTRAINT fk_tour_departures_tour
    FOREIGN KEY (tour_id)
    REFERENCES tours(id)
    ON DELETE CASCADE,

    CONSTRAINT uq_tour_departure
    UNIQUE (tour_id, departure_date),

    INDEX idx_tour_departures_deleted_at (deleted_at)
);

-- =========================================================
-- BOOKINGS
-- =========================================================

CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    booking_code VARCHAR(50) NOT NULL UNIQUE,

    user_id BIGINT NULL,

    tour_departure_id BIGINT NOT NULL,

    booking_type ENUM(
        'INDIVIDUAL',
        'GROUP',
        'PRIVATE'
    ) DEFAULT 'INDIVIDUAL',

    organization_name VARCHAR(255),

    contact_person VARCHAR(255),

    full_name VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL,

    phone VARCHAR(20) NOT NULL,

    pickup_address TEXT,

    total_people INT NOT NULL,

    adult_count INT DEFAULT 0,

    child_count INT DEFAULT 0,

    adult_price_snapshot DECIMAL(12,2),

    child_price_snapshot DECIMAL(12,2),

    total_price DECIMAL(12,2) NOT NULL,

    note TEXT,

    special_request TEXT,

    internal_note TEXT,

    booking_status ENUM(
        'PENDING',
        'CONFIRMED',
        'CANCELLED',
        'IN_PROGRESS',
        'COMPLETED'
    ) DEFAULT 'PENDING',

    payment_status ENUM(
        'UNPAID',
        'PARTIAL',
        'PAID',
        'REFUNDED',
        'FAILED'
    ) DEFAULT 'UNPAID',

    payment_deadline DATETIME NULL,

    booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    confirmed_at DATETIME NULL,

    confirmed_by BIGINT NULL,

    cancelled_at DATETIME NULL,

    deleted_at DATETIME NULL,

    CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id)
    REFERENCES users(id),

    CONSTRAINT fk_bookings_tour_departure
    FOREIGN KEY (tour_departure_id)
    REFERENCES tour_departures(id),

    CONSTRAINT fk_booking_confirmed_by
    FOREIGN KEY (confirmed_by)
    REFERENCES users(id),

    CONSTRAINT chk_booking_code
    CHECK (
        booking_code REGEXP '^[A-Z0-9]+$'
    )
);

-- =========================================================
-- BOOKING CUSTOMERS
-- =========================================================

CREATE TABLE booking_customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    booking_id BIGINT NOT NULL,

    customer_type ENUM(
        'ADULT',
        'CHILD',
        'INFANT'
    ) DEFAULT 'ADULT',

    full_name VARCHAR(255) NOT NULL,

    gender ENUM(
        'MALE',
        'FEMALE',
        'OTHER'
    ) DEFAULT 'OTHER',

    date_of_birth DATE,

    identity_number VARCHAR(50),

    email VARCHAR(255),

    phone VARCHAR(20),

    address TEXT,

    emergency_contact VARCHAR(255),

    is_group_leader BOOLEAN DEFAULT FALSE,

    checked_in BOOLEAN DEFAULT FALSE,

    checked_in_at DATETIME NULL,

    health_note TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_customers_booking
    FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE CASCADE
);

-- =========================================================
-- BOOKING EMPLOYEES
-- =========================================================

CREATE TABLE booking_employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    booking_id BIGINT NOT NULL,

    employee_id BIGINT NOT NULL,

    role_in_trip ENUM(
        'GUIDE',
        'ASSISTANT',
        'DRIVER',
        'PHOTOGRAPHER'
    ) DEFAULT 'GUIDE',

    note TEXT,

    assignment_status ENUM(
        'ASSIGNED',
        'ACCEPTED',
        'REJECTED'
    ) DEFAULT 'ASSIGNED',

    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    accepted_at DATETIME NULL,

    CONSTRAINT fk_booking_employees_booking
    FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_booking_employees_employee
    FOREIGN KEY (employee_id)
    REFERENCES users(id),

    CONSTRAINT uq_booking_employee
    UNIQUE (booking_id, employee_id)
);

-- =========================================================
-- BOOKING SCHEDULE DAYS
-- =========================================================

CREATE TABLE booking_schedule_days (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    booking_id BIGINT NOT NULL,

    day_number INT NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_schedule_days_booking
    FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE CASCADE,

    CONSTRAINT uq_booking_schedule_day
    UNIQUE (booking_id, day_number)
);

-- =========================================================
-- BOOKING SCHEDULE ACTIVITIES
-- =========================================================

CREATE TABLE booking_schedule_activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    booking_schedule_day_id BIGINT NOT NULL,

    original_activity_id BIGINT NULL,

    start_time TIME,

    end_time TIME,

    actual_start_time DATETIME NULL,

    actual_end_time DATETIME NULL,

    actual_location TEXT,

    attachment_url VARCHAR(1000),

    title VARCHAR(255) NOT NULL,

    description TEXT,

    activity_status ENUM(
        'PENDING',
        'DONE',
        'SKIPPED',
        'CHANGED'
    ) DEFAULT 'PENDING',

    actual_note TEXT,

    completed_at DATETIME NULL,

    updated_by_employee BIGINT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_schedule_activities_day
    FOREIGN KEY (booking_schedule_day_id)
    REFERENCES booking_schedule_days(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_booking_schedule_activities_original
    FOREIGN KEY (original_activity_id)
    REFERENCES tour_activities(id),

    CONSTRAINT fk_booking_schedule_activities_employee
    FOREIGN KEY (updated_by_employee)
    REFERENCES users(id)
);

-- =========================================================
-- ACTIVITY CHANGE LOGS
-- =========================================================

CREATE TABLE activity_change_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    booking_schedule_activity_id BIGINT NOT NULL,

    changed_by BIGINT NOT NULL,

    old_title VARCHAR(255),

    new_title VARCHAR(255),

    old_time TIME,

    new_time TIME,

    reason TEXT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_change_logs_activity
    FOREIGN KEY (booking_schedule_activity_id)
    REFERENCES booking_schedule_activities(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_activity_change_logs_user
    FOREIGN KEY (changed_by)
    REFERENCES users(id)
);

-- =========================================================
-- PAYMENTS
-- =========================================================

CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    booking_id BIGINT NOT NULL,

    payment_method ENUM(
        'CASH',
        'BANKING',
        'MOMO',
        'VNPAY'
    ) NOT NULL,

    payment_type ENUM(
        'DEPOSIT',
        'PARTIAL',
        'FULL',
        'REFUND'
    ) DEFAULT 'FULL',

    amount DECIMAL(12,2) NOT NULL,

    paid_by VARCHAR(255),

    transaction_code VARCHAR(255),

    note TEXT,

    payment_status ENUM(
        'PENDING',
        'PAID',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'PENDING',

    paid_at DATETIME NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_booking
    FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE CASCADE
);

-- =========================================================
-- REVIEWS
-- =========================================================

CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    booking_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    tour_id BIGINT NOT NULL,

    rating INT NOT NULL,

    comment TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_review_rating
    CHECK (
        rating >= 1
        AND rating <= 5
    ),

    CONSTRAINT fk_reviews_booking
    FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id)
    REFERENCES users(id),

    CONSTRAINT fk_reviews_tour
    FOREIGN KEY (tour_id)
    REFERENCES tours(id),

    CONSTRAINT uq_review_booking_user
    UNIQUE (booking_id, user_id)
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL,

    type ENUM(
        'BOOKING',
        'PAYMENT',
        'TOUR',
        'SYSTEM'
    ) DEFAULT 'SYSTEM',

    reference_type VARCHAR(50),

    reference_id BIGINT,

    title VARCHAR(255) NOT NULL,

    content TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_users_role
ON users(role_id);

CREATE INDEX idx_tours_status
ON tours(status);

CREATE INDEX idx_tour_departures_status
ON tour_departures(status);

CREATE INDEX idx_tour_departures_date
ON tour_departures(departure_date);

CREATE INDEX idx_departure_booking_deadline
ON tour_departures(booking_deadline);

CREATE INDEX idx_bookings_status
ON bookings(booking_status);

CREATE INDEX idx_bookings_payment_status
ON bookings(payment_status);

CREATE INDEX idx_booking_departure
ON bookings(tour_departure_id);

CREATE INDEX idx_booking_user
ON bookings(user_id);

CREATE INDEX idx_booking_type
ON bookings(booking_type);

CREATE INDEX idx_booking_customer_booking
ON booking_customers(booking_id);

CREATE INDEX idx_booking_employees_status
ON booking_employees(assignment_status);

CREATE INDEX idx_booking_employee_role
ON booking_employees(role_in_trip);

CREATE INDEX idx_schedule_activity_status
ON booking_schedule_activities(activity_status);

CREATE INDEX idx_schedule_updated_by
ON booking_schedule_activities(updated_by_employee);

CREATE INDEX idx_payment_booking
ON payments(booking_id);

CREATE INDEX idx_payment_status
ON payments(payment_status);

CREATE INDEX idx_notifications_is_read
ON notifications(is_read);