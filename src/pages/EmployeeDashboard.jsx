import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, User, CalendarCheck, FileText, LogOut,
  Bell, Clock, CheckCircle2, AlertCircle, XCircle,
  TrendingUp, Calendar, ChevronRight, Sun, Menu, X,
  Briefcase, DollarSign, Folder, Camera, Mail, Phone,
  MapPin, ShieldAlert, Award, Download, UploadCloud, Edit3, Check,
  Shield, Save, Play, Pause, CalendarRange, ListFilter, Image as ImageIcon, Plus
} from 'lucide-react';
import { getEmployeeProfile, updateEmployeeProfile } from '../services/employeeService';
import { MOCK_WEEKLY_ATTENDANCE, MOCK_DAILY_TIMELINE, ATTENDANCE_STATUS_TYPES } from '../services/attendanceService';
import { getStoredLeaves, addLeaveRequest, updateStoredEmployeeProfile } from '../services/storeService';
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

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Leave Request Approved', desc: 'HR approved your 2 days casual leave for Aug 25–26', time: '10 mins ago', unread: true, icon: <CheckCircle2 size={16} />, color: 'var(--success-400)' },
  { id: 2, title: 'Shift Check-in Recorded', desc: 'Successfully checked in at 09:02 AM', time: '3 hours ago', unread: true, icon: <Clock size={16} />, color: 'var(--primary-400)' },
  { id: 3, title: 'July Payslip Ready', desc: 'Your net pay of $9,433 has been disbursed', time: '1 day ago', unread: false, icon: <DollarSign size={16} />, color: 'var(--success-400)' },
  { id: 4, title: 'Policy Update', desc: 'New hybrid workplace guidelines effective Sep 1', time: '2 days ago', unread: false, icon: <AlertCircle size={16} />, color: 'var(--warning-400)' },
];

const QUICK_STATS = [
  { label: 'Days Present', value: '18', sub: 'this month', icon: <CalendarCheck size={22} />, color: 'var(--success-400)' },
  { label: 'Leaves Used', value: '3', sub: 'of 24 annual', icon: <Calendar size={22} />, color: 'var(--warning-400)' },
  { label: 'Hours Logged', value: '142', sub: 'this month', icon: <Clock size={22} />, color: 'var(--primary-400)' },
  { label: 'On-Time Rate', value: '95%', sub: 'last 30 days', icon: <TrendingUp size={22} />, color: 'var(--accent-400)' },
];

export default function EmployeeDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileSubTab, setProfileSubTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  
  // Notification Dropdown State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Attendance Tracking States
  const [attendanceView, setAttendanceView] = useState('daily');
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('09:02 AM');
  const [checkOutTime, setCheckOutTime] = useState('—');
  const [workSeconds, setWorkSeconds] = useState(15735);
  const [todayStatus, setTodayStatus] = useState('PRESENT');
  const [weeklyRecords, setWeeklyRecords] = useState(MOCK_WEEKLY_ATTENDANCE);

  // Leave Management States - Synced with Store
  const [myLeaves, setMyLeaves] = useState(() => getStoredLeaves());
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [newLeaveForm, setNewLeaveForm] = useState({
    type: 'Casual Leave',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  useEffect(() => {
    getEmployeeProfile().then((data) => {
      setProfileData(data);
      initFormData(data);
    });
  }, []);

  // Sync Store Updates in Real-Time
  useEffect(() => {
    const handleStoreChange = () => {
      setMyLeaves(getStoredLeaves());
    };
    window.addEventListener('dayflow_store_update', handleStoreChange);
    return () => window.removeEventListener('dayflow_store_update', handleStoreChange);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setWorkSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  const handleToggleCheckIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isCheckedIn) {
      setIsCheckedIn(false);
      setCheckOutTime(timeStr);
      const hrsLogged = workSeconds / 3600;
      if (hrsLogged < 4) {
        setTodayStatus('HALF_DAY');
      } else {
        setTodayStatus('PRESENT');
      }
    } else {
      setIsCheckedIn(true);
      setCheckInTime(timeStr);
      setCheckOutTime('—');
      setTodayStatus('PRESENT');
    }
  };

  const initFormData = (data) => {
    if (!data) return;
    setEditFormData({
      fullName: data.personalDetails?.fullName || '',
      email: data.personalDetails?.email || '',
      phone: data.personalDetails?.phone || '',
      dob: data.personalDetails?.dob || '',
      gender: data.personalDetails?.gender || '',
      address: data.personalDetails?.address || '',
      avatarUrl: data.personalDetails?.avatarUrl || '',
      emergencyName: data.personalDetails?.emergencyContact?.name || '',
      emergencyRelation: data.personalDetails?.emergencyContact?.relation || '',
      emergencyPhone: data.personalDetails?.emergencyContact?.phone || '',
      designation: data.jobDetails?.designation || '',
      department: data.jobDetails?.department || '',
      employeeType: data.jobDetails?.employeeType || '',
      dateOfJoining: data.jobDetails?.dateOfJoining || '',
      workLocation: data.jobDetails?.workLocation || '',
      manager: data.jobDetails?.manager || '',
      status: data.jobDetails?.status || '',
      annualPackage: data.salaryStructure?.annualPackage || '',
      netMonthlyPay: data.salaryStructure?.netMonthlyPay || '',
      monthlyBase: data.salaryStructure?.monthlyBase || '',
      hra: data.salaryStructure?.hra || '',
      specialAllowance: data.salaryStructure?.specialAllowance || '',
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleOpenEditModal = () => {
    initFormData(profileData);
    setIsEditModalOpen(true);
  };

  const handleInputChange = (field, val) => {
    setEditFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...profileData,
      personalDetails: {
        ...profileData.personalDetails,
        phone: editFormData.phone,
        address: editFormData.address,
        avatarUrl: editFormData.avatarUrl,
        emergencyContact: {
          name: editFormData.emergencyName,
          relation: editFormData.emergencyRelation,
          phone: editFormData.emergencyPhone,
        },
      },
    };

    setProfileData(updated);
    updateEmployeeProfile(updated);
    updateStoredEmployeeProfile('EMP-001', {
      phone: editFormData.phone,
      address: editFormData.address,
      avatarUrl: editFormData.avatarUrl,
      fullName: editFormData.fullName,
    });
    setIsEditModalOpen(false);
    
    setSaveSuccessMsg('Your profile details & picture have been updated and synced with HR Admin!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleApplyLeaveSubmit = (e) => {
    e.preventDefault();
    if (!newLeaveForm.fromDate || !newLeaveForm.toDate) {
      alert('Please select both From Date and To Date');
      return;
    }

    const d1 = new Date(newLeaveForm.fromDate);
    const d2 = new Date(newLeaveForm.toDate);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeaveObj = {
      id: `LV-${Math.floor(100 + Math.random() * 900)}`,
      employee: profileData?.personalDetails?.fullName || 'Alex Morgan',
      avatar: 'AM',
      type: newLeaveForm.type,
      from: newLeaveForm.fromDate,
      to: newLeaveForm.toDate,
      fromDate: newLeaveForm.fromDate,
      toDate: newLeaveForm.toDate,
      days: isNaN(diffDays) ? 1 : diffDays,
      reason: newLeaveForm.reason || 'Personal leave request',
      status: 'pending',
      appliedDate: 'Just Now',
    };

    addLeaveRequest(newLeaveObj);
    setIsLeaveModalOpen(false);
    setNewLeaveForm({ type: 'Casual Leave', fromDate: '', toDate: '', reason: '' });
    
    setSaveSuccessMsg(`Leave request (${newLeaveForm.type}) submitted successfully and synced to HR Admin for approval!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const personal = profileData?.personalDetails || {};
  const job = profileData?.jobDetails || {};
  const salary = profileData?.salaryStructure || {};
  const documents = profileData?.documents || [];

  const renderStatusBadge = (statusKey) => {
    const config = ATTENDANCE_STATUS_TYPES[statusKey] || ATTENDANCE_STATUS_TYPES.PRESENT;
    return (
      <span
        className="weekly-status-chip"
        style={{ color: config.color, background: config.bg, border: `1px solid ${config.border}` }}
      >
        <span className="status-dot" style={{ background: config.color }} />
        {config.label}
      </span>
    );
  };

  const getLeaveStatusChip = (status) => {
    if (status === 'approved') {
      return <span className="weekly-status-chip" style={{ color: 'var(--success-400)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Approved</span>;
    }
    if (status === 'rejected') {
      return <span className="weekly-status-chip" style={{ color: 'var(--danger-400)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Rejected</span>;
    }
    return <span className="weekly-status-chip" style={{ color: 'var(--warning-400)', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Pending HR Review</span>;
  };

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

          <button
            onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }}
            className={`sidebar-link ${activeTab === 'attendance' ? 'sidebar-link-active' : ''}`}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="sidebar-link-icon"><CalendarCheck size={20} /></div>
            <span>Attendance</span>
          </button>

          <button
            onClick={() => { setActiveTab('leaves'); setSidebarOpen(false); }}
            className={`sidebar-link ${activeTab === 'leaves' ? 'sidebar-link-active' : ''}`}
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="sidebar-link-icon"><FileText size={20} /></div>
            <span>Leave Requests</span>
          </button>
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
                {activeTab === 'dashboard' && <>{getGreeting()}, <span className="gradient-text">{personal.fullName ? personal.fullName.split(' ')[0] : 'Alex'}</span></>}
                {activeTab === 'profile' && <>Employee <span className="gradient-text">Profile</span></>}
                {activeTab === 'attendance' && <>Attendance <span className="gradient-text">Tracking</span></>}
                {activeTab === 'leaves' && <>Leave <span className="gradient-text">Management</span></>}
              </h1>
              <p className="topbar-subtitle">
                {activeTab === 'dashboard' && "Here's your daily overview"}
                {activeTab === 'profile' && 'Manage your personal details, job role, salary & documents'}
                {activeTab === 'attendance' && 'Live check-in/out, daily timeline logs & weekly views'}
                {activeTab === 'leaves' && 'Apply for leave, check available balances & view status'}
              </p>
            </div>
          </div>
          <div className="topbar-right" style={{ position: 'relative' }}>
            {/* Notification Bell with Badge & Dropdown */}
            <button
              className="topbar-icon-btn"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(prev => !prev)}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
            </button>

            {/* Notification Dropdown Panel */}
            {notificationsOpen && (
              <div className="notifications-dropdown-menu">
                <div className="notifications-dropdown-header">
                  <div className="notifications-dropdown-title">
                    <Bell size={18} style={{ color: 'var(--primary-400)' }} /> Notifications
                  </div>
                  {unreadCount > 0 && (
                    <button className="btn-ghost-sm" onClick={markAllNotificationsRead} style={{ fontSize: '0.75rem' }}>
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notifications-dropdown-body">
                  {notifications.map((item) => (
                    <div key={item.id} className={`notification-dropdown-item ${item.unread ? 'unread' : ''}`}>
                      <div className="notification-dropdown-icon" style={{ background: `${item.color}15`, color: item.color }}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="notification-dropdown-text">{item.title}</div>
                        <div className="notification-dropdown-sub">{item.desc}</div>
                        <div className="notification-dropdown-time">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="notifications-dropdown-footer">
                  <button className="btn-ghost-sm" onClick={() => setNotificationsOpen(false)} style={{ width: '100%', fontSize: '0.8rem' }}>
                    Close Notifications
                  </button>
                </div>
              </div>
            )}

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
          {saveSuccessMsg && (
            <div className="status-badge status-approved" style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              <Check size={18} /> {saveSuccessMsg}
            </div>
          )}

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
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
                    <p className="quick-card-desc">View and edit your personal details & profile photo</p>
                    <button className="quick-card-btn">
                      Open Profile <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="quick-card quick-card-attendance" onClick={() => setActiveTab('attendance')} style={{ cursor: 'pointer' }}>
                    <div className="quick-card-glow" />
                    <div className="quick-card-icon">
                      <CalendarCheck size={28} />
                    </div>
                    <h3 className="quick-card-title">Attendance Tracking</h3>
                    <p className="quick-card-desc">Check in/out and view daily & weekly logs</p>
                    <button className="quick-card-btn">
                      View Attendance <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="quick-card quick-card-leave" onClick={() => setActiveTab('leaves')} style={{ cursor: 'pointer' }}>
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
          )}

          {/* TAB 2: VIEW PROFILE DASHBOARD */}
          {activeTab === 'profile' && (
            <div className="profile-container">
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
                        onClick={handleOpenEditModal}
                        title="Upload Photo from Device"
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
                    <button className="btn-secondary" onClick={handleOpenEditModal}>
                      <Edit3 size={16} style={{ marginRight: '0.4rem' }} /> Edit Profile
                    </button>
                    <button className="btn-primary" onClick={() => setProfileSubTab('documents')}>
                      <UploadCloud size={16} style={{ marginRight: '0.4rem' }} /> Documents
                    </button>
                  </div>
                </div>
              </div>

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
                      <button className="btn-ghost-sm" onClick={handleOpenEditModal}><Edit3 size={14} /> Edit</button>
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
                      <button className="btn-ghost-sm" onClick={handleOpenEditModal}><Edit3 size={14} /> Edit</button>
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
                    <button className="btn-primary" onClick={() => alert('Document upload trigger clicked!')}>
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

          {/* TAB 3: ATTENDANCE TRACKING DASHBOARD */}
          {activeTab === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
              {/* Check-In / Check-Out Hero Widget */}
              <div className="attendance-hero-card">
                <div className="checkin-status-info">
                  <div className={`checkin-pulse-icon ${isCheckedIn ? 'checked-in' : 'checked-out'}`}>
                    {isCheckedIn ? <Clock size={28} /> : <Pause size={28} />}
                  </div>
                  <div>
                    <div className="checkin-time-title">
                      {isCheckedIn ? 'Shift In Progress' : 'Currently Checked Out'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--neutral-300)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                      <span>Check-In: <strong>{checkInTime}</strong></span>
                      <span>Check-Out: <strong>{checkOutTime}</strong></span>
                      <span>Today's Status: {renderStatusBadge(todayStatus)}</span>
                    </div>
                  </div>
                </div>

                <div className="checkin-action-btns">
                  {isCheckedIn && (
                    <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged Duration</div>
                      <div className="checkin-timer-count">{formatTimer(workSeconds)}</div>
                    </div>
                  )}
                  
                  <button
                    className={isCheckedIn ? 'btn-checkout-large' : 'btn-checkin-large'}
                    onClick={handleToggleCheckIn}
                  >
                    {isCheckedIn ? (
                      <>
                        <Pause size={20} /> Check Out Now
                      </>
                    ) : (
                      <>
                        <Play size={20} /> Check In Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Type Legend Bar */}
              <div className="status-legend-bar">
                <span style={{ fontWeight: 700, color: 'white', marginRight: '0.5rem' }}>Attendance Status Types:</span>
                {Object.keys(ATTENDANCE_STATUS_TYPES).map((key) => {
                  const type = ATTENDANCE_STATUS_TYPES[key];
                  return (
                    <div key={key} className="status-legend-item">
                      <span className="status-dot" style={{ background: type.color }} />
                      <span style={{ color: type.color, fontWeight: 600 }}>{type.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Daily View vs Weekly View Header */}
              <div className="view-switch-nav">
                <h2 className="section-title">
                  {attendanceView === 'daily' ? "Today's Daily Attendance Timeline" : 'Weekly Attendance Overview'}
                </h2>

                <div className="view-switch-btns">
                  <button
                    className={`view-switch-btn ${attendanceView === 'daily' ? 'active' : ''}`}
                    onClick={() => setAttendanceView('daily')}
                  >
                    <Clock size={16} /> Daily View
                  </button>
                  <button
                    className={`view-switch-btn ${attendanceView === 'weekly' ? 'active' : ''}`}
                    onClick={() => setAttendanceView('weekly')}
                  >
                    <CalendarRange size={16} /> Weekly View
                  </button>
                </div>
              </div>

              {/* DAILY ATTENDANCE VIEW */}
              {attendanceView === 'daily' && (
                <div className="profile-content-grid">
                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h3 className="profile-card-title"><Clock className="profile-card-title-icon" size={20} /> Shift Log Summary (Today)</h3>
                    </div>
                    <div className="profile-details-grid">
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">First Check-In</span>
                        <span className="profile-detail-value">{checkInTime}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Last Check-Out</span>
                        <span className="profile-detail-value">{checkOutTime}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Effective Work Hours</span>
                        <span className="profile-detail-value">{formatTimer(workSeconds)}</span>
                      </div>
                      <div className="profile-detail-field">
                        <span className="profile-detail-label">Assigned Status</span>
                        <span className="profile-detail-value">{renderStatusBadge(todayStatus)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-card">
                    <div className="profile-card-header">
                      <h3 className="profile-card-title"><ListFilter className="profile-card-title-icon" size={20} /> Daily Activity Log</h3>
                    </div>
                    <div className="activity-list">
                      {MOCK_DAILY_TIMELINE.map((item, i) => (
                        <div key={i} className="activity-item">
                          <div className="activity-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)' }}>
                            <Clock size={18} />
                          </div>
                          <div className="activity-body">
                            <div className="activity-title">{item.title}</div>
                            <div className="activity-desc">{item.desc}</div>
                          </div>
                          <div className="activity-time">{item.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* WEEKLY ATTENDANCE VIEW */}
              {attendanceView === 'weekly' && (
                <div className="weekly-grid">
                  {weeklyRecords.map((item) => (
                    <div key={item.id} className={`weekly-card ${item.isToday ? 'today' : ''}`}>
                      <div className="weekly-card-header">
                        <div>
                          <div className="weekly-day-name">{item.day} {item.isToday && <span style={{ fontSize: '0.7rem', color: 'var(--primary-400)', fontWeight: 700 }}>(Today)</span>}</div>
                          <div className="weekly-date-sub">{item.date}</div>
                        </div>
                        {renderStatusBadge(item.status)}
                      </div>

                      <div>
                        <div className="weekly-hours-val">{item.hours}</div>
                        <div className="weekly-times" style={{ marginTop: '0.4rem' }}>
                          <span>In: {item.checkIn}</span>
                          <span>Out: {item.checkOut}</span>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', fontStyle: 'italic', borderTop: '1px solid var(--surface-glass-border)', paddingTop: '0.5rem' }}>
                        {item.note}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LEAVE REQUESTS MANAGEMENT DASHBOARD */}
          {activeTab === 'leaves' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
              {/* Leave Balances Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div className="stat-card-icon" style={{ color: 'var(--success-400)', background: 'rgba(16, 185, 129, 0.15)' }}>
                      <Calendar size={22} />
                    </div>
                  </div>
                  <div className="stat-card-value">8 Days</div>
                  <div className="stat-card-label">Casual Leave Balance</div>
                  <div className="stat-card-sub">4 days used of 12 annual</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <div className="stat-card-icon" style={{ color: 'var(--warning-400)', background: 'rgba(245, 158, 11, 0.15)' }}>
                      <Clock size={22} />
                    </div>
                  </div>
                  <div className="stat-card-value">6 Days</div>
                  <div className="stat-card-label">Sick Leave Balance</div>
                  <div className="stat-card-sub">4 days used of 10 annual</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <div className="stat-card-icon" style={{ color: 'var(--primary-400)', background: 'rgba(99, 102, 241, 0.15)' }}>
                      <Sun size={22} />
                    </div>
                  </div>
                  <div className="stat-card-value">10 Days</div>
                  <div className="stat-card-label">Annual Vacation</div>
                  <div className="stat-card-sub">5 days used of 15 annual</div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="section-title">My Submitted Leave Applications</h2>
                <button className="btn-primary" onClick={() => setIsLeaveModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={18} /> Apply for New Leave
                </button>
              </div>

              {/* Leave Requests History Table */}
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Duration / Dates</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Applied On</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves.map((leave) => (
                      <tr key={leave.id} className="table-row">
                        <td style={{ fontWeight: 700, color: 'white' }}>{leave.type}</td>
                        <td className="table-date">{leave.fromDate || leave.from} to {leave.toDate || leave.to}</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{leave.days} day(s)</td>
                        <td style={{ color: 'var(--neutral-300)', fontSize: '0.88rem' }}>{leave.reason}</td>
                        <td className="table-time">{leave.appliedDate}</td>
                        <td>{getLeaveStatusChip(leave.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* APPLY FOR LEAVE MODAL */}
      {isLeaveModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLeaveModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FileText size={20} style={{ color: 'var(--primary-400)' }} /> Apply for New Leave
              </div>
              <button className="sidebar-close" onClick={() => setIsLeaveModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Leave Type</label>
                    <select
                      className="form-input"
                      value={newLeaveForm.type}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, type: e.target.value })}
                      style={{ background: 'var(--surface-card)', color: 'white' }}
                    >
                      <option value="Casual Leave">Casual Leave (8 days remaining)</option>
                      <option value="Sick Leave">Sick Leave (6 days remaining)</option>
                      <option value="Annual Vacation">Annual Vacation (10 days remaining)</option>
                      <option value="Unpaid Leave">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">From Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newLeaveForm.fromDate}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, fromDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">To Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newLeaveForm.toDate}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, toDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Reason for Leave</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      placeholder="Please enter a brief reason for your leave request..."
                      value={newLeaveForm.reason}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost-sm" onClick={() => setIsLeaveModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={16} /> Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Edit3 size={20} style={{ color: 'var(--primary-400)' }} /> Edit My Profile Details
              </div>
              <button className="sidebar-close" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                {/* Profile Photo File Upload */}
                <div className="form-group" style={{ gridColumn: '1 / -1', background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-glass-border)' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'white', fontWeight: 700 }}>
                    <ImageIcon size={18} style={{ color: 'var(--primary-400)' }} /> Select Profile Photo from Folders
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary-400)', background: 'var(--surface-card)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {editFormData.avatarUrl ? (
                        <img src={editFormData.avatarUrl} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={28} style={{ color: 'var(--neutral-400)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={handleImageFileUpload}
                        style={{ cursor: 'pointer', padding: '0.4rem' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', marginTop: '0.25rem', display: 'block' }}>
                        Supports JPG, PNG, WEBP from your local computer files.
                      </span>
                    </div>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-400)', borderBottom: '1px solid var(--surface-glass-border)', paddingBottom: '0.4rem', marginTop: '0.5rem' }}>
                  Editable Personal Contact Details
                </h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Emergency Contact Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.emergencyName}
                      onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Residential Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--neutral-400)', borderBottom: '1px solid var(--surface-glass-border)', paddingBottom: '0.4rem', marginTop: '1rem' }}>
                  Official Job & System Information (Read-Only)
                </h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.fullName}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={editFormData.email}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost-sm" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Save size={16} /> Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
