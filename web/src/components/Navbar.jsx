import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Store, Search, LogOut, Package, LayoutDashboard, Grid, ChevronDown, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productAPI } from '../api';
import LocationSearchBar from './LocationSearchBar';
import CartDrawer from './CartDrawer';
import './Navbar.css';

const RECENT_SEARCHES = ['Fresh Vegetables', 'Wireless Earbuds', 'Men\'s T-Shirts'];
const POPULAR_SEARCHES = ['Organic Fruits', 'Running Shoes', 'Smart Watches'];

export default function Navbar() {
  const { isAuthenticated, user, isSeller, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useRouterLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Mega Menu State
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Search Focus State
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    // Fetch categories for mega menu
    productAPI.getCategories()
      .then(res => setCategories(res.data.results || res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shops?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setSearchFocused(false);
      setMenuOpen(false);
    }
  };

  const handleSuggestionClick = (term) => {
    navigate(`/shops?q=${encodeURIComponent(term)}`);
    setSearchFocused(false);
    setSearch('');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to={isAuthenticated ? '/home' : '/'} className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Indian Local Store" style={{ height: '36px', width: 'auto', borderRadius: '6px' }} />
        </Link>

        {/* Location Search API Integration */}
        <div className="d-none d-lg-block">
          <LocationSearchBar />
        </div>

        {/* Enhanced Search (desktop) */}
        <div className="navbar-search-container" ref={searchRef}>
          <form className="navbar-search" onSubmit={handleSearch}>
            <Search size={16} className="search-icon" />
            <input
              id="navbar-search"
              type="text"
              placeholder="Search products, brands and more..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
            />
          </form>
          
          {/* Search Dropdown / Hints */}
          {searchFocused && (
            <div className="search-dropdown-menu shadow-lg">
              <div className="sdm-section">
                <h6><Clock size={14}/> Recent Searches</h6>
                <div className="sdm-list">
                  {RECENT_SEARCHES.map((term, i) => (
                    <button key={i} type="button" onClick={() => handleSuggestionClick(term)}>{term}</button>
                  ))}
                </div>
              </div>
              <div className="sdm-section">
                <h6><TrendingUp size={14} className="text-saffron"/> Popular Right Now</h6>
                <div className="sdm-list">
                  {POPULAR_SEARCHES.map((term, i) => (
                    <button key={i} type="button" onClick={() => handleSuggestionClick(term)}>{term}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nav Links (desktop) */}
        <div className="navbar-links">
          
          {/* Categories Mega Menu */}
          <div 
            className="mega-menu-trigger"
            onMouseEnter={() => setShowMegaMenu(true)}
            onMouseLeave={() => setShowMegaMenu(false)}
          >
            <Link to="/categories" className={`nav-link ${isActive('/categories') ? 'active' : ''}`}>
               Categories <ChevronDown size={14} className="ml-1" style={{marginTop: '2px'}}/>
            </Link>
            
            {showMegaMenu && categories.length > 0 && (
              <div className="mega-menu-panel shadow-xl">
                <div className="mega-menu-grid">
                  {categories.slice(0, 12).map(cat => (
                    <Link key={cat.id} to={`/shops?category=${cat.id}`} className="mm-item">
                      <div className="mm-icon">
                        {cat.icon ? <img src={cat.icon} alt=""/> : '🛍️'}
                      </div>
                      <span className="mm-name truncate">{cat.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="mm-footer">
                  <Link to="/categories" className="btn-link">View All Categories</Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/shops" className={`nav-link ${isActive('/shops') ? 'active' : ''}`}>Shops</Link>

          {isAuthenticated ? (
            <>
              {/* Cart */}
              <button onClick={() => setCartDrawerOpen(true)} id="cart-btn" className="nav-icon-btn">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>

              {/* User Menu */}
              <div 
                className="user-menu-wrapper"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <Link
                  id="user-menu-btn"
                  className="user-avatar-btn"
                  to="/profile"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="avatar">
                    {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                  </div>
                </Link>
                {userMenuOpen && (
                  <div className="user-dropdown shadow-lg" id="user-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user?.first_name || user?.username}</p>
                      <p className="dropdown-role">{user?.role}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User size={15} /> Your Account
                    </Link>
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Package size={15} /> Your Orders
                    </Link>
                    {isSeller && (
                      <Link to="/seller" className="dropdown-item text-saffron" onClick={() => setUserMenuOpen(false)}>
                        <Store size={15} /> Seller Dashboard
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item text-red" onClick={handleLogout} id="logout-btn">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm ml-2">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          id="mobile-menu-btn"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu shadow-lg">
          <form className="mobile-search" onSubmit={handleSearch}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search local shops..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
          
          <LocationSearchBar />

          <div className="mobile-links mt-3">
            <Link to="/categories" onClick={() => setMenuOpen(false)}><Grid size={18}/> Categories</Link>
            <Link to="/shops" onClick={() => setMenuOpen(false)}><Store size={18}/> All Shops</Link>

            {isAuthenticated ? (
              <>
                <div className="mobile-divider" />
                <Link to="/profile" onClick={() => setMenuOpen(false)}><User size={18}/> Your Account</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)}><Package size={18}/> Your Orders</Link>
                <button
                  className="mobile-link-btn"
                  onClick={() => { setMenuOpen(false); setCartDrawerOpen(true); }}
                >
                  <ShoppingCart size={18}/> Cart ({cartCount})
                </button>
                {isSeller && (
                  <Link to="/seller" className="text-saffron" onClick={() => setMenuOpen(false)}>
                    <Store size={18}/> Seller Dashboard
                  </Link>
                )}
                <button className="mobile-link-btn text-red" onClick={handleLogout}>
                  <LogOut size={18}/> Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="mobile-divider" />
                <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="text-primary" onClick={() => setMenuOpen(false)}>Create Account</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </nav>
  );
}
