import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Users, CalendarCheck, FileCheck, LogOut,
  Bell, Clock, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, Search, ChevronRight, BarChart3, UserCheck,
  Settings, Menu, X, ChevronDown, Check, ArrowUpDown, Edit3, Save, Shield
} from 'lucide-react';
import './Dashboard.css';

const INITIAL_EMPLOYEES = [
  { id: 'EMP-001', name: 'Alex Morgan', role: 'Senior Frontend Developer', dept: 'Engineering', status: 'present', avatar: 'AM', checkIn: '9:02 AM', email: 'alex.morgan@dayflow.io', phone: '+1 (555) 234-5678', address: '742 Evergreen Terrace, Springfield, OR', salary: '$145,000' },
  { id: 'EMP-002', name: 'Sarah Chen', role: 'Lead Product Designer', dept: 'Design', status: 'present', avatar: 'SC', checkIn: '8:55 AM', email: 'sarah.chen@dayflow.io', phone: '+1 (555) 345-6789', address: '120 Market St, San Francisco, CA', salary: '$150,000' },
  { id: 'EMP-003', name: 'James Wilson', role: 'Backend Software Engineer', dept: 'Engineering', status: 'absent', avatar: 'JW', checkIn: '—', email: 'james.wilson@dayflow.io', phone: '+1 (555) 456-7890', address: '456 Oak Lane, Seattle, WA', salary: '$135,000' },
  { id: 'EMP-004', name: 'Maya Patel', role: 'HR Operations Manager', dept: 'Human Resources', status: 'present', avatar: 'MP', checkIn: '8:48 AM', email: 'maya.patel@dayflow.io', phone: '+1 (555) 567-8901', address: '789 Pine Ave, Austin, TX', salary: '$130,000' },
  { id: 'EMP-005', name: 'David Kim', role: 'Senior Data Analyst', dept: 'Analytics', status: 'on-leave', avatar: 'DK', checkIn: '—', email: 'david.kim@dayflow.io', phone: '+1 (555) 678-9012', address: '321 Elm St, Chicago, IL', salary: '$125,000' },
  { id: 'EMP-006', name: 'Emma Thompson', role: 'QA Lead Engineer', dept: 'Engineering', status: 'present', avatar: 'ET', checkIn: '9:10 AM', email: 'emma.t@dayflow.io', phone: '+1 (555) 789-0123', address: '654 Birch Rd, Denver, CO', salary: '$120,000' },
  { id: 'EMP-007', name: 'Ryan Garcia', role: 'DevOps & Cloud Engineer', dept: 'Engineering', status: 'present', avatar: 'RG', checkIn: '8:30 AM', email: 'ryan.g@dayflow.io', phone: '+1 (555) 890-1234', address: '987 Cedar Way, Boston, MA', salary: '$140,000' },
  { id: 'EMP-008', name: 'Lisa Wang', role: 'Growth Marketing Lead', dept: 'Marketing', status: 'late', avatar: 'LW', checkIn: '10:15 AM', email: 'lisa.wang@dayflow.io', phone: '+1 (555) 901-2345', address: '147 Maple Dr, New York, NY', salary: '$128,000' },
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
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [leaveActions, setLeaveActions] = useState({});
  
  // Admin Edit Employee State
  const [editingEmp, setEditingEmp] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [successToast, setSuccessToast] = useState('');

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <p className="topbar-subtitle">Full administrative control over employee profiles & workforce</p>
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

          {/* Tab Content */}
          {activeTab === 'employees' && (
            <section className="section" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <div className="section-header">
                <h2 className="section-title">Employee Directory (Admin Edit Enabled)</h2>
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
                              <Edit3 size={14} /> Edit All Details
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

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Residential Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-400)', borderBottom: '1px solid var(--surface-glass-border)', paddingBottom: '0.4rem', marginTop: '0.5rem' }}>
                  Job Role & Department
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Job Designation / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.dept}
                      onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Attendance Status</label>
                    <select
                      className="form-input"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      style={{ color: 'white', background: 'var(--surface-card)' }}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="on-leave">On Leave</option>
                      <option value="late">Late</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Salary Package / CTC</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.salary}
                      onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
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
