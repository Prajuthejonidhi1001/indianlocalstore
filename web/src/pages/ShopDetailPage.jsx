import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Star, ArrowLeft, Shield } from 'lucide-react';
import { shopAPI, productAPI } from '../api';
import ProductCard from '../components/ProductCard';
import './ShopDetailPage.css';

export default function ShopDetailPage() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [shopRes, prodRes] = await Promise.all([
          shopAPI.getShopDetail(id),
          productAPI.getProducts({ shop: id }),
        ]);
        setShop(shopRes.data);
        setProducts(prodRes.data.results || prodRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!shop) return <div className="empty-state"><h3>Shop not found</h3></div>;

  return (
    <div className="page pb-section">
      {/* Cover / Header */}
      <div className="shop-cover">
        {shop.banner ? (
          <img src={shop.banner} alt="Banner" className="shop-banner-img" />
        ) : (
          <div className="shop-banner-placeholder" />
        )}
        <div className="container">
          <Link to="/shops" className="back-link slide-up"><ArrowLeft size={16} /> Back</Link>
          <div className="shop-header-card glass-card">
            <div className="shop-avatar-lg">{shop.name[0]}</div>
            <div className="shop-header-info">
              <div className="shop-title-row">
                <h1 id="shop-name">{shop.name}</h1>
                {shop.verification_status === 'verified' && (
                  <span className="badge badge-green"><Shield size={12}/> Verified</span>
                )}
              </div>
              <p className="shop-city-lg"><MapPin size={14}/> {shop.address}, {shop.city}, {shop.state} - {shop.pincode}</p>
              
              <div className="shop-stats-row">
                <div className="s-stat">
                  <Star size={14} className="s-icon" /> 
                  <span>{shop.rating?.toFixed(1) || '0.0'} ({shop.reviews_count} reviews)</span>
                </div>
                <div className="s-stat">
                  <Phone size={14} className="s-icon" /> <span>{shop.phone}</span>
                </div>
                <div className="s-stat">
                  <Mail size={14} className="s-icon" /> <span>{shop.email}</span>
                </div>
                {(shop.opening_time && shop.closing_time) && (
                  <div className="s-stat">
                    <Clock size={14} className="s-icon" /> 
                    <span>{shop.opening_time} - {shop.closing_time}</span>
                  </div>
                )}
              </div>
              {shop.shop_code && (
                <div className="shop-id-badge">
                  <Shield size={12} />
                  <span>Shop ID: #{shop.id} &middot; {String(shop.shop_code).slice(0, 8).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container pt-after-cover">
        <div className="shop-main-grid">
          {/* Main content - Products */}
          <div className="shop-products">
            <h2 className="section-title">Shop Products</h2>
            <div className="divider" />
            
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <h3>No products listed</h3>
                <p>This shop hasn't added any products yet.</p>
              </div>
            ) : (
              <div className="grid grid-auto gap-3">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>

          {/* Sidebar - About Shop */}
          <div className="shop-sidebar">
            <div className="card sidebar-card">
              <h4>About this shop</h4>
              <p className="shop-about-text">{shop.description || 'No description provided.'}</p>
            </div>
            
            {shop.services?.length > 0 && (
              <div className="card sidebar-card mt-3">
                <h4>Services Offered</h4>
                <ul className="shop-services-list">
                  {shop.services.map(s => (
                    <li key={s.id} className="service-item">
                      <div className="sv-bullet" />
                      <div>
                        <p className="sv-name">{s.name}</p>
                        <p className="sv-price">₹{s.price}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
