import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query, testConnection } from './config/db.js';
import { hashPassword, comparePassword, generateToken, authenticateToken, authorizeRole } from './config/auth.js';
import { randomUUID } from 'crypto';

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

// Health Check (PUBLIC)
app.get('/api/health', async (req, res) => {
  const isDbConnected = await testConnection();
  res.json({
    status: 'OK',
    server: 'DayFlow Node.js Express Backend',
    database: isDbConnected ? 'MySQL Connected (dayflow_db)' : 'Fallback Mode (MySQL offline)',
  });
});

// ==================== AUTHENTICATION ROUTES (PUBLIC) ====================

// Register — hashes password with bcrypt before storing
app.post('/api/auth/register', async (req, res) => {
  const { employeeId, email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      // Check if email already exists
      const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      const passwordHash = await hashPassword(password);
      const newId = randomUUID();
      await query(
        'INSERT INTO users (id, employee_id, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [newId, employeeId, email, passwordHash, role || 'employee']
      );
      return res.json({ success: true, message: 'Account created successfully! You can now sign in.' });
    }
  } catch (err) {
    console.warn('MySQL Register Error:', err.message);
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }

  // Fallback dev mode
  res.json({ success: true, message: 'Registered user successfully (dev mode)' });
});

// Login — verifies password with bcrypt, returns signed JWT
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const users = await query('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'No account found with this email.' });
      }

      const user = users[0];

      // Verify password with bcrypt
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      }

      // Check role match
      if (role && user.role !== role) {
        return res.status(403).json({ success: false, message: `This account is registered as '${user.role}', not '${role}'.` });
      }

      // Generate JWT token
      const token = generateToken(user);

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          employeeId: user.employee_id,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err) {
    console.warn('MySQL Login Error:', err.message);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }

  // Fallback dev mode — generate a real JWT even in dev mode
  const mockUser = { id: 1, email, role: role || 'employee' };
  const token = generateToken(mockUser);
  res.json({ success: true, token, user: mockUser });
});

// ==================== PROTECTED ROUTES (JWT REQUIRED) ====================

// GET All Employees (HR Only)
app.get('/api/employees', authenticateToken, authorizeRole('hr'), async (req, res) => {
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const rows = await query(`
        SELECT p.*, u.email, u.employee_id 
        FROM employee_profiles p 
        JOIN users u ON p.user_id = u.id
      `);
      const employees = rows.map(p => ({
        id: p.employee_id,
        name: p.full_name,
        email: p.email,
        phone: p.phone,
        department: p.department,
        designation: p.designation,
        status: p.status,
        avatarUrl: p.avatar_url,
      }));
      return res.json(employees);
    }
  } catch (err) {
    console.error('Failed to fetch employees:', err);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// PUT Employee Profile (HR Only)
app.put('/api/employees/:employeeId', authenticateToken, authorizeRole('hr'), async (req, res) => {
  const empId = req.params.employeeId;
  const updates = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      await query(`
        UPDATE employee_profiles 
        SET phone = ?, address = ?, avatar_url = ?, full_name = ?, gender = ?
        WHERE user_id = (SELECT id FROM users WHERE employee_id = ?)
      `, [updates.phone, updates.address, updates.avatar_url, updates.full_name, updates.gender, empId]);
      return res.json({ success: true, message: 'Profile updated' });
    }
  } catch (err) {
    console.error('Failed to update employee:', err);
    return res.status(500).json({ error: 'Failed to update employee' });
  }
});
app.get('/api/employee/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const profiles = await query(`
        SELECT p.*, u.email 
        FROM employee_profiles p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.user_id = ?
      `, [userId]);
      if (profiles.length > 0) {
        const p = profiles[0];
        const salary = await query('SELECT * FROM salary_structures WHERE profile_id = ?', [p.id]);
        const s = salary[0] || {};

        return res.json({
          personalDetails: {
            id: p.id ? `EMP-2026-00${p.id}` : 'EMP-2026-0842',
            fullName: p.full_name,
            email: p.email,
            phone: p.phone,
            dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : '1994-06-15',
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
            currency: 'USD',
            annualPackage: s.gross_salary ? `$${(Number(s.gross_salary) * 12).toLocaleString()}` : '$145,000',
            monthlyBase: s.basic_salary ? `$${Number(s.basic_salary).toLocaleString()}` : '$8,500',
            hra: s.hra ? `$${Number(s.hra).toLocaleString()}` : '$2,200',
            specialAllowance: s.special_allowance ? `$${Number(s.special_allowance).toLocaleString()}` : '$1,383',
            grossMonthly: s.gross_salary ? `$${Number(s.gross_salary).toLocaleString()}` : '$12,083',
            deductions: {
              tax: s.tax_deduction ? `$${Number(s.tax_deduction).toLocaleString()}` : '$1,850',
              providentFund: s.pf_deduction ? `$${Number(s.pf_deduction).toLocaleString()}` : '$650',
              insurance: s.other_deductions ? `$${Number(s.other_deductions).toLocaleString()}` : '$150',
              totalDeductions: (s.tax_deduction && s.pf_deduction && s.other_deductions) 
                ? `$${(Number(s.tax_deduction) + Number(s.pf_deduction) + Number(s.other_deductions)).toLocaleString()}` : '$2,650',
            },
            netMonthlyPay: s.net_salary ? `$${Number(s.net_salary).toLocaleString()}` : '$9,433',
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

// PUT Update Employee Profile — uses req.user.userId from JWT
app.put('/api/employee/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { personalDetails, jobDetails } = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      if (personalDetails) {
        await query(
          'UPDATE employee_profiles SET phone = ?, address = ?, avatar_url = ?, full_name = ?, gender = ? WHERE user_id = ?',
          [personalDetails.phone, personalDetails.address, personalDetails.avatarUrl, personalDetails.fullName, personalDetails.gender, userId]
        );
        if (personalDetails.email) {
          await query(
            'UPDATE users SET email = ? WHERE id = ?',
            [personalDetails.email, userId]
          );
        }
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

// Attendance Check-In — uses req.user.userId from JWT
app.post('/api/attendance/checkin', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { checkInTime, status } = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const today = new Date().toISOString().split('T')[0];
      const newId = randomUUID();
      await query(
        'INSERT INTO attendance_logs (id, user_id, log_date, check_in_time, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE check_in_time = ?, status = ?',
        [newId, userId, today, checkInTime || '09:02 AM', status || 'PRESENT', checkInTime || '09:02 AM', status || 'PRESENT']
      );
      return res.json({ success: true, message: 'Check-in recorded in MySQL database' });
    }
  } catch (err) {
    console.warn('MySQL Check-in Error:', err.message);
  }
  res.json({ success: true, message: 'Checked in successfully (dev mode)' });
});

// Attendance Check-Out — uses req.user.userId from JWT
app.post('/api/attendance/checkout', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { checkOutTime, loggedHours, status } = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const today = new Date().toISOString().split('T')[0];
      await query(
        'UPDATE attendance_logs SET check_out_time = ?, logged_hours = ?, status = ? WHERE user_id = ? AND log_date = ?',
        [checkOutTime || '05:30 PM', loggedHours || '8.5 hrs', status || 'PRESENT', userId, today]
      );
      return res.json({ success: true, message: 'Check-out recorded in MySQL database' });
    }
  } catch (err) {
    console.warn('MySQL Check-out Error:', err.message);
  }
  res.json({ success: true, message: 'Checked out successfully (dev mode)' });
});

// GET Leave Requests — uses req.user.userId from JWT
app.get('/api/leaves', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      // HR can see all leaves, employees see only their own
      let leaves;
      if (req.user.role === 'hr') {
        leaves = await query('SELECT lr.*, u.email as employee_email FROM leave_requests lr JOIN users u ON lr.user_id = u.id ORDER BY lr.id DESC');
      } else {
        leaves = await query('SELECT * FROM leave_requests WHERE user_id = ? ORDER BY id DESC', [userId]);
      }
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

// POST Apply for Leave — uses req.user.userId from JWT
app.post('/api/leaves/apply', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { type, fromDate, toDate, days, reason } = req.body;
  try {
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      const newId = randomUUID();
      await query(
        'INSERT INTO leave_requests (id, user_id, leave_type, from_date, to_date, total_days, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [newId, userId, type || 'Casual Leave', fromDate, toDate, days || 1, reason, 'pending']
      );
      return res.json({ success: true, message: 'Leave request submitted successfully.', leaveId: newId });
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

// PUT Approve/Reject Leave — HR ONLY
app.put('/api/leaves/:id/status', authenticateToken, authorizeRole('hr'), async (req, res) => {
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
