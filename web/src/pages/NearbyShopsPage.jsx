import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const { location } = useLocation();
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  const initialCat = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState(
    initialCat ? (isNaN(initialCat) ? initialCat : parseInt(initialCat, 10)) : null
  );
  
  const initialSubCat = searchParams.get('subcategory');
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    initialSubCat ? parseInt(initialSubCat, 10) : null
  );
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);

  // Fetch categories once
  useEffect(() => {
    productAPI.getCategories()
      .then(res => setCategories(res.data.results || res.data))
      .catch(() => {});
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      productAPI.getSubCategories(selectedCategory)
        .then(res => setSubcategories(res.data.results || res.data))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      let res;
      if (coords?.lat && coords?.lng) {
        res = await shopAPI.getNearbyShops({ 
          latitude: coords.lat, 
          longitude: coords.lng,
          category: selectedCategory,
          subcategory: selectedSubcategory
        });
      } else {
        const params = { page_size: 50 };
        if (location?.district) params.city = location.district;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedSubcategory) params.subcategory = selectedSubcategory;
        res = await shopAPI.getShops(params);
      }
      setShops(res.data.results || res.data);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShops(); }, [location?.district, selectedCategory, selectedSubcategory, coords]);

  const handleLocationSearch = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
      }
    );
  };

  // Auto locate on mount
  useEffect(() => {
    handleLocationSearch();
  }, []);

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
          <div className="shops-search-row mt-3">
            <div className="shops-search-wrap">
              <Search size={15} className="shops-search-icon" />
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
            marginBottom: selectedCategory ? '0.5rem' : '1.5rem', scrollbarWidth: 'none'
          }}>
            <button
              onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }}
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
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                  setSelectedSubcategory(null);
                }}
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

        {/* Subcategory Filter Row */}
        {selectedCategory && subcategories.length > 0 && (
          <div style={{
            display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem',
            marginBottom: '1.5rem', scrollbarWidth: 'none'
          }}>
            <button
              onClick={() => setSelectedSubcategory(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
                padding: '0.35rem 0.8rem', borderRadius: '8px', border: '1px solid',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', transition: 'all 0.2s',
                borderColor: selectedSubcategory === null ? 'var(--secondary-color)' : 'var(--border-color)',
                background: selectedSubcategory === null ? 'rgba(255, 182, 39, 0.1)' : 'transparent',
                color: selectedSubcategory === null ? 'var(--secondary-color)' : 'var(--text-light)',
              }}
            >
              All Types
            </button>
            {subcategories.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(selectedSubcategory === sub.id ? null : sub.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
                  padding: '0.35rem 0.8rem', borderRadius: '8px', border: '1px solid',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', transition: 'all 0.2s',
                  borderColor: selectedSubcategory === sub.id ? 'var(--secondary-color)' : 'var(--border-color)',
                  background: selectedSubcategory === sub.id ? 'rgba(255, 182, 39, 0.1)' : 'transparent',
                  color: selectedSubcategory === sub.id ? 'var(--secondary-color)' : 'var(--text-light)',
                }}
              >
                {sub.icon && <img src={sub.icon} alt="" style={{ width: 14, height: 14, borderRadius: '3px', objectFit: 'cover' }} />}
                {sub.name}
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
          <div className="shops-cards-grid">
            {filteredShops.map((shop, i) => {
              const avatarColor = `hsl(${(shop.name.charCodeAt(0) * 37) % 360}, 60%, 42%)`;
              const logoSrc = shop.logo
                ? (shop.logo.startsWith('http') ? shop.logo : `/media/${shop.logo}`)
                : null;

              return (
                <Link
                  to={`/shops/${shop.id}`}
                  key={shop.id}
                  className={`shop-card-ns animate-in stagger-${(i % 10) + 1}`}
                  id={`shop-card-${shop.id}`}
                >
                  {/* Banner */}
                  <div className="scn-banner">
                    {logoSrc && <img src={logoSrc} alt={shop.name} />}
                    <div className="scn-banner-overlay" />
                    <div className="scn-tags">
                      <span className="scn-open-tag">
                        <span className="scn-open-dot" />
                        {shop.is_open ? 'Open' : 'Closed'}
                      </span>
                      {shop.verification_status === 'verified' && (
                        <span className="scn-verified-tag">✓ Verified</span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="scn-body">
                    <div className="scn-row1">
                      {/* Avatar */}
                      <div className="scn-avatar" style={{ background: avatarColor }}>
                        {logoSrc
                          ? <img src={logoSrc} alt={shop.name} />
                          : shop.name[0].toUpperCase()
                        }
                      </div>
                      <div className="scn-info">
                        <div className="scn-name">{shop.name}</div>
                        <div className="scn-city">
                          <MapPin size={11} /> {shop.city}
                        </div>
                      </div>
                      <div className="scn-rating">
                        <Star size={13} fill="currentColor" />
                        {shop.rating?.toFixed(1) || '0.0'}
                      </div>
                    </div>

                    <div className="scn-footer">
                      <span className="scn-phone">
                        <Phone size={12} />
                        {shop.reviews_count || 0} review{shop.reviews_count !== 1 ? 's' : ''}
                      </span>
                      <span className="scn-cta">
                        Visit Shop →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

