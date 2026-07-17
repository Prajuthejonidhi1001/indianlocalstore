import { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  
  const cartItems = cart?.items || [];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 280); // match animation duration
  };

  const handleCheckout = () => {
    handleClose();
    navigate('/cart'); // Or directly to checkout if we implement direct checkout
  };

  if (!isOpen && !isClosing) return null;

  const totalAmount = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.product_price) || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className={`cart-drawer-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`cart-drawer ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="cd-header">
          <h2><ShoppingCart size={22} /> Your Cart</h2>
          <button className="cd-close" onClick={handleClose}><X size={20} /></button>
        </div>

        <div className="cd-body">
          {cartItems.length === 0 ? (
            <div className="cd-empty">
              <ShoppingCart size={48} />
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything yet.</p>
              <button className="btn btn-outline mt-3" onClick={handleClose}>Continue Shopping</button>
            </div>
          ) : (
            <div>
              {cartItems.map((item) => {
                const productId = item.product;
                if (!productId) return null;
                const name = item.product_name || 'Product';
                const price = parseFloat(item.product_price) || 0;
                const rawImg = item.product_image;
                const imgSrc = rawImg ? (rawImg.startsWith('http') ? rawImg : `/media/${rawImg}`) : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80';

                let itemVariants = item.variants || {};
                if (typeof itemVariants === 'string') {
                  try { itemVariants = JSON.parse(itemVariants); } catch(e) { itemVariants = {}; }
                }

                return (
                  <div key={item.id} className="cd-item">
                    <img 
                      src={imgSrc} 
                      alt={name} 
                      className="cd-item-img" 
                    />
                    <div className="cd-item-details">
                      <div className="cd-item-name">{name}</div>
                      
                      {Object.keys(itemVariants).length > 0 && (
                        <div className="cd-item-variants">
                          {Object.entries(itemVariants).map(([k, v]) => (
                            <span key={k} style={{ marginRight: 8 }}>{k}: {v}</span>
                          ))}
                        </div>
                      )}
                      
                      <div className="cd-item-price">₹{price.toFixed(2)}</div>
                      
                      <div className="cd-item-actions">
                        <div className="cd-qty-controls">
                          <button 
                            className="cd-qty-btn"
                            onClick={() => {
                              if (item.quantity > 1) {
                                addToCart(productId, item.quantity - 1, item.variants);
                              } else {
                                removeFromCart(item.id);
                              }
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 600, width: 20, textAlign: 'center' }}>{item.quantity}</span>
                          <button 
                            className="cd-qty-btn"
                            onClick={() => addToCart(productId, item.quantity + 1, item.variants)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button className="cd-remove" onClick={() => removeFromCart(item.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cd-footer">
            <div className="cd-total-row">
              <span>Subtotal</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>Shipping and taxes calculated at checkout.</p>
            <button className="btn btn-primary cd-checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
