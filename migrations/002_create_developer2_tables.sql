-- ============================================================================
-- Migration 002: Developer 2 Schema - Attendance Logs & Shift Schedules
-- Version: 002
-- Description: Creates attendance_logs and shift_schedules tables
-- ============================================================================

-- 1. Attendance Logs Table
CREATE TABLE IF NOT EXISTS `attendance_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` INT NOT NULL,
  `log_date` DATE NOT NULL,
  `check_in_time` VARCHAR(50) DEFAULT '—',
  `check_out_time` VARCHAR(50) DEFAULT '—',
  `logged_hours` VARCHAR(50) DEFAULT '0.0 hrs',
  `status` ENUM('PRESENT', 'HALF_DAY', 'ABSENT', 'LEAVE', 'LATE') DEFAULT 'PRESENT',
  `note` VARCHAR(255) DEFAULT 'Regular shift',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Shift Schedules Table
CREATE TABLE IF NOT EXISTS `shift_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` INT NOT NULL,
  `shift_name` VARCHAR(100) DEFAULT 'Morning Shift',
  `start_time` TIME DEFAULT '09:00:00',
  `end_time` TIME DEFAULT '17:30:00',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
