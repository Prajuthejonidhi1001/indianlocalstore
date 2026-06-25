import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Eye, EyeOff, ArrowRight, KeyRound, ChevronLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import './AuthPages.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://indianlocalstore-api-cjiq.onrender.com/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = enter username, 2 = enter token + new password
  const [fpIdentifier, setFpIdentifier] = useState('');
  const [fpToken, setFpToken] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpSuccess, setFpSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timerId = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Welcome back!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!fpIdentifier.trim()) { toast.error('Please enter your email'); return; }
    setFpLoading(true);
    try {
      await axios.post(`${API_URL}/users/forgot_password/`, { email: fpIdentifier });
      setResetStep(2);
      setResendCooldown(60);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not find that account');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await axios.post(`${API_URL}/users/forgot_password/`, { email: fpIdentifier });
      toast.success('New OTP sent to your email!');
      setResendCooldown(60);
    } catch (err) {
      toast.error('Failed to resend OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const code = fpToken.join ? fpToken.join('') : fpToken;
    if (code.length !== 6 || !fpNewPassword.trim()) { toast.error('Please fill all fields'); return; }
    if (fpNewPassword !== fpConfirmPassword) { toast.error('Passwords do not match'); return; }
    if (fpNewPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setFpLoading(true);
    try {
      await axios.post(`${API_URL}/users/reset_password/`, {
        email: fpIdentifier,
        otp: code,
        new_password: fpNewPassword,
      });
      setFpSuccess(true);
      toast.success('Password reset! Please log in.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setFpLoading(false);
    }
  };

  // OTP Magic Input Handlers
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = Array.isArray(fpToken) ? [...fpToken] : new Array(6).fill('');
    newOtp[index] = element.value;
    setFpToken(newOtp);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, 6).split('');
    if (pasteData.some(isNaN)) return;
    const newOtp = new Array(6).fill('');
    pasteData.forEach((char, index) => newOtp[index] = char);
    setFpToken(newOtp);
    const inputs = document.querySelectorAll('.otp-input');
    if (inputs[pasteData.length - 1]) {
      inputs[pasteData.length - 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && (!fpToken[index] || fpToken[index] === '') && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  // ── Forgot Password view ─────────────────────────────────────
  if (forgotMode) {
    return (
      <div className="auth-page">
        <div className="auth-bg" />
        <div className="auth-card glass-card animate-in">
          <button className="auth-back-btn" onClick={() => { setForgotMode(false); setResetStep(1); setFpSuccess(false); setFpToken(new Array(6).fill('')); }}>
            <ChevronLeft size={16} /> Back to Login
          </button>

          <div className="auth-logo">
            <div className="logo-icon-lg">
              <KeyRound size={28} />
            </div>
          </div>

          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">
            {fpSuccess ? 'Password updated successfully!' : resetStep === 1 ? 'Enter your email to get an OTP.' : 'Enter your 6-digit OTP and new password.'}
          </p>

          {fpSuccess ? (
            <div className="fp-success">
              <CheckCircle size={48} color="#00E676" />
              <p>Your password has been reset. You can now log in.</p>
              <button className="btn btn-primary btn-full" onClick={() => { 
                setForm({ username: fpIdentifier, password: fpNewPassword });
                setForgotMode(false); 
                setResetStep(1); 
                setFpSuccess(false); 
                setFpToken(new Array(6).fill('')); 
              }}>
                Go to Login <ArrowRight size={16} />
              </button>
            </div>
          ) : resetStep === 1 ? (
            <form onSubmit={handleForgotRequest} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={fpIdentifier}
                  onChange={e => setFpIdentifier(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={fpLoading}>
                {fpLoading ? <span className="spinner-sm" /> : <>Send OTP <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'center', marginBottom: 16 }}>Verification OTP</label>
                <div className="otp-container" style={{ justifyContent: 'center' }}>
                  {(Array.isArray(fpToken) ? fpToken : new Array(6).fill('')).map((data, index) => (
                    <input
                      className="otp-input"
                      type="text"
                      name="otp"
                      maxLength="1"
                      key={index}
                      value={data}
                      onChange={e => handleOtpChange(e.target, index)}
                      onFocus={e => e.target.select()}
                      onKeyDown={e => handleOtpKeyDown(e, index)}
                      onPaste={handleOtpPaste}
                    />
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={resendCooldown > 0} onClick={handleResendOtp}>
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-with-icon">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Minimum 8 characters"
                    value={fpNewPassword}
                    onChange={e => setFpNewPassword(e.target.value)}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>
                  Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-with-icon">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={fpConfirmPassword}
                    onChange={e => setFpConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={fpLoading}>
                {fpLoading ? <span className="spinner-sm" /> : <>Reset Password <ArrowRight size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── Login view ────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card glass-card animate-in">
        <div className="auth-logo">
          <div className="logo-icon-lg"><Store size={28} /></div>
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your Indian Local Store account</p>

        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" className="forgot-link" onClick={() => setForgotMode(true)}>
                Forgot password?
              </button>
            </div>
          </div>

          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <span className="spinner-sm" /> : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" id="go-register-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
