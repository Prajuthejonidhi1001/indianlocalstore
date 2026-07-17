import { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Check, X, LayoutDashboard, Package, ShoppingCart, MapPin, Heart, Shield, ChevronRight, Clock, Search, XCircle, LogOut, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const STATUS_COLORS = {
  'pending': 'orange',
  'confirmed': 'blue',
  'processing': 'blue',
  'shipped': 'gold',
  'delivered': 'green',
  'cancelled': 'red',
};

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Profile Form State
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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

  useEffect(() => {
    // Fetch orders when navigating to orders tab or dashboard
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      orderAPI.getMyOrders()
        .then(r => setOrders(r.data.results || r.data))
        .catch(console.error)
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateUser(form);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOrderClick = async (id) => {
    try {
      const res = await orderAPI.getOrderDetail(id);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setCancelling(true);
    try {
      await orderAPI.cancelOrder(selectedOrder.id);
      toast.success('Order cancelled successfully');
      const [listRes, detailRes] = await Promise.all([
        orderAPI.getMyOrders(),
        orderAPI.getOrderDetail(selectedOrder.id),
      ]);
      setOrders(listRes.data.results || listRes.data);
      setSelectedOrder(detailRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || !form) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page account-hub-page">
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        
        {/* Account Header */}
        <div className="account-header">
          <div className="ah-avatar">
            {user.first_name?.[0] || user.username[0].toUpperCase()}
          </div>
          <div className="ah-info">
            <h1>Hello, {user.first_name || user.username}</h1>
            <p className="text-muted">{user.email} • {user.role === 'seller' ? 'Seller Account' : 'Customer Account'}</p>
          </div>
        </div>

        <div className="account-layout">
          {/* Vertical Sidebar */}
          <div className="account-sidebar">
            <button className={`account-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18} /> Account Overview
            </button>
            <button className={`account-nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <Package size={18} /> Your Orders
            </button>
            <button className={`account-nav-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <Shield size={18} /> Login & Security
            </button>
            <button className={`account-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
              <MapPin size={18} /> Your Addresses
            </button>
            <button className={`account-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}>
              <Heart size={18} /> Wishlist
            </button>
            
            <div className="divider" style={{ margin: '1rem 0' }}></div>
            
            {user.role === 'seller' && (
              <Link to="/seller" className="account-nav-btn text-saffron font-medium">
                <StoreIcon /> Seller Dashboard
              </Link>
            )}
            <button className="account-nav-btn text-red font-medium" onClick={handleLogout}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>

          {/* Main Content Area */}
          <div className="account-content">
            
            {/* ── DASHBOARD TAB ── */}
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in">
                <h2 className="tab-heading">Account Overview</h2>
                <div className="account-grid">
                  <div className="hub-card cursor-pointer" onClick={() => setActiveTab('orders')}>
                    <div className="hc-icon"><Package size={24} /></div>
                    <div className="hc-text">
                      <h3>Your Orders</h3>
                      <p>Track, return, or buy things again</p>
                    </div>
                  </div>
                  <div className="hub-card cursor-pointer" onClick={() => setActiveTab('security')}>
                    <div className="hc-icon"><Shield size={24} /></div>
                    <div className="hc-text">
                      <h3>Login & Security</h3>
                      <p>Edit login, name, and mobile number</p>
                    </div>
                  </div>
                  <div className="hub-card cursor-pointer" onClick={() => setActiveTab('addresses')}>
                    <div className="hc-icon"><MapPin size={24} /></div>
                    <div className="hc-text">
                      <h3>Your Addresses</h3>
                      <p>Edit addresses for orders and gifts</p>
                    </div>
                  </div>
                </div>

                <h3 className="sub-heading mt-4">Recent Orders</h3>
                {ordersLoading ? (
                  <p>Loading...</p>
                ) : orders.length > 0 ? (
                  <div className="recent-orders-list">
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="ro-card" onClick={() => { setActiveTab('orders'); handleOrderClick(order.id); }}>
                        <div>
                          <strong>Order #{order.order_id}</strong>
                          <div className="text-muted text-sm">{new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                        <span className={`badge badge-${STATUS_COLORS[order.order_status]}`}>
                          {order.order_status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">You have no recent orders.</p>
                )}
              </div>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in">
                <h2 className="tab-heading">Your Orders</h2>
                
                {ordersLoading ? (
                  <div className="loading-center"><div className="spinner" /></div>
                ) : orders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>No orders yet</h3>
                    <button className="btn btn-primary mt-3" onClick={() => navigate('/shops')}>Start Shopping</button>
                  </div>
                ) : (
                  <div className="orders-layout">
                    <div className="orders-list">
                      {orders.map(order => (
                        <div 
                          key={order.id} 
                          className={`order-card card ${selectedOrder?.id === order.id ? 'active' : ''}`}
                          onClick={() => handleOrderClick(order.id)}
                        >
                          <div className="order-header">
                            <div className="order-header-left">
                              <p className="order-id">Order #{order.order_id}</p>
                              <p className="order-date"><Clock size={12} /> {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                            </div>
                            <span className={`order-status-badge status-${order.order_status}`}>
                              {order.order_status.toUpperCase()}
                            </span>
                          </div>
                          <div className="order-footer">
                            <p className="order-total"><strong>₹{parseFloat(order.final_amount).toFixed(2)}</strong></p>
                            <div className="order-arrow"><ChevronRight size={18} /></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-detail-view">
                      {selectedOrder ? (
                        <div className="card od-card animate-in">
                          <div className="od-header">
                            <h2>Order #{selectedOrder.order_id}</h2>
                            <span className={`badge badge-${STATUS_COLORS[selectedOrder.order_status]}`}>
                              {selectedOrder.order_status.toUpperCase()}
                            </span>
                          </div>

                          {/* Visual Timeline */}
                          <div className="order-timeline-container">
                            <div className="timeline-track">
                              <div className="timeline-progress" style={{ 
                                width: selectedOrder.order_status === 'delivered' ? '100%' : 
                                       selectedOrder.order_status === 'shipped' ? '66%' : 
                                       selectedOrder.order_status === 'cancelled' ? '0%' : '33%' 
                              }}></div>
                            </div>
                            <div className="timeline-steps">
                              <div className={`t-step ${['pending','confirmed','processing','shipped','delivered'].includes(selectedOrder.order_status) ? 'active' : ''}`}>
                                <div className="t-dot"></div><span>Ordered</span>
                              </div>
                              <div className={`t-step ${['shipped','delivered'].includes(selectedOrder.order_status) ? 'active' : ''}`}>
                                <div className="t-dot"></div><span>Shipped</span>
                              </div>
                              <div className={`t-step ${selectedOrder.order_status === 'delivered' ? 'active' : ''}`}>
                                <div className="t-dot"></div><span>Delivered</span>
                              </div>
                            </div>
                            {selectedOrder.order_status === 'cancelled' && (
                              <div className="text-red font-medium text-center mt-2">Order Cancelled</div>
                            )}
                          </div>
                          
                          <div className="od-section">
                            <h4>Delivery Address</h4>
                            <p className="od-text">{selectedOrder.delivery_address}</p>
                            <p className="od-text">{selectedOrder.delivery_city}, {selectedOrder.delivery_state} - {selectedOrder.delivery_pincode}</p>
                            {selectedOrder.tracking_url && (
                              <a href={selectedOrder.tracking_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm mt-3" style={{display:'inline-block'}}>
                                Track Package
                              </a>
                            )}
                          </div>

                          <div className="od-section">
                            <h4>Items Ordered</h4>
                            <div className="od-items">
                              {selectedOrder.items?.map(item => (
                                <div key={item.id} className="od-item">
                                  <div className="od-item-info" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
                                    <div>
                                      <span className="od-qty">{item.quantity}x </span>
                                      <span className="od-name">{item.product_name || `Product #${item.product}`}</span>
                                    </div>
                                    <div className="text-muted text-sm mt-1">Sold by: {item.seller_name}</div>
                                    {item.variants && Object.keys(item.variants).length > 0 && (
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        {Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                                      </div>
                                    )}
                                  </div>
                                  <div className="od-price">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="od-summary">
                            <div className="summary-row"><span>Item Subtotal:</span><span>₹{selectedOrder.total_amount}</span></div>
                            {parseFloat(selectedOrder.discount_amount) > 0 && (
                              <div className="summary-row text-green"><span>Promotion Applied:</span><span>-₹{selectedOrder.discount_amount}</span></div>
                            )}
                            <div className="summary-row"><span>Shipping:</span><span>₹{selectedOrder.shipping_charge}</span></div>
                            <div className="summary-row summary-total"><span>Grand Total:</span><span>₹{selectedOrder.final_amount}</span></div>
                          </div>

                          {['pending', 'confirmed'].includes(selectedOrder.order_status) && (
                            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                              <button
                                className="btn-link text-red"
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                              >
                                {cancelling ? 'Cancelling...' : 'Cancel this order'}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="empty-selection card">
                          <Package size={48} className="text-muted" style={{opacity: 0.3, marginBottom: '1rem'}} />
                          <h4>Select an order</h4>
                          <p className="text-muted text-center">Click on any order from the list to view its complete details here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in">
                <div className="flex-between mb-4">
                  <h2 className="tab-heading mb-0">Login & Security</h2>
                  {!editing ? (
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit Details</button>
                  ) : (
                    <div className="flex-center gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={savingProfile}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={savingProfile}>
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="card ds-card">
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
                    <label className="form-label">Email Address (Read Only)</label>
                    <input type="email" className="form-input" value={user.email} disabled />
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
                  
                  {!editing && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <button className="btn btn-outline btn-sm">Change Password</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── ADDRESSES TAB ── */}
            {activeTab === 'addresses' && (
              <div className="animate-in fade-in">
                <div className="flex-between mb-4">
                  <h2 className="tab-heading mb-0">Your Addresses</h2>
                </div>

                <div className="addresses-grid">
                  <div className="address-card add-new-address" onClick={() => { setActiveTab('security'); setEditing(true); }}>
                    <Plus size={32} className="text-muted" />
                    <h3>Add Address</h3>
                  </div>

                  {(form.address || form.city) && (
                    <div className="address-card">
                      <div className="address-badge">Default</div>
                      <h4 className="font-medium text-primary mb-2">{form.first_name} {form.last_name}</h4>
                      <p className="text-secondary mb-1">{form.address}</p>
                      <p className="text-secondary mb-1">{form.city}, {form.state} {form.pincode}</p>
                      <p className="text-secondary mb-3">Phone number: {form.phone}</p>
                      <div className="address-actions">
                        <button className="btn-link" onClick={() => { setActiveTab('security'); setEditing(true); }}>Edit</button>
                        <span className="text-muted mx-2">|</span>
                        <button className="btn-link text-red">Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── WISHLIST TAB ── */}
            {activeTab === 'wishlist' && (
              <div className="animate-in fade-in">
                <h2 className="tab-heading">Your Wishlist</h2>
                <div className="empty-state card">
                  <Heart size={48} className="text-muted" style={{opacity: 0.3, marginBottom: '1rem'}} />
                  <h3>Your wishlist is empty</h3>
                  <p className="text-muted">Save items you want to buy later by clicking the heart icon on products.</p>
                  <button className="btn btn-outline mt-3" onClick={() => navigate('/shops')}>Explore Products</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Icon helper
function StoreIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>;
}
