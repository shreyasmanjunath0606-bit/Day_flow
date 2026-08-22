-- ============================================================
-- DayFlow — Phase 4: Advanced Features & Automation
-- ============================================================
-- Prerequisites: Phase 1, 2, and 3
-- Run: mysql -u root -p dayflow < phase4_advanced.sql
-- ============================================================

USE dayflow;

-- ============================================================
-- 1. TRIGGER: trg_salary_revision
-- ============================================================
-- Design rationale:
--   • Automatically logs any changes to an employee's salary.
--   • Ensures that NO ONE (not even a DBA) can update a salary
--     without it leaving a permanent audit trail.
--   • Captures the exact before & after values for basic,
--     gross, and net pay.
-- ============================================================

DELIMITER //

CREATE TRIGGER trg_salary_revision
BEFORE UPDATE ON salary_structures
FOR EACH ROW
BEGIN
    -- Only log if the basic salary or allowances actually changed
    IF OLD.basic_salary != NEW.basic_salary OR 
       OLD.hra != NEW.hra OR 
       OLD.da != NEW.da OR 
       OLD.special_allowance != NEW.special_allowance THEN
       
        INSERT INTO salary_revision_history (
            employee_id, 
            old_basic, new_basic,
            old_gross, new_gross,
            old_net, new_net,
            revision_reason, revised_by, effective_from
        ) VALUES (
            OLD.employee_id,
            OLD.basic_salary, NEW.basic_salary,
            OLD.gross_salary, (NEW.basic_salary + NEW.hra + NEW.da + NEW.special_allowance),
            OLD.net_salary, (NEW.basic_salary + NEW.hra + NEW.da + NEW.special_allowance - NEW.pf_deduction - NEW.tax_deduction - NEW.other_deductions),
            'Automated revision trigger', NEW.updated_by, NEW.effective_from
        );
    END IF;
END //

DELIMITER ;


-- ============================================================
-- 2. STORED PROCEDURE: sp_update_salary
-- ============================================================
-- Safely updates an employee's salary structure.
-- The trigger above will automatically catch this and log it.
-- ============================================================

DELIMITER //

CREATE PROCEDURE sp_update_salary(
    IN p_employee_id        VARCHAR(20),
    IN p_new_basic          DECIMAL(12,2),
    IN p_new_hra            DECIMAL(12,2),
    IN p_new_da             DECIMAL(12,2),
    IN p_new_special        DECIMAL(12,2),
    IN p_new_pf             DECIMAL(12,2),
    IN p_new_tax            DECIMAL(12,2),
    IN p_hr_id              VARCHAR(20),
    IN p_effective_date     DATE,
    OUT p_result_msg        VARCHAR(255)
)
BEGIN
    DECLARE v_emp_exists INT;
    
    SELECT COUNT(*) INTO v_emp_exists FROM employees WHERE employee_id = p_employee_id AND is_active = TRUE;
    
    IF v_emp_exists = 0 THEN
        SET p_result_msg = 'ERROR: Employee not found or inactive.';
    ELSE
        UPDATE salary_structures
        SET basic_salary = p_new_basic,
            hra = p_new_hra,
            da = p_new_da,
            special_allowance = p_new_special,
            pf_deduction = p_new_pf,
            tax_deduction = p_new_tax,
            effective_from = p_effective_date,
            updated_by = p_hr_id
        WHERE employee_id = p_employee_id;
        
        SET p_result_msg = 'SUCCESS: Salary structure updated. Audit trail logged automatically.';
    END IF;
END //

DELIMITER ;


-- ============================================================
-- 3. STORED PROCEDURE: sp_generate_payroll
-- ============================================================
-- Highly Efficient Batch Processor:
-- Generates draft payroll records for ALL active employees for 
-- a specific month in a single transaction.
-- 
-- Calculation logic:
--   1. Fetches current salary structure.
--   2. Calculates unpaid leaves taken in the target month.
--   3. Calculates leave deductions based on unpaid leaves.
--   4. Inserts DRAFT payroll records.
-- ============================================================

DELIMITER //

CREATE PROCEDURE sp_generate_payroll(
    IN p_month          TINYINT,
    IN p_year           YEAR,
    IN p_generated_by   VARCHAR(20),
    OUT p_total_created INT,
    OUT p_result_msg    VARCHAR(255)
)
BEGIN
    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;
    DECLARE v_working_days INT DEFAULT 30; -- Standardized month length for payroll calculation
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_total_created = 0;
        SET p_result_msg = 'ERROR: An unexpected database error occurred during payroll generation.';
    END;

    -- Calculate first and last day of the target month
    SET v_start_date = STR_TO_DATE(CONCAT(p_year, '-', p_month, '-01'), '%Y-%m-%d');
    SET v_end_date = LAST_DAY(v_start_date);

    START TRANSACTION;

    -- Insert Draft Payrolls for all active employees who have a salary structure
    -- ONLY if they don't already have a payroll record for this month
    INSERT INTO payroll_records (
        employee_id, pay_month, pay_year, 
        basic_salary, hra, da, special_allowance, 
        pf_deduction, tax_deduction, other_deductions,
        leave_days_paid, leave_days_unpaid, unpaid_leave_deduction,
        generated_by, payment_status
    )
    SELECT 
        e.employee_id, 
        p_month, 
        p_year,
        ss.basic_salary, 
        ss.hra, 
        ss.da, 
        ss.special_allowance,
        ss.pf_deduction, 
        ss.tax_deduction, 
        ss.other_deductions,
        
        -- Subquery: Calculate PAID/SICK leave days taken in this month
        COALESCE((
            SELECT SUM(total_days)
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.leave_type_id
            WHERE lr.employee_id = e.employee_id
              AND lr.status = 'APPROVED'
              AND lt.is_paid = TRUE
              AND lr.start_date >= v_start_date 
              AND lr.start_date <= v_end_date
        ), 0) AS leave_days_paid,
        
        -- Subquery: Calculate UNPAID leave days taken in this month
        COALESCE((
            SELECT SUM(total_days)
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.leave_type_id
            WHERE lr.employee_id = e.employee_id
              AND lr.status = 'APPROVED'
              AND lt.is_paid = FALSE
              AND lr.start_date >= v_start_date 
              AND lr.start_date <= v_end_date
        ), 0) AS leave_days_unpaid,
        
        -- Calculation: Unpaid Leave Deduction = (Gross / 30) * unpaid_leave_days
        (ss.gross_salary / v_working_days) * 
        COALESCE((
            SELECT SUM(total_days)
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.leave_type_id
            WHERE lr.employee_id = e.employee_id
              AND lr.status = 'APPROVED'
              AND lt.is_paid = FALSE
              AND lr.start_date >= v_start_date 
              AND lr.start_date <= v_end_date
        ), 0) AS unpaid_leave_deduction,
        
        p_generated_by, 
        'DRAFT'
        
    FROM employees e
    JOIN salary_structures ss ON e.employee_id = ss.employee_id
    WHERE e.is_active = TRUE
      -- Ensure we don't generate duplicate payrolls for the same month
      AND NOT EXISTS (
          SELECT 1 FROM payroll_records pr 
          WHERE pr.employee_id = e.employee_id 
            AND pr.pay_month = p_month 
            AND pr.pay_year = p_year
      );

    SET p_total_created = ROW_COUNT();
    
    SET p_result_msg = CONCAT('SUCCESS: Successfully generated ', p_total_created, ' draft payroll records for ', p_month, '/', p_year);

    COMMIT;
END //

DELIMITER ;


-- ============================================================
-- 4. VIEW: vw_employee_payroll_latest
-- ============================================================
-- Extremely fast way for the frontend Dashboard to fetch the 
-- employee's most recent payslip information without complex joins.
-- ============================================================

CREATE OR REPLACE VIEW vw_employee_payroll_latest AS
SELECT 
    pr.payroll_id,
    pr.employee_id,
    e.first_name,
    e.last_name,
    d.dept_name,
    pr.pay_month,
    pr.pay_year,
    pr.gross_pay,
    pr.net_pay,
    pr.leave_days_unpaid,
    pr.unpaid_leave_deduction,
    pr.payment_status,
    pr.payment_date
FROM payroll_records pr
JOIN employees e ON pr.employee_id = e.employee_id
JOIN departments d ON e.department_id = d.department_id
WHERE pr.payroll_id = (
    -- Subquery to get the latest payroll ID for this employee
    SELECT MAX(payroll_id) 
    FROM payroll_records 
    WHERE employee_id = pr.employee_id
);

-- ============================================================
-- 5. PERFORMANCE INDEXES
-- ============================================================
-- These ensure that queries run instantly even with 10,000+ records.

-- Index for searching employees by name (Frontend search bar)
CREATE INDEX idx_emp_name ON employees (last_name, first_name);

-- Index for sorting payrolls chronologically
CREATE INDEX idx_pr_date ON payroll_records (pay_year DESC, pay_month DESC);

-- Index to quickly find an employee's leave history
CREATE INDEX idx_lr_history ON leave_requests (employee_id, start_date DESC);
