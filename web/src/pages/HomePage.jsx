import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Star, ArrowRight, Navigation, Grid } from 'lucide-react';
import { productAPI, shopAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import './HomePage.css';

const CAT_EMOJIS = {
  'Vegetables': '🥬', 'Fruits': '🍎', 'Dairy': '🥛',
  'Spices': '🌿', 'Grains': '🌾', 'Snacks': '🥜',
  'Meat': '🍖', 'Beverages': '🧃', 'Bakery': '🍞',
  'Personal Care': '🧴', 'Home & Living': '🏠', 'Electronics': '📱',
  'Clothing': '👕', 'Stationery': '📚', 'Pharmacy': '💊',
};

export default function HomePage() {
  const { user } = useAuth();
  const { location } = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
  };

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
      () => { setLocating(false); alert('Could not get your location.'); }
    );
  };

  const filteredShops = selectedCategory
    ? shops.filter(s => s.category === selectedCategory || s.categories?.includes(selectedCategory))
    : shops;

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page animate-in">
      {/* Welcome Banner */}
      <div className="home-banner">
        <div className="container home-banner-inner">
          <div>
            <h1 className="home-greeting">
              Namaste, <span className="gradient-text">{user?.first_name || user?.username || 'Guest'}!</span> 🙏
            </h1>
            <p className="home-greeting-sub">
              {location
                ? `Discover local shops near ${location.name}`
                : 'Discover local shops near you'}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleLocateMe}
            disabled={locating}
          >
            <Navigation size={16} /> {locating ? 'Finding...' : 'Use My Location'}
          </button>
        </div>
      </div>

      <div className="container">
        {/* Categories */}
        <section className="section-sm">
          <div className="section-header flex-between">
            <div>
              <div className="section-label"><ShoppingBag size={13} /> Categories</div>
              <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Browse by Category</h2>
            </div>
            <Link to="/categories" className="btn btn-ghost btn-sm" id="all-categories-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {/* Category pill filters */}
          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.75rem', scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
                padding: '0.45rem 1rem', borderRadius: '999px', border: '1.5px solid',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s',
                borderColor: !selectedCategory ? 'var(--primary-color)' : 'var(--border-color)',
                background: !selectedCategory ? 'var(--primary-color)' : 'transparent',
                color: !selectedCategory ? '#fff' : 'var(--text-gray)',
              }}
            >
              <Grid size={13} /> All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
                  padding: '0.45rem 1rem', borderRadius: '999px', border: '1.5px solid',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', transition: 'all 0.2s',
                  borderColor: selectedCategory === cat.id ? 'var(--primary-color)' : 'var(--border-color)',
                  background: selectedCategory === cat.id ? 'var(--primary-color)' : 'transparent',
                  color: selectedCategory === cat.id ? '#fff' : 'var(--text-light)',
                }}
              >
                {cat.icon
                  ? <img src={cat.icon} alt="" style={{ width: 16, height: 16, borderRadius: '4px', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '1rem' }}>{CAT_EMOJIS[cat.name] || '🛍️'}</span>
                }
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Nearby Shops */}
        <section className="section-sm">
          <div className="section-header flex-between">
            <div>
              <div className="section-label"><MapPin size={13} /> Shops</div>
              <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
                {location ? `Local Shops near ${location.name}` : 'Local Shops'}
              </h2>
            </div>
            <Link to="/shops" className="btn btn-ghost btn-sm" id="all-shops-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {filteredShops.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏪</div>
              <h3>No shops registered yet</h3>
              <p>Be the first seller in your area!</p>
            </div>
          ) : (
            <div className="shops-grid">
              {filteredShops.map(shop => (
                <Link to={`/shops/${shop.id}`} key={shop.id} className="shop-card card" id={`shop-${shop.id}`}>
                  <div className="shop-header">
                    <div className="shop-avatar">{shop.name[0]}</div>
                    <div>
                      <h4 className="shop-name">{shop.name}</h4>
                      <p className="shop-city"><MapPin size={12} /> {shop.city}</p>
                    </div>
                    <div className="shop-rating">
                      <Star size={13} fill="currentColor" color="var(--gold)" />
                      <span>{shop.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  {shop.description && (
                    <p className="shop-desc">{shop.description.slice(0, 80)}...</p>
                  )}
                  <span className={`badge ${shop.verification_status === 'verified' ? 'badge-green' : 'badge-orange'}`}>
                    {shop.verification_status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
