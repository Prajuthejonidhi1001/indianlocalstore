import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, Star, ArrowRight, Zap, Shield, Clock, Truck, ChevronDown } from 'lucide-react';
import { productAPI } from '../api';
import './LandingPage.css';

const features = [
  { icon: <MapPin size={22} />, title: 'Find Nearby Shops', desc: 'Discover verified local shops in your area with real-time precision location.' },
  { icon: <Zap size={22} />, title: 'Instant Delivery', desc: 'Get freshest products delivered lightning fast to your doorstep.' },
  { icon: <Shield size={22} />, title: 'Verified Sellers', desc: 'Every seller is KYC-verified for your complete safety and trust.' },
  { icon: <Star size={22} />, title: 'Genuine Ratings', desc: 'Real reviews from real customers. Shop with total confidence.' },
];

const CAT_EMOJIS = {
  'Agriculture':          '🌾',
  'Automobile':           '🚗',
  'Construction':         '🏗️',
  'Electronics':          '📱',
  'Event Management':     '🎉',
  'Fashion':              '👗',
  'Furnitures':           '🪑',
  'Mart':                 '🏪',
  'Second Hand Vehicles': '🚙',
  'Traders':              '📦',
  // fallback for any extra categories
  'Food':       '🍽️',
  'Clothing':   '👕',
  'Pharmacy':   '💊',
  'Vegetables': '🥬',
  'Fruits':     '🍎',
};

const CAT_COLORS = [
  '#FF6B35','#5521FF','#00C896','#FFB627','#E91E8C',
  '#00B4D8','#FF4757','#2ED573','#FFA502','#747D8C',
];

const stats = [
  { value: '500+', label: 'Local Shops', icon: '🏪' },
  { value: '10K+', label: 'Products', icon: '📦' },
  { value: '50K+', label: 'Customers', icon: '👥' },
  { value: '4.8★', label: 'Rating', icon: '⭐' },
];

export default function LandingPage() {
  const [categories, setCategories] = useState([
    { id: 'f1', name: 'Agriculture' },
    { id: 'f2', name: 'Automobile' },
    { id: 'f3', name: 'Construction' },
    { id: 'f4', name: 'Electronics' },
    { id: 'f5', name: 'Fashion' },
    { id: 'f6', name: 'Mart' },
  ]);

  useEffect(() => {
    productAPI.getCategories()
      .then(r => setCategories(r.data.results || r.data))
      .catch(() => {});
  }, []);
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="landing">
      {/* ── HERO ── */}
      <section className="hero">
        {/* Animated background */}
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
          <div className="hero-grid-overlay" />
        </div>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="particle" style={{ '--i': i }} />
        ))}

        <div className="container hero-inner">
          {/* Left: Text Content */}
          <div className="hero-content">
            <div className="hero-badge">
              <span className="glow-dot" />
              <Zap size={12} />
              India's #1 Local Commerce Platform
            </div>

            <h1 className="hero-title">
              Shop <span className="gradient-text">Fresh.</span><br />
              Support <span className="gradient-text">Local.</span><br />
              <span className="hero-title-sub">Live Better.</span>
            </h1>

            <p className="hero-subtitle">
              Discover thousands of local shops, fresh produce, and authentic
              products from your neighbourhood — all in one place.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg hero-cta" id="get-started-btn">
                Start Shopping <ArrowRight size={18} />
              </Link>
              <Link to="/shops" className="btn btn-secondary btn-lg" id="browse-shops-btn">
                <MapPin size={17} /> Explore Shops
              </Link>
            </div>

            {/* Stats Row */}
            <div className="hero-stats">
              {stats.map((s, i) => (
                <div key={i} className="hero-stat">
                  <span className="hero-stat-icon">{s.icon}</span>
                  <div>
                    <div className="hero-stat-value">{s.value}</div>
                    <div className="hero-stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating Cards */}
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-phone-mockup">
              <div className="phone-screen">
                <div className="phone-bar" />
                <div className="phone-product-row">
                  <div className="pp-img">🥬</div>
                  <div className="pp-info">
                    <div className="pp-name">Fresh Spinach</div>
                    <div className="pp-price">₹35</div>
                  </div>
                  <div className="pp-add">+</div>
                </div>
                <div className="phone-product-row">
                  <div className="pp-img" style={{ background: 'rgba(255,23,68,0.15)' }}>🍅</div>
                  <div className="pp-info">
                    <div className="pp-name">Tomatoes</div>
                    <div className="pp-price">₹52</div>
                  </div>
                  <div className="pp-add">+</div>
                </div>
                <div className="phone-product-row">
                  <div className="pp-img" style={{ background: 'rgba(255,182,39,0.15)' }}>🌿</div>
                  <div className="pp-info">
                    <div className="pp-name">Coriander</div>
                    <div className="pp-price">₹18</div>
                  </div>
                  <div className="pp-add">+</div>
                </div>
                <div className="phone-order-bar">
                  <span>3 Items • ₹105</span>
                  <span className="phone-order-btn">Order Now</span>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="float-badge fb-1">
              <span>🏪</span>
              <div>
                <div className="fb-title">Shop Nearby</div>
                <div className="fb-sub">1.2 km away</div>
              </div>
            </div>
            <div className="float-badge fb-2">
              <span>⭐</span>
              <div>
                <div className="fb-title">4.9 Rating</div>
                <div className="fb-sub">127 reviews</div>
              </div>
            </div>
            <div className="float-badge fb-3">
              <span>🚚</span>
              <div>
                <div className="fb-title">Fast Delivery</div>
                <div className="fb-sub">25 min ETA</div>
              </div>
            </div>
          </div>
        </div>

        <a href="#categories" className="hero-scroll-hint">
          <ChevronDown size={20} />
        </a>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker">
          {[...Array(2)].map((_, repeat) => (
            <span key={repeat} className="ticker-inner">
              {categories.length > 0
                ? categories.map((cat, i) => (
                    <span key={i} className="ticker-item">
                      {CAT_EMOJIS[cat.name] || '🛍️'} {cat.name}
                    </span>
                  ))
                : ['🛍️ Local Products', '🏪 Nearby Shops', '🌟 Top Sellers', '📦 Fresh Stock'].map((item, i) => (
                    <span key={i} className="ticker-item">{item}</span>
                  ))
              }
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-header text-center" ref={addRef} style={{ transitionDelay: '0s' }}>
            <div className="section-label">🛍️ Shop by Category</div>
            <h2>Everything You <span className="gradient-text">Need</span></h2>
            <p className="section-subtitle">From fresh vegetables to home essentials — all local, all fresh</p>
          </div>

          <div className="cat-grid">
            {categories.slice(0, 10).map((cat, i) => (
              <Link
                to={`/categories`}
                key={cat.id}
                className="cat-bubble reveal"
                ref={addRef}
                style={{ transitionDelay: `${i * 0.07}s`, '--cat-color': CAT_COLORS[i % CAT_COLORS.length] }}
                id={`cat-bubble-${cat.id}`}
              >
                <div className="cat-bubble-inner">
                  {cat.icon
                    ? <img src={cat.icon} alt={cat.name} />
                    : <div className="cat-bubble-emoji">{CAT_EMOJIS[cat.name] || '🛍️'}</div>
                  }
                </div>
                <span className="cat-bubble-name">{cat.name}</span>
              </Link>
            ))}
            {categories.length === 0 && (
              [...Array(8)].map((_, i) => (
                <div key={i} className="cat-bubble" style={{ opacity: 0.4 }}>
                  <div className="cat-bubble-inner" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="cat-bubble-emoji">🛍️</div>
                  </div>
                  <span className="cat-bubble-name">Loading...</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-label">✨ Why Choose Us</div>
            <h2>Built for <span className="gradient-text">India</span></h2>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card-v2 reveal"
                ref={addRef}
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <div className="fc-icon-v2">{f.icon}</div>
                <h4 className="fc-title">{f.title}</h4>
                <p className="fc-desc">{f.desc}</p>
                <div className="fc-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-label">🚀 How It Works</div>
            <h2>Three <span className="gradient-text">Simple Steps</span></h2>
          </div>
          <div className="steps-row">
            {[
              { step: '01', emoji: '📍', title: 'Find Your Area', desc: 'Enter your location and instantly see all local shops near you.' },
              { step: '02', emoji: '🛒', title: 'Browse & Add', desc: 'Explore products, compare prices, add your favourites to cart.' },
              { step: '03', emoji: '🎉', title: 'Order & Enjoy', desc: 'Place your order and get fresh products delivered to your door.' },
            ].map((s, i) => (
              <div key={i} className="step-card reveal" ref={addRef} style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="step-num">{s.step}</div>
                <div className="step-emoji">{s.emoji}</div>
                <h4 className="step-title">{s.title}</h4>
                <p className="step-desc">{s.desc}</p>
                {i < 2 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section">
        <div className="container">
          <div className="cta-v2 reveal" ref={addRef}>
            <div className="cta-v2-orb cta-orb-1" />
            <div className="cta-v2-orb cta-orb-2" />
            <div className="cta-v2-content">
              <div className="section-label" style={{ justifyContent: 'center' }}>🌟 Join the Movement</div>
              <h2 className="cta-v2-title">
                Your <span className="gradient-text">Local Store</span><br />
                Is Waiting
              </h2>
              <p className="cta-v2-sub">
                Join 50,000+ customers supporting local Indian businesses.
                Fresh products, transparent pricing, real impact.
              </p>
              <div className="cta-v2-actions">
                <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link to="/shops" className="btn btn-secondary btn-lg" id="cta-products-btn">
                  <ShoppingBag size={17} /> Browse Shops
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
