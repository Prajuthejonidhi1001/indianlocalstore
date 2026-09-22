import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, ArrowRight, Smartphone, ShieldCheck, RefreshCw, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import './AuthPages.css';

export default function LoginPage() {
  const { loginWithPhoneOTP, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [loginMethod, setLoginMethod] = useState('email');
  const [identifier, setIdentifier] = useState('');
  
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        }
      });
    }
  };

  const isEmail = loginMethod === 'email';

  const handleSendOTP = async (e) => {
    if(e) e.preventDefault();
    if (!identifier) {
      toast.error('Please enter your phone number or email');
      return;
    }
    
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(identifier)) {
        toast.error('Please enter a valid email address');
        return;
      }
    } else {
      const numericPhone = identifier.replace(/\D/g, '');
      if (numericPhone.length < 10) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
    }
    
    setLoading(true);
    try {
      if (!isEmail) {
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;
        const numericPhone = identifier.replace(/\D/g, '');
        const phoneNumber = `+91${numericPhone}`;
        // 1. Send Firebase SMS
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
      } else {
        // 2. Send Email OTP from our backend
        await authAPI.sendPhoneOtp(null, identifier);
      }

      toast.success('OTP sent successfully!');
      setStep(2);
      setResendCooldown(30);
    } catch (err) {
      console.error("ERROR:", err);
      toast.error(err.message || 'Failed to send OTP. Try again.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      let idToken = null;
      let emailOtpToVerify = null;

      if (!isEmail) {
        // 1. Verify Phone OTP with Firebase
        const result = await window.confirmationResult.confirm(otp);
        idToken = await result.user.getIdToken();
      } else {
        // 2. Email OTP to verify
        emailOtpToVerify = otp;
      }

      // Send to backend
      const res = await loginWithPhoneOTP(idToken, emailOtpToVerify, isEmail ? identifier : null);
      
      if (res.is_new_user) {
        toast.success('Account created successfully!');
      } else {
        toast.success('Logged in successfully!');
      }
      
      const from = location.state?.from?.pathname || "/home";
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-in">
      <div className="auth-bg"></div>
      <div className="auth-card glass-card" style={{ boxShadow: '0 20px 40px rgba(255, 107, 53, 0.15), 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid rgba(255, 107, 53, 0.2)', backdropFilter: 'blur(10px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" className="auth-logo" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none', margin: '0 auto 1rem auto' }}>
            <img src="/logo.png" alt="Indian Local Store" style={{ height: '70px', width: 'auto', borderRadius: '12px' }} />
          </Link>
          <p className="auth-subtitle" style={{ fontSize: '0.95rem', margin: 0 }}>Welcome back! Sign in to continue your journey.</p>
        </div>

        {step === 1 ? (
          <div className="auth-form" id="login-form">
            <div className="role-card-grid" style={{ marginBottom: '1.5rem', gap: '10px', display: 'flex' }}>
              <button
                type="button"
                className={`role-card ${loginMethod === 'email' ? 'active' : ''}`}
                onClick={() => { setLoginMethod('email'); setIdentifier(''); }}
                style={{ flex: 1, padding: '10px', textAlign: 'center' }}
              >
                <Mail size={20} style={{ marginBottom: '5px', color: loginMethod === 'email' ? 'var(--saffron)' : 'inherit' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Email</div>
              </button>
              <button
                type="button"
                className={`role-card ${loginMethod === 'phone' ? 'active' : ''}`}
                onClick={() => { setLoginMethod('phone'); setIdentifier(''); }}
                style={{ flex: 1, padding: '10px', textAlign: 'center' }}
              >
                <Smartphone size={20} style={{ marginBottom: '5px', color: loginMethod === 'phone' ? 'var(--saffron)' : 'inherit' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Phone</div>
              </button>
            </div>

            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label className="form-label">{loginMethod === 'email' ? 'Email Address' : 'Phone Number'}</label>
                <div className="auth-input-wrapper">
                  {loginMethod === 'email' ? <Mail size={18} className="auth-input-icon" /> : <Smartphone size={18} className="auth-input-icon" />}
                  <input
                    id="identifier-input"
                    type={loginMethod === 'email' ? 'email' : 'tel'}
                    className="form-input"
                    placeholder={loginMethod === 'email' ? "Enter your email address" : "Enter 10-digit number"}
                    value={identifier}
                    onChange={(e) => {
                      if (loginMethod === 'phone') {
                        setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10));
                      } else {
                        setIdentifier(e.target.value);
                      }
                    }}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
                <small className="text-muted d-block mt-1">We will send an OTP to verify your identity.</small>
              </div>

              {/* Invisible Recaptcha Container */}
              <div id="recaptcha-container"></div>

              <button
                id="send-otp-btn"
                type="submit"
                className="btn btn-primary btn-block btn-lg mt-4"
                disabled={loading || (loginMethod === 'email' ? identifier.length < 5 : identifier.length !== 10)}
              >
                {loading ? 'Sending OTPs...' : 'Get OTP'} <ArrowRight size={18} />
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form animate-in" id="otp-form">
            <div className="text-center mb-4">
              <div className="verify-icon mb-3">
                <ShieldCheck size={48} className="text-saffron mx-auto" />
              </div>
              <h3 className="font-medium">Verify your details</h3>
              <p className="text-muted text-sm mt-1">We've sent a 6-digit code to {isEmail ? '' : '+91 '} {identifier}</p>
              <button 
                type="button" 
                className="btn-link text-sm mt-1"
                onClick={() => setStep(1)}
              >
                Change Details
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                id="otp-input"
                type="text"
                className="form-input text-center text-xl tracking-widest"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              id="verify-otp-btn"
              type="submit"
              className="btn btn-primary btn-block btn-lg mt-4"
              disabled={loading || otp.length < 6}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <div className="text-center mt-4">
              {resendCooldown > 0 ? (
                <span className="text-muted text-sm">Resend code in {resendCooldown}s</span>
              ) : (
                <button 
                  type="button" 
                  className="btn-link text-sm flex-center gap-1 mx-auto"
                  onClick={handleSendOTP}
                >
                  <RefreshCw size={14} /> Resend OTPs
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
