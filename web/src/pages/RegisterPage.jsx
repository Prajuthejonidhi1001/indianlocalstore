import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Eye, EyeOff, User, ShoppingBag, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { shopAPI } from '../api';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', password: '', role: 'customer',
    // New Seller Fields
    shopName: '', shopAddress: '', pincode: '',
    state: '', district: '', taluk: '',
  });

  const [shopPhoto, setShopPhoto] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Location States
  const [locating, setLocating] = useState(false);
  const [taluks, setTaluks] = useState([]);
  const [fetchingPin, setFetchingPin] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });

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
        toast.success("Location precisely detected!");
        setLocating(false);
      },
      () => {
        toast.error("Unable to get location");
        setLocating(false);
      }
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
      console.error(err);
      toast.error('Registration failed. Username or email might be taken.');
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

        {/* Role Selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${form.role === 'customer' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'customer' })}
          >
            <User size={18} /> Customer
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === 'seller' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'seller' })}
          >
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

          {form.role === 'seller' && (
            <div className="seller-fields-container" style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ color: 'var(--text)', marginBottom: '15px', fontSize: '1.1rem' }}>Business Details</h4>
              
              <div className="form-group">
                <label className="form-label">Shop/Business Name *</label>
                <input type="text" className="form-input" placeholder="My Local Shop"
                  value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Shop Photo</label>
                <input type="file" className="form-input" accept="image/*" onChange={e => setShopPhoto(e.target.files[0])} style={{ padding: '0.6rem' }}/>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pincode * {fetchingPin && <span className="spinner-sm" style={{borderColor: 'var(--saffron)', width: 12, height:12, position:'absolute', marginLeft: 5}}/>}</label>
                  <input type="text" className="form-input" placeholder="560001" maxLength={6}
                    value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Select State</label>
                  <input type="text" className="form-input" placeholder="Auto-filled" disabled value={form.state} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input type="text" className="form-input" placeholder="Auto-filled" disabled value={form.district} />
                </div>
                <div className="form-group">
                  <label className="form-label">Taluk</label>
                  <select className="form-input" value={form.taluk} onChange={e => setForm({ ...form, taluk: e.target.value })} disabled={taluks.length === 0} style={{ paddingRight: '25px', backgroundColor: 'var(--bg-elevated)' }}>
                    {taluks.length > 0 ? taluks.map((t, i) => <option key={i} value={t}>{t}</option>) : <option value="">Select Taluk</option>}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shop Address *</label>
                <textarea className="form-input" placeholder="Full street address..." style={{ minHeight: '80px', resize: 'vertical' }}
                  value={form.shopAddress} onChange={e => setForm({ ...form, shopAddress: e.target.value })} />
              </div>

              <div className="form-group" style={{ marginTop: '5px' }}>
                <button type="button" onClick={handleDetectLocation} disabled={locating} style={{ width: '100%', padding: '0.8rem', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                  <MapPin size={16} /> {locating ? 'Detecting...' : coords.lat ? 'Location Captured ✅' : 'Detect Shop Location'}
                </button>
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop: form.role === 'seller' ? '15px' : '0' }}>
            <label className="form-label" htmlFor="reg-password">Password *</label>
            <div className="input-with-icon">
              <input id="reg-password" type={showPw ? 'text' : 'password'} className="form-input"
                placeholder="Min. 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="register-btn" type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '10px' }}>
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
