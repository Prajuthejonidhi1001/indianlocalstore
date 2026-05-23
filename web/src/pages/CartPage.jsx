import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartPage.css';

export default function CartPage() {
  const { cart, cartLoading, cartTotal, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartLoading) return <div className="loading-center"><div className="spinner" /></div>;

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="page pb-section">
      <div className="container" style={{ paddingTop: '2.5rem' }}>
        <div className="section-header flex-between mb-cart">
          <div>
            <h1 id="cart-heading">Your Cart</h1>
            <p className="section-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>
          {!isEmpty && (
            <button className="btn btn-ghost btn-sm text-danger" id="clear-cart-btn" onClick={clearCart}>
              <Trash2 size={14} /> Clear Cart
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shops" className="btn btn-primary mt-3">Start Shopping</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items column */}
            <div className="cart-items-list">
              {items.map(item => {
                // API returns flat fields: product_name, product_image, product_price
                // item.product is just the integer product ID
                const productId = item.product;
                const name = item.product_name || 'Product';
                const price = parseFloat(item.product_price) || 0;
                const rawImg = item.product_image;
                const imgSrc = rawImg
                  ? (rawImg.startsWith('http') ? rawImg : `/media/${rawImg}`)
                  : null;

                return (
                  <div key={item.id} className="cart-item" id={`cart-item-${item.id}`}>
                    {/* Image */}
                    <div className="cart-item-img">
                      {imgSrc
                        ? <img src={imgSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                        : <span style={{ fontSize: '2rem' }}>🛒</span>
                      }
                    </div>

                    {/* Info */}
                    <div className="cart-item-info">
                      <p className="cart-item-name">{name}</p>
                      <p className="cart-item-price">
                        ₹{price.toFixed(2)}
                      </p>

                      {/* Qty + Remove */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <div className="qty-controls">
                          <button
                            className="qty-btn"
                            id={`qty-minus-${item.id}`}
                            onClick={() => addToCart(productId, Math.max(1, item.quantity - 1))}
                          >−</button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            id={`qty-plus-${item.id}`}
                            onClick={() => addToCart(productId, item.quantity + 1)}
                          >+</button>
                        </div>
                        <button
                          className="cart-item-remove"
                          id={`remove-item-${item.id}`}
                          onClick={() => removeFromCart(productId)}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div style={{ fontWeight: 800, color: 'var(--saffron)', fontSize: '1rem', flexShrink: 0 }}>
                      ₹{(price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary column */}
            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span style={{ color: 'var(--green, #22c55e)', fontWeight: 700 }}>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              <button
                id="checkout-btn"
                className="btn btn-primary cart-checkout-btn cta-pulse"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              <Link to="/shops" className="btn btn-ghost btn-full mt-2">
                <ShoppingBag size={14} /> Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
