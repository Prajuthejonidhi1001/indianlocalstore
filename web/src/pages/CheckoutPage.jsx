import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    delivery_address: user?.address || '',
    delivery_city: user?.city || '',
    delivery_state: user?.state || '',
    delivery_pincode: user?.pincode || '',
    payment_method: 'cod', // Defaulting to Cash on Delivery for this version
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.delivery_address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }
    if (!form.delivery_city.trim() || !form.delivery_state.trim()) {
      toast.error('Please enter your city and state');
      return;
    }
    if (!/^\d{6}$/.test(form.delivery_pincode.trim())) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    try {
      // Amounts are deliberately not sent. The API recomputes every total from
      // the server-side cart, so anything posted here would be ignored.
      const res = await orderAPI.createOrder({
        delivery_address: form.delivery_address.trim(),
        delivery_city: form.delivery_city.trim(),
        delivery_state: form.delivery_state.trim(),
        delivery_pincode: form.delivery_pincode.trim(),
        payment_method: form.payment_method,
      });

      const orderNumber = res.data?.order_id || res.data?.id;
      toast.success(
        orderNumber
          ? `Order ${orderNumber} placed. Pay cash on delivery.`
          : 'Order placed. Pay cash on delivery.'
      );
      await clearCart();
      navigate('/profile');

    } catch (err) {
      // DRF sends either {error: "..."} or {field: ["..."]}. Show whichever
      // came back so the customer knows what to change.
      const data = err.response?.data;
      let message = 'Could not place your order. Please try again.';
      if (typeof data?.error === 'string') {
        message = data.error;
      } else if (data && typeof data === 'object') {
        const first = Object.values(data)[0];
        if (Array.isArray(first) && first.length) message = String(first[0]);
        else if (typeof first === 'string') message = first;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return null;

  return (
    <div className="page pb-section">
      <div className="container" style={{ paddingTop: '6rem' }}>
        <h1 className="mb-4">Checkout</h1>
        
        <div className="checkout-layout">
          <div className="checkout-form-col">
            <form onSubmit={handleSubmit} id="checkout-form">
              <div className="card checkout-card">
                <div className="checkout-card-header">
                  <div className="ch-icon"><Truck size={18} /></div>
                  <h3>Delivery Address</h3>
                </div>
                <div className="checkout-card-body">
                  <div className="form-group mb-3">
                    <label className="form-label">Full Address</label>
                    <textarea 
                      className="form-input" rows={3} placeholder="House No, Building, Street..."
                      value={form.delivery_address} onChange={e => setForm({...form, delivery_address: e.target.value})}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="form-input" value={form.delivery_city} onChange={e => setForm({...form, delivery_city: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input type="text" className="form-input" value={form.delivery_state} onChange={e => setForm({...form, delivery_state: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group mt-3">
                    <label className="form-label">Pincode</label>
                    <input type="text" className="form-input" value={form.delivery_pincode} onChange={e => setForm({...form, delivery_pincode: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="card checkout-card mt-4">
                <div className="checkout-card-header">
                  <div className="ch-icon"><CreditCard size={18} /></div>
                  <h3>Payment Method</h3>
                </div>
                <div className="checkout-card-body">
                  <div className={`payment-option ${form.payment_method === 'cod' ? 'selected' : ''}`} onClick={() => setForm({...form, payment_method: 'cod'})}>
                    <div className="payment-radio">
                      {form.payment_method === 'cod' && <div className="payment-radio-dot" />}
                    </div>
                    <div className="payment-info">
                      <div className="payment-title">Cash on Delivery (COD)</div>
                      <div className="payment-subtitle">Pay safely when your order arrives.</div>
                    </div>
                  </div>
                  
                  <div className={`payment-option ${form.payment_method === 'razorpay' ? 'selected' : ''}`} style={{opacity: 0.6, cursor: 'not-allowed', marginTop: '0.75rem'}}>
                    <div className="payment-radio">
                      {form.payment_method === 'razorpay' && <div className="payment-radio-dot" />}
                    </div>
                    <div className="payment-info">
                      <div className="flex-between">
                        <div className="payment-title">Online Payment (Razorpay)</div>
                        <span className="badge badge-orange" style={{fontSize: '0.65rem'}}>COMING SOON</span>
                      </div>
                      <div className="payment-subtitle">Pay via UPI, Cards, or NetBanking.</div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-full mt-4" disabled={loading} id="place-order-btn">
                {loading ? <span className="spinner-sm" /> : <><ShieldCheck size={18} /> Place Order - ₹{cartTotal.toFixed(2)}</>}
              </button>
            </form>
          </div>

          <div className="checkout-summary-col">
            <div className="card checkout-summary sticky-top">
              <h3>Order Items</h3>
              <div className="divider" />
              <div className="checkout-items-list">
                {cart.items.map(item => {
                  const price = item.product_price;
                  const name = item.product_name || `Product #${item.product}`;
                  return (
                    <div key={item.id} className="checkout-item-row">
                      <div className="checkout-item-name">
                        <span className="checkout-item-qty" style={{marginRight: '8px'}}>{item.quantity}x</span>
                        <span>{name}</span>
                      </div>
                      <div className="checkout-item-price">₹{(parseFloat(price) * item.quantity).toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="divider" />
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span className="text-green">Free</span>
              </div>
              <div className="divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
