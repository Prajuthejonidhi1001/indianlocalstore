import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, ArrowRight, Smartphone, ShieldCheck, RefreshCw, Mail } from 'lucide-react';
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
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  
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

  const handleSendOTP = async (e) => {
    if(e) e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const phoneNumber = `+91${phone}`;

      // 1. Send Firebase SMS
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;

      // 2. Send Email OTP from our backend (if provided)
      if (email) {
        await authAPI.sendPhoneOtp(phoneNumber, email);
      }

      toast.success(email ? 'OTPs sent to phone and email!' : 'OTP sent successfully!');
      setStep(2);
      setResendCooldown(30);
    } catch (err) {
      console.error("FIREBASE ERROR:", err);
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
    if (phoneOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit phone OTP');
      return;
    }
    if (email && emailOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit email OTP');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Verify Phone OTP with Firebase
      const result = await window.confirmationResult.confirm(phoneOtp);
      const idToken = await result.user.getIdToken();

      // 2. Send Firebase ID Token (and optional Email OTP) to our backend
      const res = await loginWithPhoneOTP(idToken, emailOtp);
      
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
      <div className="auth-card glass-card">
        <Link to="/" className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <div className="logo-icon-lg" style={{ width: '50px', height: '50px', flexShrink: 0, margin: 0, position: 'static' }}>
            <Store size={28} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Indian<span className="text-saffron">LocalStore</span></h2>
        </Link>
        <p className="auth-subtitle">Welcome back! Sign in to continue.</p>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="auth-form" id="login-form">
            <div className="form-group">
              <label className="form-label">Phone Number (Required)</label>
              <div className="auth-input-wrapper">
                <Smartphone size={18} className="auth-input-icon" />
                <span className="phone-prefix">+91</span>
                <input
                  id="phone-input"
                  type="tel"
                  className="form-input"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{ paddingLeft: '75px' }}
                />
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-label">Email Address (Optional)</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="email-input"
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              <small className="text-muted d-block mt-1">If provided, we'll verify this too for extra security.</small>
            </div>

            {/* Invisible Recaptcha Container */}
            <div id="recaptcha-container"></div>

            <button
              id="send-otp-btn"
              type="submit"
              className="btn btn-primary btn-block btn-lg mt-4"
              disabled={loading || phone.length < 10}
            >
              {loading ? 'Sending OTPs...' : 'Get OTP'} <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form animate-in" id="otp-form">
            <div className="text-center mb-4">
              <div className="verify-icon mb-3">
                <ShieldCheck size={48} className="text-saffron mx-auto" />
              </div>
              <h3 className="font-medium">Verify your details</h3>
              <p className="text-muted text-sm mt-1">We've sent a 6-digit code to +91 {phone}</p>
              {email && <p className="text-muted text-sm">And an email code to {email}</p>}
              <button 
                type="button" 
                className="btn-link text-sm mt-1"
                onClick={() => setStep(1)}
              >
                Change Details
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Verification Code</label>
              <input
                id="phone-otp-input"
                type="text"
                className="form-input text-center text-xl tracking-widest"
                placeholder="• • • • • •"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoFocus
              />
            </div>
            
            {email && (
              <div className="form-group mt-3">
                <label className="form-label">Email Verification Code</label>
                <input
                  id="email-otp-input"
                  type="text"
                  className="form-input text-center text-xl tracking-widest"
                  placeholder="• • • • • •"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>
            )}

            <button
              id="verify-otp-btn"
              type="submit"
              className="btn btn-primary btn-block btn-lg mt-4"
              disabled={loading || phoneOtp.length < 6 || (email && emailOtp.length < 6)}
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
