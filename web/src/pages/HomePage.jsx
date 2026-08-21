import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Star, ArrowRight, Navigation, Grid, TrendingUp, Clock, Zap, ChevronRight, Store, ChevronLeft, Heart } from 'lucide-react';
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

// Premium Hero Images (Mocked with random colorful gradients/patterns if no backend image)
const HERO_BANNERS = [
  { id: 1, title: 'Mega Electronics Sale', subtitle: 'Up to 40% Off on Top Brands', color: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', image: '/media/electronics_cat_1781148957487.png' },
  { id: 2, title: 'Fresh Groceries Delivered', subtitle: 'In 30 Minutes or Less', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', image: '/media/cat_agriculture_1780936159975.png' },
  { id: 3, title: 'Fashion Clearance', subtitle: 'Trendy Styles at Unbeatable Prices', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', image: '/media/fashion_cat_1781148912233.png' }
];

const CAT_GRADIENTS = [
  'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
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

function ProductSkeleton() {
  return (
    <div className="product-card-skeleton card">
      <div className="sks-banner shimmer" style={{ height: '150px' }} />
      <div className="sks-body" style={{ padding: '12px' }}>
        <div className="sks-line shimmer" style={{ width: '90%', marginBottom: '8px' }} />
        <div className="sks-line shimmer" style={{ width: '50%', marginBottom: '16px' }} />
        <div className="sks-line shimmer" style={{ width: '100%', height: '36px', borderRadius: '4px' }} />
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
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Countdown timer for Flash Deals
  const [timeLeft, setTimeLeft] = useState(3600 * 5); // 5 hours

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Carousel Autoplay
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(s => (s === HERO_BANNERS.length - 1 ? 0 : s + 1));
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [catRes, shopRes, prodRes] = await Promise.all([
          productAPI.getCategories(),
          shopAPI.getShops({ page_size: 8, city: location?.district }),
          productAPI.getProducts({ page_size: 10 }) // Get some products for the flash deals/trending sections
        ]);
        setCategories(catRes.data.results || catRes.data);
        setShops(shopRes.data.results || shopRes.data);
        setTrendingProducts(prodRes.data.results || prodRes.data);
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

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="page animate-in">
      
      {/* ── PREMIUM HERO CAROUSEL ── */}
      <div className="premium-hero-carousel">
        <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {HERO_BANNERS.map((banner, i) => (
            <div key={banner.id} className="carousel-slide" style={{ background: banner.color }}>
              <div className="container carousel-slide-inner">
                <div className="carousel-text">
                  <span className="badge badge-orange mb-3" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>Limited Time Offer</span>
                  <h1>{banner.title}</h1>
                  <p>{banner.subtitle}</p>
                  <button className="btn btn-primary mt-4" onClick={() => navigate('/shops')}>Shop Now <ArrowRight size={16}/></button>
                </div>
                <div className="carousel-image">
                  <img src={banner.image} alt={banner.title} onError={(e) => e.target.style.display = 'none'} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="carousel-dots">
          {HERO_BANNERS.map((_, i) => (
            <button key={i} className={`carousel-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />
          ))}
        </div>
        <button className="carousel-nav prev" onClick={() => setCurrentSlide(s => (s === 0 ? HERO_BANNERS.length - 1 : s - 1))}><ChevronLeft size={24}/></button>
        <button className="carousel-nav next" onClick={() => setCurrentSlide(s => (s === HERO_BANNERS.length - 1 ? 0 : s + 1))}><ChevronRight size={24}/></button>
      </div>

      <div className="container" style={{ paddingBottom: '4rem' }}>
        
        {/* Quick Location Action */}
        <div className="location-bar-premium card mb-5">
          <div className="flex-between">
            <div className="flex-center gap-3">
              <div className="icon-circle"><MapPin size={20} /></div>
              <div>
                <p className="text-muted text-sm mb-0">Delivering to</p>
                <h4 className="font-medium mb-0">{location ? location.name : 'Select your location to see local offers'}</h4>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleLocateMe} disabled={locating}>
              <Navigation size={14} /> {locating ? 'Locating...' : 'Update Location'}
            </button>
          </div>
        </div>

        {/* ── TOP CATEGORIES MEGA GRID ── */}
        <section className="home-section mb-5">
          <div className="section-header flex-between mb-4">
            <div>
              <h2 className="section-title">Shop by Category</h2>
            </div>
            <Link to="/categories" className="btn-link">View All <ArrowRight size={16} /></Link>
          </div>
          
          <div className="premium-categories-grid">
            {categories.slice(0, 10).map((cat) => (
              <Link to={`/categories?id=${cat.id}`} key={cat.id} className="premium-cat-card">
                <div className="cat-icon-lg">
                  {cat.icon ? (
                    <img src={cat.icon?.startsWith('http') ? cat.icon : `/media/${cat.icon}`} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    CAT_EMOJIS[cat.name] || '🏷️'
                  )}
                </div>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FLASH DEALS ── */}
        <section className="home-section mb-5 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="section-header flex-between mb-4">
            <div className="flex-center gap-3">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap className="text-saffron" size={24} fill="var(--saffron)" /> Deals of the Day
              </h2>
              <div className="countdown-timer">
                Ends in: <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
            <Link to="/shops" className="btn-link">See All Deals <ArrowRight size={16} /></Link>
          </div>

          <div className="flash-deals-scroll">
            {loading ? (
              Array(4).fill(0).map((_,i) => <ProductSkeleton key={i} />)
            ) : trendingProducts.slice(0, 5).map(prod => (
              <div key={prod.id} className="flash-deal-card card" onClick={() => navigate(`/products/${prod.id}`)}>
                <button className="wishlist-btn"><Heart size={16} /></button>
                <div className="fd-discount-badge">-{(Math.random() * 20 + 10).toFixed(0)}%</div>
                <img src={prod.image?.startsWith('http') ? prod.image : `/media/${prod.image}`} alt={prod.name} className="fd-img" onError={(e) => { e.target.src = 'https://placehold.co/300x300/131920/FFF?text=No+Image' }} />
                <div className="fd-info">
                  <h4 className="fd-name truncate">{prod.name}</h4>
                  <div className="fd-pricing">
                    <span className="fd-price">₹{prod.price}</span>
                    <span className="fd-old-price">₹{(parseFloat(prod.price) * 1.2).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOP LOCAL SHOPS ── */}
        <section className="home-section mb-5">
          <div className="section-header flex-between mb-4">
            <div>
              <h2 className="section-title"><Store size={22} style={{marginRight: 8, verticalAlign: 'middle', color: 'var(--saffron)'}}/> Top Rated Local Shops</h2>
              <p className="text-muted">Discover the best sellers in your area</p>
            </div>
            <Link to="/shops" className="btn-link">Explore Area <ArrowRight size={16} /></Link>
          </div>
          
          <div className="shops-grid">
            {loading ? (
              Array(4).fill(0).map((_, i) => <ShopSkeleton key={i} />)
            ) : shops.length > 0 ? (
              shops.map(shop => (
                <div key={shop.id} className="shop-card card" onClick={() => navigate(`/shops/${shop.id}`)}>
                  <div className="sc-banner">
                    {shop.banner ? <img src={shop.banner} alt={shop.name} /> : <div className="sc-banner-fallback" style={{ background: CAT_GRADIENTS[shop.id % CAT_GRADIENTS.length] }} />}
                    <div className="sc-rating"><Star size={12} fill="currentColor" /> {shop.rating || '4.5'}</div>
                  </div>
                  <div className="sc-body">
                    <div className="sc-row">
                      <div className="sc-avatar">{shop.logo ? <img src={shop.logo} alt="logo" /> : (shop.name?.[0] || 'S')}</div>
                      <div className="sc-info">
                        <h3 className="sc-name truncate">{shop.name}</h3>
                        <p className="sc-desc truncate">{shop.description || 'Premium local seller'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <Store size={48} className="text-muted mb-3" />
                <h3>No shops found near you</h3>
                <p>Try searching in a different area or update your location.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── RECOMMENDED FOR YOU ── */}
        <section className="home-section mb-2">
          <div className="section-header flex-between mb-4">
            <h2 className="section-title"><TrendingUp size={22} style={{marginRight: 8, verticalAlign: 'middle', color: '#3498db'}}/> Recommended For You</h2>
          </div>
          <div className="premium-products-grid">
             {loading ? (
              Array(8).fill(0).map((_,i) => <ProductSkeleton key={i} />)
            ) : trendingProducts.slice(5, 13).map(prod => (
              <div key={prod.id} className="premium-product-card card" onClick={() => navigate(`/products/${prod.id}`)}>
                <button className="wishlist-btn"><Heart size={16} /></button>
                <div className="ppc-img-wrapper">
                  <img src={prod.image?.startsWith('http') ? prod.image : `/media/${prod.image}`} alt={prod.name} onError={(e) => { e.target.src = 'https://placehold.co/300x300/131920/FFF?text=Product' }} />
                </div>
                <div className="ppc-info">
                  <div className="text-xs text-muted mb-1 uppercase tracking-wide">{prod.category}</div>
                  <h4 className="ppc-name truncate-2">{prod.name}</h4>
                  <div className="ppc-rating">
                    <div className="stars">
                      <Star size={12} fill="var(--saffron)" color="var(--saffron)" />
                      <Star size={12} fill="var(--saffron)" color="var(--saffron)" />
                      <Star size={12} fill="var(--saffron)" color="var(--saffron)" />
                      <Star size={12} fill="var(--saffron)" color="var(--saffron)" />
                      <Star size={12} color="var(--saffron)" />
                    </div>
                    <span className="text-xs text-muted">(124)</span>
                  </div>
                  <div className="flex-between mt-3" style={{ alignItems: 'flex-end' }}>
                    <div className="ppc-price">₹{prod.price}</div>
                    <button className="btn btn-primary btn-sm rounded-btn"><Plus size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
