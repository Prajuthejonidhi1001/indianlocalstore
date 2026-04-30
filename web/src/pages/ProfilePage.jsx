import { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Check, X, LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser(form);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !form) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem', maxWidth: '800px' }}>
        <div className="section-header flex-between">
          <div>
            <div className="section-label"><User size={14} /> Account</div>
            <h1 id="profile-heading">My Profile</h1>
            <p className="section-subtitle">Manage your personal information and addresses</p>
          </div>
          {!editing ? (
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} id="edit-profile-btn">
              <Edit2 size={14} /> Edit Profile
            </button>
          ) : (
            <div className="flex-center gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={loading} id="cancel-edit-btn">
                <X size={14} /> Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading} id="save-profile-btn">
                {loading ? <span className="spinner-sm" style={{borderColor:'white', borderTopColor:'transparent'}} /> : <><Check size={14} /> Save</>}
              </button>
            </div>
          )}
        </div>

        <div className="profile-layout">
          {/* Avatar Card */}
          <div className="card profile-avatar-card">
            <div className="pa-avatar">
              {user.first_name?.[0] || user.username[0].toUpperCase()}
            </div>
            <h3 className="pa-name">{user.first_name} {user.last_name}</h3>
            <p className="pa-role">@{user.username} • <span className="badge badge-orange">{user.role}</span></p>
            
            <div className="pa-contact mt-3">
              <div className="pa-item"><Mail size={14} /> {user.email}</div>
              <div className="pa-item"><Phone size={14} /> {user.phone || 'Not provided'}</div>
            </div>
          </div>

          {/* Quick Links — hidden while editing profile */}
          {!editing && (
            <div className="profile-quick-links">
              <Link to="/orders" className="pql-btn" id="profile-orders-link">
                <Package size={18} />
                <span>My Orders</span>
              </Link>
              {user?.role === 'seller' && (
                <Link to="/seller" className="pql-btn pql-seller" id="profile-seller-link">
                  <LayoutDashboard size={18} />
                  <span>Seller Dashboard</span>
                </Link>
              )}
            </div>
          )}

          {/* Details Form Card */}
          <div className="card profile-form-card">
            <h3 className="form-card-title">Personal Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input 
                  type="text" className="form-input" 
                  value={form.first_name} 
                  onChange={e => setForm({...form, first_name: e.target.value})}
                  disabled={!editing} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input 
                  type="text" className="form-input" 
                  value={form.last_name} 
                  onChange={e => setForm({...form, last_name: e.target.value})}
                  disabled={!editing} 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" className="form-input" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})}
                disabled={!editing} 
              />
            </div>

            <h3 className="form-card-title mt-4">Delivery Address</h3>
            
            <div className="form-group">
              <label className="form-label">Full Address</label>
              <textarea 
                className="form-input" rows={3}
                value={form.address} 
                onChange={e => setForm({...form, address: e.target.value})}
                disabled={!editing}
                placeholder="House No, Building, Street..."
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" className="form-input" 
                  value={form.city} 
                  onChange={e => setForm({...form, city: e.target.value})}
                  disabled={!editing} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input 
                  type="text" className="form-input" 
                  value={form.state} 
                  onChange={e => setForm({...form, state: e.target.value})}
                  disabled={!editing} 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input 
                type="text" className="form-input" style={{ maxWidth: '200px' }}
                value={form.pincode} 
                onChange={e => setForm({...form, pincode: e.target.value})}
                disabled={!editing} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
