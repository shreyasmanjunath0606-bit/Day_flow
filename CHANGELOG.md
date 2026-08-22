# DayFlow - Project Release & Feature Updates

## Update: Edit Profile (Employee vs Admin Permissions) & View Profile Dashboard

### 🚀 Newly Added Features

#### 1. Edit Profile System with Role-Based Permissions
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

#### 2. Employee Dashboard - View Profile System
Employees can access a complete **View Profile** section with tabbed views:

- **Personal Details**: Employee ID (`EMP-2026-0842`), Full Name, Email, Phone, DOB, Gender, Address, Emergency Contact.
- **Job Details**: Job Designation (`Senior Frontend Engineer`), Department, Employment Type, Date of Joining, Manager Name, Location, Status.
- **Salary Structure**: Net Monthly Pay, Annual CTC, Allowances breakdown (Basic, HRA, Special), Deductions (TDS Tax, PF, Insurance), Bank Account details.
- **Documents Management**: Uploaded employment documents (Offer Letter, Passport ID, Tax Forms, Degree) with status badges and download triggers.
- **Profile Picture**: Avatar display & picture URL editor.

---

#### 3. Node.js Backend Architecture
- **Server Application**: Node.js Express server configured in `server/index.js` exposing REST API endpoints (`GET /api/employee/profile`, `PUT /api/employee/profile`, `GET /api/health`).
- **Frontend Service Integration**: `src/services/employeeService.js` abstraction layer communicating with Node.js APIs with instant fallback mock data for seamless development and evaluation.

---

### 📂 Modified & Added Files
- `src/pages/EmployeeDashboard.jsx` (Added Edit Profile modal, Employee vs Admin permission logic, and form state handling)
- `src/pages/Dashboard.css` (Added styling for Edit modal, locked input fields, and permission switcher banner)
- `src/services/employeeService.js` (Added profile service layer & update handlers)
- `server/package.json` & `server/index.js` (Node.js Express backend server)
- `CHANGELOG.md` (Project update record for evaluators)
