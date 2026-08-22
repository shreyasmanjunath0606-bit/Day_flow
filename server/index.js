import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query, testConnection } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Database Fallback
let inMemoryDb = {
  profile: {
    personalDetails: {
      id: "EMP-2026-0842",
      fullName: "Alex Morgan",
      email: "alex.morgan@dayflow.io",
      phone: "+1 (555) 234-5678",
      dob: "1994-06-15",
      gender: "Non-binary",
      address: "742 Evergreen Terrace, Suite 4B, Springfield, OR 97477",
      emergencyContact: {
        name: "Sarah Morgan",
        relation: "Sister",
        phone: "+1 (555) 987-6543",
      },
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    },
    jobDetails: {
      designation: "Senior Frontend Engineer",
      department: "Engineering & Product",
      employeeType: "Full-Time",
      dateOfJoining: "2022-03-15",
      workLocation: "Springfield HQ (Hybrid)",
      manager: "Marcus Vance",
      status: "Active",
    },
    salaryStructure: {
      currency: "USD",
      annualPackage: "$145,000",
      monthlyBase: "$8,500",
      hra: "$2,200",
      specialAllowance: "$1,383",
      grossMonthly: "$12,083",
      deductions: {
        tax: "$1,850",
        providentFund: "$650",
        insurance: "$150",
        totalDeductions: "$2,650",
      },
      netMonthlyPay: "$9,433",
      bankDetails: {
        bankName: "Chase Bank",
        accountNumber: "•••• •••• 4892",
      },
    },
    documents: [
      { id: "doc-1", title: "Offer Letter & Employment Agreement", category: "Contract", fileSize: "2.4 MB", status: "Verified" },
      { id: "doc-2", title: "Government ID / Passport Copy", category: "Identity Proof", fileSize: "1.8 MB", status: "Verified" },
      { id: "doc-3", title: "Form W-2 Tax Declaration 2025", category: "Tax Form", fileSize: "850 KB", status: "Verified" },
    ],
  },
  attendanceLogs: [
    { id: 1, day: 'Monday', date: 'Aug 17', checkIn: '09:00 AM', checkOut: '05:30 PM', hours: '8.5 hrs', status: 'PRESENT', note: 'Regular shift' },
    { id: 2, day: 'Tuesday', date: 'Aug 18', checkIn: '09:05 AM', checkOut: '05:35 PM', hours: '8.5 hrs', status: 'PRESENT', note: 'Regular shift' },
    { id: 3, day: 'Wednesday', date: 'Aug 19', checkIn: '09:00 AM', checkOut: '01:00 PM', hours: '4.0 hrs', status: 'HALF_DAY', note: 'Medical appointment in afternoon' },
    { id: 4, day: 'Thursday', date: 'Aug 20', checkIn: '08:55 AM', checkOut: '05:30 PM', hours: '8.5 hrs', status: 'PRESENT', note: 'Regular shift' },
    { id: 5, day: 'Friday', date: 'Aug 21', checkIn: '—', checkOut: '—', hours: '0.0 hrs', status: 'LEAVE', note: 'Approved Casual Leave' },
    { id: 6, day: 'Saturday', date: 'Aug 22', checkIn: '09:02 AM', checkOut: '—', hours: '4.2 hrs', status: 'PRESENT', isToday: true, note: 'Shift in progress' },
  ],
  leaves: [
    { id: 'LV-101', type: 'Casual Leave', fromDate: '2026-08-25', toDate: '2026-08-26', days: 2, reason: 'Personal errands and home maintenance', status: 'approved', appliedDate: 'Aug 20, 2026' },
    { id: 'LV-102', type: 'Sick Leave', fromDate: '2026-08-10', toDate: '2026-08-10', days: 1, reason: 'High fever and doctor consultation', status: 'approved', appliedDate: 'Aug 09, 2026' },
    { id: 'LV-103', type: 'Annual Vacation', fromDate: '2026-09-01', toDate: '2026-09-05', days: 5, reason: 'Family trip to national park', status: 'pending', appliedDate: 'Aug 21, 2026' },
  ],
};

// ------------------- API ROUTES -------------------

// Health Check
app.get('/api/health', async (req, res) => {
  const isDbConnected = await testConnection();
  res.json({
    status: 'OK',
    server: 'DayFlow Node.js Express Backend',
    database: isDbConnected ? 'MySQL Connected (dayflow_db)' : 'Fallback Mode (MySQL offline)',
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  const { employeeId, email, password, role } = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const result = await query(
        'INSERT INTO users (employee_id, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [employeeId, email, password, role || 'employee']
      );
      return res.json({ success: true, message: 'User registered in MySQL database', userId: result.insertId });
    }
  } catch (err) {
    console.warn('MySQL Register Query Error:', err.message);
  }
  res.json({ success: true, message: 'Registered user successfully (dev mode)', user: { employeeId, email, role } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, role } = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const users = await query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length > 0) {
        return res.json({ success: true, token: 'jwt_mock_token_123', user: users[0] });
      }
    }
  } catch (err) {
    console.warn('MySQL Login Query Error:', err.message);
  }
  res.json({ success: true, token: 'jwt_mock_token_123', user: { email, role: role || 'employee' } });
});

// GET Employee Profile
app.get('/api/employee/profile', async (req, res) => {
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const profiles = await query('SELECT * FROM employee_profiles WHERE user_id = 1');
      if (profiles.length > 0) {
        const p = profiles[0];
        const salary = await query('SELECT * FROM salary_structures WHERE profile_id = ?', [p.id]);
        const s = salary[0] || {};
        
        return res.json({
          personalDetails: {
            id: p.id ? `EMP-2026-00${p.id}` : 'EMP-2026-0842',
            fullName: p.full_name,
            email: 'alex.morgan@dayflow.io',
            phone: p.phone,
            dob: p.dob,
            gender: p.gender,
            address: p.address,
            avatarUrl: p.avatar_url,
            emergencyContact: {
              name: p.emergency_name,
              relation: p.emergency_relation,
              phone: p.emergency_phone,
            },
          },
          jobDetails: {
            designation: p.designation,
            department: p.department,
            employeeType: p.employee_type,
            dateOfJoining: p.date_of_joining,
            workLocation: p.work_location,
            manager: p.manager_name,
            status: p.status,
          },
          salaryStructure: {
            currency: s.currency || 'USD',
            annualPackage: s.annual_package || '$145,000',
            monthlyBase: s.monthly_base || '$8,500',
            hra: s.hra || '$2,200',
            specialAllowance: s.special_allowance || '$1,383',
            grossMonthly: s.gross_monthly || '$12,083',
            deductions: {
              tax: s.tax_deduction || '$1,850',
              providentFund: s.pf_deduction || '$650',
              insurance: s.insurance_deduction || '$150',
              totalDeductions: '$2,650',
            },
            netMonthlyPay: s.net_monthly_pay || '$9,433',
            bankDetails: {
              bankName: s.bank_name || 'Chase Bank',
              accountNumber: s.account_number || '•••• •••• 4892',
            },
          },
          documents: inMemoryDb.profile.documents,
        });
      }
    }
  } catch (err) {
    console.warn('MySQL Profile Query Error:', err.message);
  }
  res.json(inMemoryDb.profile);
});

// PUT Update Employee Profile
app.put('/api/employee/profile', async (req, res) => {
  const { personalDetails, jobDetails } = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      if (personalDetails) {
        await query(
          'UPDATE employee_profiles SET phone = ?, address = ?, avatar_url = ? WHERE user_id = 1',
          [personalDetails.phone, personalDetails.address, personalDetails.avatarUrl]
        );
      }
      return res.json({ success: true, message: 'Updated employee profile in MySQL database' });
    }
  } catch (err) {
    console.warn('MySQL Update Profile Error:', err.message);
  }

  if (personalDetails) {
    inMemoryDb.profile.personalDetails = { ...inMemoryDb.profile.personalDetails, ...personalDetails };
  }
  if (jobDetails) {
    inMemoryDb.profile.jobDetails = { ...inMemoryDb.profile.jobDetails, ...jobDetails };
  }
  res.json({ success: true, message: 'Profile updated in server state', profile: inMemoryDb.profile });
});

// Attendance Check-In / Check-Out Routes
app.post('/api/attendance/checkin', async (req, res) => {
  const { checkInTime, status } = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const today = new Date().toISOString().split('T')[0];
      await query(
        'INSERT INTO attendance_logs (user_id, log_date, check_in_time, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE check_in_time = ?, status = ?',
        [1, today, checkInTime || '09:02 AM', status || 'PRESENT', checkInTime || '09:02 AM', status || 'PRESENT']
      );
      return res.json({ success: true, message: 'Check-in recorded in MySQL database' });
    }
  } catch (err) {
    console.warn('MySQL Check-in Error:', err.message);
  }
  res.json({ success: true, message: 'Checked in successfully (dev mode)' });
});

app.post('/api/attendance/checkout', async (req, res) => {
  const { checkOutTime, loggedHours, status } = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const today = new Date().toISOString().split('T')[0];
      await query(
        'UPDATE attendance_logs SET check_out_time = ?, logged_hours = ?, status = ? WHERE user_id = 1 AND log_date = ?',
        [checkOutTime || '05:30 PM', loggedHours || '8.5 hrs', status || 'PRESENT', today]
      );
      return res.json({ success: true, message: 'Check-out recorded in MySQL database' });
    }
  } catch (err) {
    console.warn('MySQL Check-out Error:', err.message);
  }
  res.json({ success: true, message: 'Checked out successfully (dev mode)' });
});

// LEAVE REQUESTS MYSQL ROUTES
app.get('/api/leaves', async (req, res) => {
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const leaves = await query('SELECT * FROM leave_requests WHERE user_id = 1 ORDER BY id DESC');
      if (leaves.length > 0) {
        const formatted = leaves.map((l) => ({
          id: `LV-${l.id}`,
          type: l.leave_type,
          fromDate: l.from_date,
          toDate: l.to_date,
          days: l.total_days,
          reason: l.reason,
          status: l.status,
          appliedDate: new Date(l.created_at).toLocaleDateString(),
        }));
        return res.json(formatted);
      }
    }
  } catch (err) {
    console.warn('MySQL Fetch Leaves Error:', err.message);
  }
  res.json(inMemoryDb.leaves);
});

app.post('/api/leaves/apply', async (req, res) => {
  const { type, fromDate, toDate, days, reason } = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const result = await query(
        'INSERT INTO leave_requests (user_id, leave_type, from_date, to_date, total_days, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, type || 'Casual Leave', fromDate, toDate, days || 1, reason, 'pending']
      );
      return res.json({ success: true, message: 'Leave request inserted into MySQL database', leaveId: result.insertId });
    }
  } catch (err) {
    console.warn('MySQL Apply Leave Error:', err.message);
  }

  const newLeave = {
    id: `LV-${Math.floor(100 + Math.random() * 900)}`,
    type: type || 'Casual Leave',
    fromDate,
    toDate,
    days: days || 1,
    reason: reason || 'Personal leave request',
    status: 'pending',
    appliedDate: 'Just Now',
  };
  inMemoryDb.leaves.unshift(newLeave);
  res.json({ success: true, message: 'Leave request submitted', leave: newLeave });
});

app.put('/api/leaves/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const numericId = id.replace('LV-', '');
  
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      await query(
        'UPDATE leave_requests SET status = ? WHERE id = ?',
        [status, numericId]
      );
      return res.json({ success: true, message: `Leave ${status} successfully in MySQL` });
    }
  } catch (err) {
    console.warn('MySQL Update Leave Error:', err.message);
  }

  // Fallback for inMemoryDb
  const leave = inMemoryDb.leaves.find(l => l.id === id || l.id === `LV-${numericId}`);
  if (leave) {
    leave.status = status;
  }
  res.json({ success: true, message: `Leave ${status} in memory` });
});

// Start Server
app.listen(PORT, async () => {
  const isDbConnected = await testConnection();
  console.log(`🚀 DayFlow Node.js Backend Server running on http://localhost:${PORT}`);
  if (isDbConnected) {
    console.log('🗄️ MySQL Database (`dayflow_db`) connected and active!');
  } else {
    console.log('⚠️ MySQL database connection offline. Operating with graceful memory state fallbacks.');
  }
});
