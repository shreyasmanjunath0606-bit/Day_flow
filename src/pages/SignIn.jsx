import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, User, ShieldCheck } from 'lucide-react';
import './Auth.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee'); // 'employee' | 'hr'
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    
    // Role-based navigation for Admin vs Employee
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'hr') {
        navigate('/dashboard/hr');
      } else {
        navigate('/dashboard/employee');
      }
    }, 1200);
  };

  return (
    <div className="auth-page">
      {/* Animated background elements */}
      <div className="auth-bg-orbs">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      {/* Grid pattern overlay */}
      <div className="auth-grid-overlay" />

      <div className="auth-container">
        {/* Left panel — branding */}
        <div className="auth-branding">
          <div className="auth-branding-content">
            <div className="auth-logo">
              <div className="auth-logo-icon">
                <Zap size={32} />
              </div>
              <span className="auth-logo-text">DayFlow</span>
            </div>
            <h1 className="auth-branding-title">
              Streamline your <span className="gradient-text">workforce</span> management
            </h1>
            <p className="auth-branding-subtitle">
              Track attendance, manage leaves, and empower your team — all in one beautiful platform.
            </p>
            <div className="auth-branding-features">
              <div className="auth-feature">
                <div className="auth-feature-dot" />
                <span>Real-time attendance tracking</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-dot" />
                <span>Seamless leave management</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-dot" />
                <span>HR & Admin analytics dashboard</span>
              </div>
            </div>
          </div>
          <div className="auth-branding-footer">
            <p>Trusted by 500+ companies worldwide</p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            {/* Mobile logo */}
            <div className="auth-mobile-logo">
              <div className="auth-logo-icon">
                <Zap size={24} />
              </div>
              <span className="auth-logo-text">DayFlow</span>
            </div>

            <div className="auth-form-header">
              <h2 className="auth-form-title">Welcome back</h2>
              <p className="auth-form-subtitle">Select your account role to sign in</p>
            </div>

            {/* Role Switcher */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Account Type</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-option ${role === 'employee' ? 'role-option-active' : ''}`}
                  onClick={() => setRole('employee')}
                >
                  <User size={18} />
                  <span>Employee</span>
                </button>
                <button
                  type="button"
                  className={`role-option ${role === 'hr' ? 'role-option-active' : ''}`}
                  onClick={() => setRole('hr')}
                >
                  <ShieldCheck size={18} />
                  <span>HR / Admin</span>
                </button>
              </div>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className={`form-group ${errors.email ? 'form-group-error' : ''}`}>
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="form-input-wrapper">
                  <Mail size={18} className="form-input-icon" />
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder={role === 'hr' ? 'admin@company.com' : 'you@company.com'}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: ''})); }}
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className={`form-group ${errors.password ? 'form-group-error' : ''}`}>
                <label className="form-label" htmlFor="password">Password</label>
                <div className="form-input-wrapper">
                  <Lock size={18} className="form-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: ''})); }}
                  />
                  <button
                    type="button"
                    className="form-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-options">
                <label className="form-checkbox-label">
                  <input type="checkbox" className="form-checkbox" />
                  <span className="form-checkbox-custom" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="form-link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="btn-spinner" />
                ) : (
                  <>
                    Sign In as {role === 'hr' ? 'HR / Admin' : 'Employee'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-alt-actions">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="form-link-bold">Create account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
