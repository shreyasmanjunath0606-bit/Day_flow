import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Zap,
  User, BadgeCheck, ShieldCheck, CheckCircle2, XCircle
} from 'lucide-react';
import './Auth.css';

const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character (!@#$...)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function SignUp() {
  const [form, setForm] = useState({
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: email verification

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else {
      const failedRules = PASSWORD_RULES.filter(r => !r.test(form.password));
      if (failedRules.length > 0) e.password = 'Password does not meet all requirements';
    }
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
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
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1800);
  };

  const passwordStrength = form.password
    ? PASSWORD_RULES.filter(r => r.test(form.password)).length
    : 0;

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Excellent'][passwordStrength];
  const strengthColor = ['', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4'][passwordStrength];

  if (step === 2) {
    return (
      <div className="auth-page">
        <div className="auth-bg-orbs">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
        </div>
        <div className="auth-grid-overlay" />
        <div className="verification-container">
          <div className="verification-card">
            <div className="verification-icon">
              <Mail size={48} />
            </div>
            <h2 className="verification-title">Check your email</h2>
            <p className="verification-text">
              We've sent a verification link to <strong>{form.email}</strong>.
              Please check your inbox and click the link to verify your account.
            </p>
            <div className="verification-info">
              <p>Didn't receive the email?</p>
              <button className="btn-ghost" onClick={() => {}}>Resend verification email</button>
            </div>
            <Link to="/signin" className="btn-secondary btn-full" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orbs">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>
      <div className="auth-grid-overlay" />

      <div className="auth-container">
        {/* Left panel */}
        <div className="auth-branding">
          <div className="auth-branding-content">
            <div className="auth-logo">
              <div className="auth-logo-icon">
                <Zap size={32} />
              </div>
              <span className="auth-logo-text">DayFlow</span>
            </div>
            <h1 className="auth-branding-title">
              Join the future of <span className="gradient-text">HR management</span>
            </h1>
            <p className="auth-branding-subtitle">
              Create your account and start managing your workforce efficiently.
            </p>
            <div className="auth-branding-features">
              <div className="auth-feature">
                <div className="auth-feature-dot" />
                <span>Quick setup in minutes</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-dot" />
                <span>Secure & compliant</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-dot" />
                <span>Role-based access control</span>
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
            <div className="auth-mobile-logo">
              <div className="auth-logo-icon">
                <Zap size={24} />
              </div>
              <span className="auth-logo-text">DayFlow</span>
            </div>

            <div className="auth-form-header">
              <h2 className="auth-form-title">Create account</h2>
              <p className="auth-form-subtitle">Get started with DayFlow today</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Employee ID */}
              <div className={`form-group ${errors.employeeId ? 'form-group-error' : ''}`}>
                <label className="form-label" htmlFor="employeeId">Employee ID</label>
                <div className="form-input-wrapper">
                  <BadgeCheck size={18} className="form-input-icon" />
                  <input
                    id="employeeId"
                    type="text"
                    className="form-input"
                    placeholder="e.g. EMP-001"
                    value={form.employeeId}
                    onChange={(e) => updateField('employeeId', e.target.value)}
                  />
                </div>
                {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}
              </div>

              {/* Email */}
              <div className={`form-group ${errors.email ? 'form-group-error' : ''}`}>
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="form-input-wrapper">
                  <Mail size={18} className="form-input-icon" />
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              {/* Role */}
              <div className="form-group">
                <label className="form-label">Role</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-option ${form.role === 'employee' ? 'role-option-active' : ''}`}
                    onClick={() => updateField('role', 'employee')}
                  >
                    <User size={20} />
                    <span>Employee</span>
                  </button>
                  <button
                    type="button"
                    className={`role-option ${form.role === 'hr' ? 'role-option-active' : ''}`}
                    onClick={() => updateField('role', 'hr')}
                  >
                    <ShieldCheck size={20} />
                    <span>HR / Admin</span>
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className={`form-group ${errors.password ? 'form-group-error' : ''}`}>
                <label className="form-label" htmlFor="password">Password</label>
                <div className="form-input-wrapper">
                  <Lock size={18} className="form-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
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

                {/* Password strength */}
                {form.password && (
                  <div className="password-strength">
                    <div className="password-strength-bar">
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className="password-strength-segment"
                          style={{
                            background: i <= passwordStrength ? strengthColor : 'var(--neutral-700)',
                          }}
                        />
                      ))}
                    </div>
                    <span className="password-strength-label" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}

                {/* Password rules */}
                {form.password && (
                  <div className="password-rules">
                    {PASSWORD_RULES.map(rule => {
                      const passed = rule.test(form.password);
                      return (
                        <div key={rule.id} className={`password-rule ${passed ? 'password-rule-pass' : 'password-rule-fail'}`}>
                          {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          <span>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className={`form-group ${errors.confirmPassword ? 'form-group-error' : ''}`}>
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="form-input-wrapper">
                  <Lock size={18} className="form-input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                  />
                  <button
                    type="button"
                    className="form-input-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="btn-spinner" />
                ) : (
                  <>
                    Create Account
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
                Already have an account?{' '}
                <Link to="/signin" className="form-link-bold">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
