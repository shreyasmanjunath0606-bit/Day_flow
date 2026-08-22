# DayFlow - Project Release & Feature Updates

## Update: Admin Registration & Role-Based Sign-In Fix + Edit Profile & View Profile

### 🚀 Newly Added & Updated Features

#### 1. HR / Admin Account Registration & Sign-In Flow
- **Fixed Admin Sign-Up**: Registering with the **HR / Admin** role option now successfully creates the Admin account and provides an instant **"Go to HR / Admin Dashboard"** navigation action.
- **Role Selector on Sign-In Page**:
  - Added a role toggle bar (**Employee** vs **HR / Admin**) directly on the Sign-In page ([`src/pages/SignIn.jsx`](file:///c:/Users/kusum/Desktop/Day_flow/src/pages/SignIn.jsx)).
  - Signing in under **HR / Admin** routes directly to the HR Management Dashboard (`/dashboard/hr`).
  - Signing in under **Employee** routes directly to the Employee Dashboard (`/dashboard/employee`).

---

#### 2. Edit Profile System with Role-Based Permissions
- **Edit Modal**: Accessible via the **"Edit Profile"** button or quick action cards on the Profile header.
- **Permission Modes**:
  - 👤 **Employee Mode (Limited Edit)**:
    - Employees can edit **only** limited fields: **Phone Number**, **Residential Address**, and **Profile Picture URL**.
    - All other sensitive fields (Employee ID, Email, DOB, Gender, Designation, Department, Salary, Allowances) are locked with a 🔒 lock indicator.
  - 👑 **Admin / HR Mode (Full Edit)**:
    - Admin users have full permissions to edit **all** employee details across Personal, Job, and Salary categories.
- **Interactive Role Switcher**:
  - Includes a live toggle bar inside the modal allowing evaluators/testers to seamlessly switch between **Employee Mode** and **Admin Mode** to test editing permission rules in real-time.

---

#### 3. Employee Dashboard - View Profile System
- **Personal Details**: Employee ID (`EMP-2026-0842`), Full Name, Email, Phone, DOB, Gender, Address, Emergency Contact.
- **Job Details**: Job Designation (`Senior Frontend Engineer`), Department, Employment Type, Date of Joining, Manager Name, Location, Status.
- **Salary Structure**: Net Monthly Pay, Annual CTC, Allowances breakdown, Deductions, Bank Account details.
- **Documents Management**: Uploaded employment documents with status badges and download triggers.
- **Profile Picture**: Avatar display & picture URL editor.

---

#### 4. Node.js Backend Architecture
- Node.js Express server configured in `server/index.js` exposing REST API endpoints (`GET /api/employee/profile`, `PUT /api/employee/profile`, `GET /api/health`).
- `src/services/employeeService.js` abstraction layer communicating with Node.js APIs with instant fallback mock data.

---

### 📂 Modified & Added Files
- `src/pages/SignIn.jsx` (Added Role selector toggle for Employee vs HR/Admin login)
- `src/pages/SignUp.jsx` (Updated HR/Admin registration success action & dashboard navigation)
- `src/pages/EmployeeDashboard.jsx` (Added Edit Profile modal & role-based editing logic)
- `src/pages/Dashboard.css` (Added modal, permission badges & switcher styling)
- `src/services/employeeService.js` (Added profile service layer & update handlers)
- `server/package.json` & `server/index.js` (Node.js Express backend server)
- `CHANGELOG.md` (Project update record for evaluators)
