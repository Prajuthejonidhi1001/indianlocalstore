import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Package, Store, Shield, RefreshCw } from 'lucide-react';
import { productAPI } from '../api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import ImageMagnifier from '../components/ImageMagnifier';
import { Accordion } from '../components/Accordion';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
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
    if (product.variants && product.variants.length > 0) {
      const requiredTypes = product.variants.map(v => v.type);
      const selectedKeys = Object.keys(selectedVariants);
      const missing = requiredTypes.filter(t => !selectedKeys.includes(t));
      if (missing.length > 0) {
        toast.error(`Please select: ${missing.join(', ')}`);
        return;
      }
    }
    await addToCart(product.id, qty, selectedVariants);
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

  let price = parseFloat(product.price);
  let discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  let stock = product.stock;

  // Safely parse variants in case backend returns a string
  let parsedVariants = [];
  if (Array.isArray(product.variants)) {
    parsedVariants = product.variants;
  } else if (typeof product.variants === 'string') {
    try { parsedVariants = JSON.parse(product.variants); } catch(e) {}
  }

  const normalVariants = parsedVariants.filter(v => v.type !== '_MATRIX_');
  const matrixVariant = parsedVariants.find(v => v.type === '_MATRIX_');
  const matrix = matrixVariant ? matrixVariant.values : [];

  // Check if selected options match a matrix combination
  if (matrix.length > 0 && Object.keys(selectedVariants).length === normalVariants.length) {
    const selectedKeys = normalVariants.map(v => v.type);
    const comboRow = matrix.find(row => {
      return selectedKeys.every(k => row.combo[k] === selectedVariants[k]);
    });
    
    if (comboRow) {
      if (comboRow.price) {
        price = parseFloat(comboRow.price);
        discountPrice = null; // matrix price overrides discount
      }
      if (comboRow.stock !== '') {
        stock = parseInt(comboRow.stock, 10);
      }
    }
  }

  const discount = discountPrice ? Math.round((1 - discountPrice / price) * 100) : 0;
  const imgSrc = product.image ? (product.image.startsWith('http') ? product.image : `/media/${product.image}`) : null;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <Link to="/shops" className="back-link" id="back-to-products">
          <ArrowLeft size={16} /> Back to Shops
        </Link>

        <div className="pd-grid">
          {/* Image */}
          <div className="pd-gallery">
            <ImageMagnifier src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'} />
            <div className="pd-badges">
              {discount > 0 && <span className="pd-discount-badge">{discount}% OFF</span>}
            </div>
          </div>

          {/* Info */}
          <div className="pd-info">
            <span className="pd-category-tag">{product.category_name || 'Product'}</span>
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

            {normalVariants.length > 0 && (
              <div className="pd-variants" style={{ margin: '1.5rem 0' }}>
                {normalVariants.map((v) => (
                  <div key={v.type} style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Select {v.type}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {v.values.map(val => {
                        const isSelected = selectedVariants[v.type] === val;
                        return (
                          <button
                            key={val}
                            className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setSelectedVariants({ ...selectedVariants, [v.type]: val })}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pd-stock">
              {stock > 0 ? (
                <span className="badge badge-green">In Stock ({stock} left)</span>
              ) : (
                <span className="badge badge-red">Out of Stock</span>
              )}
            </div>

            {/* Quantity + Cart */}
            <div className="pd-actions">
              <div className="pd-qty-row">
                <span className="pd-qty-label">Quantity:</span>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                  <span className="qty-val">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(Math.min(stock, qty + 1))}>+</button>
                </div>
              </div>
              <button
                id="add-to-cart-btn"
                className="btn btn-primary flex-1"
                disabled={stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>

            {/* Seller */}
            {product.seller_name && (
              <>
                <div className="pd-divider" />
                <h4 className="pd-description-title">Sold By</h4>
                <Link to={`/shops/${product.shop}`} className="pd-shop-card">
                  <div className="pd-shop-avatar">
                    {product.seller_name[0].toUpperCase()}
                  </div>
                  <div className="pd-shop-info">
                    <div className="pd-shop-name">{product.seller_name}</div>
                    <div className="pd-shop-city"><Store size={12}/> View Shop</div>
                  </div>
                </Link>
              </>
            )}

            {/* Accordions */}
            <div style={{ marginTop: '24px' }}>
              <Accordion items={[
                {
                  title: 'Product Description',
                  content: <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{product.description || 'No detailed description available.'}</p>
                },
                {
                  title: 'Shipping & Delivery',
                  content: (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Package size={16} /> Usually dispatched in 24 hours.
                      </p>
                      <p>Estimated delivery within 2-4 business days.</p>
                    </div>
                  )
                },
                {
                  title: 'Return Policy',
                  content: (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <RefreshCw size={16} /> 7 Days Replacement Policy
                      </p>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={16} /> Secure payments guaranteed
                      </p>
                    </div>
                  )
                }
              ]} />
            </div>
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
