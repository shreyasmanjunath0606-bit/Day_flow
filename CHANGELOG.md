# DayFlow - Project Release & Feature Updates

## Major Update: MySQL Database Integration, Leave Requests System & Local Photo Upload

### 🚀 Newly Added Features

#### 1. MySQL Database Architecture & Persistence (`dayflow_db`)
- **Database Engine**: Configured MySQL connection pool using `mysql2/promise` in `server/config/db.js`.
- **Relational Schema DDL ([`server/schema.sql`](file:///c:/Users/kusum/Desktop/Day_flow/server/schema.sql))**:
  - `users`: Authentication credentials, hashed passwords, roles (`employee` vs `hr`).
  - `employee_profiles`: Personal details (DOB, Gender, Phone, Address, Avatar URL, Emergency Contact) & Job details (Designation, Department, Employment Type, Joining Date, Manager, Work Location).
  - `salary_structures`: Base Pay, HRA, Allowances, Deductions (TDS Tax, PF, Insurance), Net Pay, and Bank Account details.
  - `attendance_logs`: Daily & weekly shift records, Check-In, Check-Out, Logged Hours, and Status (`PRESENT`, `HALF_DAY`, `ABSENT`, `LEAVE`).
  - `leave_requests`: Leave types, date ranges, total days, reasons, and approval status (`pending`, `approved`, `rejected`).
- **Automated Database Seeder ([`server/seed.js`](file:///c:/Users/kusum/Desktop/Day_flow/server/seed.js))**: `npm run seed` command automatically initializes `dayflow_db` and seeds initial test records.
- **Node.js Express REST APIs ([`server/index.js`](file:///c:/Users/kusum/Desktop/Day_flow/server/index.js))**: Exposes REST endpoints (`/api/health`, `/api/auth/login`, `/api/employee/profile`, `/api/attendance/checkin`, `/api/leaves/apply`).

---

#### 2. Leave Requests Management System
- **Employee Leave Dashboard ([`src/pages/EmployeeDashboard.jsx`](file:///c:/Users/kusum/Desktop/Day_flow/src/pages/EmployeeDashboard.jsx))**:
  - Active **Leave Requests** tab with Leave Balance summary cards (Casual Leave: 8 days, Sick Leave: 6 days, Vacation: 10 days).
  - **Apply for Leave Modal**: Select leave type, From Date, To Date, and Reason with automatic duration calculation.
  - **My Leave History & Status Table**: Real-time status tracking (`Pending HR Review`, `Approved`, `Rejected`).
- **HR Leave Approvals ([`src/pages/HRDashboard.jsx`](file:///c:/Users/kusum/Desktop/Day_flow/src/pages/HRDashboard.jsx))**: HR Admins can review pending leave applications and approve or reject requests.

---

#### 3. Local Computer Photo File Upload for Profile Picture
- Replaced URL text input with a native device file picker (`<input type="file" accept="image/*" />`).
- Employees can select any photo file (JPG, PNG, WEBP) directly from their computer folders with instant base64 preview across profile banners, header, and topbar.

---

#### 4. Role-Based Attendance View Permissions
- 👤 **Employee View**: Strictly locked to the employee's own shift timer, check-in/out logs, and weekly schedule.
- 👑 **HR / Admin View**: Master Attendance Dashboard displaying all employee records across the company with status filters (Present, Half-day, Absent, Leave) and detailed log modals.

---

### 📂 Modified & Added Files
- `server/schema.sql` (MySQL Relational DDL Script)
- `server/seed.js` (Automated MySQL database seeder)
- `server/config/db.js` (MySQL Connection Pool manager)
- `server/.env` (Database environment configuration)
- `server/index.js` (Node.js Express server with MySQL REST APIs)
- `src/services/attendanceService.js` (Real-time MySQL attendance & leave API helper service)
- `src/pages/EmployeeDashboard.jsx` (Added Leave Requests tab, local photo file upload, removed admin mode toggle)
- `src/pages/HRDashboard.jsx` (Master attendance view for all employees & leave approval cards)
- `CHANGELOG.md` (Project release updates for evaluators)
