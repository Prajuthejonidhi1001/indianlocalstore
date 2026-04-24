import { useState } from 'react';
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
    if (!fpIdentifier.trim()) { toast.error('Please enter your username or email'); return; }
    setFpLoading(true);
    try {
      const res = await axios.post(`${API_URL}/users/forgot_password/`, { username: fpIdentifier });
      setFpToken(res.data.reset_token || '');
      setResetStep(2);
      toast.success('Reset token generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not find that account');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!fpToken.trim() || !fpNewPassword.trim()) { toast.error('Please fill all fields'); return; }
    if (fpNewPassword !== fpConfirmPassword) { toast.error('Passwords do not match'); return; }
    if (fpNewPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setFpLoading(true);
    try {
      await axios.post(`${API_URL}/users/reset_password/`, {
        reset_token: fpToken,
        new_password: fpNewPassword,
      });
      setFpSuccess(true);
      toast.success('Password reset! Please log in.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired token');
    } finally {
      setFpLoading(false);
    }
  };

  // ── Forgot Password view ─────────────────────────────────────
  if (forgotMode) {
    return (
      <div className="auth-page">
        <div className="auth-bg" />
        <div className="auth-card glass-card animate-in">
          <button className="auth-back-btn" onClick={() => { setForgotMode(false); setResetStep(1); setFpSuccess(false); }}>
            <ChevronLeft size={16} /> Back to Login
          </button>

          <div className="auth-logo">
            <div className="logo-icon-lg">
              <KeyRound size={28} />
            </div>
          </div>

          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">
            {fpSuccess ? 'Password updated successfully!' : resetStep === 1 ? 'Enter your username or email to get a reset token.' : 'Enter your reset token and new password.'}
          </p>

          {fpSuccess ? (
            <div className="fp-success">
              <CheckCircle size={48} color="#00E676" />
              <p>Your password has been reset. You can now log in.</p>
              <button className="btn btn-primary btn-full" onClick={() => { setForgotMode(false); setResetStep(1); setFpSuccess(false); }}>
                Go to Login <ArrowRight size={16} />
              </button>
            </div>
          ) : resetStep === 1 ? (
            <form onSubmit={handleForgotRequest} className="auth-form">
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your username or email"
                  value={fpIdentifier}
                  onChange={e => setFpIdentifier(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={fpLoading}>
                {fpLoading ? <span className="spinner-sm" /> : <>Get Reset Token <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form">
              {fpToken && (
                <div className="fp-token-box">
                  <p className="fp-token-label">Your Reset Token:</p>
                  <code className="fp-token-value">{fpToken}</code>
                  <p className="fp-token-note">⚠️ Copy this (in production it would be emailed to you)</p>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Reset Token</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste your reset token"
                  value={fpToken}
                  onChange={e => setFpToken(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={fpNewPassword}
                  onChange={e => setFpNewPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={fpConfirmPassword}
                  onChange={e => setFpConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={fpLoading}>
                {fpLoading ? <span className="spinner-sm" /> : <>Reset Password <ArrowRight size={16} /></>}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setResetStep(1)}>← Go back</button>
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
            <div className="form-label-row">
              <label className="form-label" htmlFor="password">Password</label>
              <button type="button" className="forgot-link" onClick={() => setForgotMode(true)}>
                Forgot password?
              </button>
            </div>
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
