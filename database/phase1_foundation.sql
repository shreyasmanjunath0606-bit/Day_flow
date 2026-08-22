-- ============================================================
-- DayFlow — Phase 1: Foundation Tables
-- ============================================================
-- NOTE: These are TEMPORARY placeholder tables for testing.
-- When your teammate's auth/employee module is ready, replace
-- the `employees` and `roles` tables with hers. The foreign
-- keys in Phase 2–4 reference `employees(employee_id)` — just
-- make sure her table uses the same PK column name and type.
-- ============================================================

-- Create the database
CREATE DATABASE IF NOT EXISTS dayflow
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE dayflow;

-- ============================================================
-- 1. ROLES — Lookup table for access control
-- ============================================================
-- Normalized: instead of storing 'Employee'/'HR' as strings
-- everywhere, we reference this table by ID. Prevents typos
-- and makes role-based queries fast with INT comparisons.
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    role_id     INT AUTO_INCREMENT PRIMARY KEY,
    role_name   VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(150),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed the two required roles
INSERT INTO roles (role_name, description) VALUES
    ('Employee', 'Standard employee with self-service access'),
    ('HR',       'HR administrator with full workforce management access');


-- ============================================================
-- 2. DEPARTMENTS — Normalized lookup table
-- ============================================================
-- 3NF: Department names are stored once here, not repeated
-- as strings in the employees table. This ensures consistency
-- and allows renaming a department in one place.
-- ============================================================

CREATE TABLE IF NOT EXISTS departments (
    department_id   INT AUTO_INCREMENT PRIMARY KEY,
    dept_name       VARCHAR(100) NOT NULL UNIQUE,
    dept_code       VARCHAR(10) NOT NULL UNIQUE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed departments
INSERT INTO departments (dept_name, dept_code) VALUES
    ('Engineering',      'ENG'),
    ('Design',           'DSN'),
    ('Human Resources',  'HR'),
    ('Analytics',        'ANL'),
    ('Marketing',        'MKT'),
    ('Finance',          'FIN'),
    ('Operations',       'OPS');


-- ============================================================
-- 3. EMPLOYEES — Placeholder table for testing
-- ============================================================
-- ⚠️  TEMPORARY: Will be replaced by teammate's table.
--     When swapping, ensure:
--       • PK column is `employee_id VARCHAR(20)`
--       • Foreign keys in Phase 2–4 will reference it
--       • Keep `role_id` as FK to `roles` table
--       • Keep `department_id` as FK to `departments` table
--
-- Design notes:
--   • employee_id is VARCHAR(20) to match 'EMP-001' format
--     from the signup UI
--   • is_active provides soft-delete (never hard-delete
--     employees who have payroll/leave history)
--   • email has UNIQUE constraint to match signup validation
--   • hire_date is important for leave balance calculations
--     (pro-rated allocation for mid-year hires)
-- ============================================================

CREATE TABLE IF NOT EXISTS employees (
    employee_id     VARCHAR(20) PRIMARY KEY,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    role_id         INT NOT NULL,
    department_id   INT NOT NULL,
    designation     VARCHAR(100),
    hire_date       DATE NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_emp_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_emp_dept
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Indexes for common queries
    INDEX idx_emp_role (role_id),
    INDEX idx_emp_dept (department_id),
    INDEX idx_emp_active (is_active),
    INDEX idx_emp_email (email)
) ENGINE=InnoDB;


-- ============================================================
-- 4. SAMPLE EMPLOYEE DATA — For testing Phase 2–4
-- ============================================================
-- These match the employees shown in the DayFlow UI dashboard.
-- When teammate's data arrives, these can be replaced.
-- ============================================================

INSERT INTO employees (employee_id, first_name, last_name, email, phone, role_id, department_id, designation, hire_date) VALUES
    ('EMP-001', 'Alex',   'Morgan',   'alex.morgan@dayflow.com',   '+91-9876543210', 1, 1, 'Frontend Developer',  '2024-03-15'),
    ('EMP-002', 'Sarah',  'Chen',     'sarah.chen@dayflow.com',    '+91-9876543211', 1, 2, 'Product Designer',    '2024-01-10'),
    ('EMP-003', 'James',  'Wilson',   'james.wilson@dayflow.com',  '+91-9876543212', 1, 1, 'Backend Developer',   '2023-07-22'),
    ('EMP-004', 'Maya',   'Patel',    'maya.patel@dayflow.com',    '+91-9876543213', 2, 3, 'HR Manager',          '2023-01-05'),
    ('EMP-005', 'David',  'Kim',      'david.kim@dayflow.com',     '+91-9876543214', 1, 4, 'Data Analyst',        '2024-06-01'),
    ('EMP-006', 'Emma',   'Thompson', 'emma.thompson@dayflow.com', '+91-9876543215', 1, 1, 'QA Engineer',         '2023-11-18'),
    ('EMP-007', 'Ryan',   'Garcia',   'ryan.garcia@dayflow.com',   '+91-9876543216', 1, 1, 'DevOps Engineer',     '2024-02-28'),
    ('EMP-008', 'Lisa',   'Wang',     'lisa.wang@dayflow.com',     '+91-9876543217', 1, 5, 'Marketing Lead',      '2023-09-12');


-- ============================================================
-- VERIFICATION QUERIES — Run these to confirm Phase 1 is correct
-- ============================================================

-- 1. Check all tables exist
SELECT TABLE_NAME, TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dayflow'
ORDER BY TABLE_NAME;

-- 2. Verify employee count and role distribution
SELECT r.role_name, COUNT(*) AS emp_count
FROM employees e
JOIN roles r ON e.role_id = r.role_id
GROUP BY r.role_name;

-- 3. Verify department distribution
SELECT d.dept_name, d.dept_code, COUNT(e.employee_id) AS emp_count
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
GROUP BY d.department_id
ORDER BY emp_count DESC;

-- Expected output:
-- Engineering: 4 employees (Alex, James, Emma, Ryan)
-- Design: 1 (Sarah)
-- Human Resources: 1 (Maya)
-- Analytics: 1 (David)
-- Marketing: 1 (Lisa)
-- Finance, Operations: 0 each
