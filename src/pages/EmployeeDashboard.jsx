import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, User, CalendarCheck, FileText, LogOut,
  Bell, Clock, CheckCircle2, AlertCircle,
  TrendingUp, Calendar, ChevronRight, Sun, Menu, X,
  Briefcase, DollarSign, Folder, Camera, Mail, Phone,
  MapPin, ShieldAlert, Award, Download, UploadCloud, Edit3, Check
} from 'lucide-react';
import { getEmployeeProfile, updateEmployeeProfile } from '../services/employeeService';
import './Dashboard.css';

const RECENT_ACTIVITY = [
  {
    id: 1,
    icon: <CheckCircle2 size={18} />,
    color: 'var(--success-400)',
    title: 'Leave request approved',
    desc: 'Your casual leave for Aug 25–26 has been approved by HR.',
    time: '2 hours ago',
  },
  {
    id: 2,
    icon: <Clock size={18} />,
    color: 'var(--warning-400)',
    title: 'Check-in recorded',
    desc: 'You checked in today at 9:02 AM.',
    time: '5 hours ago',
  },
  {
    id: 3,
    icon: <AlertCircle size={18} />,
    color: 'var(--primary-400)',
    title: 'New company policy',
    desc: 'Updated remote work policy has been published. Please review.',
    time: '1 day ago',
  },
  {
    id: 4,
    icon: <FileText size={18} />,
    color: 'var(--accent-400)',
    title: 'Payslip generated',
    desc: 'Your July 2026 payslip is now available for download.',
    time: '3 days ago',
  },
];

const QUICK_STATS = [
  { label: 'Days Present', value: '18', sub: 'this month', icon: <CalendarCheck size={22} />, color: 'var(--success-400)' },
  { label: 'Leaves Used', value: '3', sub: 'of 24 annual', icon: <Calendar size={22} />, color: 'var(--warning-400)' },
  { label: 'Hours Logged', value: '142', sub: 'this month', icon: <Clock size={22} />, color: 'var(--primary-400)' },
  { label: 'On-Time Rate', value: '95%', sub: 'last 30 days', icon: <TrendingUp size={22} />, color: 'var(--accent-400)' },
];

export default function EmployeeDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'profile'
  const [profileSubTab, setProfileSubTab] = useState('personal'); // 'personal' | 'job' | 'salary' | 'documents'
  const [profileData, setProfileData] = useState(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getEmployeeProfile().then((data) => setProfileData(data));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleAvatarUpdate = (e) => {
    e.preventDefault();
    if (!newAvatarUrl) return;
    const updated = {
      ...profileData,
      personalDetails: {
        ...profileData.personalDetails,
        avatarUrl: newAvatarUrl,
      },
    };
    setProfileData(updated);
    updateEmployeeProfile({ avatarUrl: newAvatarUrl });
    setIsEditingAvatar(false);
    setNewAvatarUrl('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const personal = profileData?.personalDetails || {};
  const job = profileData?.jobDetails || {};
  const salary = profileData?.salaryStructure || {};
  const documents = profileData?.documents || [];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Zap size={22} />
            </div>
            <span className="sidebar-logo-text">DayFlow</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          <button
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
            className={`sidebar-link ${activeTab === 'dashboard' ? 'sidebar-link-active' : ''}`}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="sidebar-link-icon"><Sun size={20} /></div>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
            className={`sidebar-link ${activeTab === 'profile' ? 'sidebar-link-active' : ''}`}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="sidebar-link-icon"><User size={20} /></div>
            <span>My Profile</span>
          </button>

          <a href="#" className="sidebar-link" onClick={(e) => e.preventDefault()}>
            <div className="sidebar-link-icon"><CalendarCheck size={20} /></div>
            <span>Attendance</span>
          </a>
          <a href="#" className="sidebar-link" onClick={(e) => e.preventDefault()}>
            <div className="sidebar-link-icon"><FileText size={20} /></div>
            <span>Leave Requests</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <Link to="/signin" className="sidebar-link sidebar-link-danger">
            <div className="sidebar-link-icon"><LogOut size={20} /></div>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="topbar-greeting">
              <h1 className="topbar-title">
                {activeTab === 'dashboard' ? (
                  <>{getGreeting()}, <span className="gradient-text">{personal.fullName ? personal.fullName.split(' ')[0] : 'Alex'}</span></>
                ) : (
                  <>Employee <span className="gradient-text">Profile</span></>
                )}
              </h1>
              <p className="topbar-subtitle">
                {activeTab === 'dashboard' ? "Here's your daily overview" : 'Manage your personal details, job role, salary & documents'}
              </p>
            </div>
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="topbar-badge">3</span>
            </button>
            <div
              className="topbar-avatar"
              onClick={() => setActiveTab('profile')}
              title="Click to View Profile"
              style={{ cursor: 'pointer' }}
            >
              {personal.avatarUrl ? (
                <img src={personal.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span>AM</span>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="dashboard-content">
          {activeTab === 'dashboard' ? (
            <>
              {/* Quick Stats */}
              <section className="stats-grid">
                {QUICK_STATS.map((stat, i) => (
                  <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="stat-card-header">
                      <div className="stat-card-icon" style={{ color: stat.color, background: `${stat.color}15` }}>
                        {stat.icon}
                      </div>
                      <ChevronRight size={16} className="stat-card-arrow" />
                    </div>
                    <div className="stat-card-value">{stat.value}</div>
                    <div className="stat-card-label">{stat.label}</div>
                    <div className="stat-card-sub">{stat.sub}</div>
                  </div>
                ))}
              </section>

              {/* Quick Access Cards */}
              <section className="section">
                <h2 className="section-title">Quick Access</h2>
                <div className="quick-access-grid">
                  <div className="quick-card quick-card-profile" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
                    <div className="quick-card-glow" />
                    <div className="quick-card-icon">
                      <User size={28} />
                    </div>
                    <h3 className="quick-card-title">My Profile</h3>
                    <p className="quick-card-desc">View and edit your personal, job, salary details & documents</p>
                    <button className="quick-card-btn">
                      Open Profile <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="quick-card quick-card-attendance">
                    <div className="quick-card-glow" />
                    <div className="quick-card-icon">
                      <CalendarCheck size={28} />
                    </div>
                    <h3 className="quick-card-title">Attendance</h3>
                    <p className="quick-card-desc">Check in/out and view your attendance log</p>
                    <button className="quick-card-btn">
                      View Attendance <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="quick-card quick-card-leave">
                    <div className="quick-card-glow" />
                    <div className="quick-card-icon">
                      <FileText size={28} />
                    </div>
                    <h3 className="quick-card-title">Leave Requests</h3>
                    <p className="quick-card-desc">Apply for leave or check request status</p>
                    <button className="quick-card-btn">
                      Manage Leaves <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Recent Activity</h2>
                  <button className="btn-ghost-sm">View All</button>
                </div>
                <div className="activity-list">
                  {RECENT_ACTIVITY.map((item, i) => (
                    <div key={item.id} className="activity-item" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="activity-icon" style={{ color: item.color, background: `${item.color}15` }}>
                        {item.icon}
                      </div>
                      <div className="activity-body">
                        <div className="activity-title">{item.title}</div>
                        <div className="activity-desc">{item.desc}</div>
                      </div>
                      <div className="activity-time">{item.time}</div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            /* VIEW PROFILE DASHBOARD */
            <div className="profile-container">
              {saveSuccess && (
                <div className="status-badge status-approved" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={18} /> Profile picture updated successfully!
                </div>
              )}

              {/* Profile Header Banner */}
              <div className="profile-header-card">
                <div className="profile-cover-banner">
                  <div className="profile-cover-glow" />
                </div>
                <div className="profile-header-body">
                  <div className="profile-avatar-group">
                    <div className="profile-avatar-wrapper">
                      {personal.avatarUrl ? (
                        <img src={personal.avatarUrl} alt={personal.fullName} className="profile-avatar-img" />
                      ) : (
                        <div className="profile-avatar-fallback">AM</div>
                      )}
                      <button
                        className="profile-avatar-edit-btn"
                        onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                        title="Update Profile Picture"
                      >
                        <Camera size={16} />
                      </button>
                    </div>
                    <div className="profile-user-info">
                      <div className="profile-user-name">
                        {personal.fullName || 'Alex Morgan'}
                        <span className="profile-status-chip">{job.status || 'Active'}</span>
                      </div>
                      <div className="profile-user-role">{job.designation || 'Senior Frontend Engineer'} • {job.department || 'Engineering'}</div>
                      <div className="profile-user-meta">
                        <span className="profile-user-meta-item"><Mail size={14} /> {personal.email}</span>
                        <span className="profile-user-meta-item"><Phone size={14} /> {personal.phone}</span>
                        <span className="profile-user-meta-item"><MapPin size={14} /> {job.workLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-header-actions">
                    <button className="btn-primary" onClick={() => setProfileSubTab('documents')}>
                      <UploadCloud size={16} style={{ marginRight: '0.4rem' }} /> Manage Documents
                    </button>
                  </div>
                </div>
              </div>

              {/* Avatar Uploader Form Modal/Card */}
              {isEditingAvatar && (
                <div className="profile-card" style={{ border: '1px solid var(--primary-500)', animation: 'fadeIn 0.3s ease-out' }}>
                  <div className="profile-card-header">
                    <h3 className="profile-card-title"><Camera size={20} className="profile-card-title-icon" /> Update Profile Picture</h3>
                    <button className="sidebar-close" onClick={() => setIsEditingAvatar(false)}><X size={18} /></button>
                  </div>
                  <form onSubmit={handleAvatarUpdate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                      type="url"
                      placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                      value={newAvatarUrl}
                      onChange={(e) => setNewAvatarUrl(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        background: 'var(--surface-glass)',
                        border: '1px solid var(--surface-glass-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        minWidth: '240px'
                      }}
                      required
                    />
                    <button type="submit" className="btn-primary">Save Picture</button>
                  </form>
                </div>
              )}

              {/* Profile Sub-Navigation Tabs */}
              <div className="profile-tabs-nav">
                <button
                  className={`profile-tab-btn ${profileSubTab === 'personal' ? 'active' : ''}`}
                  onClick={() => setProfileSubTab('personal')}
                >
                  <User size={18} /> Personal Details
                </button>
                <button
                  className={`profile-tab-btn ${profileSubTab === 'job' ? 'active' : ''}`}
                  onClick={() => setProfileSubTab('job')}
                >
                  <Briefcase size={18} /> Job Details
                </button>
                <button
                  className={`profile-tab-btn ${profileSubTab === 'salary' ? 'active' : ''}`}
                  onClick={() => setProfileSubTab('salary')}
                >
                  <DollarSign size={18} /> Salary Structure
                </button>
                <button
                  className={`profile-tab-btn ${profileSubTab === 'documents' ? 'active' : ''}`}
                  onClick={() => setProfileSubTab('documents')}
                >
                  <Folder size={18} /> Documents ({documents.length})
                </button>
              </div>

              {/* Tab Content 1: Personal Details */}
              {profileSubTab === 'personal' && (
                <div className="profile-content-grid">
                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h3 className="profile-card-title"><User className="profile-card-title-icon" size={20} /> Basic Information</h3>
                    </div>
                    <div className="profile-details-grid">
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Employee ID</span>
                        <span className="profile-detail-value">{personal.id}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Full Name</span>
                        <span className="profile-detail-value">{personal.fullName}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Email Address</span>
                        <span className="profile-detail-value">{personal.email}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Phone Number</span>
                        <span className="profile-detail-value">{personal.phone}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Date of Birth</span>
                        <span className="profile-detail-value">{personal.dob}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Gender</span>
                        <span className="profile-detail-value">{personal.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h3 className="profile-card-title"><MapPin className="profile-card-title-icon" size={20} /> Residential Address</h3>
                    </div>
                    <div className="profile-detail-field">
                      <span className="profile-detail-label">Current Address</span>
                      <span className="profile-detail-value">{personal.address}</span>
                    </div>

                    <div className="profile-card-header" style={{ marginTop: '1rem' }}>
                      <h3 className="profile-card-title"><ShieldAlert className="profile-card-title-icon" size={20} /> Emergency Contact</h3>
                    </div>
                    <div className="profile-details-grid">
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Contact Person</span>
                        <span className="profile-detail-value">{personal.emergencyContact?.name}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Relationship</span>
                        <span className="profile-detail-value">{personal.emergencyContact?.relation}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Emergency Phone</span>
                        <span className="profile-detail-value">{personal.emergencyContact?.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Job Details */}
              {profileSubTab === 'job' && (
                <div className="profile-content-grid">
                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h3 className="profile-card-title"><Briefcase className="profile-card-title-icon" size={20} /> Position & Department</h3>
                    </div>
                    <div className="profile-details-grid">
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Job Designation</span>
                        <span className="profile-detail-value">{job.designation}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Department</span>
                        <span className="profile-detail-value">{job.department}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Employment Type</span>
                        <span className="profile-detail-value">{job.employeeType}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Date of Joining</span>
                        <span className="profile-detail-value">{job.dateOfJoining}</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h3 className="profile-card-title"><Award className="profile-card-title-icon" size={20} /> Manager & Location</h3>
                    </div>
                    <div className="profile-details-grid">
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Reporting Manager</span>
                        <span className="profile-detail-value">{job.manager}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Workplace Location</span>
                        <span className="profile-detail-value">{job.workLocation}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Current Status</span>
                        <span className="profile-detail-value" style={{ color: 'var(--success-400)' }}>{job.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 3: Salary Structure */}
              {profileSubTab === 'salary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="salary-overview-card">
                    <div>
                      <span className="profile-detail-label">Estimated Monthly Net Pay</span>
                      <div className="salary-main-val">{salary.netMonthlyPay} <span style={{ fontSize: '0.9rem', color: 'var(--neutral-400)', fontWeight: 500 }}>/ month ({salary.currency})</span></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="profile-detail-label">Annual CTC Package</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success-400)' }}>{salary.annualPackage}</div>
                    </div>
                  </div>

                  <div className="profile-content-grid">
                    <div className="profile-card">
                      <div className="profile-card-header">
                        <h3 className="profile-card-title"><DollarSign className="profile-card-title-icon" size={20} /> Monthly Allowances</h3>
                      </div>
                      <div className="salary-breakdown-list">
                        <div className="salary-row salary-row-allowance">
                          <span>Basic Salary</span>
                          <span style={{ fontWeight: 700 }}>{salary.monthlyBase}</span>
                        </div>
                        <div className="salary-row salary-row-allowance">
                          <span>House Rent Allowance (HRA)</span>
                          <span style={{ fontWeight: 700 }}>{salary.hra}</span>
                        </div>
                        <div className="salary-row salary-row-allowance">
                          <span>Special & Flexible Allowance</span>
                          <span style={{ fontWeight: 700 }}>{salary.specialAllowance}</span>
                        </div>
                        <div className="salary-row" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                          <span style={{ fontWeight: 700 }}>Gross Monthly Earnings</span>
                          <span style={{ fontWeight: 800, color: 'var(--primary-400)' }}>{salary.grossMonthly}</span>
                        </div>
                      </div>
                    </div>

                    <div className="profile-card">
                      <div className="profile-card-header">
                        <h3 className="profile-card-title"><ShieldAlert className="profile-card-title-icon" size={20} /> Deductions & Bank Details</h3>
                      </div>
                      <div className="salary-breakdown-list">
                        <div className="salary-row salary-row-deduction">
                          <span>Income Tax Deduction (TDS)</span>
                          <span style={{ fontWeight: 700, color: 'var(--danger-400)' }}>-{salary.deductions?.tax}</span>
                        </div>
                        <div className="salary-row salary-row-deduction">
                          <span>Provident Fund (PF)</span>
                          <span style={{ fontWeight: 700, color: 'var(--danger-400)' }}>-{salary.deductions?.providentFund}</span>
                        </div>
                        <div className="salary-row salary-row-deduction">
                          <span>Medical Insurance</span>
                          <span style={{ fontWeight: 700, color: 'var(--danger-400)' }}>-{salary.deductions?.insurance}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-glass-border)' }}>
                        <span className="profile-detail-label">Disbursement Bank Account</span>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', marginTop: '0.25rem' }}>
                          {salary.bankDetails?.bankName} ({salary.bankDetails?.accountNumber})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 4: Documents */}
              {profileSubTab === 'documents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>Employee Uploaded Documents</h3>
                    <button className="btn-primary" onClick={() => alert('Document upload modal dialog opened!')}>
                      <UploadCloud size={16} style={{ marginRight: '0.4rem' }} /> Upload New Document
                    </button>
                  </div>

                  <div className="documents-grid">
                    {documents.map((doc) => (
                      <div key={doc.id} className="document-item-card">
                        <div className="document-icon-box">
                          <FileText size={24} />
                        </div>
                        <div className="document-info">
                          <div className="document-title">{doc.title}</div>
                          <div className="document-meta">
                            <span>{doc.category}</span> • <span>{doc.fileSize}</span>
                          </div>
                          <div className="document-actions">
                            <button
                              className="btn-ghost-sm"
                              onClick={() => alert(`Downloading ${doc.title}...`)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <Download size={14} /> Download
                            </button>
                            <span className="status-chip status-approved" style={{ fontSize: '0.7rem' }}>
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
