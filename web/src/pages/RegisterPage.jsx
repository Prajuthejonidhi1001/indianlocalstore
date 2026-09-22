import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Eye, EyeOff, User, ShoppingBag, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, shopAPI, productAPI } from '../api';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import './AuthPages.css';

export default function RegisterPage() {
  const { register, login, loginWithPhoneOTP } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', password: '', role: 'customer',
    shopName: '', shopAddress: '', pincode: '',
    state: '', district: '', taluk: '',
    category: '', subcategory: '',
  });

  const [shopPhoto, setShopPhoto] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [locating, setLocating] = useState(false);
  const [taluks, setTaluks] = useState([]);
  const [fetchingPin, setFetchingPin] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [step, setStep] = useState(1);
  const [phoneOtp, setPhoneOtp] = useState(new Array(6).fill(''));
  const [emailOtp, setEmailOtp] = useState(new Array(6).fill(''));
  const [otpStatus, setOtpStatus] = useState(''); // 'success' or 'error'
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timerId = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendCooldown]);

  // Load categories when seller role is selected
  useEffect(() => {
    if (form.role === 'seller' && categories.length === 0) {
      productAPI.getCategories()
        .then(r => setCategories(r.data.results || r.data))
        .catch(() => {});
    }
  }, [form.role]);

  // Load subcategories when a category is selected
  useEffect(() => {
    if (form.category) {
      setSubcategories([]);
      setForm(f => ({ ...f, subcategory: '' }));
      productAPI.getSubCategories(form.category)
        .then(r => setSubcategories(r.data.results || r.data))
        .catch(() => {});
    }
  }, [form.category]);

  const handlePasswordChange = (e) => {
    const pw = e.target.value;
    setForm({ ...form, password: pw });
    let score = 0;
    if (pw.length > 7) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    setPasswordStrength(score);
  };

  useEffect(() => {
    const fetchLocationData = async () => {
      if (form.pincode.length === 6 && /^\d+$/.test(form.pincode)) {
        setFetchingPin(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`);
          const data = await res.json();
          if (data && data[0].Status === 'Success') {
            const offices = data[0].PostOffice;
            const uniqueTaluks = [...new Set(offices.map(po => po.Block))].filter(Boolean);
            setForm(f => ({
              ...f,
              state: offices[0].State,
              district: offices[0].District,
              taluk: uniqueTaluks[0] || offices[0].District
            }));
            setTaluks(uniqueTaluks.length > 0 ? uniqueTaluks : [offices[0].District]);
            toast.success("Location auto-filled!");
          } else {
            toast.error("Invalid pincode.");
            setForm(f => ({ ...f, state: '', district: '', taluk: '' }));
            setTaluks([]);
          }
        } catch {
          toast.error("Error fetching pincode.");
        } finally {
          setFetchingPin(false);
        }
      }
    };
    fetchLocationData();
  }, [form.pincode]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Location detected!");
        setLocating(false);
      },
      () => { toast.error("Unable to get location"); setLocating(false); }
    );
  };

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['username', 'email', 'password', 'first_name', 'phone'];
    for (const f of required) {
      if (!form[f]) return toast.error(`${f.replace('_', ' ')} is required`);
    }
    if (form.phone.length !== 10) return toast.error("Phone number must be 10 digits");
    
    if (form.role === 'seller' && (!form.shopName || !form.pincode || !form.shopAddress)) {
      return toast.error("Please fill all required Shop Details");
    }
    if (form.role === 'seller' && !form.category) {
      return toast.error("Please select your shop category");
    }
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (form.password !== confirmPw) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      if (step === 1) {
        const fullPhone = `+91${form.phone}`;
        const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        await authAPI.sendPhoneOtp(fullPhone, form.email);
        setStep(2);
        toast.success("OTPs sent to phone and email!");
      }
    } catch (err) {
      console.error("FIREBASE ERROR:", err);
      toast.error(err.message || 'Failed to send SMS.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    setOtpStatus('');
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
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
    setOtp(newOtp);
    setOtpStatus('');
    
    // Focus last filled input
    const inputs = document.querySelectorAll('.otp-input');
    if (inputs[pasteData.length - 1]) {
      inputs[pasteData.length - 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      setOtpStatus('');
      if (!otp[index] && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const verifyAndRegister = async (pCode, eCode) => {
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(pCode);
      const idToken = await result.user.getIdToken();

      await loginWithPhoneOTP(idToken, eCode, form.email, form.role, form.first_name, form.last_name);
      
      setOtpStatus('success');

      if (form.role === 'seller') {
        const shopData = new FormData();
        shopData.append('name', form.shopName);
        shopData.append('email', form.email);
        shopData.append('phone', form.phone);
        shopData.append('pincode', form.pincode);
        shopData.append('address', form.shopAddress);
        shopData.append('city', form.district);
        shopData.append('state', form.state);
        shopData.append('latitude', coords.lat || 20.5937);
        shopData.append('longitude', coords.lng || 78.9629);
        shopData.append('description', `${form.shopName} in ${form.taluk}, ${form.district}`);
        if (form.category) shopData.append('category', form.category);
        if (form.subcategory) shopData.append('subcategory', form.subcategory);
        if (shopPhoto) shopData.append('logo', shopPhoto);
        await shopAPI.createShop(shopData);
        
        if (form.category) {
          localStorage.setItem('seller_default_category', form.category);
          const catName = categories.find(c => String(c.id) === form.category)?.name || '';
          localStorage.setItem('seller_default_category_name', catName);
        }
        if (form.subcategory) {
          localStorage.setItem('seller_default_subcategory', form.subcategory);
          const subName = subcategories.find(s => String(s.id) === form.subcategory)?.name || '';
          localStorage.setItem('seller_default_subcategory_name', subName);
        }
        
        setTimeout(() => {
          toast.success('Account & Shop created! Welcome aboard.');
          navigate('/seller');
        }, 800);
      } else {
        setTimeout(() => {
          toast.success('Account created and logged in!');
          navigate('/');
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setOtpStatus('error');
      toast.error(err.message || 'Verification failed. Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card auth-card-wide glass-card animate-in">
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <img src="/logo.png" alt="Indian Local Store" style={{ height: '70px', width: 'auto', borderRadius: '12px' }} />
        </div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join thousands of local shoppers & sellers</p>

        {/* Role Selector — large cards */}
        {step === 1 && (
          <div className="role-card-grid" style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`role-card ${form.role === 'customer' ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: 'customer' })}
              id="role-customer"
            >
              <div className="role-card-icon">🛒</div>
              <div className="role-card-body">
                <div className="role-card-title">Customer</div>
                <div className="role-card-desc">Browse shops & buy products</div>
              </div>
              {form.role === 'customer' && <div className="role-card-check">✓</div>}
            </button>
            <button
              type="button"
              className={`role-card ${form.role === 'seller' ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: 'seller' })}
              id="role-seller"
            >
              <div className="role-card-icon">🏪</div>
              <div className="role-card-body">
                <div className="role-card-title">Seller</div>
                <div className="role-card-desc">List your shop & sell products</div>
              </div>
              {form.role === 'seller' && <div className="role-card-check">✓</div>}
            </button>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="auth-form" id="register-form">
            <div id="recaptcha-container"></div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="first_name">First Name</label>
                <input id="first_name" type="text" className="form-input" placeholder="Rahul"
                  value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="last_name">Last Name</label>
                <input id="last_name" type="text" className="form-input" placeholder="Sharma"
                  value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              </div>
            </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username *</label>
            <input id="reg-username" type="text" className="form-input" placeholder="rahul_sharma"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email *</label>
            <input id="reg-email" type="email" className="form-input" placeholder="rahul@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone</label>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ padding: '0 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', border: '2px solid var(--border-subtle)', borderRight: 'none', borderRadius: '12px 0 0 12px', color: 'var(--text)', fontWeight: '600' }}>
                +91
              </div>
              <input id="phone" type="tel" className="form-input" style={{ borderRadius: '0 12px 12px 0', flex: 1 }} placeholder="9876543210"
                value={form.phone} onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setForm({ ...form, phone: val });
                }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password *</label>
            <div className="input-with-icon">
              <input id="reg-password" type={showPw ? 'text' : 'password'} className="form-input"
                placeholder="Minimum 8 characters" value={form.password} onChange={handlePasswordChange} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, lineHeight: 1.4 }}>
                  Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, transition: 'all 0.4s', width: `${(passwordStrength / 4) * 100}%`, backgroundColor: passwordStrength <= 1 ? '#E74C3C' : passwordStrength === 2 ? '#F1C40F' : passwordStrength === 3 ? '#3498DB' : '#2ECC71' }} />
                </div>
                <div style={{ fontSize: 12, textAlign: 'right', marginTop: 4, fontWeight: 600, color: passwordStrength <= 1 ? '#E74C3C' : passwordStrength === 2 ? '#F1C40F' : passwordStrength === 3 ? '#3498DB' : '#2ECC71' }}>
                  {passwordStrength <= 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong'}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm-password">Confirm Password *</label>
            <div className="input-with-icon">
              <input
                id="reg-confirm-password"
                type={showConfirmPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                style={confirmPw.length > 0 ? { borderColor: confirmPw === form.password ? '#2ECC71' : '#E74C3C' } : {}}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPw.length > 0 && (
              <div style={{ fontSize: 12, textAlign: 'right', marginTop: 4, fontWeight: 700,
                color: confirmPw === form.password ? '#2ECC71' : '#E74C3C' }}>
                {confirmPw === form.password ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}
          </div>


          {/* ── Seller Fields ── */}
          {form.role === 'seller' && (
            <div className="reg-seller-section">
              <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px dashed var(--saffron)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--saffron)', fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Store size={18} /> Grow Your Local Business
                </h4>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Reach thousands of local customers in your city.</li>
                  <li>Zero onboarding fees—set up your shop in minutes.</li>
                  <li>Manage your inventory and orders seamlessly.</li>
                </ul>
              </div>

              <div className="reg-seller-header">
                <ShoppingBag size={16} />
                <span>Business Details</span>
              </div>

              <div className="form-group">
                <label className="form-label">Shop / Business Name *</label>
                <input type="text" className="form-input" placeholder="My Local Shop"
                  value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Shop Photo</label>
                <input type="file" className="form-input" accept="image/*"
                  onChange={e => setShopPhoto(e.target.files[0])} style={{ padding: '0.6rem' }} />
              </div>

              {/* Category Picker — ONE only */}
              <div className="form-group">
                <label className="form-label"><Tag size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Shop Category *</label>
                <div className="reg-cat-grid">
                  {categories.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading categories…</p>}
                  {categories.map(cat => (
                    <button key={cat.id} type="button" id={`cat-btn-${cat.id}`}
                      className={`reg-cat-chip ${form.category === String(cat.id) ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, category: String(cat.id), subcategory: '' }))}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategory Picker — ONE only, shown when category picked */}
              {subcategories.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Subcategory <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                  <div className="reg-cat-grid">
                    {subcategories.map(sub => (
                      <button key={sub.id} type="button" id={`subcat-btn-${sub.id}`}
                        className={`reg-cat-chip reg-cat-chip-sm ${form.subcategory === String(sub.id) ? 'selected' : ''}`}
                        onClick={() => setForm(f => ({ ...f, subcategory: String(sub.id) }))}>
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">📍 Pincode * {fetchingPin && <span className="spinner-sm" style={{ borderColor: 'var(--saffron)', width: 12, height: 12, display: 'inline-block', marginLeft: 5 }} />}</label>
                  <input type="text" className="form-input" placeholder="560001" maxLength={6}
                    value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">🏛️ State (Auto)</label>
                  <input type="text" className="form-input" disabled value={form.state} placeholder="Auto from pincode" style={{ opacity: form.state ? 1 : 0.5 }} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">🗺️ District (Auto)</label>
                  <input type="text" className="form-input" disabled value={form.district} placeholder="Auto from pincode" style={{ opacity: form.district ? 1 : 0.5 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Area / Taluk</label>
                  <select className="form-input" value={form.taluk} onChange={e => setForm({ ...form, taluk: e.target.value })} disabled={taluks.length === 0} style={{ backgroundColor: 'var(--bg-elevated)' }}>
                    {taluks.length > 0 ? taluks.map((t, i) => <option key={i} value={t}>{t}</option>) : <option value="">Select Area</option>}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shop Address *</label>
                <textarea className="form-input" placeholder="Full street address..." style={{ minHeight: 70, resize: 'vertical' }}
                  value={form.shopAddress} onChange={e => setForm({ ...form, shopAddress: e.target.value })} />
              </div>

              <button type="button" className="reg-location-btn" onClick={handleDetectLocation} disabled={locating} id="detect-location-btn">
                <MapPin size={16} /> {locating ? 'Detecting…' : coords.lat ? '✅ Location Captured' : 'Detect Shop Location'}
              </button>
            </div>
          )}

          <button id="register-btn" type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '1.25rem' }}>
            {loading ? <span className="spinner-sm" /> : <>Continue <ArrowRight size={16} /></>}
          </button>
        </form>
        ) : (
          <div className="auth-form animate-in">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: 8 }}>Verify Identity</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Enter the codes sent to your phone and email.
              </p>
            </div>

            <label className="form-label" style={{textAlign: 'left', display: 'block', marginTop: '1rem'}}>Phone OTP (+91 {form.phone})</label>
            <div className="otp-container" style={{marginBottom: '1rem'}}>
              {phoneOtp.map((digit, index) => (
                <input
                  key={`p-${index}`}
                  type="text"
                  maxLength={1}
                  className={`otp-input ${otpStatus}`}
                  value={digit}
                  onChange={(e) => {
                    if (isNaN(e.target.value)) return;
                    setOtpStatus('');
                    const newOtp = [...phoneOtp];
                    newOtp[index] = e.target.value;
                    setPhoneOtp(newOtp);
                    if (e.target.nextSibling && e.target.value) e.target.nextSibling.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !phoneOtp[index] && e.target.previousSibling) {
                      e.target.previousSibling.focus();
                    }
                  }}
                  autoFocus={index === 0}
                  disabled={loading}
                />
              ))}
            </div>

            <label className="form-label" style={{textAlign: 'left', display: 'block'}}>Email OTP ({form.email})</label>
            <div className="otp-container" style={{marginBottom: '1.5rem'}}>
              {emailOtp.map((digit, index) => (
                <input
                  key={`e-${index}`}
                  type="text"
                  maxLength={1}
                  className={`otp-input ${otpStatus}`}
                  value={digit}
                  onChange={(e) => {
                    if (isNaN(e.target.value)) return;
                    setOtpStatus('');
                    const newOtp = [...emailOtp];
                    newOtp[index] = e.target.value;
                    setEmailOtp(newOtp);
                    if (e.target.nextSibling && e.target.value) e.target.nextSibling.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !emailOtp[index] && e.target.previousSibling) {
                      e.target.previousSibling.focus();
                    }
                  }}
                  disabled={loading}
                />
              ))}
            </div>

            <button 
              className="btn btn-primary btn-block mb-3" 
              onClick={() => verifyAndRegister(phoneOtp.join(''), emailOtp.join(''))} 
              disabled={loading || phoneOtp.join('').length < 6 || emailOtp.join('').length < 6}
            >
              {loading ? <span className="spinner-sm" /> : "Verify & Create Account"}
            </button>
            
            <button 
              className="auth-back-btn" 
              onClick={() => { setStep(1); setPhoneOtp(new Array(6).fill('')); setEmailOtp(new Array(6).fill('')); setOtpStatus(''); }}
              style={{ marginTop: '1rem', margin: '1rem auto 0' }}
              disabled={loading}
            >
              ← Back to Registration
            </button>
          </div>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login" id="go-login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
