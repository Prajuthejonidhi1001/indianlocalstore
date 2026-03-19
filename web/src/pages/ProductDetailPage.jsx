import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Package, Store } from 'lucide-react';
import { productAPI } from '../api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    productAPI.getProductDetail(id)
      .then(r => setProduct(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product.id, qty);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await productAPI.addReview(id, reviewForm);
      toast.success('Review submitted!');
      const r = await productAPI.getProductDetail(id);
      setProduct(r.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!product) return <div className="empty-state"><h3>Product not found</h3></div>;

  const price = parseFloat(product.price);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const discount = discountPrice ? Math.round((1 - discountPrice / price) * 100) : 0;
  const imgSrc = product.image ? (product.image.startsWith('http') ? product.image : `/media/${product.image}`) : null;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <Link to="/products" className="back-link" id="back-to-products">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="product-detail-grid">
          {/* Image */}
          <div className="pd-image-col">
            <div className="pd-image-box">
              {imgSrc ? (
                <img src={imgSrc} alt={product.name} />
              ) : (
                <div className="pd-no-image"><Package size={72} /></div>
              )}
              {discount > 0 && <span className="pd-discount-badge">{discount}% OFF</span>}
            </div>
          </div>

          {/* Info */}
          <div className="pd-info-col">
            <p className="pd-category">{product.category_name || 'Product'}</p>
            <h1 className="pd-name" id="product-title">{product.name}</h1>

            <div className="pd-rating">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16} fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'} strokeWidth={1.5} />
              ))}
              <span>{product.rating?.toFixed(1)}</span>
              <span className="pd-review-count">({product.reviews_count} reviews)</span>
            </div>

            <div className="pd-price-row">
              {discountPrice ? (
                <>
                  <span className="pd-price">₹{discountPrice.toFixed(2)}</span>
                  <span className="pd-price-slash">₹{price.toFixed(2)}</span>
                  <span className="badge badge-orange">{discount}% OFF</span>
                </>
              ) : (
                <span className="pd-price">₹{price.toFixed(2)}</span>
              )}
            </div>

            <p className="pd-description">{product.description}</p>

            <div className="pd-stock">
              {product.stock > 0 ? (
                <span className="badge badge-green">In Stock ({product.stock} left)</span>
              ) : (
                <span className="badge badge-red">Out of Stock</span>
              )}
            </div>

            {/* Quantity + Cart */}
            <div className="pd-actions">
              <div className="qty-control">
                <button id="qty-minus" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span id="qty-display">{qty}</span>
                <button id="qty-plus" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
              </div>
              <button
                id="add-to-cart-btn"
                className="btn btn-primary flex-1"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>

            {/* Seller */}
            {product.seller_name && (
              <div className="pd-seller">
                <Store size={14} />
                <span>Sold by <strong>{product.seller_name}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="pd-reviews-section">
          <h2 className="pd-section-title">Customer Reviews</h2>

          {/* Write Review */}
          <div className="review-form-box card">
            <h4>Write a Review</h4>
            <form onSubmit={handleReview} className="review-form" id="review-form">
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="star-rating">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      type="button"
                      id={`star-${s}`}
                      className={s <= reviewForm.rating ? 'star active' : 'star'}
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                    >★</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  id="review-comment"
                  className="form-input"
                  rows={3}
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>
              <button id="submit-review-btn" type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Reviews list */}
          <div className="reviews-list">
            {(product.product_reviews || []).length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first!</p>
            ) : (
              (product.product_reviews || []).map(rev => (
                <div key={rev.id} className="review-item card">
                  <div className="review-header">
                    <div className="reviewer-avatar">{rev.user_username?.[0]?.toUpperCase() || 'U'}</div>
                    <div>
                      <p className="reviewer-name">{rev.user_username}</p>
                      <div className="review-stars">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} fill={s <= rev.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <span className="review-date">{new Date(rev.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  {rev.comment && <p className="review-comment">{rev.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
