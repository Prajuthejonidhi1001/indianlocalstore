import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Eye, EyeOff, User, ShoppingBag, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { shopAPI, productAPI } from '../api';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const { register, login } = useAuth();
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
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [locating, setLocating] = useState(false);
  const [taluks, setTaluks] = useState([]);
  const [fetchingPin, setFetchingPin] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['username', 'email', 'password', 'first_name'];
    for (const f of required) {
      if (!form[f]) return toast.error(`${f.replace('_', ' ')} is required`);
    }
    if (form.role === 'seller' && (!form.shopName || !form.pincode || !form.shopAddress)) {
      return toast.error("Please fill all required Shop Details");
    }
    if (form.role === 'seller' && !form.category) {
      return toast.error("Please select your shop category");
    }
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const userData = {
        username: form.username, email: form.email, phone: form.phone,
        first_name: form.first_name, last_name: form.last_name,
        password: form.password, role: form.role
      };
      await register(userData);

      if (form.role === 'seller') {
        await login(form.username, form.password);
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
        if (shopPhoto) shopData.append('logo', shopPhoto);
        await shopAPI.createShop(shopData);
        toast.success('Account & Shop created! Welcome aboard.');
        navigate('/seller');
      } else {
        toast.success('Account created! Please log in.');
        navigate('/login');
      }
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const firstKey = Object.keys(errorData)[0];
        if (firstKey) {
          const msg = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
          toast.error(`${firstKey.toUpperCase()}: ${msg}`);
          return;
        }
      }
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card auth-card-wide glass-card animate-in">
        <div className="auth-logo">
          <div className="logo-icon-lg"><Store size={28} /></div>
        </div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join thousands of local shoppers & sellers</p>

        {/* Role Selector — at the TOP */}
        <div className="role-selector" style={{ marginBottom: '1.5rem' }}>
          <button type="button" className={`role-btn ${form.role === 'customer' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'customer' })} id="role-customer">
            <User size={18} /> Customer
          </button>
          <button type="button" className={`role-btn ${form.role === 'seller' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'seller' })} id="role-seller">
            <ShoppingBag size={18} /> Seller
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
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
            <input id="phone" type="tel" className="form-input" placeholder="+91 98765 43210"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
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
              <>
                <div style={{ height: 4, borderRadius: 2, marginTop: 8, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, transition: 'all 0.4s', width: `${(passwordStrength / 4) * 100}%`, backgroundColor: passwordStrength <= 1 ? '#E74C3C' : passwordStrength === 2 ? '#F1C40F' : passwordStrength === 3 ? '#3498DB' : '#2ECC71' }} />
                </div>
                <div style={{ fontSize: 12, textAlign: 'right', marginTop: 4, color: passwordStrength <= 1 ? '#E74C3C' : passwordStrength === 2 ? '#F1C40F' : passwordStrength === 3 ? '#3498DB' : '#2ECC71' }}>
                  {passwordStrength <= 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong'}
                </div>
              </>
            )}
          </div>

          {/* ── Seller Fields ── */}
          {form.role === 'seller' && (
            <div className="reg-seller-section">
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
            {loading ? <span className="spinner-sm" /> : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" id="go-login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
