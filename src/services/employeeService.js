// Employee Service - Mock Data & Node.js API Service layer
import { getAuthHeaders } from './authService';

export const MOCK_EMPLOYEE_PROFILE = {
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

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetch employee profile data from Node.js backend with fallback to mock data
 */
export async function getEmployeeProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/employee/profile`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error('API unavailable');
    const data = await response.json();
    return data;
  } catch {
    // Fallback to mock profile when backend is offline or in dev mode
    return MOCK_EMPLOYEE_PROFILE;
  }
}

/**
 * Fetch all employee profiles from Node.js backend (HR Admin only)
 */
export async function fetchAllEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error('API unavailable');
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
}

/**
 * Update employee profile details
 */
export async function updateEmployeeProfile(updatedDetails) {
  try {
    const response = await fetch(`${API_BASE_URL}/employee/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updatedDetails),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  } catch {
    // Fallback update mock
    return { success: true, profile: { ...MOCK_EMPLOYEE_PROFILE, personalDetails: { ...MOCK_EMPLOYEE_PROFILE.personalDetails, ...updatedDetails } } };
  }
}
