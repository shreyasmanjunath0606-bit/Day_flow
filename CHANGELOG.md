# DayFlow - Project Release & Feature Updates

## Update: Attendance Tracking System & Role-Based Attendance View Permissions

### 🚀 Newly Added Features

#### 1. Attendance View Permissions (Employee vs Admin)
- 👤 **Employee View**: Employees can view **only** their own attendance records (live shift timer, personal check-in/out times, daily timeline, and personal 7-day weekly schedule).
- 👑 **Admin / HR View**: HR Admins can view the attendance records of **all employees** across the company on the **Master Attendance Dashboard** ([`src/pages/HRDashboard.jsx`](file:///c:/Users/kusum/Desktop/Day_flow/src/pages/HRDashboard.jsx)). Includes search and status filtering (Present, Half-day, Absent, Leave) and an interactive **Full Attendance Log Modal** for any selected employee.

---

#### 2. Interactive Attendance Tracking System
- **Check-In / Check-Out Hero Widget**:
  - Live **Check In Now** / **Check Out Now** toggle button.
  - Live duration timer (`04h 22m 15s`) while checked in.
  - Records exact check-in and check-out timestamps.
- **Daily & Weekly Attendance Views**:
  - **Daily View**: Shift log summary, effective work hours, and daily event timeline (Check-in, Lunch Break, Work in progress).
  - **Weekly View**: 7-day calendar cards (Mon–Sun) showing date, check-in, check-out, hours logged, and status badges.
- **4 Attendance Status Types**:
  - 🟢 **Present** (Full Shift, 8+ hours)
  - 🟡 **Half-day** (4 Hours)
  - 🔴 **Absent**
  - 🔵 **Leave** (Approved casual/sick leave)

---

#### 3. HR Admin Edit All Employee Details Dashboard
- **Admin Edit Action**: Added an **"Edit All Details"** button in the Employee Directory table on the HR Admin Dashboard.
- **Full Employee Detail Editing Modal**: HR Admins can edit **all** personal, job, designation, department, status, address, and salary details for any employee.

---

#### 4. Edit Profile Modal with Role-Based Permissions
- 👤 **Employee Mode (Limited Edit)**: Phone, Residential Address, Profile Picture URL.
- 👑 **Admin / HR Mode (Full Edit)**: Full permissions to edit all fields across Personal, Job, and Salary categories.

---

#### 5. HR / Admin Account Registration & Sign-In Flow
- Added Role selector toggle (**Employee** vs **HR / Admin**) on the Sign-In page (`/signin`) and enabled instant HR Admin Dashboard access upon sign-up (`/dashboard/hr`).

---

#### 6. Node.js Backend Architecture
- Node.js Express server configured in `server/index.js` exposing REST API endpoints (`GET /api/employee/profile`, `PUT /api/employee/profile`, `GET /api/health`).
- `src/services/employeeService.js` and `src/services/attendanceService.js` abstraction layers communicating with Node.js APIs with instant fallback mock data.

---

### 📂 Modified & Added Files
- `src/services/attendanceService.js` (Added attendance tracking service layer & status definitions)
- `src/pages/EmployeeDashboard.jsx` (Added Attendance tracking view, check-in widget, daily/weekly view switcher)
- `src/pages/HRDashboard.jsx` (Added Master All-Employee attendance view & attendance log modal)
- `src/pages/Dashboard.css` (Added attendance hero widget, status badges, and weekly card styling)
- `CHANGELOG.md` (Project update record for evaluators)
