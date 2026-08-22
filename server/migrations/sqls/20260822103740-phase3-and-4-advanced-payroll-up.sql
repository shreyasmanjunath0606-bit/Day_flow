/* Phase 3 & 4 Advanced Payroll Migration */

-- We are upgrading the simple string-based salary_structures to a mathematical decimal-based table
DROP TABLE IF EXISTS `salary_structures`;

CREATE TABLE IF NOT EXISTS `salary_structures` (
    `id` VARCHAR(36) PRIMARY KEY,
    `profile_id` VARCHAR(36) NOT NULL UNIQUE,
    `basic_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `hra` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `da` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `special_allowance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `gross_salary` DECIMAL(12,2) GENERATED ALWAYS AS (basic_salary + hra + da + special_allowance) STORED,
    `pf_deduction` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `tax_deduction` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `other_deductions` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `net_salary` DECIMAL(12,2) GENERATED ALWAYS AS (basic_salary + hra + da + special_allowance - pf_deduction - tax_deduction - other_deductions) STORED,
    `effective_from` DATE,
    `updated_by` VARCHAR(36) DEFAULT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `bank_name` VARCHAR(150),
    `account_number` VARCHAR(100),
    CONSTRAINT fk_ss_profile FOREIGN KEY (`profile_id`) REFERENCES `employee_profiles`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `salary_revision_history` (
    `id` VARCHAR(36) PRIMARY KEY,
    `profile_id` VARCHAR(36) NOT NULL,
    `old_basic` DECIMAL(12,2) NOT NULL,
    `new_basic` DECIMAL(12,2) NOT NULL,
    `old_gross` DECIMAL(12,2) NOT NULL,
    `new_gross` DECIMAL(12,2) NOT NULL,
    `old_net` DECIMAL(12,2) NOT NULL,
    `new_net` DECIMAL(12,2) NOT NULL,
    `revision_reason` TEXT,
    `revised_by` VARCHAR(36),
    `effective_from` DATE NOT NULL,
    `revised_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_srh_profile FOREIGN KEY (`profile_id`) REFERENCES `employee_profiles`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `allowance_types` (
    `id` VARCHAR(36) PRIMARY KEY,
    `type_name` VARCHAR(50) NOT NULL UNIQUE,
    `is_taxable` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `deduction_types` (
    `id` VARCHAR(36) PRIMARY KEY,
    `type_name` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Using INT for pay_month/year but UUID for relation
CREATE TABLE IF NOT EXISTS `payroll_records` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `pay_month` TINYINT NOT NULL CHECK (pay_month BETWEEN 1 AND 12),
    `pay_year` YEAR NOT NULL,
    `days_worked` INT DEFAULT 0,
    `leave_days_paid` DECIMAL(5,1) DEFAULT 0.0,
    `leave_days_unpaid` DECIMAL(5,1) DEFAULT 0.0,
    `basic_salary` DECIMAL(12,2) NOT NULL,
    `hra` DECIMAL(12,2) NOT NULL,
    `da` DECIMAL(12,2) NOT NULL,
    `special_allowance` DECIMAL(12,2) NOT NULL,
    `pf_deduction` DECIMAL(12,2) NOT NULL,
    `tax_deduction` DECIMAL(12,2) NOT NULL,
    `other_deductions` DECIMAL(12,2) NOT NULL,
    `variable_allowances` DECIMAL(12,2) DEFAULT 0.00,
    `variable_deductions` DECIMAL(12,2) DEFAULT 0.00,
    `unpaid_leave_deduction` DECIMAL(12,2) DEFAULT 0.00,
    `gross_pay` DECIMAL(12,2) GENERATED ALWAYS AS (basic_salary + hra + da + special_allowance + variable_allowances) STORED,
    `net_pay` DECIMAL(12,2) GENERATED ALWAYS AS (basic_salary + hra + da + special_allowance + variable_allowances - pf_deduction - tax_deduction - other_deductions - variable_deductions - unpaid_leave_deduction) STORED,
    `payment_status` ENUM('DRAFT', 'PROCESSED', 'PAID') NOT NULL DEFAULT 'DRAFT',
    `payment_date` DATE DEFAULT NULL,
    `generated_by` VARCHAR(36),
    `generated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_payroll_period UNIQUE (`user_id`, `pay_month`, `pay_year`),
    CONSTRAINT fk_pr_user FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `payroll_allowances` (
    `id` VARCHAR(36) PRIMARY KEY,
    `payroll_id` VARCHAR(36) NOT NULL,
    `allowance_type_id` VARCHAR(36) NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    `remarks` VARCHAR(255),
    CONSTRAINT fk_pa_payroll FOREIGN KEY (`payroll_id`) REFERENCES `payroll_records`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_pa_type FOREIGN KEY (`allowance_type_id`) REFERENCES `allowance_types`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `payroll_deductions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `payroll_id` VARCHAR(36) NOT NULL,
    `deduction_type_id` VARCHAR(36) NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    `remarks` VARCHAR(255),
    CONSTRAINT fk_pd_payroll FOREIGN KEY (`payroll_id`) REFERENCES `payroll_records`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_pd_type FOREIGN KEY (`deduction_type_id`) REFERENCES `deduction_types`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
