import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Star, Phone, Search, Grid } from 'lucide-react';
import { shopAPI, productAPI } from '../api';
import { useLocation } from '../context/LocationContext';
import './NearbyShopsPage.css';

const CAT_EMOJIS = {
  'Vegetables': '🥬', 'Fruits': '🍎', 'Dairy': '🥛',
  'Spices': '🌿', 'Grains': '🌾', 'Snacks': '🥜',
  'Meat': '🍖', 'Beverages': '🧃', 'Bakery': '🍞',
  'Personal Care': '🧴', 'Home & Living': '🏠', 'Electronics': '📱',
  'Clothing': '👕', 'Stationery': '📚', 'Pharmacy': '💊',
};

export default function NearbyShopsPage() {
  const { location } = useLocation();
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locating, setLocating] = useState(false);

  // Fetch categories once
  useEffect(() => {
    productAPI.getCategories()
      .then(res => setCategories(res.data.results || res.data))
      .catch(() => {});
  }, []);

  const fetchShops = async (lat = null, lng = null) => {
    setLoading(true);
    try {
      let res;
      if (lat && lng) {
        res = await shopAPI.getNearbyShops(lat, lng);
      } else {
        const params = { page_size: 50 };
        if (location?.district) params.city = location.district;
        if (selectedCategory) params.category = selectedCategory;
        res = await shopAPI.getShops(params);
      }
      setShops(res.data.results || res.data);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShops(); }, [location?.district, selectedCategory]);

  const handleLocationSearch = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchShops(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Could not get your location.');
      }
    );
  };

  const filteredShops = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        <div className="shops-header">
          <div>
            <div className="section-label"><MapPin size={14} /> Find Local</div>
            <h1 id="shops-heading">
              {location ? `Shops in ${location.name}` : 'Nearby Shops'}
            </h1>
            <p className="section-subtitle">
              {location
                ? `Showing all registered shops and sellers in ${location.district}, ${location.state}`
                : 'Support your neighbourhood businesses'}
            </p>
          </div>
          <div className="shops-controls">
            <div className="shops-search">
              <Search size={15} className="ss-icon" />
              <input
                id="shop-search"
                type="text"
                placeholder="Search by name or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              id="locate-me-btn"
              className="btn btn-primary btn-sm"
              onClick={handleLocationSearch}
              disabled={locating}
            >
              <Navigation size={14} /> {locating ? 'Locating...' : 'Use My Location'}
            </button>
          </div>
        </div>

        {/* Category Filter Row */}
        {categories.length > 0 && (
          <div style={{
            display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.75rem',
            marginBottom: '1.5rem', scrollbarWidth: 'none'
          }}>
            {/* "All" chip */}
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
                padding: '0.45rem 1rem', borderRadius: '999px', border: '1.5px solid',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s',
                borderColor: selectedCategory === null ? 'var(--primary-color)' : 'var(--border-color)',
                background: selectedCategory === null ? 'var(--primary-color)' : 'transparent',
                color: selectedCategory === null ? '#fff' : 'var(--text-gray)',
              }}
            >
              <Grid size={13} /> All
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
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
        )}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filteredShops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <h3>No shops found</h3>
            <p>Try selecting a different category or area</p>
          </div>
        ) : (
          <div className="shops-page-grid">
            {filteredShops.map(shop => (
              <Link to={`/shops/${shop.id}`} key={shop.id} className="sp-card card" id={`shop-card-${shop.id}`}>
                <div className="sp-header">
                  <div className="sp-avatar">{shop.name[0]}</div>
                  <div className="sp-info">
                    <h3 className="sp-name">{shop.name}</h3>
                    <div className="sp-meta">
                      <span className="sp-rating">
                        <Star size={12} fill="currentColor" /> {shop.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="sp-dot">•</span>
                      <span className={`sp-status ${shop.verification_status === 'verified' ? 'verified' : ''}`}>
                        {shop.verification_status}
                      </span>
                    </div>
                  </div>
                </div>

                {shop.description && <p className="sp-desc">{shop.description.slice(0, 100)}...</p>}

                <div className="sp-footer">
                  <div className="sp-item"><MapPin size={13} /> {shop.city}, {shop.state}</div>
                  <div className="sp-item"><Phone size={13} /> Call Shop</div>
                </div>
                {shop.distance && (
                  <div className="sp-distance">{shop.distance.toFixed(1)} km away</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
