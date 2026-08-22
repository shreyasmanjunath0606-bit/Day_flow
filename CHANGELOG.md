# DayFlow - Project Release & Feature Updates

## Update: Employee View Profile & Node.js Backend Integration

### 🚀 Newly Added Features

#### 1. Employee Dashboard - View Profile System
Employees can now access a complete **View Profile** section directly from their dashboard sidebar or quick-access cards with the following tabbed views:

- **Personal Details**:
  - Employee ID (`EMP-2026-0842`)
  - Full Name, Email, Phone, Date of Birth, Gender
  - Current Residential Address
  - Emergency Contact Person, Relationship & Phone
- **Job Details**:
  - Job Designation (`Senior Frontend Engineer`) & Department
  - Employment Type (`Full-Time`), Date of Joining
  - Reporting Manager Name & Workplace Location
  - Live Employment Status Badge
- **Salary Structure**:
  - Net Monthly Take-Home Pay & Annual CTC Package summary
  - Monthly Allowances (Basic Salary, HRA, Special Allowances)
  - Deductions breakdown (Income Tax/TDS, Provident Fund, Medical Insurance)
  - Disbursement Bank Account & Routing Details
- **Documents Management**:
  - View uploaded employment documents (Offer Letter, Passport ID, Tax Forms, Educational Certificates)
  - Document status badges (`Verified`) and download action triggers
- **Profile Picture**:
  - Header avatar display & interactive picture URL updater modal

---

#### 2. Node.js Backend Architecture
- **Server Application**: Node.js Express server configured in `server/index.js` exposing REST API endpoints (`GET /api/employee/profile`, `PUT /api/employee/profile`, `GET /api/health`).
- **Frontend Service Integration**: Created `src/services/employeeService.js` abstraction layer to communicate with the Node.js backend while providing instant fallback mock data for seamless development and evaluation.

---

### 📂 Modified & Added Files
- `src/pages/EmployeeDashboard.jsx` (Added interactive View Profile tab navigation & component views)
- `src/pages/Dashboard.css` (Added styling for profile cover banner, detail grids, salary breakdown, and document cards)
- `src/services/employeeService.js` (Added frontend profile service layer)
- `server/package.json` & `server/index.js` (Added Node.js Express backend server)
- `CHANGELOG.md` (Project update record for evaluators)
