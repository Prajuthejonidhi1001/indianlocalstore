import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import toast from 'react-hot-toast';
import { FiUsers, FiShoppingBag, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getDashboardStats();
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const loadShops = async () => {
    try {
      const res = await adminAPI.getShops();
      setShops(res.data);
    } catch (err) {
      toast.error('Failed to load shops');
    }
  };

  const loadOrders = async () => {
    try {
      const res = await adminAPI.getOrders();
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders');
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) loadUsers();
    if (activeTab === 'shops' && shops.length === 0) loadShops();
    if (activeTab === 'orders' && orders.length === 0) loadOrders();
  }, [activeTab]);

  const handleUpdateRole = async (userId, role) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      toast.success('Role updated successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleVerifyShop = async (shopId) => {
    try {
      await adminAPI.verifyShop(shopId);
      toast.success('Shop verified successfully');
      loadShops();
    } catch (error) {
      toast.error('Failed to verify shop');
    }
  };

  if (loading || !stats) {
    return <div className="admin-loading">Loading Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard container">
      <div className="admin-sidebar">
        <h2 className="admin-title">Super Admin</h2>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          <button className={`admin-nav-item ${activeTab === 'shops' ? 'active' : ''}`} onClick={() => setActiveTab('shops')}>Shops</button>
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
        </nav>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="admin-overview">
            <h2>Dashboard Overview</h2>
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-icon"><FiDollarSign /></div>
                <div className="stat-info">
                  <p>Total Revenue</p>
                  <h3>₹{stats.total_revenue?.toFixed(2)}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><FiUsers /></div>
                <div className="stat-info">
                  <p>Total Users</p>
                  <h3>{stats.total_users}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><FiShoppingBag /></div>
                <div className="stat-info">
                  <p>Active Shops</p>
                  <h3>{stats.total_shops}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><FiCheckCircle /></div>
                <div className="stat-info">
                  <p>Total Products</p>
                  <h3>{stats.total_products}</h3>
                </div>
              </div>
            </div>

            <div className="recent-orders">
              <h3>Recent Orders</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_orders?.map(order => (
                    <tr key={order.id}>
                      <td>#{order.order_id}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${order.order_status}`}>{order.order_status.toUpperCase()}</span>
                      </td>
                      <td>₹{order.final_amount}</td>
                    </tr>
                  ))}
                  {stats.recent_orders?.length === 0 && (
                    <tr><td colSpan="4" style={{textAlign: 'center'}}>No recent orders.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-users">
            <h2>User Management</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Phone / Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.phone || u.email || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${u.role}`}>{u.role.toUpperCase()}</span>
                    </td>
                    <td>
                      <select 
                        value={u.role} 
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="admin-select"
                      >
                        <option value="customer">Customer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'shops' && (
          <div className="admin-shops">
            <h2>Shop Management</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.city}</td>
                    <td>
                      <span className={`badge badge-${s.verification_status}`}>{s.verification_status.toUpperCase()}</span>
                    </td>
                    <td>
                      {s.verification_status !== 'verified' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleVerifyShop(s.id)}>Verify Shop</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-orders">
            <h2>Platform Orders</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Shop</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>#{o.order_id}</td>
                    <td>{o.shop_name}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${o.order_status}`}>{o.order_status.toUpperCase()}</span>
                    </td>
                    <td>₹{o.final_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
