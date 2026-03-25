import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Star, ArrowRight, Navigation, Grid } from 'lucide-react';
import { productAPI, shopAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import './HomePage.css';
import './CategoriesPage.css';

const EMOJIS = ['🥬', '🍎', '🥛', '🌿', '🌾', '🥜', '🧴', '🏠', '🐟', '🍬', '🥦', '🫙'];
import { ChevronDown } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { location } = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCats, setExpandedCats] = useState({});

  const toggleCat = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

          {/* Category Accordions (Imported from Categories Page) */}
          <div className="categories-list" style={{ marginTop: '1rem' }}>
            {categories.map((cat, i) => (
              <div key={cat.id} className="cat-section" id={`cat-section-${cat.id}`}>
                <div className="cat-section-header clickable" onClick={() => toggleCat(cat.id)}>
                  {cat.icon ? (
                    <img src={cat.icon} alt={cat.name} className="cat-section-img" />
                  ) : (
                    <div className="cat-page-emoji">{EMOJIS[i % EMOJIS.length]}</div>
                  )}
                  <div className="cat-section-title">
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-dark)' }}>{cat.name}</h2>
                    {cat.description && <p style={{ margin: '4px 0 0', color: 'var(--text-gray)', fontSize: '0.9rem' }}>{cat.description}</p>}
                  </div>
                  <ChevronDown className={`cat-chevron ${expandedCats[cat.id] ? 'expanded' : ''}`} />
                </div>
                
                {expandedCats[cat.id] && (
                  cat.subcategories?.length > 0 ? (
                  <div className="subcat-grid">
                    {cat.subcategories.map((sub, j) => (
                      <Link to={`/products?category=${cat.id}&subcategory=${sub.id}`} key={sub.id} className="subcat-card card" id={`subcat-${sub.id}`}>
                        {sub.icon ? (
                          <img src={sub.icon} alt={sub.name} className="subcat-img" />
                        ) : (
                          <div className="subcat-emoji">{EMOJIS[(i + j + 1) % EMOJIS.length]}</div>
                        )}
                        <span className="subcat-name">{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="subcat-empty">No subcategories available.</div>
                ))}
              </div>
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
