# DayFlow - Project Release & Feature Updates

## Major Update: MySQL Database Integration, Real-Time Dashboard Sync, HR Profile & Workforce Analytics

### 🚀 Newly Added Features

#### 1. Centralized Real-Time Synchronization Service ([`src/services/storeService.js`](file:///c:/Users/kusum/Desktop/Day_flow/src/services/storeService.js))
- Built a reactive store broadcasting real-time updates (`dayflow_store_update`) across the application.
- **Profile Details Sync**: When an employee edits phone, address, or profile photo in `EmployeeDashboard.jsx`, the update is instantly reflected in the HR Admin Employee Directory (`HRDashboard.jsx`).
- **Leave Request Sync**: New leave applications submitted by employees instantly appear in the HR Admin's **Leave Approvals** tab.
- **Approval Status Sync**: When HR approves or rejects a leave request, the status updates live on the employee's Leave Requests tab (`Approved` or `Rejected`).

---

#### 2. HR Administrator Profile & Photo Upload ([`src/pages/HRDashboard.jsx`](file:///c:/Users/kusum/Desktop/Day_flow/src/pages/HRDashboard.jsx))
- Added an interactive **HR Admin Profile Modal** accessible via the HR avatar icon in topbar.
- Displays HR Admin credentials (Name: Maya Patel, Admin ID: `ADM-001`, Title: Head of HR Operations, Department: Human Resources, Access Level: 🛡️ Super Admin).
- Includes native device photo picker for HR Admin profile picture updates.

---

#### 3. Workforce Analytics & Insights Dashboard
- Activated the **Analytics** menu item (`activeTab === 'analytics'`) in `HRDashboard.jsx`.
- **Department Headcount Breakdown**: Visual progress bars for Engineering (40%), Design (20%), Marketing (16%), HR (14%), and Analytics (10%).
- **Punctuality & Attendance Metrics**: 92.4% on-time arrival rate, 8.4 hrs/day average work duration.
- **Leave Category Usage**: Vacation (68 days), Casual (45 days), Sick (22 days).
- **Payroll Expense Summary**: $578,000 / month gross salary budget tracking.

---

#### 4. Interactive Notification Bell Dropdowns
- Floating Notification Panel in both `EmployeeDashboard.jsx` and `HRDashboard.jsx`.
- Lists recent system alerts, leave updates, and check-in logs with unread badge counter.
- Includes a "Mark all read" button to clear notifications instantly.

---

#### 5. MySQL Database Architecture & REST APIs (`dayflow_db`)
- Relational table DDL in [`server/schema.sql`](file:///c:/Users/kusum/Desktop/Day_flow/server/schema.sql) for `users`, `employee_profiles`, `salary_structures`, `attendance_logs`, and `leave_requests`.
- Automated seeding script in [`server/seed.js`](file:///c:/Users/kusum/Desktop/Day_flow/server/seed.js).
- MySQL Connection pool manager in [`server/config/db.js`](file:///c:/Users/kusum/Desktop/Day_flow/server/config/db.js).
- Node.js Express REST APIs in [`server/index.js`](file:///c:/Users/kusum/Desktop/Day_flow/server/index.js).

---

### 📂 Modified & Added Files
- `src/services/storeService.js` (Central real-time synchronization store)
- `src/pages/EmployeeDashboard.jsx` (Notification bell dropdown, leave submission sync, profile photo upload)
- `src/pages/HRDashboard.jsx` (HR Admin profile modal, Analytics dashboard, notification dropdown, real-time leave approvals)
- `src/pages/Dashboard.css` (Notification dropdown floating panel & analytics progress bar styling)
- `CHANGELOG.md` (Project release summary)
