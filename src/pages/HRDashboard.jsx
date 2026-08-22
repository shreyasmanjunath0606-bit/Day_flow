import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Users, CalendarCheck, FileCheck, LogOut,
  Bell, Clock, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, Search, ChevronRight, BarChart3, UserCheck,
  Settings, Menu, X, ChevronDown, Check, ArrowUpDown, Edit3, Save, Shield, Eye, CalendarRange, Filter
} from 'lucide-react';
import './Dashboard.css';

const INITIAL_EMPLOYEES = [
  { id: 'EMP-001', name: 'Alex Morgan', role: 'Senior Frontend Developer', dept: 'Engineering', status: 'present', avatar: 'AM', checkIn: '09:02 AM', checkOut: '05:30 PM', hours: '8.5 hrs', email: 'alex.morgan@dayflow.io', phone: '+1 (555) 234-5678', address: '742 Evergreen Terrace, Springfield, OR', salary: '$145,000' },
  { id: 'EMP-002', name: 'Sarah Chen', role: 'Lead Product Designer', dept: 'Design', status: 'present', avatar: 'SC', checkIn: '08:55 AM', checkOut: '05:25 PM', hours: '8.5 hrs', email: 'sarah.chen@dayflow.io', phone: '+1 (555) 345-6789', address: '120 Market St, San Francisco, CA', salary: '$150,000' },
  { id: 'EMP-003', name: 'James Wilson', role: 'Backend Software Engineer', dept: 'Engineering', status: 'absent', avatar: 'JW', checkIn: '—', checkOut: '—', hours: '0.0 hrs', email: 'james.wilson@dayflow.io', phone: '+1 (555) 456-7890', address: '456 Oak Lane, Seattle, WA', salary: '$135,000' },
  { id: 'EMP-004', name: 'Maya Patel', role: 'HR Operations Manager', dept: 'Human Resources', status: 'present', avatar: 'MP', checkIn: '08:48 AM', checkOut: '05:15 PM', hours: '8.5 hrs', email: 'maya.patel@dayflow.io', phone: '+1 (555) 567-8901', address: '789 Pine Ave, Austin, TX', salary: '$130,000' },
  { id: 'EMP-005', name: 'David Kim', role: 'Senior Data Analyst', dept: 'Analytics', status: 'on-leave', avatar: 'DK', checkIn: '—', checkOut: '—', hours: '0.0 hrs', email: 'david.kim@dayflow.io', phone: '+1 (555) 678-9012', address: '321 Elm St, Chicago, IL', salary: '$125,000' },
  { id: 'EMP-006', name: 'Emma Thompson', role: 'QA Lead Engineer', dept: 'Engineering', status: 'half-day', avatar: 'ET', checkIn: '09:10 AM', checkOut: '01:10 PM', hours: '4.0 hrs', email: 'emma.t@dayflow.io', phone: '+1 (555) 789-0123', address: '654 Birch Rd, Denver, CO', salary: '$120,000' },
  { id: 'EMP-007', name: 'Ryan Garcia', role: 'DevOps & Cloud Engineer', dept: 'Engineering', status: 'present', avatar: 'RG', checkIn: '08:30 AM', checkOut: '05:00 PM', hours: '8.5 hrs', email: 'ryan.g@dayflow.io', phone: '+1 (555) 890-1234', address: '987 Cedar Way, Boston, MA', salary: '$140,000' },
  { id: 'EMP-008', name: 'Lisa Wang', role: 'Growth Marketing Lead', dept: 'Marketing', status: 'late', avatar: 'LW', checkIn: '10:15 AM', checkOut: '—', hours: '5.2 hrs', email: 'lisa.wang@dayflow.io', phone: '+1 (555) 901-2345', address: '147 Maple Dr, New York, NY', salary: '$128,000' },
];

const LEAVE_REQUESTS = [
  { id: 1, employee: 'Alex Morgan', avatar: 'AM', type: 'Casual Leave', from: 'Aug 25', to: 'Aug 26', days: 2, reason: 'Personal work', status: 'pending' },
  { id: 2, employee: 'David Kim', avatar: 'DK', type: 'Sick Leave', from: 'Aug 22', to: 'Aug 24', days: 3, reason: 'Medical appointment', status: 'pending' },
  { id: 3, employee: 'Emma Thompson', avatar: 'ET', type: 'Vacation', from: 'Sep 1', to: 'Sep 5', days: 5, reason: 'Family trip', status: 'pending' },
];

const HR_STATS = [
  { label: 'Total Employees', value: '50', sub: '+3 this month', icon: <Users size={22} />, color: 'var(--primary-400)' },
  { label: 'Present Today', value: '42', sub: '84% attendance', icon: <UserCheck size={22} />, color: 'var(--success-400)' },
  { label: 'Pending Leaves', value: '3', sub: 'needs approval', icon: <FileCheck size={22} />, color: 'var(--warning-400)' },
  { label: 'Late / Half-Day', value: '3', sub: 'today', icon: <Clock size={22} />, color: 'var(--warning-400)' },
];

export default function HRDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [leaveActions, setLeaveActions] = useState({});
  
  // Admin Edit Employee State
  const [editingEmp, setEditingEmp] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [successToast, setSuccessToast] = useState('');

  // Admin View Attendance Modal State
  const [viewingAttendanceEmp, setViewingAttendanceEmp] = useState(null);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAttendanceEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.dept.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (attendanceStatusFilter === 'all') return matchesSearch;
    return matchesSearch && emp.status === attendanceStatusFilter;
  });

  const handleLeaveAction = (id, action) => {
    setLeaveActions(prev => ({ ...prev, [id]: action }));
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setEditForm({ ...emp });
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    setEmployees(prev => prev.map(emp => emp.id === editForm.id ? editForm : emp));
    setEditingEmp(null);
    setSuccessToast(`Admin updated profile for ${editForm.name} (${editForm.id}) successfully!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

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
            <span className="sidebar-link-badge">3</span>
          </button>

          <div className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>Reports</div>
          <a href="#" className="sidebar-link" onClick={(e) => e.preventDefault()}>
            <div className="sidebar-link-icon"><BarChart3 size={20} /></div>
            <span>Analytics</span>
          </a>
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
          <div className="topbar-right">
            <button className="topbar-icon-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="topbar-badge">5</span>
            </button>
            <div className="topbar-avatar topbar-avatar-hr" title="Logged in as HR Admin">
              <span>HR</span>
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
                <h2 className="section-title">Employee Directory (Admin Control)</h2>
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
                            <div className="table-avatar">{emp.avatar}</div>
                            <div>
                              <div className="table-user-name">{emp.name}</div>
                              <div className="table-user-role">{emp.role}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="table-id">{emp.id}</span></td>
                        <td>{emp.dept}</td>
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

          {/* TAB 2: ALL EMPLOYEE ATTENDANCE VIEW (HR / ADMIN PERMISSION) */}
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

              {/* Status Types Legend Bar */}
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

              {filteredAttendanceEmployees.length === 0 && (
                <div className="empty-state">
                  <Search size={40} />
                  <h3>No matching attendance records</h3>
                  <p>Try selecting a different status filter</p>
                </div>
              )}
            </section>
          )}

          {/* TAB 3: LEAVE APPROVALS */}
          {activeTab === 'leaves' && (
            <section className="section" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <div className="section-header">
                <h2 className="section-title">Leave Approvals</h2>
                <span className="section-badge">{LEAVE_REQUESTS.filter(l => !leaveActions[l.id]).length} pending</span>
              </div>

              <div className="leave-cards">
                {LEAVE_REQUESTS.map((req, i) => {
                  const action = leaveActions[req.id];
                  return (
                    <div
                      key={req.id}
                      className={`leave-card ${action ? `leave-card-${action}` : ''}`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="leave-card-top">
                        <div className="leave-card-user">
                          <div className="leave-card-avatar">{req.avatar}</div>
                          <div>
                            <div className="leave-card-name">{req.employee}</div>
                            <div className="leave-card-type">{req.type}</div>
                          </div>
                        </div>
                        {action && (
                          <span className={`status-badge ${action === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                            {action === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </div>

                      <div className="leave-card-details">
                        <div className="leave-detail">
                          <span className="leave-detail-label">Duration</span>
                          <span className="leave-detail-value">{req.from} – {req.to} ({req.days} days)</span>
                        </div>
                        <div className="leave-detail">
                          <span className="leave-detail-label">Reason</span>
                          <span className="leave-detail-value">{req.reason}</span>
                        </div>
                      </div>

                      {!action && (
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
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

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
