# DayFlow - Project Release & Feature Updates

## Update: HR Admin Edit All Employee Details Feature + Role Permissions & Sign-In Fix

### 🚀 Newly Added Features

#### 1. HR Admin Edit All Employee Details Dashboard
- **Admin Edit Action**: Added an **"Edit All Details"** button in the Employee Directory table on the HR Admin Dashboard ([`src/pages/HRDashboard.jsx`](file:///c:/Users/kusum/Desktop/Day_flow/src/pages/HRDashboard.jsx)).
- **Full Employee Detail Editing Modal**:
  - HR Admins can edit **all** employee details:
    - Full Name & Employee ID
    - Email Address & Phone Number
    - Residential Address
    - Job Designation & Role
    - Department
    - Attendance Status (Present, Absent, On Leave, Late)
    - Salary Package / CTC
- **Live State Updates**: Saving updates the employee record in real-time with success toast confirmation.

---

#### 2. Edit Profile Modal with Role-Based Permissions
- **Edit Modal**: Accessible via the **"Edit Profile"** button on the Profile header.
- **Permission Modes**:
  - 👤 **Employee Mode (Limited Edit)**:
    - Employees can edit **only** limited fields: **Phone Number**, **Residential Address**, and **Profile Picture URL**.
    - All other sensitive fields (Employee ID, Email, DOB, Gender, Designation, Department, Salary) are locked with 🔒 lock indicators.
  - 👑 **Admin / HR Mode (Full Edit)**:
    - Admin users have full permissions to edit **all** employee details across Personal, Job, and Salary categories.

---

#### 3. HR / Admin Account Registration & Sign-In Flow
- **Fixed Admin Sign-Up**: Registering with the **HR / Admin** role option creates the Admin account and provides an instant **"Go to HR / Admin Dashboard"** navigation action.
- **Role Selector on Sign-In Page**:
  - Added a role toggle bar (**Employee** vs **HR / Admin**) directly on the Sign-In page ([`src/pages/SignIn.jsx`](file:///c:/Users/kusum/Desktop/Day_flow/src/pages/SignIn.jsx)).
  - Signing in under **HR / Admin** routes directly to `/dashboard/hr`.
  - Signing in under **Employee** routes directly to `/dashboard/employee`.

---

#### 4. Employee Dashboard - View Profile System
- **Personal Details**: Employee ID (`EMP-2026-0842`), Full Name, Email, Phone, DOB, Gender, Address, Emergency Contact.
- **Job Details**: Job Designation (`Senior Frontend Engineer`), Department, Employment Type, Date of Joining, Manager Name, Location, Status.
- **Salary Structure**: Net Monthly Pay, Annual CTC, Allowances breakdown, Deductions, Bank Account details.
- **Documents Management**: Uploaded employment documents with status badges and download triggers.

---

#### 5. Node.js Backend Architecture
- Node.js Express server configured in `server/index.js` exposing REST API endpoints (`GET /api/employee/profile`, `PUT /api/employee/profile`, `GET /api/health`).
- `src/services/employeeService.js` abstraction layer communicating with Node.js APIs with instant fallback mock data.

---

### 📂 Modified Files
- `src/pages/HRDashboard.jsx` (Added Admin Edit Employee Details modal and table action triggers)
- `src/pages/EmployeeDashboard.jsx` (Added Edit Profile modal & role-based editing logic)
- `src/pages/SignIn.jsx` (Added Role selector toggle for Employee vs HR/Admin login)
- `src/pages/SignUp.jsx` (Updated HR/Admin registration success action & dashboard navigation)
- `src/pages/Dashboard.css` (Added modal, permission badges & switcher styling)
- `src/services/employeeService.js` (Added profile service layer & update handlers)
- `server/package.json` & `server/index.js` (Node.js Express backend server)
- `CHANGELOG.md` (Project update record for evaluators)
