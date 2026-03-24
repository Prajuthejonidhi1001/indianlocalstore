import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Store, Search, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LocationSearchBar from './LocationSearchBar';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, isSeller, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shops?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to={isAuthenticated ? '/home' : '/'} className="navbar-logo">
          <div className="logo-icon">
            <Store size={22} />
          </div>
          <span className="logo-text">Indian<span className="logo-accent">LocalStore</span></span>
        </Link>

        {/* Location Search API Integration */}
        <LocationSearchBar />

        {/* Search (desktop) */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <Search size={16} className="search-icon" />
          <input
            id="navbar-search"
            type="text"
            placeholder="Search local shops..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        {/* Nav Links (desktop) */}
        <div className="navbar-links">
          <Link to="/categories" className={`nav-link ${isActive('/categories') ? 'active' : ''}`}>Categories</Link>
          <Link to="/shops" className={`nav-link ${isActive('/shops') ? 'active' : ''}`}>Shops</Link>

          {isAuthenticated ? (
            <>
              {/* Cart */}
              <Link to="/cart" id="cart-btn" className="nav-icon-btn">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              {/* User Menu */}
              <div className="user-menu-wrapper">
                <button
                  id="user-menu-btn"
                  className="user-avatar-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="avatar">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown" id="user-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user?.first_name || user?.username}</p>
                      <p className="dropdown-role">{user?.role}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User size={15} /> Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Package size={15} /> My Orders
                    </Link>
                    {isSeller && (
                      <Link to="/seller" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <LayoutDashboard size={15} /> Seller Dashboard
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} id="mobile-menu-btn">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <LocationSearchBar />
          <form className="mobile-search" style={{marginTop: '0'}} onSubmit={handleSearch}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Search local shops..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
          <Link to="/categories" className="mobile-link" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link to="/shops" className="mobile-link" onClick={() => setMenuOpen(false)}>Shops</Link>
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="mobile-link" onClick={() => setMenuOpen(false)}>Cart {cartCount > 0 && `(${cartCount})`}</Link>
              <Link to="/orders" className="mobile-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>Profile</Link>
              {isSeller && <Link to="/seller" className="mobile-link" onClick={() => setMenuOpen(false)}>Seller Dashboard</Link>}
              <button className="mobile-link danger" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
