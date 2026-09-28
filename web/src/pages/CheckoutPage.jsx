import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, addressAPI } from '../api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { cart, cartTotal, cartSubtotal, clearCart } = useCart();
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

  // Address selection state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [addressesLoading, setAddressesLoading] = useState(true);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  useEffect(() => {
    addressAPI.getAddresses()
      .then(res => {
        const data = res.data.results || res.data;
        setAddresses(data);
        const defaultAddr = data.find(a => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          populateFormWithAddress(defaultAddr);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id);
          populateFormWithAddress(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setAddressesLoading(false));
  }, []);

  const populateFormWithAddress = (addr) => {
    setForm(prev => ({
      ...prev,
      delivery_address: addr.address_line,
      delivery_city: addr.city,
      delivery_state: addr.state,
      delivery_pincode: addr.pincode,
    }));
  };

  const handleAddressSelect = (e) => {
    const val = e.target.value;
    setSelectedAddressId(val);
    if (val === 'new') {
      setForm(prev => ({
        ...prev,
        delivery_address: '',
        delivery_city: '',
        delivery_state: '',
        delivery_pincode: '',
      }));
    } else {
      const addr = addresses.find(a => a.id.toString() === val);
      if (addr) populateFormWithAddress(addr);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['delivery_address', 'delivery_city', 'delivery_state', 'delivery_pincode'];
    for (const f of required) {
      if (!form[f]) { toast.error('Please fill all address fields'); return; }
    }

    setLoading(true);
    try {
      const orderData = {
        ...form,
        total_amount: cartTotal,
        final_amount: cartTotal, // Adding shipping/discount logic could go here
      };
      
      const res = await orderAPI.createOrder(orderData);
      
      // Since we chose COD / simulated payment for now
      toast.success(`Order placed successfully! ID: ${res.data.order_id}`);
      await clearCart();
      navigate('/orders');
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
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
                  {!addressesLoading && addresses.length > 0 && (
                    <div className="form-group mb-4">
                      <label className="form-label">Saved Addresses</label>
                      <select 
                        className="form-input" 
                        value={selectedAddressId} 
                        onChange={handleAddressSelect}
                      >
                        {addresses.map(addr => (
                          <option key={addr.id} value={addr.id}>
                            {addr.title} - {addr.address_line}, {addr.city}
                          </option>
                        ))}
                        <option value="new">+ Enter new address</option>
                      </select>
                    </div>
                  )}

                  <div className="form-group mb-3">
                    <label className="form-label">Full Address</label>
                    <textarea 
                      className="form-input" rows={3} placeholder="House No, Building, Street..."
                      value={form.delivery_address} onChange={e => setForm({...form, delivery_address: e.target.value})}
                      disabled={selectedAddressId !== 'new'}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="form-input" value={form.delivery_city} onChange={e => setForm({...form, delivery_city: e.target.value})} disabled={selectedAddressId !== 'new'} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input type="text" className="form-input" value={form.delivery_state} onChange={e => setForm({...form, delivery_state: e.target.value})} disabled={selectedAddressId !== 'new'} />
                    </div>
                  </div>
                  <div className="form-group mt-3">
                    <label className="form-label">Pincode</label>
                    <input type="text" className="form-input" value={form.delivery_pincode} onChange={e => setForm({...form, delivery_pincode: e.target.value})} disabled={selectedAddressId !== 'new'} />
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
                <span>₹{cartSubtotal.toFixed(2)}</span>
              </div>
              
              {cart?.applied_coupon_code && (
                <div className="summary-row" style={{ color: 'var(--green, #22c55e)' }}>
                  <span>Discount ({cart.applied_coupon_code})</span>
                  <span>-₹{(cartSubtotal - cartTotal).toFixed(2)}</span>
                </div>
              )}

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
