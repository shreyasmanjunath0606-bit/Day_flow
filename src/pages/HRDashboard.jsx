import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Users, CalendarCheck, FileCheck, LogOut,
  Bell, Clock, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, Search, ChevronRight, BarChart3, UserCheck,
  Settings, Menu, X, ChevronDown, Check, ArrowUpDown, Edit3, Save, Shield, Eye, CalendarRange, Filter, User, Mail, Phone, MapPin, DollarSign, PieChart, Image as ImageIcon, Camera
} from 'lucide-react';
import { getStoredEmployees, getStoredLeaves, updateLeaveStatus, updateStoredEmployeeProfile } from '../services/storeService';
import './Dashboard.css';

const HR_NOTIFICATIONS = [
  { id: 1, title: 'Pending Leave Applications', desc: 'New leave requests require HR review & approval', time: '5 mins ago', unread: true, icon: <FileCheck size={16} />, color: 'var(--warning-400)' },
  { id: 2, title: 'Employee Profile Updated', desc: 'Alex Morgan updated contact details & profile photo', time: '1 hour ago', unread: true, icon: <UserCheck size={16} />, color: 'var(--success-400)' },
  { id: 3, title: 'Weekly Attendance Report', desc: 'Company attendance rate is at 92.4% this week', time: '1 day ago', unread: false, icon: <TrendingUp size={16} />, color: 'var(--primary-400)' },
  { id: 4, title: 'System Backup Complete', desc: 'MySQL database backup saved to cloud storage', time: '2 days ago', unread: false, icon: <CheckCircle2 size={16} />, color: 'var(--accent-400)' },
];

export default function HRDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'attendance' | 'leaves' | 'analytics'
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
  
  // Real-time Synced States from Central Store
  const [employees, setEmployees] = useState(() => getStoredEmployees());
  const [leaveRequests, setLeaveRequests] = useState(() => getStoredLeaves());
  
  // Notification Dropdown State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(HR_NOTIFICATIONS);

  // HR Profile Modal State
  const [isHrProfileOpen, setIsHrProfileOpen] = useState(false);
  const [hrProfileData, setHrProfileData] = useState({
    id: 'ADM-001',
    name: 'Maya Patel',
    title: 'Head of HR Operations & People Culture',
    email: 'hr.admin@dayflow.io',
    phone: '+1 (555) 987-6543',
    dept: 'Human Resources & People Ops',
    address: '789 Executive Blvd, Austin, TX 78701',
    accessLevel: 'Super Admin (Full Access)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  });

  // Admin Edit Employee State
  const [editingEmp, setEditingEmp] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [successToast, setSuccessToast] = useState('');

  // Admin View Attendance Modal State
  const [viewingAttendanceEmp, setViewingAttendanceEmp] = useState(null);

  // Listen for Real-Time Synchronization Events across Dashboards
  useEffect(() => {
    const handleStoreChange = () => {
      setEmployees(getStoredEmployees());
      setLeaveRequests(getStoredLeaves());
    };
    window.addEventListener('dayflow_store_update', handleStoreChange);
    return () => window.removeEventListener('dayflow_store_update', handleStoreChange);
  }, []);

  const pendingCount = leaveRequests.filter(l => l.status === 'pending').length;

  const HR_STATS = [
    { label: 'Total Employees', value: String(employees.length + 42), sub: '+3 this month', icon: <Users size={22} />, color: 'var(--primary-400)' },
    { label: 'Present Today', value: '42', sub: '84% attendance', icon: <UserCheck size={22} />, color: 'var(--success-400)' },
    { label: 'Pending Leaves', value: String(pendingCount), sub: 'needs approval', icon: <FileCheck size={22} />, color: 'var(--warning-400)' },
    { label: 'Late / Half-Day', value: '3', sub: 'today', icon: <Clock size={22} />, color: 'var(--warning-400)' },
  ];

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.role && emp.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredAttendanceEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.dept.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (attendanceStatusFilter === 'all') return matchesSearch;
    return matchesSearch && emp.status === attendanceStatusFilter;
  });

  const handleLeaveAction = (id, action) => {
    updateLeaveStatus(id, action);
    setSuccessToast(`Leave request ${action === 'approved' ? 'APPROVED' : 'REJECTED'} successfully! Emitted to Employee Dashboard.`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setEditForm({ ...emp });
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    updateStoredEmployeeProfile(editForm.id, {
      phone: editForm.phone,
      address: editForm.address,
      avatarUrl: editForm.avatarUrl,
      fullName: editForm.name,
    });
    setEditingEmp(null);
    setSuccessToast(`Admin updated profile for ${editForm.name} (${editForm.id}) successfully!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleHrAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHrProfileData(prev => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getStatusBadge = (status) => {
    const map = {
      present: { label: 'Present', class: 'badge-success', color: 'var(--success-400)', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
      'half-day': { label: 'Half-day', class: 'badge-warning', color: 'var(--warning-400)', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
      absent: { label: 'Absent', class: 'badge-danger', color: 'var(--danger-400)', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
      'on-leave': { label: 'Leave', class: 'badge-primary', color: 'var(--primary-400)', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)' },
      late: { label: 'Late Arrival', class: 'badge-accent', color: 'var(--accent-400)', bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.3)' },
    };
    const s = map[status] || { label: status, class: 'badge-neutral', color: 'var(--neutral-400)', bg: 'var(--surface-glass)', border: 'var(--surface-glass-border)' };
    return (
      <span className="weekly-status-chip" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
        <span className="status-dot" style={{ background: s.color }} />
        {s.label}
      </span>
    );
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

        <div className="sidebar-role-badge">
          <Shield size={14} />
          <span>HR Admin Mode</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Overview</div>
          <button
            className={`sidebar-link ${activeTab === 'employees' ? 'sidebar-link-active' : ''}`}
            onClick={() => { setActiveTab('employees'); setSidebarOpen(false); }}
          >
            <div className="sidebar-link-icon"><Users size={20} /></div>
            <span>Employee Directory</span>
          </button>
          <button
            className={`sidebar-link ${activeTab === 'attendance' ? 'sidebar-link-active' : ''}`}
            onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }}
          >
            <div className="sidebar-link-icon"><CalendarCheck size={20} /></div>
            <span>All Employee Attendance</span>
          </button>
          <button
            className={`sidebar-link ${activeTab === 'leaves' ? 'sidebar-link-active' : ''}`}
            onClick={() => { setActiveTab('leaves'); setSidebarOpen(false); }}
          >
            <div className="sidebar-link-icon"><FileCheck size={20} /></div>
            <span>Leave Approvals</span>
            {pendingCount > 0 && <span className="sidebar-link-badge">{pendingCount}</span>}
          </button>

          <div className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>Reports</div>
          <button
            className={`sidebar-link ${activeTab === 'analytics' ? 'sidebar-link-active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
          >
            <div className="sidebar-link-icon"><BarChart3 size={20} /></div>
            <span>Analytics</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <Link to="/signin" className="sidebar-link sidebar-link-danger">
            <div className="sidebar-link-icon"><LogOut size={20} /></div>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="topbar-greeting">
              <h1 className="topbar-title">HR <span className="gradient-text">Admin Dashboard</span></h1>
              <p className="topbar-subtitle">Full administrative control over all employees & workforce attendance</p>
            </div>
          </div>
          <div className="topbar-right" style={{ position: 'relative' }}>
            {/* Notification Bell Icon */}
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
                    <Bell size={18} style={{ color: 'var(--primary-400)' }} /> HR Alerts & Notifications
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
                    Close HR Alerts
                  </button>
                </div>
              </div>
            )}

            {/* HR Profile Avatar Button */}
            <div
              className="topbar-avatar topbar-avatar-hr"
              onClick={() => setIsHrProfileOpen(true)}
              title="Click to view HR Admin Profile"
              style={{ cursor: 'pointer' }}
            >
              {hrProfileData.avatarUrl ? (
                <img src={hrProfileData.avatarUrl} alt="HR Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span>HR</span>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {successToast && (
            <div className="status-badge status-approved" style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              <Check size={18} /> {successToast}
            </div>
          )}

          {/* Stats */}
          <section className="stats-grid">
            {HR_STATS.map((stat, i) => (
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

          {/* TAB 1: EMPLOYEE DIRECTORY */}
          {activeTab === 'employees' && (
            <section className="section" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <div className="section-header">
                <h2 className="section-title">Employee Directory (Admin Control & Real-Time Sync)</h2>
                <div className="section-actions">
                  <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search by name, ID, or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>ID</th>
                      <th>Department</th>
                      <th>Phone & Contact</th>
                      <th>Status</th>
                      <th>Salary / CTC</th>
                      <th>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp, i) => (
                      <tr key={emp.id} className="table-row" style={{ animationDelay: `${i * 0.05}s` }}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                              {emp.avatarUrl ? (
                                <img src={emp.avatarUrl} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                emp.avatar
                              )}
                            </div>
                            <div>
                              <div className="table-user-name">{emp.name}</div>
                              <div className="table-user-role">{emp.role}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="table-id">{emp.id}</span></td>
                        <td>{emp.dept}</td>
                        <td className="table-time" style={{ fontSize: '0.85rem' }}>{emp.phone || 'N/A'}</td>
                        <td>{getStatusBadge(emp.status)}</td>
                        <td className="table-time" style={{ fontWeight: 600, color: 'var(--success-400)' }}>{emp.salary}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              className="btn-primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => handleOpenEdit(emp)}
                            >
                              <Edit3 size={14} /> Edit Details
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => setViewingAttendanceEmp(emp)}
                            >
                              <Eye size={14} /> View Attendance
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredEmployees.length === 0 && (
                <div className="empty-state">
                  <Search size={40} />
                  <h3>No employees found</h3>
                  <p>Try adjusting your search query</p>
                </div>
              )}
            </section>
          )}

          {/* TAB 2: ALL EMPLOYEE ATTENDANCE VIEW */}
          {activeTab === 'attendance' && (
            <section className="section" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <div className="section-header">
                <h2 className="section-title">Master Attendance View (All Employees)</h2>
                <div className="section-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search employee name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-input"
                    value={attendanceStatusFilter}
                    onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                    style={{ background: 'var(--surface-card)', color: 'white', border: '1px solid var(--surface-glass-border)', padding: '0.5rem 0.85rem' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="half-day">Half-day</option>
                    <option value="absent">Absent</option>
                    <option value="on-leave">Leave</option>
                    <option value="late">Late Arrival</option>
                  </select>
                </div>
              </div>

              <div className="status-legend-bar" style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontWeight: 700, color: 'white', marginRight: '0.5rem' }}>Status Filter Types:</span>
                <span
                  className="weekly-status-chip"
                  onClick={() => setAttendanceStatusFilter('present')}
                  style={{ color: 'var(--success-400)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'pointer' }}
                >
                  🟢 Present
                </span>
                <span
                  className="weekly-status-chip"
                  onClick={() => setAttendanceStatusFilter('half-day')}
                  style={{ color: 'var(--warning-400)', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', cursor: 'pointer' }}
                >
                  🟡 Half-day
                </span>
                <span
                  className="weekly-status-chip"
                  onClick={() => setAttendanceStatusFilter('absent')}
                  style={{ color: 'var(--danger-400)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer' }}
                >
                  🔴 Absent
                </span>
                <span
                  className="weekly-status-chip"
                  onClick={() => setAttendanceStatusFilter('on-leave')}
                  style={{ color: 'var(--primary-400)', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', cursor: 'pointer' }}
                >
                  🔵 Leave
                </span>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>ID</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Hours Logged</th>
                      <th>Attendance Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendanceEmployees.map((emp, i) => (
                      <tr key={emp.id} className="table-row" style={{ animationDelay: `${i * 0.05}s` }}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">{emp.avatar}</div>
                            <div>
                              <div className="table-user-name">{emp.name}</div>
                              <div className="table-user-role">{emp.role}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="table-id">{emp.id}</span></td>
                        <td className="table-time">{emp.checkIn}</td>
                        <td className="table-time">{emp.checkOut}</td>
                        <td style={{ fontWeight: 700, color: 'white' }}>{emp.hours}</td>
                        <td>{getStatusBadge(emp.status)}</td>
                        <td>
                          <button
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            onClick={() => setViewingAttendanceEmp(emp)}
                          >
                            <CalendarRange size={14} /> Full Log
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 3: LEAVE APPROVALS */}
          {activeTab === 'leaves' && (
            <section className="section" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <div className="section-header">
                <h2 className="section-title">Leave Approvals (Synced with Employee Dashboard)</h2>
                <span className="section-badge">{pendingCount} pending</span>
              </div>

              <div className="leave-cards">
                {leaveRequests.map((req, i) => (
                  <div
                    key={req.id}
                    className={`leave-card ${req.status !== 'pending' ? `leave-card-${req.status}` : ''}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="leave-card-top">
                      <div className="leave-card-user">
                        <div className="leave-card-avatar">{req.avatar || 'EM'}</div>
                        <div>
                          <div className="leave-card-name">{req.employee}</div>
                          <div className="leave-card-type">{req.type}</div>
                        </div>
                      </div>
                      {req.status !== 'pending' && (
                        <span className={`status-badge ${req.status === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                          {req.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </div>

                    <div className="leave-card-details">
                      <div className="leave-detail">
                        <span className="leave-detail-label">Duration</span>
                        <span className="leave-detail-value">{req.from || req.fromDate} – {req.to || req.toDate} ({req.days} days)</span>
                      </div>
                      <div className="leave-detail">
                        <span className="leave-detail-label">Reason</span>
                        <span className="leave-detail-value">{req.reason}</span>
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="leave-card-actions">
                        <button
                          className="leave-btn leave-btn-approve"
                          onClick={() => handleLeaveAction(req.id, 'approved')}
                        >
                          <Check size={16} />
                          Approve
                        </button>
                        <button
                          className="leave-btn leave-btn-reject"
                          onClick={() => handleLeaveAction(req.id, 'rejected')}
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 4: ANALYTICS & INSIGHTS DASHBOARD */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeInUp 0.4s ease-out' }}>
              <div className="section-header">
                <h2 className="section-title">Workforce Analytics & Insights</h2>
              </div>

              {/* Analytics Summary Row */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-label">Monthly Punctuality</div>
                  <div className="stat-card-value" style={{ color: 'var(--success-400)' }}>92.4%</div>
                  <div className="stat-card-sub">On-time check-in rate</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-label">Avg Daily Work Hours</div>
                  <div className="stat-card-value" style={{ color: 'var(--primary-400)' }}>8.4 hrs</div>
                  <div className="stat-card-sub">Across active staff</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-label">Monthly Payroll Spent</div>
                  <div className="stat-card-value" style={{ color: 'var(--accent-400)' }}>$578,000</div>
                  <div className="stat-card-sub">Gross monthly salary budget</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-label">Leave Utilization</div>
                  <div className="stat-card-value" style={{ color: 'var(--warning-400)' }}>135 Days</div>
                  <div className="stat-card-sub">Total leaves taken YTD</div>
                </div>
              </div>

              <div className="profile-content-grid">
                {/* Department Distribution Chart Card */}
                <div className="profile-card">
                  <div className="profile-card-header">
                    <h3 className="profile-card-title"><PieChart className="profile-card-title-icon" size={20} /> Department Headcount Breakdown</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>
                        <span>Engineering & Product (20 staff)</span>
                        <span>40%</span>
                      </div>
                      <div className="analytics-bar-bg">
                        <div className="analytics-bar-fill" style={{ width: '40%', background: 'var(--primary-400)' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>
                        <span>Design & User Experience (10 staff)</span>
                        <span>20%</span>
                      </div>
                      <div className="analytics-bar-bg">
                        <div className="analytics-bar-fill" style={{ width: '20%', background: 'var(--accent-400)' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>
                        <span>Marketing & Growth (8 staff)</span>
                        <span>16%</span>
                      </div>
                      <div className="analytics-bar-bg">
                        <div className="analytics-bar-fill" style={{ width: '16%', background: 'var(--warning-400)' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>
                        <span>Human Resources & Ops (7 staff)</span>
                        <span>14%</span>
                      </div>
                      <div className="analytics-bar-bg">
                        <div className="analytics-bar-fill" style={{ width: '14%', background: 'var(--success-400)' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>
                        <span>Data & Analytics (5 staff)</span>
                        <span>10%</span>
                      </div>
                      <div className="analytics-bar-bg">
                        <div className="analytics-bar-fill" style={{ width: '10%', background: 'var(--secondary-400)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Leave Utilization Chart */}
                <div className="profile-card">
                  <div className="profile-card-header">
                    <h3 className="profile-card-title"><BarChart3 className="profile-card-title-icon" size={20} /> Leave Category Usage</h3>
                  </div>
                  <div className="salary-breakdown-list">
                    <div className="salary-row salary-row-allowance">
                      <span>Annual Vacation Leaves</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>68 Days (50.3%)</span>
                    </div>
                    <div className="salary-row salary-row-allowance">
                      <span>Casual & Personal Leaves</span>
                      <span style={{ fontWeight: 700, color: 'var(--success-400)' }}>45 Days (33.3%)</span>
                    </div>
                    <div className="salary-row salary-row-allowance">
                      <span>Sick & Medical Leaves</span>
                      <span style={{ fontWeight: 700, color: 'var(--warning-400)' }}>22 Days (16.4%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* HR ADMIN PROFILE MODAL */}
      {isHrProfileOpen && (
        <div className="modal-overlay" onClick={() => setIsHrProfileOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Shield size={20} style={{ color: 'var(--accent-400)' }} /> HR Administrator Profile
              </div>
              <button className="sidebar-close" onClick={() => setIsHrProfileOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-glass-border)' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'white', fontWeight: 700 }}>
                  <ImageIcon size={18} style={{ color: 'var(--primary-400)' }} /> HR Admin Photo (Upload from Computer)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent-400)', background: 'var(--surface-card)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {hrProfileData.avatarUrl ? (
                      <img src={hrProfileData.avatarUrl} alt="HR Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={28} style={{ color: 'var(--neutral-400)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                      onChange={handleHrAvatarUpload}
                      style={{ cursor: 'pointer', padding: '0.4rem' }}
                    />
                  </div>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="profile-detail-field">
                  <span className="profile-detail-label">Admin Name</span>
                  <span className="profile-detail-value">{hrProfileData.name}</span>
                </div>
                <div className="profile-detail-field">
                  <span className="profile-detail-label">Admin ID</span>
                  <span className="profile-detail-value">{hrProfileData.id}</span>
                </div>
                <div className="profile-detail-field">
                  <span className="profile-detail-label">Official Designation</span>
                  <span className="profile-detail-value">{hrProfileData.title}</span>
                </div>
                <div className="profile-detail-field">
                  <span className="profile-detail-label">Department</span>
                  <span className="profile-detail-value">{hrProfileData.dept}</span>
                </div>
                <div className="profile-detail-field">
                  <span className="profile-detail-label">Email Address</span>
                  <span className="profile-detail-value">{hrProfileData.email}</span>
                </div>
                <div className="profile-detail-field">
                  <span className="profile-detail-label">Phone</span>
                  <span className="profile-detail-value">{hrProfileData.phone}</span>
                </div>
              </div>

              <div className="profile-detail-field" style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                <span className="profile-detail-label" style={{ color: 'var(--accent-300)' }}>System Access Rights</span>
                <span className="profile-detail-value" style={{ color: 'white', fontWeight: 700 }}>
                  🛡️ {hrProfileData.accessLevel}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setIsHrProfileOpen(false)}>
                Close HR Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN VIEW EMPLOYEE ATTENDANCE MODAL */}
      {viewingAttendanceEmp && (
        <div className="modal-overlay" onClick={() => setViewingAttendanceEmp(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <CalendarCheck size={20} style={{ color: 'var(--primary-400)' }} /> Attendance Log for {viewingAttendanceEmp.name} ({viewingAttendanceEmp.id})
              </div>
              <button className="sidebar-close" onClick={() => setViewingAttendanceEmp(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: '1.25rem' }}>
              <div className="salary-overview-card" style={{ padding: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{viewingAttendanceEmp.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--neutral-400)' }}>{viewingAttendanceEmp.role} • {viewingAttendanceEmp.dept}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', textTransform: 'uppercase' }}>Today's Status</div>
                  <div>{getStatusBadge(viewingAttendanceEmp.status)}</div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginTop: '0.5rem' }}>
                Weekly Shift Log (Mon – Sun)
              </h4>
              
              <div className="weekly-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                <div className="weekly-card">
                  <div className="weekly-card-header">
                    <span className="weekly-day-name">Monday</span>
                    {getStatusBadge('present')}
                  </div>
                  <div className="weekly-hours-val">8.5 hrs</div>
                  <div className="weekly-times">
                    <span>In: 09:00 AM</span>
                    <span>Out: 05:30 PM</span>
                  </div>
                </div>

                <div className="weekly-card">
                  <div className="weekly-card-header">
                    <span className="weekly-day-name">Tuesday</span>
                    {getStatusBadge('present')}
                  </div>
                  <div className="weekly-hours-val">8.5 hrs</div>
                  <div className="weekly-times">
                    <span>In: 09:05 AM</span>
                    <span>Out: 05:35 PM</span>
                  </div>
                </div>

                <div className="weekly-card">
                  <div className="weekly-card-header">
                    <span className="weekly-day-name">Wednesday</span>
                    {getStatusBadge('half-day')}
                  </div>
                  <div className="weekly-hours-val">4.0 hrs</div>
                  <div className="weekly-times">
                    <span>In: 09:00 AM</span>
                    <span>Out: 01:00 PM</span>
                  </div>
                </div>

                <div className="weekly-card">
                  <div className="weekly-card-header">
                    <span className="weekly-day-name">Thursday</span>
                    {getStatusBadge('present')}
                  </div>
                  <div className="weekly-hours-val">8.5 hrs</div>
                  <div className="weekly-times">
                    <span>In: 08:55 AM</span>
                    <span>Out: 05:30 PM</span>
                  </div>
                </div>

                <div className="weekly-card">
                  <div className="weekly-card-header">
                    <span className="weekly-day-name">Friday</span>
                    {getStatusBadge(viewingAttendanceEmp.status)}
                  </div>
                  <div className="weekly-hours-val">{viewingAttendanceEmp.hours}</div>
                  <div className="weekly-times">
                    <span>In: {viewingAttendanceEmp.checkIn}</span>
                    <span>Out: {viewingAttendanceEmp.checkOut}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setViewingAttendanceEmp(null)}>
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN EDIT ALL EMPLOYEE DETAILS MODAL */}
      {editingEmp && (
        <div className="modal-overlay" onClick={() => setEditingEmp(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Shield size={20} style={{ color: 'var(--accent-400)' }} /> Admin Edit Employee Profile ({editForm.id})
              </div>
              <button className="sidebar-close" onClick={() => setEditingEmp(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="role-switcher-banner" style={{ background: 'rgba(236, 72, 153, 0.1)', borderColor: 'rgba(236, 72, 153, 0.2)' }}>
              <div className="role-switcher-title" style={{ color: 'var(--accent-300)' }}>
                👑 <strong>Admin Mode Active</strong>: You have full permission to edit all personal, job, role, and salary details for this employee.
              </div>
            </div>

            <form onSubmit={handleSaveEmployee} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-400)', borderBottom: '1px solid var(--surface-glass-border)', paddingBottom: '0.4rem' }}>
                  Personal Information
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.id}
                      onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost-sm" onClick={() => setEditingEmp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Save size={16} /> Save Admin Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
