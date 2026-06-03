-- Advanced Student Management System Database Schema
-- Database: student_management_db

CREATE DATABASE IF NOT EXISTS student_management_db;
USE student_management_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    duration VARCHAR(50) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    gender VARCHAR(15) NOT NULL,
    dob DATE NOT NULL,
    address TEXT,
    course_id INT,
    semester INT NOT NULL,
    admission_date DATE NOT NULL,
    photo_url VARCHAR(255),
    CONSTRAINT fk_student_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_date (student_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Marks Table
CREATE TABLE IF NOT EXISTS marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    marks_obtained DOUBLE NOT NULL,
    total_marks DOUBLE NOT NULL,
    percentage DOUBLE NOT NULL,
    grade VARCHAR(10) NOT NULL,
    result_status VARCHAR(20) NOT NULL, -- Pass, Fail
    CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_subject (student_id, subject)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    timestamp DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Seed Users:
-- admin / admin123 -> BCrypt: $2a$10$YWbIzzeC4dhySz0Hg4k/Huzw9/C4iSK.tSuTFUJ8q1Tgz64RSjZqi
-- staff / staff123 -> BCrypt: $2a$10$/hrW5CuGOnY7ED/4x8MEy.AXwuSD0g4a/UTUXktrXsykZhla6jcJ6
INSERT INTO users (id, username, email, password, role) VALUES 
(1, 'admin', 'admin@sms.com', '$2a$10$YWbIzzeC4dhySz0Hg4k/Huzw9/C4iSK.tSuTFUJ8q1Tgz64RSjZqi', 'ADMIN'),
(2, 'staff', 'staff@sms.com', '$2a$10$/hrW5CuGOnY7ED/4x8MEy.AXwuSD0g4a/UTUXktrXsykZhla6jcJ6', 'STAFF')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Courses:
INSERT INTO courses (id, course_name, course_code, duration, description) VALUES
(1, 'Master of Computer Applications', 'MCA', '2 Years', 'Postgraduate course focusing on software development and computer applications.'),
(2, 'Bachelor of Computer Applications', 'BCA', '3 Years', 'Undergraduate course providing foundational programming and system analysis skills.'),
(3, 'Bachelor of Technology in CSE', 'BTech-CSE', '4 Years', 'Engineering degree in Computer Science with focus on algorithms and system design.'),
(4, 'Master of Science in Information Technology', 'MSc-IT', '2 Years', 'Advanced research and applications in modern IT frameworks.')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Students:
INSERT INTO students (id, first_name, last_name, email, phone, gender, dob, address, course_id, semester, admission_date, photo_url) VALUES
(1, 'John', 'Doe', 'john.doe@gmail.com', '9876543210', 'Male', '2001-05-15', '123 Baker Street, London', 1, 2, '2025-08-01', NULL),
(2, 'Jane', 'Smith', 'jane.smith@gmail.com', '9876543211', 'Female', '2002-09-20', '456 Elm Street, New York', 1, 2, '2025-08-01', NULL),
(3, 'Alice', 'Johnson', 'alice.j@gmail.com', '9876543212', 'Female', '2000-11-12', '789 Maple Drive, Toronto', 2, 4, '2024-08-01', NULL),
(4, 'Bob', 'Brown', 'bob.brown@gmail.com', '9876543213', 'Male', '2001-02-28', '101 Pine Avenue, Sydney', 3, 6, '2023-08-01', NULL)
ON DUPLICATE KEY UPDATE id=id;

-- Seed Attendance:
INSERT INTO attendance (id, student_id, attendance_date, status) VALUES
(1, 1, '2026-06-01', 'PRESENT'),
(2, 2, '2026-06-01', 'PRESENT'),
(3, 3, '2026-06-01', 'ABSENT'),
(4, 4, '2026-06-01', 'PRESENT'),
(5, 1, '2026-06-02', 'PRESENT'),
(6, 2, '2026-06-02', 'ABSENT'),
(7, 3, '2026-06-02', 'PRESENT'),
(8, 4, '2026-06-02', 'PRESENT'),
(9, 1, '2026-06-03', 'PRESENT'),
(10, 2, '2026-06-03', 'PRESENT'),
(11, 3, '2026-06-03', 'PRESENT'),
(12, 4, '2026-06-03', 'ABSENT')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Marks:
INSERT INTO marks (id, student_id, subject, marks_obtained, total_marks, percentage, grade, result_status) VALUES
(1, 1, 'Java Programming', 85, 100, 85.0, 'A', 'Pass'),
(2, 1, 'Database Systems', 92, 100, 92.0, 'A+', 'Pass'),
(3, 2, 'Java Programming', 78, 100, 78.0, 'B', 'Pass'),
(4, 2, 'Database Systems', 65, 100, 65.0, 'C', 'Pass'),
(5, 3, 'Software Engineering', 95, 100, 95.0, 'A+', 'Pass'),
(6, 4, 'Computer Networks', 45, 100, 45.0, 'Fail', 'Fail')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Activity Logs:
INSERT INTO activity_log (id, action, user_name, timestamp) VALUES
(1, 'System seeded with default values.', 'System', '2026-06-03 09:00:00'),
(2, 'Admin user account verified.', 'admin', '2026-06-03 09:15:00')
ON DUPLICATE KEY UPDATE id=id;
