import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Tag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user, toggleWishlist, wishlist } = useAuth();

  const price = parseFloat(product.price);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const discount = discountPrice ? Math.round((1 - discountPrice / price) * 100) : 0;

  const imgSrc = product.image
    ? (product.image.startsWith('http') ? product.image : `/media/${product.image}`)
    : null;

  // Check if product is in wishlist
  const isInWishlist = wishlist && wishlist.some(item => item.product === product.id);

  const handleToggleWishlist = async (e) => {
    e.stopPropagation(); // Prevent triggering the product link

    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await toggleWishlist(product.id);
      // Note: We're optimistically updating the UI here
      // The AuthContext will handle updating the wishlist state
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="product-card card" id={`product-${product.id}`}>
      <div className="wishlist-btn-wrapper">
        <button
          className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isInWishlist ? "var(--saffron)" : "none"} />
        </button>
      </div>
      <Link to={`/products/${product.id}`} className="product-img-wrap">
        {imgSrc ? (
          <img src={imgSrc} alt={product.name} className="product-img" loading="lazy" />
        ) : (
          <div className="product-img-placeholder">🛒</div>
        )}
        {discount > 0 && (
          <span className="discount-badge"><Tag size={10} /> {discount}% OFF</span>
        )}
      </Link>
      <div className="product-info">
        <p className="product-category">{product.category_name || product.category}</p>
        <Link to={`/products/${product.id}`} className="product-name">{product.name}</Link>
        <div className="product-rating">
          <Star size={13} fill="currentColor" />
          <span>{product.rating?.toFixed(1) || '0.0'}</span>
          <span className="rating-count">({product.reviews_count || 0})</span>
        </div>
        <div className="product-price-row">
          <div className="product-prices">
            {discountPrice ? (
              <>
                <span className="price-current">₹{discountPrice.toFixed(2)}</span>
                <span className="price-original">₹{price.toFixed(2)}</span>
              </>
            ) : (
              <span className="price-current">₹{price.toFixed(2)}</span>
            )}
          </div>
          <button
            className="cart-btn"
            id={`add-cart-${product.id}`}
            onClick={(e) => { e.preventDefault(); addToCart(product.id); }}
            title="Add to cart"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
