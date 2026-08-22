import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory Employee Profile Database store (easily replaced with MongoDB/PostgreSQL)
let employeeProfile = {
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
    manager: "Marcus Vance (VP of Engineering)",
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
      routingNumber: "122000043",
    },
  },
  documents: [
    {
      id: "doc-1",
      title: "Offer Letter & Employment Agreement",
      category: "Contract",
      uploadDate: "2022-03-10",
      fileSize: "2.4 MB",
      status: "Verified",
    },
    {
      id: "doc-2",
      title: "Government ID / Passport Copy",
      category: "Identity Proof",
      uploadDate: "2022-03-12",
      fileSize: "1.8 MB",
      status: "Verified",
    },
    {
      id: "doc-3",
      title: "Form W-2 Tax Declaration 2025",
      category: "Tax Form",
      uploadDate: "2026-01-20",
      fileSize: "850 KB",
      status: "Verified",
    },
    {
      id: "doc-4",
      title: "Educational Certificate (B.S. CS)",
      category: "Education",
      uploadDate: "2022-03-11",
      fileSize: "3.1 MB",
      status: "Verified",
    },
  ],
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DayFlow Node.js backend server is running' });
});

// GET Employee Profile
app.get('/api/employee/profile', (req, res) => {
  res.json(employeeProfile);
});

// PUT Update Employee Profile
app.get('/api/employee/profile', (req, res) => {
  res.json(employeeProfile);
});

app.put('/api/employee/profile', (req, res) => {
  const { personalDetails } = req.body;
  if (personalDetails) {
    employeeProfile.personalDetails = { ...employeeProfile.personalDetails, ...personalDetails };
  }
  res.json({ message: 'Profile updated successfully', profile: employeeProfile });
});

app.listen(PORT, () => {
  console.log(`DayFlow Node.js Backend Server running on http://localhost:${PORT}`);
});
