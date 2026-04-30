import { useState, useEffect } from 'react';
import { Package, Clock, ChevronRight, Search, XCircle } from 'lucide-react';
import { orderAPI } from '../api';
import toast from 'react-hot-toast';
import './OrdersPage.css';

const STATUS_COLORS = {
  'pending': 'orange',
  'confirmed': 'blue',
  'processing': 'blue',
  'shipped': 'gold',
  'delivered': 'green',
  'cancelled': 'red',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(r => setOrders(r.data.results || r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOrderClick = async (id) => {
    try {
      const res = await orderAPI.getOrderDetail(id);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setCancelling(true);
    try {
      await orderAPI.cancelOrder(selectedOrder.id);
      toast.success('Order cancelled successfully');
      // Refresh orders list and detail
      const [listRes, detailRes] = await Promise.all([
        orderAPI.getMyOrders(),
        orderAPI.getOrderDetail(selectedOrder.id),
      ]);
      setOrders(listRes.data.results || listRes.data);
      setSelectedOrder(detailRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        <div className="section-header">
          <div className="section-label"><Package size={14} /> Tracking</div>
          <h1 id="orders-heading">My Orders</h1>
          <p className="section-subtitle">Track, manage and view your recent orders</p>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Ready to make your first purchase?</p>
          </div>
        ) : (
          <div className="orders-layout">
            <div className="orders-list">
              {orders.map(order => (
                <div 
                  key={order.id} 
                  className={`order-card card ${selectedOrder?.id === order.id ? 'active' : ''}`}
                  onClick={() => handleOrderClick(order.id)}
                  id={`order-card-${order.id}`}
                >
                  <div className="oc-header">
                    <div>
                      <p className="oc-id">Order #{order.order_id}</p>
                      <p className="oc-date"><Clock size={12} /> {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                    </div>
                    <span className={`badge badge-${STATUS_COLORS[order.order_status]}`}>
                      {order.order_status.toUpperCase()}
                    </span>
                  </div>
                  <div className="oc-footer">
                    <p className="oc-total">₹{parseFloat(order.final_amount).toFixed(2)}</p>
                    <div className="oc-arrow"><ChevronRight size={18} /></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-detail-view">
              {selectedOrder ? (
                <div className="card od-card animate-in" id="order-detail-panel">
                  <div className="od-header">
                    <h2>Order #{selectedOrder.order_id}</h2>
                    <span className={`badge badge-${STATUS_COLORS[selectedOrder.order_status]}`}>
                      {selectedOrder.order_status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="od-section">
                    <h4>Delivery Details</h4>
                    <p className="od-text">{selectedOrder.delivery_address}</p>
                    <p className="od-text">{selectedOrder.delivery_city}, {selectedOrder.delivery_state} - {selectedOrder.delivery_pincode}</p>
                  </div>

                  <div className="od-section">
                    <h4>Payment Information</h4>
                    <p className="od-text">Method: <strong style={{textTransform:'uppercase'}}>{selectedOrder.payment_method}</strong></p>
                    <p className="od-text">Status: <span className={`text-${selectedOrder.payment_status === 'completed' ? 'green' : 'orange'}`}>{selectedOrder.payment_status}</span></p>
                  </div>

                  <div className="od-section">
                    <h4>Items</h4>
                    <div className="od-items">
                      {selectedOrder.items?.map(item => (
                        <div key={item.id} className="od-item">
                          <div className="od-item-info">
                            <span className="od-qty">{item.quantity}x</span>
                            <span className="od-name">{item.product_name || `Product #${item.product}`}</span>
                          </div>
                          <div className="od-price">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="od-summary">
                    <div className="summary-row"><span>Subtotal</span><span>₹{selectedOrder.total_amount}</span></div>
                    {parseFloat(selectedOrder.discount_amount) > 0 && (
                      <div className="summary-row text-green"><span>Discount</span><span>-₹{selectedOrder.discount_amount}</span></div>
                    )}
                    <div className="summary-row"><span>Shipping</span><span>₹{selectedOrder.shipping_charge}</span></div>
                    <div className="divider" style={{margin: '0.75rem 0'}} />
                    <div className="summary-row summary-total"><span>Total</span><span>₹{selectedOrder.final_amount}</span></div>
                  </div>

                  {/* Cancel Order — only if pending */}
                  {['pending', 'confirmed'].includes(selectedOrder.order_status) && (
                    <button
                      className="btn-cancel-order"
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      id="cancel-order-btn"
                    >
                      <XCircle size={16} />
                      {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="empty-selection card">
                  <Search size={48} className="text-muted" style={{opacity: 0.3, marginBottom: '1rem'}} />
                  <h4>Select an order</h4>
                  <p className="text-muted text-center">Click on any order from the list to view its complete details here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
