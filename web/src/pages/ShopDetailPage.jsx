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
      <div className="shop-cover-banner">
        {shop.banner ? (
          <img src={shop.banner} alt="Banner" className="shop-cover-img" />
        ) : (
          <div className="shop-cover-overlay" />
        )}
        <div className="shop-cover-overlay" />
        <Link to="/shops" className="shop-cover-back"><ArrowLeft size={18} /></Link>
      </div>

      <div className="shop-info-bar">
        <div className="container">
          <div className="shop-info-inner">
            <div className="shop-logo-wrap">
              <div className="shop-logo-circle">
                {shop.logo ? <img src={shop.logo} alt={shop.name} /> : shop.name[0].toUpperCase()}
              </div>
            </div>
            <div className="shop-main-info">
              <h1 className="shop-detail-name">{shop.name}</h1>
              <div className="shop-detail-meta">
                <span className="shop-meta-item rating"><Star size={14} fill="currentColor" /> {shop.rating?.toFixed(1) || '0.0'} ({shop.reviews_count})</span>
                <span className="shop-meta-item"><MapPin size={14} /> {shop.city}, {shop.state}</span>
                <span className="shop-meta-item"><Phone size={14} /> {shop.phone}</span>
                {shop.opening_time && <span className="shop-meta-item"><Clock size={14} /> {shop.opening_time} - {shop.closing_time}</span>}
              </div>
              <p className="shop-detail-desc">{shop.description || 'No description provided for this shop.'}</p>
              {shop.shop_code && (
                <div className="shop-code-badge">
                  <Shield size={12} /> ID: {String(shop.shop_code).slice(0, 8).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container pt-4">
        <div className="shop-products-section">
          <div className="shop-products-header">
            <h2>Shop Products</h2>
          </div>
          
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No products listed</h3>
              <p>This shop hasn't added any products yet.</p>
            </div>
          ) : (
            <div className="shop-products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
