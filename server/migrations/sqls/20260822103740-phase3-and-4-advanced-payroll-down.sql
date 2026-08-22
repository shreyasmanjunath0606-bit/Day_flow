/* Phase 3 & 4 Advanced Payroll Migration - DOWN */

DROP TRIGGER IF EXISTS trg_salary_revision;

DROP TABLE IF EXISTS `payroll_deductions`;
DROP TABLE IF EXISTS `payroll_allowances`;
DROP TABLE IF EXISTS `payroll_records`;
DROP TABLE IF EXISTS `deduction_types`;
DROP TABLE IF EXISTS `allowance_types`;
DROP TABLE IF EXISTS `salary_revision_history`;

DROP TABLE IF EXISTS `salary_structures`;

-- Recreate old simple salary_structures from developer1
CREATE TABLE IF NOT EXISTS `salary_structures` (
  `id` VARCHAR(36) PRIMARY KEY,
  `profile_id` VARCHAR(36) NOT NULL UNIQUE,
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