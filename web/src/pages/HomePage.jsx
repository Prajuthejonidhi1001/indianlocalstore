import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { productAPI, shopAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const CATEGORIES_EMOJI = {
  'Vegetables': '🥬', 'Fruits': '🍎', 'Dairy': '🥛',
  'Spices': '🌿', 'Grains': '🌾', 'Snacks': '🥜',
};

export default function HomePage() {
  const { user } = useAuth();
  const { location } = useLocation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes, shopRes] = await Promise.all([
          productAPI.getCategories(),
          productAPI.getProducts({ page_size: 8 }),
          shopAPI.getShops({ page_size: 6, city: location?.district }),
        ]);
        setCategories(catRes.data.results || catRes.data);
        setProducts(prodRes.data.results || prodRes.data);
        setShops(shopRes.data.results || shopRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [location?.district]);

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
                ? `Discover fresh products from local shops near ${location.name}, ${location.pincode}`
                : "Discover fresh products from local shops near you"}
            </p>
          </div>
          <Link to="/products" className="btn btn-primary" id="shop-now-btn">
            Shop Now <ArrowRight size={16} />
          </Link>
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
          <div className="home-categories">
            {categories.slice(0, 8).map(cat => (
              <Link
                to={`/products?category=${cat.id}`}
                key={cat.id}
                className="home-cat-item"
                id={`home-cat-${cat.id}`}
              >
                {cat.icon ? (
                  <img src={cat.icon} alt={cat.name} className="home-cat-img" />
                ) : (
                  <div className="home-cat-emoji">
                    {CATEGORIES_EMOJI[cat.name] || '🛍️'}
                  </div>
                )}
                <p>{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="section-sm">
          <div className="section-header flex-between">
            <div>
              <div className="section-label"><TrendingUp size={13} /> Featured</div>
              <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Fresh Arrivals</h2>
            </div>
            <Link to="/products" className="btn btn-ghost btn-sm" id="all-products-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No products yet</h3>
              <p>Check back soon for fresh arrivals.</p>
            </div>
          ) : (
            <div className="grid grid-auto gap-3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Nearby Shops */}
        <section className="section-sm">
          <div className="section-header flex-between">
            <div>
              <div className="section-label"><MapPin size={13} /> Shops</div>
              <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
                {location ? `Local Shops near ${location.name}` : `Local Shops`}
              </h2>
            </div>
            <Link to="/shops" className="btn btn-ghost btn-sm" id="all-shops-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {shops.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏪</div>
              <h3>No shops registered yet</h3>
            </div>
          ) : (
            <div className="shops-grid">
              {shops.map(shop => (
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
