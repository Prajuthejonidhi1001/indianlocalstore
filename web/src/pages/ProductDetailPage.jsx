import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Store, Package, Shield, RefreshCw, ChevronLeft, ChevronRight, Share2, Heart, Plus } from 'lucide-react';
import { productAPI, authAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Accordion from '../components/Accordion';
import ImageMagnifier from '../components/ImageMagnifier';
import './ProductDetailPage.css';

function generateHistogram(reviews) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let total = reviews.length;
  reviews.forEach(r => {
    if (counts[r.rating] !== undefined) counts[r.rating]++;
  });
  if (total === 0) return { counts, total: 0 };
  return { counts, total };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Customization
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Review
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Sticky Cart
  const [showStickyCart, setShowStickyCart] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const mainActionsRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          productAPI.getProductDetail(id),
          productAPI.getProductReviews(id)
        ]);
        const p = prodRes.data;
        if (typeof p.variants === 'string') {
          try { p.variants = JSON.parse(p.variants); } catch (e) { p.variants = null; }
        }
        setProduct(p);
        setReviews(revRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const res = await authAPI.getWishlist();
        const wishlistProductIds = res.data.map(item => item.product);
        setWishlist(wishlistProductIds.includes(id));
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
      }
    };
    fetchWishlist();
  }, [user, id, authAPI]);

  useEffect(() => {
    const handleScroll = () => {
      if (mainActionsRef.current) {
        const rect = mainActionsRef.current.getBoundingClientRect();
        // Show sticky cart when the main add to cart button is scrolled above the viewport
        setShowStickyCart(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (product.variants && Object.keys(product.variants).length > 0) {
      if (Object.keys(selectedVariants).length !== Object.keys(product.variants).length) {
        toast.error('Please select all options');
        return;
      }
    }
    const cartItem = {
      product: product.id,
      quantity,
      selected_variants: selectedVariants
    };
    addToCart(cartItem, product);
    toast.success('Added to Cart');
    setIsCartOpen(true);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to review');
    if (!reviewForm.comment.trim()) return toast.error('Comment is required');

    setSubmittingReview(true);
    try {
      await productAPI.addReview(product.id, reviewForm);
      toast.success('Review submitted!');
      const revRes = await productAPI.getProductReviews(id);
      setReviews(revRes.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) return toast.error('Please login to save items to wishlist');

    try {
      const res = await authAPI.toggleWishlist(id);
      setWishlist(res.data.in_wishlist);
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!product) return <div className="container" style={{padding:'4rem 0', textAlign:'center'}}><h2>Product Not Found</h2></div>;

  const images = product.image ? [product.image.startsWith('http') ? product.image : `/media/${product.image}`] : [];
  if (images.length === 0) images.push('https://placehold.co/600x600/131920/FFF?text=No+Image');

  const { counts: histCounts, total: histTotal } = generateHistogram(reviews);

  return (
    <div className="page pb-5 animate-in">
      
      {/* ── STICKY ADD TO CART BAR ── */}
      <div className={`sticky-cart-bar ${showStickyCart ? 'visible' : ''}`}>
        <div className="container scb-inner">
          <div className="scb-info">
            <img src={images[0]} alt={product.name} />
            <div className="scb-text">
              <span className="truncate">{product.name}</span>
              <span className="scb-price">₹{product.price}</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>

      <div className="container">
        
        {/* Breadcrumb */}
        <div className="breadcrumb mt-4 mb-4 text-sm text-muted">
          <Link to="/home">Home</Link> <ChevronRight size={14}/>
          <Link to={`/categories?id=${product.category}`}>{product.category_name || product.category}</Link> <ChevronRight size={14}/>
          <span className="text-primary truncate" style={{maxWidth: '200px', display: 'inline-block', verticalAlign: 'bottom'}}>{product.name}</span>
        </div>

        <div className="pd-grid">
          {/* Left: Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-image-container">
              <button className={`pd-action-btn pd-wishlist ${wishlist ? 'active' : ''}`} onClick={handleToggleWishlist}>
  <Heart size={20} />
</button>
              <button className="pd-action-btn pd-share"><Share2 size={20}/></button>
              <ImageMagnifier src={images[currentImageIndex]} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    className={`pd-thumb ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img src={img} alt={`thumb-${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="pd-details">
            <h1 className="pd-title">{product.name}</h1>
            
            <div className="pd-rating-row mb-3">
              <div className="pd-stars">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} className={s <= (product.average_rating || 0) ? 'star-filled' : 'star-empty'} fill="currentColor" />
                ))}
              </div>
              <a href="#reviews" className="pd-rating-text">{product.average_rating || 'New'} ({reviews.length} reviews)</a>
            </div>

            <div className="pd-pricing mb-4 pb-4 border-bottom">
              <span className="pd-price-symbol">₹</span>
              <span className="pd-price-value">{product.price}</span>
              <span className="pd-old-price">₹{(parseFloat(product.price) * 1.2).toFixed(2)}</span>
              <span className="pd-discount text-green">20% off</span>
            </div>

            {/* Variants */}
            {product.variants && Object.keys(product.variants).map(optName => (
              <div key={optName} className="pd-variant-group mb-4">
                <div className="pd-variant-label">{optName}: <strong>{selectedVariants[optName] || 'Select'}</strong></div>
                <div className="pd-variant-options">
                  {product.variants[optName].map(val => (
                    <button
                      key={val}
                      className={`pd-variant-btn ${selectedVariants[optName] === val ? 'active' : ''}`}
                      onClick={() => setSelectedVariants({ ...selectedVariants, [optName]: val })}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="pd-actions mb-4" ref={mainActionsRef}>
              <div className="qty-selector">
                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} id="qty-minus">-</button>
                <input type="number" readOnly value={quantity} id="qty-input" />
                <button type="button" onClick={() => setQuantity(q => q + 1)} id="qty-plus">+</button>
              </div>
              <button 
                className="btn btn-primary btn-lg flex-1" 
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            <div className="pd-delivery-info card bg-elevated mb-4">
              <div className="flex-center gap-3 mb-2">
                <MapPin size={20} className="text-saffron" />
                <div>
                  <div className="font-medium text-primary">Deliver to your location</div>
                  <div className="text-sm text-muted">Usually ships within 24 hours</div>
                </div>
              </div>
              <div className="flex-center gap-3">
                <Shield size={20} className="text-green" />
                <div>
                  <div className="font-medium text-primary">Secure Transaction</div>
                  <div className="text-sm text-muted">Safe and reliable payments</div>
                </div>
              </div>
            </div>

            {product.seller_name && (
              <Link to={`/shops/${product.seller}`} className="pd-shop-card mb-4 card border-hover">
                <div className="pd-shop-avatar">
                  {product.seller_name[0].toUpperCase()}
                </div>
                <div className="pd-shop-info">
                  <div className="font-medium text-primary">Sold by {product.seller_name}</div>
                  <div className="text-sm text-saffron mt-1 flex-center gap-1"><Store size={14}/> Visit Store</div>
                </div>
              </Link>
            )}

            {/* Accordions */}
            <Accordion items={[
              {
                title: 'Product Description',
                content: <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{product.description || 'No detailed description available.'}</p>
              },
              {
                title: 'Specifications',
                content: (
                  <ul className="pd-specs-list">
                    <li><span>Brand</span><span>{product.brand || 'Generic'}</span></li>
                    <li><span>Category</span><span>{product.category_name || product.category}</span></li>
                    <li><span>Stock</span><span>{product.stock} units</span></li>
                  </ul>
                )
              },
              {
                title: 'Return Policy',
                content: (
                  <div style={{ color: 'var(--text-muted)' }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <RefreshCw size={16} /> 7 Days Replacement Policy
                    </p>
                  </div>
                )
              }
            ]} />
          </div>
        </div>

        {/* Frequently Bought Together Mock */}
        <div className="home-section mt-5 pt-5 border-top">
          <h2 className="section-title">Frequently Bought Together</h2>
          <div className="fbt-container mt-4 card bg-elevated" style={{ padding: '24px' }}>
             <div className="flex-center gap-4 wrap">
               <img src={images[0]} style={{width: 100, height: 100, objectFit: 'cover', borderRadius: 8, background: '#fff'}} />
               <Plus className="text-muted" size={24} />
               <div style={{width: 100, height: 100, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>Product 2</div>
               <Plus className="text-muted" size={24} />
               <div style={{width: 100, height: 100, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>Product 3</div>
               <div className="ml-auto" style={{ textAlign: 'right' }}>
                 <div className="text-muted mb-1">Total price:</div>
                 <div className="text-xl font-bold text-primary mb-3">₹{(parseFloat(product.price) + 499).toFixed(2)}</div>
                 <button className="btn btn-primary btn-sm">Add all 3 to Cart</button>
               </div>
             </div>
          </div>
        </div>

        {/* Reviews */}
        <div id="reviews" className="pd-reviews-section mt-5 pt-5 border-top">
          <h2 className="section-title mb-4">Customer Ratings & Reviews</h2>

          <div className="reviews-layout">
            
            {/* Left: Histogram & Stats */}
            <div className="reviews-stats-panel card">
               <div className="rs-main-score">
                 <div className="rs-score-value">{product.average_rating?.toFixed(1) || '0.0'}</div>
                 <div className="rs-stars">
                    {[1,2,3,4,5].map(s => <Star key={s} size={20} className={s <= (product.average_rating || 0) ? 'star-filled' : 'star-empty'} fill="currentColor" />)}
                 </div>
                 <div className="text-muted text-sm mt-1">{histTotal} global ratings</div>
               </div>

               <div className="rs-histogram mt-4">
                 {[5,4,3,2,1].map(star => {
                   const count = histCounts[star];
                   const percent = histTotal === 0 ? 0 : Math.round((count / histTotal) * 100);
                   return (
                     <div key={star} className="hist-row">
                       <span className="hist-label">{star} star</span>
                       <div className="hist-bar-bg">
                         <div className="hist-bar-fill" style={{ width: `${percent}%` }} />
                       </div>
                       <span className="hist-pct">{percent}%</span>
                     </div>
                   )
                 })}
               </div>
               
               <div className="mt-4 pt-4 border-top">
                 <h4 className="mb-2">Review this product</h4>
                 <p className="text-muted text-sm mb-3">Share your thoughts with other customers</p>
                 <a href="#write-review" className="btn btn-outline btn-block" style={{textAlign: 'center'}}>Write a customer review</a>
               </div>
            </div>

            {/* Right: Review List & Form */}
            <div className="reviews-list-panel">
              <div className="reviews-list">
                {reviews.length === 0 ? (
                  <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="review-card">
                      <div className="review-header">
                        <div className="review-user-avatar">
                           {r.user_name ? r.user_name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="review-meta">
                          <strong>{r.user_name || 'Anonymous'}</strong>
                          <div className="review-stars-small mt-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={12} className={s <= r.rating ? 'star-filled' : 'star-empty'} fill="currentColor" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="review-text mt-2">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Write Review Form */}
              <div id="write-review" className="review-form-box card mt-5">
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
                      rows={4}
                      placeholder="Share your experience (e.g., Quality, Fit, Value)"
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    />
                  </div>
                  <button id="submit-review-btn" type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
