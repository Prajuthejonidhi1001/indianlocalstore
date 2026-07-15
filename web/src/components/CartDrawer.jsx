import { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

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
    const price = item.product?.discount_price || item.product?.price || 0;
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
                const product = item.product;
                if (!product) return null;
                const price = product.discount_price || product.price;

                return (
                  <div key={item.id} className="cd-item">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'} 
                      alt={product.name} 
                      className="cd-item-img" 
                    />
                    <div className="cd-item-details">
                      <div className="cd-item-name">{product.name}</div>
                      
                      {item.variants && Object.keys(item.variants).length > 0 && (
                        <div className="cd-item-variants">
                          {Object.entries(item.variants).map(([k, v]) => (
                            <span key={k} style={{ marginRight: 8 }}>{k}: {v}</span>
                          ))}
                        </div>
                      )}
                      
                      <div className="cd-item-price">₹{price}</div>
                      
                      <div className="cd-item-actions">
                        <div className="cd-qty-controls">
                          <button 
                            className="cd-qty-btn"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeFromCart(item.id);
                                toast.success('Item removed');
                              }
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 600, width: 20, textAlign: 'center' }}>{item.quantity}</span>
                          <button 
                            className="cd-qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button className="cd-remove" onClick={() => {
                          removeFromCart(item.id);
                          toast.success('Item removed');
                        }}>
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
