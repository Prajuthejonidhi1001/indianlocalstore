import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { authAPI, cartAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './WishlistPage.css';

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getWishlist();
      setWishlistItems(res.data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await authAPI.toggleWishlist(productId);
      setWishlistItems(items => items.filter(item => item.product !== productId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await addToCart({ product: item.product, quantity: 1, selected_variants: {} }, {
        id: item.product,
        name: item.product_name,
        price: item.product_price,
        image: item.product_image
      });
      toast.success('Added to cart');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const handleMoveToCart = async (item) => {
    await handleAddToCart(item);
    await handleRemoveFromWishlist(item.product);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: '6rem' }}>
          <div className="loading-center"><div className="spinner" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page wishlist-page">
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>

        {/* Header */}
        <div className="wishlist-header mb-5">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">
              <Heart size={28} className="text-primary" fill="var(--saffron)" />
              My Wishlist
            </h1>
            <p className="text-muted">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved</p>
          </div>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist card">
            <Heart size={64} className="text-muted mb-3" />
            <h2>Your wishlist is empty</h2>
            <p className="text-muted mb-4">Save items you love so you don't lose sight of them</p>
            <Link to="/home" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map(item => (
              <div key={item.id} className="wishlist-card card">
                <button
                  className="wishlist-remove-btn"
                  onClick={() => handleRemoveFromWishlist(item.product)}
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>

                <Link to={`/products/${item.product}`} className="wishlist-card-image">
                  <img
                    src={item.product_image?.startsWith('http') ? item.product_image : `/media/${item.product_image}`}
                    alt={item.product_name}
                    onError={(e) => { e.target.src = 'https://placehold.co/300x300/131920/FFF?text=No+Image' }}
                  />
                </Link>

                <div className="wishlist-card-body">
                  <Link to={`/products/${item.product}`} className="wishlist-card-title">
                    {item.product_name}
                  </Link>

                  <div className="wishlist-card-price">
                    <span className="price-current">₹{item.product_discount_price || item.product_price}</span>
                    {item.product_discount_price && (
                      <span className="price-original">₹{item.product_price}</span>
                    )}
                  </div>

                  <div className="wishlist-card-actions">
                    <button
                      className="btn btn-outline btn-sm flex-1"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                    <button
                      className="btn btn-primary btn-sm flex-1"
                      onClick={() => handleMoveToCart(item)}
                    >
                      Move to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
