-- ============================================================================
-- Migration 001: Developer 1 Baseline - Core Users & Employee Profiles
-- Version: 001
-- Description: Creates schema_migrations tracking, users, employee_profiles, and salary_structures
-- ============================================================================

-- 0. Schema Migrations History Tracking Table
CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `version` VARCHAR(255) NOT NULL UNIQUE,
  `filename` VARCHAR(255) NOT NULL,
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1. Core Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `employee_id` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('employee', 'hr', 'admin') NOT NULL DEFAULT 'employee',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Employee Profiles Table
CREATE TABLE IF NOT EXISTS `employee_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` INT NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `dob` DATE DEFAULT NULL,
  `gender` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `avatar_url` LONGTEXT DEFAULT NULL,
  `emergency_name` VARCHAR(255) DEFAULT NULL,
  `emergency_relation` VARCHAR(100) DEFAULT NULL,
  `emergency_phone` VARCHAR(50) DEFAULT NULL,
  `designation` VARCHAR(255) DEFAULT 'Software Engineer',
  `department` VARCHAR(255) DEFAULT 'Engineering',
  `employee_type` VARCHAR(100) DEFAULT 'Full-Time',
  `date_of_joining` DATE DEFAULT NULL,
  `work_location` VARCHAR(255) DEFAULT 'HQ (Hybrid)',
  `manager_name` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('Active', 'On-Leave', 'Terminated') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Salary Structures Table
CREATE TABLE IF NOT EXISTS `salary_structures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL DEFAULT (UUID()),
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
  `bank_name` VARCHAR(255) DEFAULT 'Chase Bank',
  `account_number` VARCHAR(100) DEFAULT '•••• •••• 4892',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`profile_id`) REFERENCES `employee_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
