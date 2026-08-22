# DayFlow - Project Release & Feature Updates

## Major Update: Single Check-In/Out Rules, Realistic Work Hour Statuses & Database Migrations

### 🚀 Newly Added Features

#### 1. Single Check-In & Single Check-Out Per Day Policy ([`src/pages/EmployeeDashboard.jsx`](file:///c:/Users/kusum/Desktop/Day_flow/src/pages/EmployeeDashboard.jsx))
- Employees can perform Check-In ONCE per day and Check-Out ONCE per day.
- Once checked out, the action button transitions to 🔒 **Shift Completed Today** (locked/disabled state).
- Prevents multiple erratic check-ins/outs within the same day.

#### 2. Realistic Attendance Status Thresholds
- **Full Day (`PRESENT`)**: Logged work duration $\ge$ 7.0 hours.
- **Half Day (`HALF_DAY`)**: Logged work duration between 4.0 and 6.9 hours.
- **Undertime / Absent (`ABSENT`)**: Logged work duration $<$ 4.0 hours (short durations under 4 hours are correctly marked as Undertime / Absent instead of Half-Day).
- **Shift Testing Simulator**: Added simulator controls for evaluators to test full-day, half-day, and undertime shifts easily.

---

#### 3. Database Migration Workflow ([`README_DB_SYNC.md`](file:///c:/Users/kusum/Desktop/Day_flow/README_DB_SYNC.md))
- `/migrations` directory with versioned baseline SQL scripts (`001_create_developer1_tables.sql`, `002_create_developer2_tables.sql`, `003_create_developer3_tables.sql`).
- Automated migration runner script ([`server/migrate.js`](file:///c:/Users/kusum/Desktop/Day_flow/server/migrate.js)) with `npm run db:migrate` terminal integration.
- `.env.example` environment template and updated `.gitignore` database exclusions.

---

#### 4. Real-Time Synchronization & HR Analytics
- Centralized store service ([`src/services/storeService.js`](file:///c:/Users/kusum/Desktop/Day_flow/src/services/storeService.js)) syncing profile edits and leave applications across Employee and HR Dashboards.
- Interactive HR Admin Profile modal and Workforce Analytics dashboard in [`src/pages/HRDashboard.jsx`](file:///c:/Users/kusum/Desktop/Day_flow/src/pages/HRDashboard.jsx).
- Floating Notification Bell dropdown panels with unread badge counter.

---

### 📂 Modified & Added Files
- `src/pages/EmployeeDashboard.jsx` (Single check-in/out logic, status thresholds, shift simulator)
- `CHANGELOG.md` (Release summary)
