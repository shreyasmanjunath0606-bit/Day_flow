-- ============================================================
-- DayFlow — Phase 2: Leave & Time-Off Management
-- ============================================================
-- Prerequisites: Phase 1 (roles, departments, employees)
-- Run: mysql -u root -p dayflow < phase2_leave_management.sql
-- ============================================================

USE dayflow;

-- ============================================================
-- 1. LEAVE_TYPES — Extensible leave category lookup
-- ============================================================
-- Design rationale:
--   • Separate table instead of ENUM so HR can add new types
--     (Maternity, Bereavement, Comp-Off) without ALTER TABLE.
--   • `is_paid` flag drives payroll deduction logic:
--       - Paid/Sick leaves → no salary deduction
--       - Unpaid leaves → salary deducted proportionally
--   • `default_annual_quota` is used by sp_init_yearly_leave_balances
--     to auto-allocate balances each year.
--   • `max_consecutive_days` prevents abuse (e.g., max 3 consecutive
--     sick days without a medical certificate).
--   • `requires_document` flags types needing proof uploads.
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_types (
    leave_type_id           INT AUTO_INCREMENT PRIMARY KEY,
    type_name               VARCHAR(50) NOT NULL UNIQUE,
    type_code               VARCHAR(10) NOT NULL UNIQUE,
    description             VARCHAR(255),
    is_paid                 BOOLEAN NOT NULL DEFAULT TRUE
        COMMENT 'TRUE = no salary deduction; FALSE = salary deducted for each day',
    default_annual_quota    DECIMAL(5,1) DEFAULT NULL
        COMMENT 'Default days allocated per year. NULL = unlimited (e.g., unpaid)',
    min_notice_days         INT DEFAULT 0
        COMMENT 'Minimum days in advance the request must be submitted',
    max_consecutive_days    INT DEFAULT NULL
        COMMENT 'Max consecutive days allowed without escalation. NULL = no limit',
    requires_document       BOOLEAN DEFAULT FALSE
        COMMENT 'Whether supporting documents are required (e.g., medical cert)',
    carry_forward_allowed   BOOLEAN DEFAULT FALSE
        COMMENT 'Whether unused days roll over to next year',
    max_carry_forward_days  DECIMAL(5,1) DEFAULT NULL
        COMMENT 'Cap on carry-forward. NULL = carry all unused',
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed the three required leave types + bonus types for completeness
INSERT INTO leave_types 
    (type_name, type_code, description, is_paid, default_annual_quota, min_notice_days, max_consecutive_days, requires_document, carry_forward_allowed, max_carry_forward_days)
VALUES
    ('Paid Leave',    'PL',  'Regular paid time off for personal reasons',
        TRUE,  12.0, 2,    NULL, FALSE, TRUE,  5.0),
    ('Sick Leave',    'SL',  'Leave for illness or medical appointments',
        TRUE,   6.0, 0,    3,    TRUE,  FALSE, NULL),
    ('Unpaid Leave',  'UL',  'Leave without pay — salary deducted proportionally',
        FALSE, NULL, 1,    NULL, FALSE, FALSE, NULL),
    ('Comp-Off',      'CO',  'Compensatory off for working on holidays/weekends',
        TRUE,  NULL, 1,    2,    FALSE, FALSE, NULL),
    ('Maternity Leave','ML', 'Maternity leave as per company policy',
        TRUE,  90.0, 30,   NULL, TRUE,  FALSE, NULL);


-- ============================================================
-- 2. LEAVE_BALANCES — Per-employee, per-type, per-year ledger
-- ============================================================
-- Design rationale:
--   • One row per (employee, leave_type, year) — enforced by
--     UNIQUE constraint. This is the "account balance" model.
--   • DECIMAL(5,1) supports half-day leaves (e.g., 0.5, 11.5).
--   • `total_pending` tracks days locked in pending requests,
--     preventing double-booking (can't apply for more than
--     available - pending).
--   • `remaining` is a GENERATED COLUMN computed automatically:
--       remaining = total_allocated + carried_forward
--                   - total_used - total_pending
--     This eliminates manual calculation errors.
--   • CHECK constraints prevent negative values — the database
--     itself enforces business rules, not just the app.
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_balances (
    balance_id          INT AUTO_INCREMENT PRIMARY KEY,
    employee_id         VARCHAR(20) NOT NULL,
    leave_type_id       INT NOT NULL,
    year                YEAR NOT NULL,
    total_allocated     DECIMAL(5,1) NOT NULL DEFAULT 0.0
        COMMENT 'Days allocated for this year (from leave_types.default_annual_quota)',
    carried_forward     DECIMAL(5,1) NOT NULL DEFAULT 0.0
        COMMENT 'Days carried over from previous year',
    total_used          DECIMAL(5,1) NOT NULL DEFAULT 0.0
        COMMENT 'Days actually consumed (approved leaves that occurred)',
    total_pending       DECIMAL(5,1) NOT NULL DEFAULT 0.0
        COMMENT 'Days locked in PENDING requests (prevents over-booking)',
    remaining           DECIMAL(5,1) GENERATED ALWAYS AS
        (total_allocated + carried_forward - total_used - total_pending) STORED
        COMMENT 'Auto-computed available balance',

    -- Constraints
    CONSTRAINT uq_leave_balance
        UNIQUE (employee_id, leave_type_id, year),

    CONSTRAINT fk_lb_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_lb_leave_type
        FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    -- Business rule: balances can never go negative
    CONSTRAINT chk_allocated_non_negative
        CHECK (total_allocated >= 0),
    CONSTRAINT chk_carried_non_negative
        CHECK (carried_forward >= 0),
    CONSTRAINT chk_used_non_negative
        CHECK (total_used >= 0),
    CONSTRAINT chk_pending_non_negative
        CHECK (total_pending >= 0),

    -- Indexes for common queries
    INDEX idx_lb_emp_year (employee_id, year),
    INDEX idx_lb_type_year (leave_type_id, year)
) ENGINE=InnoDB;

-- Seed balances for all employees for 2026
-- Paid Leave: 12 days, Sick Leave: 6 days, Unpaid: 0 (unlimited)
INSERT INTO leave_balances (employee_id, leave_type_id, year, total_allocated, carried_forward)
SELECT
    e.employee_id,
    lt.leave_type_id,
    2026 AS year,
    COALESCE(lt.default_annual_quota, 0) AS total_allocated,
    0 AS carried_forward
FROM employees e
CROSS JOIN leave_types lt
WHERE lt.is_active = TRUE
  AND lt.type_code IN ('PL', 'SL', 'UL')     -- Only seed the 3 core types for now
  AND e.is_active = TRUE;


-- ============================================================
-- 3. LEAVE_REQUESTS — Core leave application table
-- ============================================================
-- Design rationale:
--   • `total_days` is DECIMAL(5,1) for half-day support.
--   • `is_half_day` + `half_day_period` handle half-day logic.
--     CHECK constraint ensures half-day only applies to
--     single-day requests.
--   • `status` uses ENUM for storage efficiency (1 byte) and
--     prevents invalid status values at the database level.
--   • `cancellation_reason` is separate from `remarks` so the
--     original request reason is preserved.
--   • Composite indexes are designed for the two most common
--     query patterns:
--       1. "Show me all MY leaves" → idx_lr_emp_status
--       2. "Show me all PENDING leaves" (HR view) → idx_lr_status_date
--   • CHECK on dates prevents start > end.
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_requests (
    request_id          INT AUTO_INCREMENT PRIMARY KEY,
    employee_id         VARCHAR(20) NOT NULL,
    leave_type_id       INT NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    total_days          DECIMAL(5,1) NOT NULL
        COMMENT 'Number of leave days (may exclude weekends/holidays based on calculation)',
    is_half_day         BOOLEAN NOT NULL DEFAULT FALSE,
    half_day_period     ENUM('FIRST_HALF', 'SECOND_HALF') DEFAULT NULL
        COMMENT 'Which half of the day. NULL when is_half_day = FALSE',
    remarks             TEXT
        COMMENT 'Employee reason/remarks when applying',
    status              ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
                        NOT NULL DEFAULT 'PENDING',
    reviewed_by         VARCHAR(20) DEFAULT NULL
        COMMENT 'HR employee_id who approved/rejected',
    reviewed_at         DATETIME DEFAULT NULL
        COMMENT 'Timestamp of approval/rejection',
    cancellation_reason TEXT DEFAULT NULL
        COMMENT 'Reason if employee cancels (kept separate from original remarks)',
    cancelled_at        DATETIME DEFAULT NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_lr_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_lr_leave_type
        FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_lr_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    -- Business rule constraints
    CONSTRAINT chk_date_range
        CHECK (end_date >= start_date),

    CONSTRAINT chk_half_day_single
        CHECK (is_half_day = FALSE OR start_date = end_date),

    CONSTRAINT chk_half_day_period
        CHECK (
            (is_half_day = TRUE AND half_day_period IS NOT NULL) OR
            (is_half_day = FALSE AND half_day_period IS NULL)
        ),

    CONSTRAINT chk_total_days_positive
        CHECK (total_days > 0),

    -- Performance indexes (designed for the two main query patterns)
    -- Pattern 1: Employee viewing their own leaves, filtered by status
    INDEX idx_lr_emp_status (employee_id, status),
    -- Pattern 2: HR viewing all pending requests, sorted by date
    INDEX idx_lr_status_date (status, created_at),
    -- Pattern 3: Overlap detection — checking if date ranges conflict
    INDEX idx_lr_emp_dates (employee_id, start_date, end_date),
    -- Pattern 4: Reviewer lookup
    INDEX idx_lr_reviewer (reviewed_by)
) ENGINE=InnoDB;


-- ============================================================
-- 4. LEAVE_COMMENTS — Threaded comments on requests
-- ============================================================
-- Both HR (approval notes) and employees (additional info)
-- can add comments. This creates a conversation thread
-- attached to each leave request.
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_comments (
    comment_id      INT AUTO_INCREMENT PRIMARY KEY,
    request_id      INT NOT NULL,
    commenter_id    VARCHAR(20) NOT NULL,
    comment_text    TEXT NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lc_request
        FOREIGN KEY (request_id) REFERENCES leave_requests(request_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_lc_commenter
        FOREIGN KEY (commenter_id) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    -- Index for fetching all comments on a request, ordered by time
    INDEX idx_lc_request_time (request_id, created_at)
) ENGINE=InnoDB;


-- ============================================================
-- 5. LEAVE_STATUS_AUDIT — Immutable audit trail
-- ============================================================
-- Design rationale:
--   • Every status change is permanently logged here.
--   • Populated automatically by triggers (Phase 4), but the
--     table is created now so manual inserts work too.
--   • `old_status` is NULL for the initial INSERT (PENDING).
--   • This table is APPEND-ONLY — no UPDATEs or DELETEs
--     should ever be performed on it.
--   • Useful for compliance, dispute resolution, and analytics
--     (e.g., average approval time = reviewed_at - created_at).
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_status_audit (
    audit_id        INT AUTO_INCREMENT PRIMARY KEY,
    request_id      INT NOT NULL,
    old_status      VARCHAR(20) DEFAULT NULL
        COMMENT 'NULL for initial creation (new request)',
    new_status      VARCHAR(20) NOT NULL,
    changed_by      VARCHAR(20) NOT NULL
        COMMENT 'employee_id of person who triggered the change',
    change_reason   TEXT DEFAULT NULL
        COMMENT 'Optional note explaining the status change',
    changed_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lsa_request
        FOREIGN KEY (request_id) REFERENCES leave_requests(request_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_lsa_changer
        FOREIGN KEY (changed_by) REFERENCES employees(employee_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    -- Index for fetching audit history of a specific request
    INDEX idx_lsa_request_time (request_id, changed_at),
    -- Index for "what did this HR person do?" queries
    INDEX idx_lsa_changer (changed_by, changed_at)
) ENGINE=InnoDB;


-- ============================================================
-- 6. LEAVE OVERLAP PREVENTION — Stored Function
-- ============================================================
-- Prevents an employee from applying for overlapping dates.
-- Called by the sp_apply_leave procedure before inserting.
-- Returns TRUE if overlap exists, FALSE otherwise.
-- ============================================================

DELIMITER //

CREATE FUNCTION fn_check_leave_overlap(
    p_employee_id   VARCHAR(20),
    p_start_date    DATE,
    p_end_date      DATE
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE overlap_count INT;

    SELECT COUNT(*) INTO overlap_count
    FROM leave_requests
    WHERE employee_id = p_employee_id
      AND status IN ('PENDING', 'APPROVED')
      AND start_date <= p_end_date
      AND end_date >= p_start_date;

    RETURN overlap_count > 0;
END //

DELIMITER ;


-- ============================================================
-- 7. STORED PROCEDURE: sp_apply_leave
-- ============================================================
-- Validates all business rules and applies for leave in a
-- single TRANSACTION. Either everything succeeds or nothing
-- changes — no partial state.
--
-- Validations:
--   1. Employee must exist and be active
--   2. Leave type must exist and be active
--   3. No overlapping leave requests
--   4. Sufficient leave balance (for quota-based types)
--   5. Minimum notice period respected
--   6. Half-day rules enforced
--
-- On success: inserts leave_request + audit log + updates
-- pending balance. Returns the new request_id.
-- ============================================================

DELIMITER //

CREATE PROCEDURE sp_apply_leave(
    IN p_employee_id    VARCHAR(20),
    IN p_leave_type_id  INT,
    IN p_start_date     DATE,
    IN p_end_date       DATE,
    IN p_is_half_day    BOOLEAN,
    IN p_half_day_period VARCHAR(11),  -- 'FIRST_HALF' or 'SECOND_HALF' or NULL
    IN p_remarks        TEXT,
    OUT p_request_id    INT,
    OUT p_result_msg    VARCHAR(255)
)
BEGIN
    DECLARE v_total_days        DECIMAL(5,1);
    DECLARE v_balance_remaining DECIMAL(5,1);
    DECLARE v_has_quota         BOOLEAN;
    DECLARE v_min_notice        INT;
    DECLARE v_days_notice       INT;
    DECLARE v_type_active       BOOLEAN;
    DECLARE v_emp_active        BOOLEAN;
    DECLARE v_year              YEAR;

    -- Error handler: rollback on any error
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_request_id = NULL;
        SET p_result_msg = 'ERROR: An unexpected database error occurred';
    END;

    START TRANSACTION;

    -- ---- Validation 1: Employee exists and is active ----
    SELECT is_active INTO v_emp_active
    FROM employees WHERE employee_id = p_employee_id;

    IF v_emp_active IS NULL THEN
        SET p_result_msg = 'ERROR: Employee not found';
        ROLLBACK;
    ELSEIF v_emp_active = FALSE THEN
        SET p_result_msg = 'ERROR: Employee account is deactivated';
        ROLLBACK;
    ELSE

    -- ---- Validation 2: Leave type exists and is active ----
    SELECT is_active, min_notice_days,
           (default_annual_quota IS NOT NULL) AS has_quota
    INTO v_type_active, v_min_notice, v_has_quota
    FROM leave_types WHERE leave_type_id = p_leave_type_id;

    IF v_type_active IS NULL THEN
        SET p_result_msg = 'ERROR: Leave type not found';
        ROLLBACK;
    ELSEIF v_type_active = FALSE THEN
        SET p_result_msg = 'ERROR: This leave type is currently disabled';
        ROLLBACK;
    ELSE

    -- ---- Validation 3: Date validity ----
    IF p_end_date < p_start_date THEN
        SET p_result_msg = 'ERROR: End date cannot be before start date';
        ROLLBACK;
    ELSE

    -- ---- Validation 4: Half-day rules ----
    IF p_is_half_day = TRUE AND p_start_date != p_end_date THEN
        SET p_result_msg = 'ERROR: Half-day leave must be a single day';
        ROLLBACK;
    ELSE

    -- ---- Calculate total days ----
    IF p_is_half_day = TRUE THEN
        SET v_total_days = 0.5;
    ELSE
        -- Calculate business days (exclude weekends)
        SET v_total_days = (
            SELECT COUNT(*)
            FROM (
                SELECT DATE_ADD(p_start_date, INTERVAL seq DAY) AS d
                FROM (
                    SELECT @row := @row + 1 AS seq
                    FROM information_schema.columns, (SELECT @row := -1) r
                    LIMIT 366
                ) nums
                WHERE DATE_ADD(p_start_date, INTERVAL seq DAY) <= p_end_date
            ) dates
            WHERE DAYOFWEEK(d) NOT IN (1, 7)  -- Exclude Sunday(1) and Saturday(7)
        );
    END IF;

    IF v_total_days <= 0 THEN
        SET p_result_msg = 'ERROR: No working days in the selected range';
        ROLLBACK;
    ELSE

    -- ---- Validation 5: Minimum notice period ----
    SET v_days_notice = DATEDIFF(p_start_date, CURDATE());
    IF v_days_notice < v_min_notice THEN
        SET p_result_msg = CONCAT('ERROR: Minimum ', v_min_notice, ' days notice required. You provided ', v_days_notice, ' days');
        ROLLBACK;
    ELSE

    -- ---- Validation 6: No overlapping requests ----
    IF fn_check_leave_overlap(p_employee_id, p_start_date, p_end_date) THEN
        SET p_result_msg = 'ERROR: You already have a pending/approved leave overlapping these dates';
        ROLLBACK;
    ELSE

    -- ---- Validation 7: Sufficient balance (for quota-based types) ----
    SET v_year = YEAR(p_start_date);

    IF v_has_quota THEN
        SELECT remaining INTO v_balance_remaining
        FROM leave_balances
        WHERE employee_id = p_employee_id
          AND leave_type_id = p_leave_type_id
          AND year = v_year;

        IF v_balance_remaining IS NULL THEN
            SET p_result_msg = 'ERROR: No leave balance found for this year. Contact HR.';
            ROLLBACK;
        ELSEIF v_balance_remaining < v_total_days THEN
            SET p_result_msg = CONCAT('ERROR: Insufficient balance. Available: ', v_balance_remaining, ' days, Requested: ', v_total_days, ' days');
            ROLLBACK;
        ELSE
            -- ---- All validations passed → Insert ----

            -- Insert the leave request
            INSERT INTO leave_requests (
                employee_id, leave_type_id, start_date, end_date,
                total_days, is_half_day, half_day_period, remarks, status
            ) VALUES (
                p_employee_id, p_leave_type_id, p_start_date, p_end_date,
                v_total_days, p_is_half_day, p_half_day_period, p_remarks, 'PENDING'
            );

            SET p_request_id = LAST_INSERT_ID();

            -- Update pending balance
            UPDATE leave_balances
            SET total_pending = total_pending + v_total_days
            WHERE employee_id = p_employee_id
              AND leave_type_id = p_leave_type_id
              AND year = v_year;

            -- Insert audit trail
            INSERT INTO leave_status_audit (request_id, old_status, new_status, changed_by, change_reason)
            VALUES (p_request_id, NULL, 'PENDING', p_employee_id, 'New leave request submitted');

            SET p_result_msg = CONCAT('SUCCESS: Leave request #', p_request_id, ' submitted (', v_total_days, ' days)');

            COMMIT;
        END IF;
    ELSE
        -- Unpaid / unlimited type — no balance check needed
        INSERT INTO leave_requests (
            employee_id, leave_type_id, start_date, end_date,
            total_days, is_half_day, half_day_period, remarks, status
        ) VALUES (
            p_employee_id, p_leave_type_id, p_start_date, p_end_date,
            v_total_days, p_is_half_day, p_half_day_period, p_remarks, 'PENDING'
        );

        SET p_request_id = LAST_INSERT_ID();

        -- Still track pending for unlimited types
        -- First ensure a balance row exists
        INSERT IGNORE INTO leave_balances (employee_id, leave_type_id, year, total_allocated)
        VALUES (p_employee_id, p_leave_type_id, v_year, 0);

        UPDATE leave_balances
        SET total_pending = total_pending + v_total_days
        WHERE employee_id = p_employee_id
          AND leave_type_id = p_leave_type_id
          AND year = v_year;

        INSERT INTO leave_status_audit (request_id, old_status, new_status, changed_by, change_reason)
        VALUES (p_request_id, NULL, 'PENDING', p_employee_id, 'New leave request submitted');

        SET p_result_msg = CONCAT('SUCCESS: Leave request #', p_request_id, ' submitted (', v_total_days, ' days)');

        COMMIT;
    END IF;

    END IF; END IF; END IF; END IF; END IF; END IF; END IF;

END //

DELIMITER ;


-- ============================================================
-- 8. STORED PROCEDURE: sp_approve_leave
-- ============================================================
-- HR approves a pending leave request. In one transaction:
--   1. Updates request status to APPROVED
--   2. Moves days from `total_pending` to `total_used`
--   3. Adds HR comment if provided
--   4. Logs audit trail
-- ============================================================

DELIMITER //

CREATE PROCEDURE sp_approve_leave(
    IN p_request_id     INT,
    IN p_hr_id          VARCHAR(20),
    IN p_comment        TEXT,
    OUT p_result_msg    VARCHAR(255)
)
BEGIN
    DECLARE v_emp_id        VARCHAR(20);
    DECLARE v_type_id       INT;
    DECLARE v_total_days    DECIMAL(5,1);
    DECLARE v_status        VARCHAR(20);
    DECLARE v_year          YEAR;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_msg = 'ERROR: An unexpected database error occurred';
    END;

    START TRANSACTION;

    -- Lock the row to prevent concurrent approval/rejection
    SELECT employee_id, leave_type_id, total_days, status, YEAR(start_date)
    INTO v_emp_id, v_type_id, v_total_days, v_status, v_year
    FROM leave_requests
    WHERE request_id = p_request_id
    FOR UPDATE;

    IF v_emp_id IS NULL THEN
        SET p_result_msg = 'ERROR: Leave request not found';
        ROLLBACK;
    ELSEIF v_status != 'PENDING' THEN
        SET p_result_msg = CONCAT('ERROR: Request is already ', v_status, '. Cannot approve.');
        ROLLBACK;
    ELSE
        -- Update request status
        UPDATE leave_requests
        SET status = 'APPROVED',
            reviewed_by = p_hr_id,
            reviewed_at = NOW()
        WHERE request_id = p_request_id;

        -- Move days: pending → used
        UPDATE leave_balances
        SET total_pending = total_pending - v_total_days,
            total_used = total_used + v_total_days
        WHERE employee_id = v_emp_id
          AND leave_type_id = v_type_id
          AND year = v_year;

        -- Add HR comment if provided
        IF p_comment IS NOT NULL AND TRIM(p_comment) != '' THEN
            INSERT INTO leave_comments (request_id, commenter_id, comment_text)
            VALUES (p_request_id, p_hr_id, p_comment);
        END IF;

        -- Audit trail
        INSERT INTO leave_status_audit (request_id, old_status, new_status, changed_by, change_reason)
        VALUES (p_request_id, 'PENDING', 'APPROVED', p_hr_id, COALESCE(p_comment, 'Approved by HR'));

        SET p_result_msg = CONCAT('SUCCESS: Request #', p_request_id, ' approved (', v_total_days, ' days for ', v_emp_id, ')');

        COMMIT;
    END IF;

END //

DELIMITER ;


-- ============================================================
-- 9. STORED PROCEDURE: sp_reject_leave
-- ============================================================
-- HR rejects a pending leave request. In one transaction:
--   1. Updates request status to REJECTED
--   2. Releases days from `total_pending`
--   3. Adds rejection comment (required)
--   4. Logs audit trail
-- ============================================================

DELIMITER //

CREATE PROCEDURE sp_reject_leave(
    IN p_request_id     INT,
    IN p_hr_id          VARCHAR(20),
    IN p_comment        TEXT,
    OUT p_result_msg    VARCHAR(255)
)
BEGIN
    DECLARE v_emp_id        VARCHAR(20);
    DECLARE v_type_id       INT;
    DECLARE v_total_days    DECIMAL(5,1);
    DECLARE v_status        VARCHAR(20);
    DECLARE v_year          YEAR;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_msg = 'ERROR: An unexpected database error occurred';
    END;

    -- Rejection requires a reason
    IF p_comment IS NULL OR TRIM(p_comment) = '' THEN
        SET p_result_msg = 'ERROR: Rejection reason is required';
    ELSE

    START TRANSACTION;

    SELECT employee_id, leave_type_id, total_days, status, YEAR(start_date)
    INTO v_emp_id, v_type_id, v_total_days, v_status, v_year
    FROM leave_requests
    WHERE request_id = p_request_id
    FOR UPDATE;

    IF v_emp_id IS NULL THEN
        SET p_result_msg = 'ERROR: Leave request not found';
        ROLLBACK;
    ELSEIF v_status != 'PENDING' THEN
        SET p_result_msg = CONCAT('ERROR: Request is already ', v_status, '. Cannot reject.');
        ROLLBACK;
    ELSE
        -- Update request status
        UPDATE leave_requests
        SET status = 'REJECTED',
            reviewed_by = p_hr_id,
            reviewed_at = NOW()
        WHERE request_id = p_request_id;

        -- Release pending days back to available balance
        UPDATE leave_balances
        SET total_pending = total_pending - v_total_days
        WHERE employee_id = v_emp_id
          AND leave_type_id = v_type_id
          AND year = v_year;

        -- Add rejection comment
        INSERT INTO leave_comments (request_id, commenter_id, comment_text)
        VALUES (p_request_id, p_hr_id, p_comment);

        -- Audit trail
        INSERT INTO leave_status_audit (request_id, old_status, new_status, changed_by, change_reason)
        VALUES (p_request_id, 'PENDING', 'REJECTED', p_hr_id, p_comment);

        SET p_result_msg = CONCAT('SUCCESS: Request #', p_request_id, ' rejected');

        COMMIT;
    END IF;
    END IF;

END //

DELIMITER ;


-- ============================================================
-- 10. STORED PROCEDURE: sp_cancel_leave
-- ============================================================
-- Employee cancels their own pending request.
-- Cannot cancel approved leaves that have already started.
-- ============================================================

DELIMITER //

CREATE PROCEDURE sp_cancel_leave(
    IN p_request_id     INT,
    IN p_employee_id    VARCHAR(20),
    IN p_reason         TEXT,
    OUT p_result_msg    VARCHAR(255)
)
BEGIN
    DECLARE v_emp_id        VARCHAR(20);
    DECLARE v_type_id       INT;
    DECLARE v_total_days    DECIMAL(5,1);
    DECLARE v_status        VARCHAR(20);
    DECLARE v_start_date    DATE;
    DECLARE v_year          YEAR;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_msg = 'ERROR: An unexpected database error occurred';
    END;

    START TRANSACTION;

    SELECT employee_id, leave_type_id, total_days, status, start_date, YEAR(start_date)
    INTO v_emp_id, v_type_id, v_total_days, v_status, v_start_date, v_year
    FROM leave_requests
    WHERE request_id = p_request_id
    FOR UPDATE;

    IF v_emp_id IS NULL THEN
        SET p_result_msg = 'ERROR: Leave request not found';
        ROLLBACK;
    ELSEIF v_emp_id != p_employee_id THEN
        SET p_result_msg = 'ERROR: You can only cancel your own leave requests';
        ROLLBACK;
    ELSEIF v_status = 'CANCELLED' THEN
        SET p_result_msg = 'ERROR: Request is already cancelled';
        ROLLBACK;
    ELSEIF v_status = 'REJECTED' THEN
        SET p_result_msg = 'ERROR: Cannot cancel a rejected request';
        ROLLBACK;
    ELSEIF v_status = 'APPROVED' AND v_start_date <= CURDATE() THEN
        SET p_result_msg = 'ERROR: Cannot cancel an approved leave that has already started';
        ROLLBACK;
    ELSE
        -- Update request
        UPDATE leave_requests
        SET status = 'CANCELLED',
            cancellation_reason = p_reason,
            cancelled_at = NOW()
        WHERE request_id = p_request_id;

        -- Release days based on previous status
        IF v_status = 'PENDING' THEN
            UPDATE leave_balances
            SET total_pending = total_pending - v_total_days
            WHERE employee_id = v_emp_id
              AND leave_type_id = v_type_id
              AND year = v_year;
        ELSEIF v_status = 'APPROVED' THEN
            -- Approved but not yet started — give back used days
            UPDATE leave_balances
            SET total_used = total_used - v_total_days
            WHERE employee_id = v_emp_id
              AND leave_type_id = v_type_id
              AND year = v_year;
        END IF;

        -- Audit trail
        INSERT INTO leave_status_audit (request_id, old_status, new_status, changed_by, change_reason)
        VALUES (p_request_id, v_status, 'CANCELLED', p_employee_id, COALESCE(p_reason, 'Cancelled by employee'));

        SET p_result_msg = CONCAT('SUCCESS: Request #', p_request_id, ' cancelled');

        COMMIT;
    END IF;

END //

DELIMITER ;


-- ============================================================
-- 11. VIEWS — Read-only convenience queries
-- ============================================================

-- View: Employee leave summary for the current year
CREATE OR REPLACE VIEW vw_employee_leave_summary AS
SELECT
    e.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
    d.dept_name AS department,
    lt.type_name AS leave_type,
    lt.type_code,
    lt.is_paid,
    lb.year,
    lb.total_allocated,
    lb.carried_forward,
    lb.total_used,
    lb.total_pending,
    lb.remaining,
    (lb.total_allocated + lb.carried_forward) AS total_entitlement
FROM leave_balances lb
JOIN employees e ON lb.employee_id = e.employee_id
JOIN leave_types lt ON lb.leave_type_id = lt.leave_type_id
JOIN departments d ON e.department_id = d.department_id
WHERE e.is_active = TRUE;

-- View: All pending leave requests (HR dashboard)
CREATE OR REPLACE VIEW vw_pending_leave_requests AS
SELECT
    lr.request_id,
    lr.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
    d.dept_name AS department,
    e.designation,
    lt.type_name AS leave_type,
    lt.is_paid,
    lr.start_date,
    lr.end_date,
    lr.total_days,
    lr.is_half_day,
    lr.remarks,
    lr.created_at AS applied_on,
    DATEDIFF(NOW(), lr.created_at) AS days_pending
FROM leave_requests lr
JOIN employees e ON lr.employee_id = e.employee_id
JOIN departments d ON e.department_id = d.department_id
JOIN leave_types lt ON lr.leave_type_id = lt.leave_type_id
WHERE lr.status = 'PENDING'
ORDER BY lr.created_at ASC;

-- View: Department-wise leave statistics for current year
CREATE OR REPLACE VIEW vw_department_leave_stats AS
SELECT
    d.dept_name AS department,
    d.dept_code,
    COUNT(DISTINCT e.employee_id) AS total_employees,
    SUM(lb.total_used) AS total_days_used,
    SUM(lb.total_pending) AS total_days_pending,
    ROUND(AVG(lb.total_used), 1) AS avg_days_used_per_employee,
    SUM(CASE WHEN lt.is_paid = FALSE THEN lb.total_used ELSE 0 END) AS unpaid_days_used
FROM departments d
JOIN employees e ON d.department_id = e.department_id
JOIN leave_balances lb ON e.employee_id = lb.employee_id
JOIN leave_types lt ON lb.leave_type_id = lt.leave_type_id
WHERE lb.year = YEAR(CURDATE())
  AND e.is_active = TRUE
GROUP BY d.department_id;


-- ============================================================
-- 12. SAMPLE LEAVE REQUESTS — For testing
-- ============================================================
-- These match the leave requests shown in the HR Dashboard UI.
-- Using direct INSERTs instead of sp_apply_leave so we can
-- set specific statuses for testing.
-- ============================================================

-- Request 1: Alex Morgan — Casual/Paid leave (PENDING)
INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, remarks, status)
VALUES ('EMP-001', 1, '2026-08-25', '2026-08-26', 2.0, 'Personal work', 'PENDING');

-- Update Alex's pending balance
UPDATE leave_balances SET total_pending = total_pending + 2.0
WHERE employee_id = 'EMP-001' AND leave_type_id = 1 AND year = 2026;

-- Insert audit for request 1
INSERT INTO leave_status_audit (request_id, old_status, new_status, changed_by, change_reason)
VALUES (1, NULL, 'PENDING', 'EMP-001', 'New leave request submitted');

-- Request 2: David Kim — Sick leave (PENDING)
INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, remarks, status)
VALUES ('EMP-005', 2, '2026-08-22', '2026-08-24', 2.0, 'Medical appointment', 'PENDING');

UPDATE leave_balances SET total_pending = total_pending + 2.0
WHERE employee_id = 'EMP-005' AND leave_type_id = 2 AND year = 2026;

INSERT INTO leave_status_audit (request_id, old_status, new_status, changed_by, change_reason)
VALUES (2, NULL, 'PENDING', 'EMP-005', 'New leave request submitted');

-- Request 3: Emma Thompson — Paid leave / Vacation (PENDING)
INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, remarks, status)
VALUES ('EMP-006', 1, '2026-09-01', '2026-09-05', 5.0, 'Family trip', 'PENDING');

UPDATE leave_balances SET total_pending = total_pending + 5.0
WHERE employee_id = 'EMP-006' AND leave_type_id = 1 AND year = 2026;

INSERT INTO leave_status_audit (request_id, old_status, new_status, changed_by, change_reason)
VALUES (3, NULL, 'PENDING', 'EMP-006', 'New leave request submitted');

-- Request 4: Sarah Chen — Half-day sick leave (APPROVED — for testing)
INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, is_half_day, half_day_period, remarks, status, reviewed_by, reviewed_at)
VALUES ('EMP-002', 2, '2026-08-20', '2026-08-20', 0.5, TRUE, 'FIRST_HALF', 'Doctor visit', 'APPROVED', 'EMP-004', '2026-08-19 14:30:00');

UPDATE leave_balances SET total_used = total_used + 0.5
WHERE employee_id = 'EMP-002' AND leave_type_id = 2 AND year = 2026;

INSERT INTO leave_status_audit (request_id, old_status, new_status, changed_by, change_reason)
VALUES (4, NULL, 'PENDING', 'EMP-002', 'New leave request submitted');
INSERT INTO leave_status_audit (request_id, old_status, new_status, changed_by, change_reason)
VALUES (4, 'PENDING', 'APPROVED', 'EMP-004', 'Approved by HR');

-- Add a sample HR comment on the approved request
INSERT INTO leave_comments (request_id, commenter_id, comment_text)
VALUES (4, 'EMP-004', 'Approved. Please ensure your tasks are handed over for the morning.');


-- ============================================================
-- VERIFICATION QUERIES — Run after loading this file
-- ============================================================

-- 1. Check all Phase 2 tables exist
SELECT TABLE_NAME, TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dayflow'
  AND TABLE_NAME LIKE 'leave%'
ORDER BY TABLE_NAME;

-- 2. Verify leave balances for all employees
SELECT * FROM vw_employee_leave_summary WHERE year = 2026;

-- 3. Verify pending requests (HR view)
SELECT * FROM vw_pending_leave_requests;

-- 4. Verify department-wise stats
SELECT * FROM vw_department_leave_stats;

-- 5. Test the approval procedure
-- CALL sp_approve_leave(1, 'EMP-004', 'Approved. Enjoy your time off.', @msg);
-- SELECT @msg;

-- 6. Test the rejection procedure
-- CALL sp_reject_leave(2, 'EMP-004', 'Please submit medical certificate first.', @msg);
-- SELECT @msg;
