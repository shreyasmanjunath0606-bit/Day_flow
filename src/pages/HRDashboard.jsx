import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Users, CalendarCheck, FileCheck, LogOut,
  Bell, Clock, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, Search, ChevronRight, BarChart3, UserCheck,
  Settings, Menu, X, ChevronDown, Check, ArrowUpDown
} from 'lucide-react';
import './Dashboard.css';

const EMPLOYEES = [
  { id: 'EMP-001', name: 'Alex Morgan', role: 'Frontend Developer', dept: 'Engineering', status: 'present', avatar: 'AM', checkIn: '9:02 AM' },
  { id: 'EMP-002', name: 'Sarah Chen', role: 'Product Designer', dept: 'Design', status: 'present', avatar: 'SC', checkIn: '8:55 AM' },
  { id: 'EMP-003', name: 'James Wilson', role: 'Backend Developer', dept: 'Engineering', status: 'absent', avatar: 'JW', checkIn: '—' },
  { id: 'EMP-004', name: 'Maya Patel', role: 'HR Manager', dept: 'Human Resources', status: 'present', avatar: 'MP', checkIn: '8:48 AM' },
  { id: 'EMP-005', name: 'David Kim', role: 'Data Analyst', dept: 'Analytics', status: 'on-leave', avatar: 'DK', checkIn: '—' },
  { id: 'EMP-006', name: 'Emma Thompson', role: 'QA Engineer', dept: 'Engineering', status: 'present', avatar: 'ET', checkIn: '9:10 AM' },
  { id: 'EMP-007', name: 'Ryan Garcia', role: 'DevOps Engineer', dept: 'Engineering', status: 'present', avatar: 'RG', checkIn: '8:30 AM' },
  { id: 'EMP-008', name: 'Lisa Wang', role: 'Marketing Lead', dept: 'Marketing', status: 'late', avatar: 'LW', checkIn: '10:15 AM' },
];

const LEAVE_REQUESTS = [
  { id: 1, employee: 'Alex Morgan', avatar: 'AM', type: 'Casual Leave', from: 'Aug 25', to: 'Aug 26', days: 2, reason: 'Personal work', status: 'pending' },
  { id: 2, employee: 'David Kim', avatar: 'DK', type: 'Sick Leave', from: 'Aug 22', to: 'Aug 24', days: 3, reason: 'Medical appointment', status: 'pending' },
  { id: 3, employee: 'Emma Thompson', avatar: 'ET', type: 'Vacation', from: 'Sep 1', to: 'Sep 5', days: 5, reason: 'Family trip', status: 'pending' },
];

const ATTENDANCE_RECORDS = [
  { date: 'Aug 22, 2026', present: 42, absent: 3, onLeave: 4, late: 1, total: 50 },
  { date: 'Aug 21, 2026', present: 45, absent: 2, onLeave: 2, late: 1, total: 50 },
  { date: 'Aug 20, 2026', present: 44, absent: 1, onLeave: 3, late: 2, total: 50 },
  { date: 'Aug 19, 2026', present: 43, absent: 4, onLeave: 2, late: 1, total: 50 },
];

const HR_STATS = [
  { label: 'Total Employees', value: '50', sub: '+3 this month', icon: <Users size={22} />, color: 'var(--primary-400)' },
  { label: 'Present Today', value: '42', sub: '84% attendance', icon: <UserCheck size={22} />, color: 'var(--success-400)' },
  { label: 'Pending Leaves', value: '3', sub: 'needs approval', icon: <FileCheck size={22} />, color: 'var(--warning-400)' },
  { label: 'Late Arrivals', value: '1', sub: 'today', icon: <Clock size={22} />, color: 'var(--danger-400)' },
];

export default function HRDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveActions, setLeaveActions] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const filteredEmployees = EMPLOYEES.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLeaveAction = (id, action) => {
    setLeaveActions(prev => ({ ...prev, [id]: action }));
  };

  const getStatusBadge = (status) => {
    const map = {
      present: { label: 'Present', class: 'badge-success' },
      absent: { label: 'Absent', class: 'badge-danger' },
      'on-leave': { label: 'On Leave', class: 'badge-warning' },
      late: { label: 'Late', class: 'badge-accent' },
    };
    const s = map[status] || { label: status, class: 'badge-neutral' };
    return <span className={`status-badge ${s.class}`}>{s.label}</span>;
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
          <Settings size={14} />
          <span>HR Admin</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Overview</div>
          <button
            className={`sidebar-link ${activeTab === 'employees' ? 'sidebar-link-active' : ''}`}
            onClick={() => { setActiveTab('employees'); setSidebarOpen(false); }}
          >
            <div className="sidebar-link-icon"><Users size={20} /></div>
            <span>Employee List</span>
          </button>
          <button
            className={`sidebar-link ${activeTab === 'attendance' ? 'sidebar-link-active' : ''}`}
            onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }}
          >
            <div className="sidebar-link-icon"><CalendarCheck size={20} /></div>
            <span>Attendance</span>
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
          <a href="#" className="sidebar-link">
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
              <h1 className="topbar-title">HR <span className="gradient-text">Dashboard</span></h1>
              <p className="topbar-subtitle">Manage your workforce efficiently</p>
            </div>
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="topbar-badge">5</span>
            </button>
            <div className="topbar-avatar topbar-avatar-hr">
              <span>HR</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
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

          {/* Tab Content */}
          {activeTab === 'employees' && (
            <section className="section" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <div className="section-header">
                <h2 className="section-title">Employee Directory</h2>
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
                      <th>Check-In</th>
                      <th>Action</th>
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
                        <td className="table-time">{emp.checkIn}</td>
                        <td>
                          <button
                            className="btn-table-action"
                            onClick={() => setSelectedEmployee(selectedEmployee === emp.id ? null : emp.id)}
                          >
                            View <ChevronRight size={14} />
                          </button>
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

          {activeTab === 'attendance' && (
            <section className="section" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <div className="section-header">
                <h2 className="section-title">Attendance Records</h2>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>On Leave</th>
                      <th>Late</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ATTENDANCE_RECORDS.map((rec, i) => (
                      <tr key={i} className="table-row" style={{ animationDelay: `${i * 0.05}s` }}>
                        <td className="table-date">{rec.date}</td>
                        <td>
                          <span className="table-count table-count-success">{rec.present}</span>
                        </td>
                        <td>
                          <span className="table-count table-count-danger">{rec.absent}</span>
                        </td>
                        <td>
                          <span className="table-count table-count-warning">{rec.onLeave}</span>
                        </td>
                        <td>
                          <span className="table-count table-count-accent">{rec.late}</span>
                        </td>
                        <td>
                          <div className="attendance-rate">
                            <div className="attendance-rate-bar">
                              <div
                                className="attendance-rate-fill"
                                style={{ width: `${(rec.present / rec.total) * 100}%` }}
                              />
                            </div>
                            <span className="attendance-rate-label">
                              {Math.round((rec.present / rec.total) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Attendance summary cards */}
              <div className="attendance-summary-grid">
                <div className="attendance-summary-card">
                  <div className="asc-header">
                    <span className="asc-dot" style={{ background: 'var(--success-400)' }} />
                    <span className="asc-label">Average Attendance</span>
                  </div>
                  <div className="asc-value">86.5%</div>
                  <div className="asc-sub">Past 30 days</div>
                </div>
                <div className="attendance-summary-card">
                  <div className="asc-header">
                    <span className="asc-dot" style={{ background: 'var(--warning-400)' }} />
                    <span className="asc-label">Late Arrivals</span>
                  </div>
                  <div className="asc-value">5</div>
                  <div className="asc-sub">This week</div>
                </div>
                <div className="attendance-summary-card">
                  <div className="asc-header">
                    <span className="asc-dot" style={{ background: 'var(--primary-400)' }} />
                    <span className="asc-label">Total On Leave</span>
                  </div>
                  <div className="asc-value">11</div>
                  <div className="asc-sub">This month</div>
                </div>
              </div>
            </section>
          )}

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
    </div>
  );
}
