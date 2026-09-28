import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { wishlistAPI, cartAPI } from '../api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import './WishlistPage.css';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    setLoading(true);
    wishlistAPI.getWishlist()
      .then(res => setWishlist(res.data.results || res.data))
      .catch(err => {
        console.error(err);
        toast.error("Failed to load wishlist");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await wishlistAPI.removeFromWishlist(id);
      toast.success("Removed from wishlist");
      setWishlist(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await cartAPI.addItem(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        <div className="section-header">
          <div className="section-label"><Heart size={14} fill="currentColor" /> Favorites</div>
          <h1>My Wishlist</h1>
          <p className="section-subtitle">Products you've saved for later</p>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : wishlist.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon" style={{ backgroundColor: 'rgba(255, 107, 53, 0.1)', color: 'var(--primary)' }}>
              <Heart size={32} />
            </div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you like to view them here.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', textDecoration: 'none' }}>
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map(item => {
              const product = item.product;
              return (
                <div key={item.id} className="wishlist-card card">
                  <Link to={`/product/${product.id}`} className="wishlist-img-container">
                    <img 
                      src={product.image || 'https://via.placeholder.com/150'} 
                      alt={product.name} 
                      className="wishlist-img"
                    />
                    {product.discount_percentage > 0 && (
                      <span className="wishlist-discount-badge">-{product.discount_percentage}%</span>
                    )}
                  </Link>
                  <div className="wishlist-content">
                    <Link to={`/product/${product.id}`} className="wishlist-title">
                      {product.name}
                    </Link>
                    <p className="wishlist-seller">By {product.seller_name}</p>
                    <div className="wishlist-price-row">
                      <span className="wishlist-price">
                        ₹{product.discount_price || product.price}
                      </span>
                      {product.discount_price && (
                        <span className="wishlist-old-price">₹{product.price}</span>
                      )}
                    </div>
                  </div>
                  <div className="wishlist-actions">
                    <button 
                      className="btn-wishlist-remove" 
                      onClick={() => handleRemove(item.id)}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      className="btn btn-primary btn-sm btn-wishlist-add" 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      {product.stock > 0 ? (
                        <><ShoppingCart size={14} /> Add to Cart</>
                      ) : (
                        'Out of Stock'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
