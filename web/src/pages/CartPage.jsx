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
            <p className="section-subtitle">{items.length} items in your cart</p>
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
            <Link to="/products" className="btn btn-primary mt-3">Start Shopping</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-col">
              {items.map(item => {
                const product = item.product;
                const price = product.discount_price || product.price;
                const imgSrc = product.image ? (product.image.startsWith('http') ? product.image : `/media/${product.image}`) : null;

                return (
                  <div key={item.id} className="cart-item-card card" id={`cart-item-${item.id}`}>
                    <Link to={`/products/${product.id}`} className="ci-img-box">
                      {imgSrc ? <img src={imgSrc} alt={product.name} /> : <div>🛒</div>}
                    </Link>
                    <div className="ci-details">
                      <Link to={`/products/${product.id}`} className="ci-name">{product.name}</Link>
                      <p className="ci-price">₹{parseFloat(price).toFixed(2)}</p>
                      
                      <div className="ci-actions">
                        <div className="qty-control sm">
                          <button id={`qty-minus-${item.id}`} onClick={() => addToCart(product.id, Math.max(1, item.quantity - 1))}>-</button>
                          <span>{item.quantity}</span>
                          <button id={`qty-plus-${item.id}`} onClick={() => addToCart(product.id, item.quantity + 1)}>+</button>
                        </div>
                        <button className="ci-remove" id={`remove-item-${item.id}`} onClick={() => removeFromCart(product.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="ci-total">
                      ₹{(parseFloat(price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary-col">
              <div className="summary-card card">
                <h3>Order Summary</h3>
                <div className="divider" />
                <div className="summary-row">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span className="text-green">Free</span>
                </div>
                <div className="divider" />
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                
                <button 
                  id="checkout-btn"
                  className="btn btn-primary btn-full mt-3 cta-pulse"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
                <Link to="/products" className="btn btn-ghost btn-full mt-2">
                  <ShoppingBag size={14} /> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
