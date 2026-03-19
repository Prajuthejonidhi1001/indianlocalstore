import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, Star, ArrowRight, Zap, Shield, Clock, Truck } from 'lucide-react';
import './LandingPage.css';

const features = [
  { icon: <MapPin size={24} />, title: 'Find Nearby Shops', desc: 'Discover local shops in your area with real-time location.' },
  { icon: <Zap size={24} />, title: 'Fast Delivery', desc: 'Get fresh products delivered to your door quickly.' },
  { icon: <Shield size={24} />, title: 'Trusted Sellers', desc: 'All sellers are verified for your safety and trust.' },
  { icon: <Star size={24} />, title: 'Rated Products', desc: 'Read reviews and buy with confidence.' },
];

const categories = [
  { emoji: '🥬', name: 'Vegetables', color: '#2ECC71' },
  { emoji: '🍎', name: 'Fruits', color: '#E74C3C' },
  { emoji: '🥛', name: 'Dairy', color: '#3498DB' },
  { emoji: '🌿', name: 'Spices', color: '#FF6B35' },
  { emoji: '🍚', name: 'Grains', color: '#F39C12' },
  { emoji: '🧴', name: 'Personal Care', color: '#9B59B6' },
  { emoji: '🏠', name: 'Home & Living', color: '#1ABC9C' },
  { emoji: '🥜', name: 'Snacks', color: '#FFB627' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="container hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            Supporting Local Indian Businesses
          </div>
          <h1 className="hero-title">
            Shop <span className="gradient-text">Local.</span><br />
            Live <span className="gradient-text">Better.</span>
          </h1>
          <p className="hero-subtitle">
            Discover fresh products and trusted local shops in your neighbourhood. 
            From spices to groceries — everything local, everything fresh.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg" id="get-started-btn">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="btn btn-secondary btn-lg" id="browse-products-btn">
              <ShoppingBag size={18} /> Browse Products
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><span>500+</span><p>Local Shops</p></div>
            <div className="stat-divider" />
            <div className="stat"><span>10K+</span><p>Products</p></div>
            <div className="stat-divider" />
            <div className="stat"><span>50K+</span><p>Happy Customers</p></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card floating">
            <div className="hcard-icon">🛒</div>
            <div>
              <p className="hcard-title">Order Placed!</p>
              <p className="hcard-sub">₹240 • 3 items</p>
            </div>
          </div>
          <div className="hero-card floating-2">
            <div className="hcard-icon">⭐</div>
            <div>
              <p className="hcard-title">4.8 Rating</p>
              <p className="hcard-sub">Fresh Vegetables</p>
            </div>
          </div>
          <div className="hero-card floating-3">
            <div className="hcard-icon">🚚</div>
            <div>
              <p className="hcard-title">Fast Delivery</p>
              <p className="hcard-sub">30 min ETA</p>
            </div>
          </div>
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-label"><ShoppingBag size={14} /> Categories</div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find exactly what you need from local sellers</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link to={`/products?search=${cat.name}`} key={cat.name} className="cat-card" id={`cat-${cat.name.toLowerCase().replace(/\s/g, '-')}`}>
                <div className="cat-emoji" style={{ background: `${cat.color}18` }}>{cat.emoji}</div>
                <p>{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-label"><Star size={14} /> Why Us</div>
            <h2 className="section-title">Why Choose Indian Local Store?</h2>
          </div>
          <div className="grid grid-4 gap-3">
            {features.map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-orb" />
            <div className="section-label" style={{ justifyContent: 'center' }}><Truck size={14} /> Start Selling</div>
            <h2>Are you a Local Seller?</h2>
            <p>Register as a seller, list your products and reach thousands of customers in your area.</p>
            <div className="flex-center gap-2" style={{ marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg" id="seller-signup-btn">
                Register as Seller <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Login</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
