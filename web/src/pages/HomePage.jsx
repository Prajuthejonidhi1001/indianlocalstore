import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Star, ArrowRight, Navigation, Grid, TrendingUp, Clock, Zap, ChevronRight, Store } from 'lucide-react';
import { productAPI, shopAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import './HomePage.css';

const CAT_EMOJIS = {
  'Vegetables': '🥬', 'Fruits': '🍎', 'Dairy': '🥛', 'Spices': '🌿',
  'Grains': '🌾', 'Snacks': '🥜', 'Meat': '🍖', 'Beverages': '🧃',
  'Bakery': '🍞', 'Personal Care': '🧴', 'Home & Living': '🏠',
  'Electronics': '📱', 'Clothing': '👕', 'Pharmacy': '💊',
  'Fashion': '👗', 'Agriculture': '🌱', 'Automobile': '🚗',
  'Construction': '🏗️', 'Furniture': '🪑', 'Furnitures': '🪑',
  'Mart': '🏪', 'Traders': '📦', 'Event Management': '🎉',
  'Second Hand Vehicles': '🚙',
};

const CAT_GRADIENTS = [
  'linear-gradient(135deg,#FF6B35,#FF8C42)',
  'linear-gradient(135deg,#5521FF,#7C3AED)',
  'linear-gradient(135deg,#00C896,#00A878)',
  'linear-gradient(135deg,#FFB627,#FF9500)',
  'linear-gradient(135deg,#E91E8C,#C2185B)',
  'linear-gradient(135deg,#00B4D8,#0077B6)',
  'linear-gradient(135deg,#FF4757,#E84393)',
  'linear-gradient(135deg,#2ED573,#1E9E56)',
  'linear-gradient(135deg,#FFA502,#FF6348)',
  'linear-gradient(135deg,#747D8C,#2F3542)',
];

function ShopSkeleton() {
  return (
    <div className="shop-card-skeleton card">
      <div className="sks-banner shimmer" />
      <div className="sks-body">
        <div className="sks-row">
          <div className="sks-avatar shimmer" />
          <div className="sks-lines">
            <div className="sks-line shimmer" style={{ width: '70%' }} />
            <div className="sks-line shimmer" style={{ width: '40%', height: '10px', marginTop: '6px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { location } = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [greeting, setGreeting] = useState('');
  const catScrollRef = useRef(null);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [catRes, shopRes] = await Promise.all([
          productAPI.getCategories(),
          shopAPI.getShops({ page_size: 8, city: location?.district }),
        ]);
        setCategories(catRes.data.results || catRes.data);
        setShops(shopRes.data.results || shopRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [location?.district]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await shopAPI.getNearbyShops(pos.coords.latitude, pos.coords.longitude);
          setShops(res.data.results || res.data);
        } catch { setShops([]); } finally { setLocating(false); }
      },
      () => { setLocating(false); }
    );
  };

  const filteredShops = selectedCategory
    ? shops.filter(s => s.category === selectedCategory || s.categories?.includes(selectedCategory))
    : shops;

  return (
    <div className="page animate-in">
      {/* ── WELCOME HERO ── */}
      <div className="home-hero">
        <div className="home-hero-orb home-orb-1" />
        <div className="home-hero-orb home-orb-2" />
        <div className="container home-hero-inner">
          <div className="home-hero-text">
            <p className="home-time-label">
              <Clock size={13} /> {greeting}
            </p>
            <h1 className="home-greeting">
              Namaste, <span className="gradient-text">{user?.first_name || user?.username || 'Guest'}!</span> 🙏
            </h1>
            <p className="home-greeting-sub">
              {location ? `Exploring local shops and comparing prices near ${location.name}` : 'Discover local shops & compare prices near you'}
            </p>
          </div>
          <div className="home-hero-actions">
            <button className="btn btn-primary" onClick={handleLocateMe} disabled={locating} id="locate-me-btn">
              <Navigation size={15} /> {locating ? 'Locating...' : 'Near Me'}
            </button>
            <Link to="/shops" className="btn btn-secondary" id="browse-products-btn">
              <Store size={15} /> Browse Shops
            </Link>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="home-stats-bar">
          <div className="container home-stats-inner">
            {[
              { icon: '🏪', label: 'Local Shops', value: '500+' },
              { icon: '📦', label: 'Products', value: '10K+' },
              { icon: '⭐', label: 'Avg Rating', value: '4.8' },
              { icon: '🚀', label: 'Fast Delivery', value: '< 30 min' },
            ].map((s, i) => (
              <div key={i} className="home-stat-item">
                <span className="hs-icon">{s.icon}</span>
                <div>
                  <div className="hs-value">{s.value}</div>
                  <div className="hs-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── CATEGORIES ── */}
        <section className="section-sm">
          <div className="home-section-header">
            <div>
              <div className="section-label"><ShoppingBag size={12} /> Categories</div>
              <h2 className="home-section-title">What are you looking for?</h2>
            </div>
            <Link to="/categories" className="home-view-all" id="all-categories-link">
              All <ChevronRight size={14} />
            </Link>
          </div>

          {/* Scrollable category pills */}
          <div className="cat-scroll-row" ref={catScrollRef}>
            <button
              className={`cat-pill-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              <Grid size={14} /> All
            </button>
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                className={`cat-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              >
                {cat.icon
                  ? <img src={cat.icon} alt={cat.name} className="cat-pill-img" />
                  : <span>{CAT_EMOJIS[cat.name] || '🛍️'}</span>
                }
                {cat.name}
              </button>
            ))}
          </div>

          {/* Category icon grid */}
          <div className="home-cat-grid">
            {categories.slice(0, 10).map((cat, i) => (
              <Link
                to={`/categories`}
                key={cat.id}
                className="home-cat-card"
                id={`home-cat-${cat.id}`}
              >
                <div className="home-cat-icon" style={{ background: CAT_GRADIENTS[i % CAT_GRADIENTS.length] }}>
                  {cat.icon
                    ? <img src={cat.icon} alt={cat.name} className="home-cat-img" />
                    : <span className="home-cat-emoji">{CAT_EMOJIS[cat.name] || '🛍️'}</span>
                  }
                </div>
                <span className="home-cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── NEARBY SHOPS ── */}
        <section className="section-sm">
          <div className="home-section-header">
            <div>
              <div className="section-label"><MapPin size={12} /> Shops</div>
              <h2 className="home-section-title">
                {location ? `Near ${location.name}` : 'Local Shops'}
              </h2>
            </div>
            <Link to="/shops" className="home-view-all" id="all-shops-link">
              All <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="shops-grid">
              {[...Array(6)].map((_, i) => <ShopSkeleton key={i} />)}
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏪</div>
              <h3>No shops yet</h3>
              <p>Be the first seller in your area!</p>
              <Link to="/seller" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Open a Shop
              </Link>
            </div>
          ) : (
            <div className="shops-grid">
              {filteredShops.map(shop => (
                <Link to={`/shops/${shop.id}`} key={shop.id} className="shop-card-premium card" id={`shop-${shop.id}`}>
                  {/* Banner */}
                  <div className="scp-banner" style={{
                    background: shop.logo
                      ? `url(${shop.logo}) center/cover`
                      : `linear-gradient(135deg, ${CAT_GRADIENTS[shop.id % CAT_GRADIENTS.length].split(',')[1]?.trim() || '#FF6B35'}, #0A0D14)`
                  }}>
                    <div className="scp-banner-overlay" />
                    <span className={`scp-status ${shop.is_open ? 'open' : 'closed'}`}>
                      <span className="scp-dot" /> {shop.is_open ? 'Open' : 'Closed'}
                    </span>
                    {shop.verification_status === 'verified' && (
                      <span className="scp-verified">✓ Verified</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="scp-body">
                    <div className="scp-avatar" style={{ background: CAT_GRADIENTS[shop.id % CAT_GRADIENTS.length] }}>
                      {shop.logo
                        ? <img src={shop.logo} alt={shop.name} />
                        : <span>{shop.name[0]}</span>
                      }
                    </div>
                    <div className="scp-info">
                      <h4 className="scp-name">{shop.name}</h4>
                      <p className="scp-city"><MapPin size={11} /> {shop.city}</p>
                    </div>
                    <div className="scp-rating">
                      <Star size={12} fill="currentColor" />
                      <span>{shop.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>

                  {shop.description && (
                    <p className="scp-desc">{shop.description.slice(0, 75)}...</p>
                  )}

                  <div className="scp-footer">
                    <span className="scp-cta">View Shop <ArrowRight size={13} /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── TRENDING BANNER ── */}
        <section className="section-sm">
          <div className="home-promo-banner">
            <div className="hpb-orb" />
            <div className="hpb-content">
              <div className="section-label"><TrendingUp size={12} /> Trending</div>
              <h3>Find the Best Prices<br />From Local Sellers Near You</h3>
              <p>Compare product prices across neighbourhood stores to get the best deals from verified local shops.</p>
              <Link to="/shops" className="btn btn-primary" id="trending-products-btn">
                Explore Shops <ArrowRight size={15} />
              </Link>
            </div>
            <div className="hpb-emojis" aria-hidden="true">
              {['🥬', '🍎', '🥛', '🌿', '📱', '👗'].map((e, i) => (
                <span key={i} className="hpb-emoji" style={{ '--delay': `${i * 0.4}s` }}>{e}</span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
