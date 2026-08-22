-- DayFlow Workforce Management - MySQL Database Schema DDL

CREATE DATABASE IF NOT EXISTS `dayflow_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dayflow_db`;

-- 1. Users Table (Authentication & System Roles)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('employee', 'hr') NOT NULL DEFAULT 'employee',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Employee Profiles Table (Personal & Job Details)
CREATE TABLE IF NOT EXISTS `employee_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `dob` DATE,
  `gender` VARCHAR(50),
  `address` TEXT,
  `avatar_url` TEXT,
  `emergency_name` VARCHAR(255),
  `emergency_relation` VARCHAR(100),
  `emergency_phone` VARCHAR(50),
  `designation` VARCHAR(150),
  `department` VARCHAR(150),
  `employee_type` VARCHAR(50) DEFAULT 'Full-Time',
  `date_of_joining` DATE,
  `work_location` VARCHAR(255),
  `manager_name` VARCHAR(255),
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Salary Structures Table
CREATE TABLE IF NOT EXISTS `salary_structures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `profile_id` INT NOT NULL UNIQUE,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `annual_package` VARCHAR(50) DEFAULT '$145,000',
  `monthly_base` VARCHAR(50) DEFAULT '$8,500',
  `hra` VARCHAR(50) DEFAULT '$2,200',
  `special_allowance` VARCHAR(50) DEFAULT '$1,383',
  `gross_monthly` VARCHAR(50) DEFAULT '$12,083',
  `tax_deduction` VARCHAR(50) DEFAULT '$1,850',
  `pf_deduction` VARCHAR(50) DEFAULT '$650',
  `insurance_deduction` VARCHAR(50) DEFAULT '$150',
  `net_monthly_pay` VARCHAR(50) DEFAULT '$9,433',
  `bank_name` VARCHAR(150) DEFAULT 'Chase Bank',
  `account_number` VARCHAR(100) DEFAULT '•••• •••• 4892',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`profile_id`) REFERENCES `employee_profiles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Attendance Logs Table (Check-In/Out & Status Types)
CREATE TABLE IF NOT EXISTS `attendance_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `log_date` DATE NOT NULL,
  `check_in_time` VARCHAR(20),
  `check_out_time` VARCHAR(20),
  `logged_hours` VARCHAR(50) DEFAULT '0.0 hrs',
  `status` ENUM('PRESENT', 'HALF_DAY', 'ABSENT', 'LEAVE') NOT NULL DEFAULT 'PRESENT',
  `note` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Leave Requests Table
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `leave_type` VARCHAR(100) NOT NULL,
  `from_date` VARCHAR(50) NOT NULL,
  `to_date` VARCHAR(50) NOT NULL,
  `total_days` INT NOT NULL,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
