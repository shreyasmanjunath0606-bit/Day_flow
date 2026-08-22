-- ============================================================
-- DayFlow — Phase 3: Payroll & Salary Management
-- ============================================================
-- Prerequisites: Phase 1 & Phase 2
-- Run: mysql -u root -p dayflow < phase3_payroll_management.sql
-- ============================================================

USE dayflow;

-- ============================================================
-- 1. SALARY_STRUCTURES — Current standard salary per employee
-- ============================================================
-- Design rationale:
--   • Stores the baseline salary components.
--   • gross_salary and net_salary are GENERATED COLUMNS to
--     ensure they are always perfectly mathematically consistent
--     with the base components.
--   • UNIQUE constraint on employee_id ensures there is only
--     ONE active salary structure per employee at any time.
--   • Leave deductions are NOT stored here — they are calculated
--     dynamically per month in the `payroll_records` table.
-- ============================================================

CREATE TABLE IF NOT EXISTS salary_structures (
    structure_id        INT AUTO_INCREMENT PRIMARY KEY,
    employee_id         VARCHAR(20) NOT NULL UNIQUE,
    basic_salary        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    hra                 DECIMAL(12,2) NOT NULL DEFAULT 0.00
        COMMENT 'House Rent Allowance',
    da                  DECIMAL(12,2) NOT NULL DEFAULT 0.00
        COMMENT 'Dearness Allowance',
    special_allowance   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    
    -- Auto-computed gross salary
    gross_salary        DECIMAL(12,2) GENERATED ALWAYS AS 
        (basic_salary + hra + da + special_allowance) STORED,
        
    pf_deduction        DECIMAL(12,2) NOT NULL DEFAULT 0.00
        COMMENT 'Provident Fund',
    tax_deduction       DECIMAL(12,2) NOT NULL DEFAULT 0.00
        COMMENT 'Income Tax (TDS)',
    other_deductions    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    
    -- Auto-computed standard net salary (before any variable leave deductions)
    net_salary          DECIMAL(12,2) GENERATED ALWAYS AS 
        (basic_salary + hra + da + special_allowance - pf_deduction - tax_deduction - other_deductions) STORED,
        
    effective_from      DATE NOT NULL,
    updated_by          VARCHAR(20) DEFAULT NULL,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ss_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    CONSTRAINT fk_ss_updater
        FOREIGN KEY (updated_by) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    -- Basic sanity checks
    CONSTRAINT chk_basic_positive CHECK (basic_salary >= 0),
    CONSTRAINT chk_hra_positive CHECK (hra >= 0),
    CONSTRAINT chk_da_positive CHECK (da >= 0),
    CONSTRAINT chk_pf_positive CHECK (pf_deduction >= 0),
    CONSTRAINT chk_tax_positive CHECK (tax_deduction >= 0)
) ENGINE=InnoDB;


-- ============================================================
-- 2. SALARY_REVISION_HISTORY — Audit trail of all salary changes
-- ============================================================
-- Design rationale:
--   • Will be automatically populated by a trigger when
--     salary_structures is updated (in Phase 4).
--   • Keeps track of old vs new values for promotions/appraisals.
-- ============================================================

CREATE TABLE IF NOT EXISTS salary_revision_history (
    revision_id         INT AUTO_INCREMENT PRIMARY KEY,
    employee_id         VARCHAR(20) NOT NULL,
    old_basic           DECIMAL(12,2) NOT NULL,
    new_basic           DECIMAL(12,2) NOT NULL,
    old_gross           DECIMAL(12,2) NOT NULL,
    new_gross           DECIMAL(12,2) NOT NULL,
    old_net             DECIMAL(12,2) NOT NULL,
    new_net             DECIMAL(12,2) NOT NULL,
    revision_reason     TEXT,
    revised_by          VARCHAR(20),
    effective_from      DATE NOT NULL,
    revised_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_srh_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_srh_reviser
        FOREIGN KEY (revised_by) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_srh_emp_date (employee_id, revised_at)
) ENGINE=InnoDB;


-- ============================================================
-- 3. ALLOWANCE_TYPES & DEDUCTION_TYPES — Lookups for variable pay
-- ============================================================
-- For components that vary month-to-month (like bonuses, overtime,
-- or penalty deductions) and aren't part of the standard structure.
-- ============================================================

CREATE TABLE IF NOT EXISTS allowance_types (
    allowance_type_id   INT AUTO_INCREMENT PRIMARY KEY,
    type_name           VARCHAR(50) NOT NULL UNIQUE,
    is_taxable          BOOLEAN DEFAULT TRUE,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS deduction_types (
    deduction_type_id   INT AUTO_INCREMENT PRIMARY KEY,
    type_name           VARCHAR(50) NOT NULL UNIQUE,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO allowance_types (type_name, is_taxable) VALUES
    ('Performance Bonus', TRUE),
    ('Overtime Pay', TRUE),
    ('Travel Reimbursement', FALSE),
    ('Internet Allowance', FALSE);

INSERT INTO deduction_types (type_name) VALUES
    ('Loan Repayment'),
    ('Disciplinary Penalty'),
    ('Loss of Asset');


-- ============================================================
-- 4. PAYROLL_RECORDS — The monthly payslip snapshot
-- ============================================================
-- Design rationale:
--   • Acts as a historical snapshot. We copy the basic_salary
--     into this table so that if the salary_structure changes
--     next year, old payslips remain accurate.
--   • Explicitly handles 'unpaid_leave_deduction'.
--   • 'leave_days_paid' and 'leave_days_unpaid' are tracked for
--     transparency on the payslip.
-- ============================================================

CREATE TABLE IF NOT EXISTS payroll_records (
    payroll_id              INT AUTO_INCREMENT PRIMARY KEY,
    employee_id             VARCHAR(20) NOT NULL,
    pay_month               TINYINT NOT NULL CHECK (pay_month BETWEEN 1 AND 12),
    pay_year                YEAR NOT NULL,
    
    -- Attendance summary for the month
    days_worked             INT DEFAULT 0,
    leave_days_paid         DECIMAL(5,1) DEFAULT 0.0
        COMMENT 'Approved paid/sick leaves taken this month. No salary deduction.',
    leave_days_unpaid       DECIMAL(5,1) DEFAULT 0.0
        COMMENT 'Approved unpaid leaves taken this month. Deducted from salary.',
    
    -- Snapshot of the standard structure for this month
    basic_salary            DECIMAL(12,2) NOT NULL,
    hra                     DECIMAL(12,2) NOT NULL,
    da                      DECIMAL(12,2) NOT NULL,
    special_allowance       DECIMAL(12,2) NOT NULL,
    pf_deduction            DECIMAL(12,2) NOT NULL,
    tax_deduction           DECIMAL(12,2) NOT NULL,
    other_deductions        DECIMAL(12,2) NOT NULL,
    
    -- Variables specific to this month
    variable_allowances     DECIMAL(12,2) DEFAULT 0.00
        COMMENT 'Sum from payroll_allowances table',
    variable_deductions     DECIMAL(12,2) DEFAULT 0.00
        COMMENT 'Sum from payroll_deductions table',
        
    -- Unpaid leave deduction (formula: (gross_salary / 30) * leave_days_unpaid)
    unpaid_leave_deduction  DECIMAL(12,2) DEFAULT 0.00
        COMMENT 'Calculated deduction for taking unpaid leaves',
        
    -- Auto-computed final payslip amounts
    gross_pay               DECIMAL(12,2) GENERATED ALWAYS AS 
        (basic_salary + hra + da + special_allowance + variable_allowances) STORED,
        
    net_pay                 DECIMAL(12,2) GENERATED ALWAYS AS 
        (basic_salary + hra + da + special_allowance + variable_allowances 
         - pf_deduction - tax_deduction - other_deductions - variable_deductions - unpaid_leave_deduction) STORED,
         
    payment_status          ENUM('DRAFT', 'PROCESSED', 'PAID') NOT NULL DEFAULT 'DRAFT',
    payment_date            DATE DEFAULT NULL,
    generated_by            VARCHAR(20),
    generated_at            DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_payroll_period UNIQUE (employee_id, pay_month, pay_year),

    CONSTRAINT fk_pr_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
        
    CONSTRAINT fk_pr_generator
        FOREIGN KEY (generated_by) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_pr_period (pay_year, pay_month),
    INDEX idx_pr_status (payment_status)
) ENGINE=InnoDB;


-- ============================================================
-- 5. PAYROLL_ALLOWANCES & DEDUCTIONS — Line items for a specific month
-- ============================================================

CREATE TABLE IF NOT EXISTS payroll_allowances (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    payroll_id          INT NOT NULL,
    allowance_type_id   INT NOT NULL,
    amount              DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    remarks             VARCHAR(255),
    
    CONSTRAINT fk_pa_payroll
        FOREIGN KEY (payroll_id) REFERENCES payroll_records(payroll_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    CONSTRAINT fk_pa_type
        FOREIGN KEY (allowance_type_id) REFERENCES allowance_types(allowance_type_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payroll_deductions (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    payroll_id          INT NOT NULL,
    deduction_type_id   INT NOT NULL,
    amount              DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    remarks             VARCHAR(255),
    
    CONSTRAINT fk_pd_payroll
        FOREIGN KEY (payroll_id) REFERENCES payroll_records(payroll_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
        
    CONSTRAINT fk_pd_type
        FOREIGN KEY (deduction_type_id) REFERENCES deduction_types(deduction_type_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;


-- ============================================================
-- 6. SAMPLE DATA
-- ============================================================

-- Insert sample salary structures
INSERT INTO salary_structures (employee_id, basic_salary, hra, da, special_allowance, pf_deduction, tax_deduction, effective_from) VALUES
    ('EMP-001', 60000.00, 30000.00, 5000.00,  15000.00, 7200.00,  10000.00, '2026-01-01'),
    ('EMP-002', 75000.00, 37500.00, 6000.00,  20000.00, 9000.00,  15000.00, '2026-01-01'),
    ('EMP-003', 55000.00, 27500.00, 4500.00,  12000.00, 6600.00,   8000.00, '2026-01-01'),
    ('EMP-004', 80000.00, 40000.00, 7000.00,  25000.00, 9600.00,  18000.00, '2026-01-01');

-- Insert a sample payroll record for EMP-001 (Alex Morgan) for July 2026
-- Alex took 1 unpaid leave day in July.
INSERT INTO payroll_records (
    employee_id, pay_month, pay_year, days_worked, leave_days_paid, leave_days_unpaid,
    basic_salary, hra, da, special_allowance, pf_deduction, tax_deduction, other_deductions,
    unpaid_leave_deduction, payment_status, payment_date
) VALUES (
    'EMP-001', 7, 2026, 21, 2.0, 1.0, 
    60000.00, 30000.00, 5000.00, 15000.00, 7200.00, 10000.00, 0.00,
    3666.67, 'PAID', '2026-07-31'  -- (110000 gross / 30 days) * 1 unpaid day = 3666.67 deduction
);

-- Give Alex a performance bonus for July
INSERT INTO payroll_allowances (payroll_id, allowance_type_id, amount, remarks)
VALUES (1, 1, 5000.00, 'Q2 Outstanding Performance');
