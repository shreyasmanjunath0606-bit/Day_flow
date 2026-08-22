import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, User, CalendarCheck, FileText, LogOut,
  Bell, Clock, CheckCircle2, AlertCircle,
  TrendingUp, Calendar, ChevronRight, Sun, Moon, Menu, X
} from 'lucide-react';
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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
          <a href="#" className="sidebar-link sidebar-link-active">
            <div className="sidebar-link-icon"><Sun size={20} /></div>
            <span>Dashboard</span>
          </a>
          <a href="#" className="sidebar-link">
            <div className="sidebar-link-icon"><User size={20} /></div>
            <span>My Profile</span>
          </a>
          <a href="#" className="sidebar-link">
            <div className="sidebar-link-icon"><CalendarCheck size={20} /></div>
            <span>Attendance</span>
          </a>
          <a href="#" className="sidebar-link">
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

      {/* Overlay for mobile */}
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
              <h1 className="topbar-title">{getGreeting()}, <span className="gradient-text">Alex</span></h1>
              <p className="topbar-subtitle">Here's your daily overview</p>
            </div>
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="topbar-badge">3</span>
            </button>
            <div className="topbar-avatar">
              <span>AM</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
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
              <div className="quick-card quick-card-profile">
                <div className="quick-card-glow" />
                <div className="quick-card-icon">
                  <User size={28} />
                </div>
                <h3 className="quick-card-title">My Profile</h3>
                <p className="quick-card-desc">View and edit your personal information</p>
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
        </div>
      </main>
    </div>
  );
}
