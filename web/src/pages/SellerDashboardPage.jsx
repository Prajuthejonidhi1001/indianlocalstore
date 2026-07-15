import { useState, useEffect } from 'react';
import { Store, Package, ShoppingBag, Plus, Save, X, Truck, Hash, ToggleLeft, ToggleRight, Settings, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { shopAPI, productAPI, orderAPI } from '../api';
import toast from 'react-hot-toast';
import './SellerDashboardPage.css';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shop Form
  const [shopForm, setShopForm] = useState({
    name: '', description: '', phone: '', email: '',
    address: '', city: '', state: '', pincode: '',
    is_open: true,
    online_delivery_enabled: false,
  });
  const [savingShop, setSavingShop] = useState(false);

  // Product Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState('basic');
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', discount_price: '', stock: '',
    category: '', subcategory: '', variants: []
  });
  const [productImages, setProductImages] = useState([]);
  const [customVariant, setCustomVariant] = useState({ type: '', value: '' });
  const [savingProduct, setSavingProduct] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [productSubcats, setProductSubcats] = useState([]);

  // Default category saved during seller signup
  const defaultCatId   = localStorage.getItem('seller_default_category') || '';
  const defaultCatName = localStorage.getItem('seller_default_category_name') || '';
  const defaultSubId   = localStorage.getItem('seller_default_subcategory') || '';
  const defaultSubName = localStorage.getItem('seller_default_subcategory_name') || '';


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await productAPI.getCategories();
        setAllCategories(catRes.data.results || catRes.data);

        try {
          const shopRes = await shopAPI.getMyShop();
          const shopData = shopRes.data;
          setShop(shopData);
          setShopForm({
            name: shopData.name || '',
            description: shopData.description || '',
            phone: shopData.phone || '',
            email: shopData.email || '',
            address: shopData.address || '',
            city: shopData.city || '',
            state: shopData.state || '',
            pincode: shopData.pincode || '',
            is_open: shopData.is_open ?? true,
            online_delivery_enabled: shopData.online_delivery_enabled ?? false,
          });

          const prodRes = await productAPI.getMyProducts();
          setProducts(prodRes.data.results || prodRes.data);

          try {
            const ordRes = await orderAPI.getSellerOrders();
            setSellerOrders(ordRes.data.results || ordRes.data);
          } catch (ordErr) {
            console.error("Orders fetch failed", ordErr);
          }
        } catch (shopErr) {
          if (shopErr.response?.status !== 404) console.error(shopErr);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSaveShop = async (e) => {
    e.preventDefault();
    setSavingShop(true);
    try {
      if (shop) {
        const res = await shopAPI.updateShop(shop.id, shopForm);
        setShop(res.data);
        toast.success('Shop details updated');
      } else {
        const res = await shopAPI.createShop(shopForm);
        setShop(res.data);
        toast.success('Shop created successfully');
      }
    } catch {
      toast.error('Failed to save shop');
    } finally {
      setSavingShop(false);
    }
  };

  // Quick toggle for is_open (saves immediately)
  const handleToggleOpen = async () => {
    if (!shop) return;
    const newVal = !shopForm.is_open;
    setShopForm(f => ({ ...f, is_open: newVal }));
    try {
      await shopAPI.updateShop(shop.id, { ...shopForm, is_open: newVal });
      setShop(s => ({ ...s, is_open: newVal }));
      toast.success(newVal ? '🟢 Shop is now Open' : '🔴 Shop is now Closed');
    } catch {
      setShopForm(f => ({ ...f, is_open: !newVal }));
      toast.error('Failed to update shop status');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setProductImages(files);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!shop) { toast.error('Please complete shop setup first'); return; }
    if (productImages.length === 0) { toast.error('At least 1 product image is required'); return; }
    setSavingProduct(true);
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      if (productForm.discount_price) formData.append('discount_price', productForm.discount_price);
      formData.append('stock', productForm.stock);
      // Use default category from signup (stored in localStorage)
      const catId = defaultCatId || productForm.category;
      const subId = defaultSubId || productForm.subcategory;
      if (catId) formData.append('category', catId);
      if (subId) formData.append('subcategory', subId);
      if (productForm.variants.length > 0) formData.append('variants', JSON.stringify(productForm.variants));
      formData.append('image', productImages[0]);
      productImages.slice(1).forEach(img => formData.append('images', img));

      await productAPI.createProduct(formData);
      const freshProducts = await productAPI.getMyProducts();
      setProducts(freshProducts.data.results || freshProducts.data);
      setShowProductModal(false);
      setProductForm({ name: '', description: '', price: '', discount_price: '', stock: '', category: '', subcategory: '', variants: [] });
      setProductImages([]);
      setProductSubcats([]);
      toast.success('✅ Product added!');
    } catch (err) {
      const data = err?.response?.data;
      const msg = data ? Object.values(data)[0]?.[0] || JSON.stringify(data) : 'Failed to add product';
      toast.error(msg);
    } finally {
      setSavingProduct(false);
    }
  };

  // Only needed if seller wants to manually pick category (fallback)
  const handleProductCatChange = async (catId) => {
    setProductForm(f => ({ ...f, category: catId, subcategory: '' }));
    setProductSubcats([]);
    if (catId) {
      try {
        const r = await productAPI.getSubCategories(catId);
        setProductSubcats(r.data.results || r.data);
      } catch {}
    }
  };

  const handleToggleVariant = (variantType, variantValue) => {
    const existing = productForm.variants.find(v => v.type === variantType);
    let newVariants = [...productForm.variants];
    
    if (existing) {
      if (existing.values.includes(variantValue)) {
        existing.values = existing.values.filter(v => v !== variantValue);
        if (existing.values.length === 0) {
          newVariants = newVariants.filter(v => v.type !== variantType);
        }
      } else {
        existing.values.push(variantValue);
      }
    } else {
      newVariants.push({ type: variantType, values: [variantValue] });
    }
    setProductForm({ ...productForm, variants: newVariants });
  };

  const activeCategoryName = allCategories.find(c => c.id === (productForm.category || defaultCatId))?.name || defaultCatName;
  const isApparel = activeCategoryName.toLowerCase().includes('clothing') || activeCategoryName.toLowerCase().includes('apparel') || activeCategoryName.toLowerCase().includes('fashion');
  const isFootwear = activeCategoryName.toLowerCase().includes('footwear') || activeCategoryName.toLowerCase().includes('shoes');

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page pb-section">
      <div className="container" style={{ paddingTop: '2.5rem' }}>

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 id="dashboard-heading">Seller Dashboard</h1>
            <p className="text-muted">Manage your shop, products, and catalog</p>
          </div>
          {shop && (
            <div className="dash-header-right">
              {shop.shop_code && (
                <div className="shop-id-badge">
                  <Hash size={12} />
                  <span>{String(shop.shop_code).slice(0, 8).toUpperCase()}</span>
                </div>
              )}
              {/* Shop Open/Closed toggle in header */}
              <button
                className={`shop-open-toggle ${shopForm.is_open ? 'open' : 'closed'}`}
                onClick={handleToggleOpen}
                id="shop-open-toggle-btn"
              >
                {shopForm.is_open ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                {shopForm.is_open ? 'Open' : 'Closed'}
              </button>
              <span className={`badge badge-${shop.verification_status === 'verified' ? 'green' : 'orange'}`}>
                {shop.verification_status?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="dashboard-layout">
          {/* Sidebar */}
          <div className="dashboard-sidebar card">
            <button className={`dsb-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} id="tab-dashboard">
              <Store size={18} /> Dashboard
            </button>
            <button className={`dsb-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')} id="tab-products">
              <Package size={18} /> Inventory
            </button>
            <button className={`dsb-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} id="tab-orders">
              <ShoppingBag size={18} /> Orders
            </button>
            <button className={`dsb-link ${activeTab === 'marketing' ? 'active' : ''}`} onClick={() => setActiveTab('marketing')} id="tab-marketing">
              <Star size={18} /> Marketing
            </button>
            <button className={`dsb-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} id="tab-overview">
              <Settings size={18} /> Settings
            </button>
          </div>

          {/* Content */}
          <div className="dashboard-content">

            {/* ── DASHBOARD / ANALYTICS ── */}
            {activeTab === 'dashboard' && (
              <div className="card ds-card animate-in fade-in">
                <div className="ds-header">
                  <h2>Dashboard Overview</h2>
                  <p>Track your shop's performance and recent activity</p>
                </div>
                
                <div className="analytics-grid mb-4">
                  <div className="analytics-card">
                    <div className="ac-icon"><TrendingUp size={20} color="#2ECC71" /></div>
                    <div className="ac-info">
                      <h4>Total Revenue</h4>
                      <h2>₹{sellerOrders.reduce((acc, o) => acc + (o.order_status !== 'cancelled' ? parseFloat(o.total_amount || 0) : 0), 0).toFixed(2)}</h2>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="ac-icon"><ShoppingBag size={20} color="var(--primary)" /></div>
                    <div className="ac-info">
                      <h4>Total Orders</h4>
                      <h2>{sellerOrders.length}</h2>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="ac-icon"><Package size={20} color="var(--saffron)" /></div>
                    <div className="ac-info">
                      <h4>Active Products</h4>
                      <h2>{products.filter(p => p.is_active).length}</h2>
                    </div>
                  </div>
                </div>

                <div className="dashboard-widgets">
                  <div className="widget-card">
                    <h3>Low Stock Alerts <AlertTriangle size={16} color="#E74C3C" /></h3>
                    {products.filter(p => p.stock < 5).length > 0 ? (
                      <ul className="alert-list">
                        {products.filter(p => p.stock < 5).slice(0,5).map(p => (
                          <li key={p.id}>
                            <span>{p.name}</span>
                            <strong style={{ color: p.stock === 0 ? '#E74C3C' : '#F39C12' }}>{p.stock} left</strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>All products are well stocked.</p>
                    )}
                  </div>
                  <div className="widget-card">
                    <h3>Recent Orders</h3>
                    {sellerOrders.slice(0,3).map(o => (
                      <div key={o.id} className="recent-order-item">
                        <div>
                          <strong>{o.order_id}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.delivery_city}</div>
                        </div>
                        <span className={`badge badge-${o.order_status === 'pending' ? 'orange' : 'blue'}`}>{o.order_status}</span>
                      </div>
                    ))}
                    {sellerOrders.length === 0 && <p className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>No recent orders.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── SHOP SETTINGS ── */}
            {activeTab === 'overview' && (
              <div className="card ds-card animate-in">
                <div className="ds-header">
                  <h2>Shop Settings</h2>
                  <p>Manage your shop status and profile</p>
                </div>
                <form onSubmit={handleSaveShop} className="ds-form">

                  {/* Default category info banner */}
                {(defaultCatName) && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.2)',
                    borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem',
                    fontSize: '0.88rem', color: 'var(--saffron)'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🏷️</span>
                    <div>
                      <strong>Shop Category:</strong> {defaultCatName}
                      {defaultSubName && <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>› {defaultSubName}</span>}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>All your products are listed under this category</div>
                    </div>
                  </div>
                )}

                  <div className="toggles-row mb-4">
                    <div className="toggle-card">
                      <div className="toggle-card-info">
                        <span className="toggle-card-icon">🟢</span>
                        <div>
                          <p className="toggle-card-label">Shop Status</p>
                          <p className="toggle-card-sub">{shopForm.is_open ? 'Currently Open' : 'Currently Closed'}</p>
                        </div>
                      </div>
                      <button type="button" className={`toggle-switch ${shopForm.is_open ? 'on' : ''}`}
                        onClick={() => setShopForm(f => ({ ...f, is_open: !f.is_open }))} id="is-open-toggle">
                        <span className="toggle-thumb" />
                      </button>
                    </div>

                    <div className="toggle-card">
                      <div className="toggle-card-info">
                        <Truck size={18} style={{ color: 'var(--saffron)' }} />
                        <div>
                          <p className="toggle-card-label">Online Delivery</p>
                          <p className="toggle-card-sub">{shopForm.online_delivery_enabled ? 'Delivery enabled' : 'No delivery'}</p>
                        </div>
                      </div>
                      <button type="button" className={`toggle-switch ${shopForm.online_delivery_enabled ? 'on' : ''}`}
                        onClick={() => setShopForm(f => ({ ...f, online_delivery_enabled: !f.online_delivery_enabled }))} id="delivery-toggle">
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                  </div>

                  {/* Shop Info Fields */}
                  <div className="form-group mb-3">
                    <label className="form-label">Shop Name *</label>
                    <input type="text" className="form-input" required value={shopForm.name} onChange={e => setShopForm({ ...shopForm, name: e.target.value })} />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={3} value={shopForm.description} onChange={e => setShopForm({ ...shopForm, description: e.target.value })} />
                  </div>
                  <div className="form-row mb-3">
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input type="tel" className="form-input" value={shopForm.phone} onChange={e => setShopForm({ ...shopForm, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" value={shopForm.email} onChange={e => setShopForm({ ...shopForm, email: e.target.value })} />
                    </div>
                  </div>

                  <h3 className="mt-3 mb-3" style={{ fontSize: '1rem' }}>Shop Location</h3>
                  <div className="form-group mb-3">
                    <label className="form-label">Full Address</label>
                    <textarea className="form-input" rows={2} value={shopForm.address} onChange={e => setShopForm({ ...shopForm, address: e.target.value })} />
                  </div>
                  <div className="form-row mb-4">
                    <div className="form-group">
                      <label className="form-label">📍 Area / City</label>
                      <input type="text" className="form-input" value={shopForm.city} onChange={e => setShopForm({ ...shopForm, city: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">🏛️ State (Auto)</label>
                      <input type="text" className="form-input" value={shopForm.state} onChange={e => setShopForm({ ...shopForm, state: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">🗺️ District / Pincode</label>
                      <input type="text" className="form-input" value={shopForm.pincode} onChange={e => setShopForm({ ...shopForm, pincode: e.target.value })} />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={savingShop} id="save-shop-btn">
                    {savingShop ? 'Saving...' : <><Save size={16} /> Save Shop Settings</>}
                  </button>
                </form>
              </div>
            )}

            {/* ── PRODUCTS ── */}
            {activeTab === 'products' && (
              <div className="card ds-card animate-in">
                <div className="ds-header flex-between mb-0">
                  <div><h2>My Products</h2><p>Manage your inventory</p></div>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowProductModal(true)} disabled={!shop} id="add-product-btn">
                    <Plus size={16} /> Add Product
                  </button>
                </div>
                {!shop ? (
                  <div className="empty-state mt-4"><h3>Setup your shop first</h3></div>
                ) : products.length === 0 ? (
                  <div className="empty-state mt-4">
                    <div className="empty-state-icon">📦</div>
                    <h3>No products yet</h3>
                    <p>Click the button above to add your first product.</p>
                  </div>
                ) : (
                  <div className="table-responsive mt-4">
                    <table className="ds-table">
                      <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td className="font-medium">
                              {p.image && <img src={p.image} alt={p.name} className="product-thumb-square" style={{ marginRight: 8, verticalAlign: 'middle', display: 'inline-block' }} />}
                              {p.name}
                            </td>
                            <td>₹{p.price}</td>
                            <td>{p.stock}</td>
                            <td><span className={`badge ${p.is_active ? 'badge-green' : 'badge-orange'}`}>{p.is_active ? 'Active' : 'Draft'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── ORDERS ── */}
            {activeTab === 'orders' && (
              <div className="card ds-card animate-in">
                <div className="ds-header flex-between mb-0">
                  <div><h2>Shop Orders</h2><p>Manage and dispatch your orders</p></div>
                </div>
                {sellerOrders.length === 0 ? (
                  <div className="empty-state mt-4">
                    <div className="empty-state-icon">🛒</div>
                    <h3>No orders yet</h3>
                    <p>When customers buy your products, they will appear here.</p>
                  </div>
                ) : (
                  <div className="table-responsive mt-4">
                    <table className="ds-table">
                      <thead><tr><th>Order ID</th><th>Customer</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {sellerOrders.map(o => (
                          <tr key={o.id}>
                            <td className="font-medium">{o.order_id}</td>
                            <td>{o.delivery_city}</td>
                            <td><span className={`badge badge-${o.order_status === 'pending' ? 'orange' : 'blue'}`}>{o.order_status}</span></td>
                            <td>
                              {(o.order_status === 'pending' || o.order_status === 'confirmed') ? (
                                <button className="btn btn-primary btn-sm" onClick={() => {
                                  toast.promise(orderAPI.dispatchOrder(o.id), {
                                    loading: 'Dispatching...',
                                    success: 'Order Dispatched to Delivery Partner!',
                                    error: 'Failed to dispatch'
                                  }).then(() => {
                                    // Refresh orders
                                    orderAPI.getSellerOrders().then(res => setSellerOrders(res.data.results || res.data));
                                  });
                                }}>
                                  Dispatch
                                </button>
                              ) : (
                                <a href={o.tracking_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Track</a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── MARKETING ── */}
            {activeTab === 'marketing' && (
              <div className="card ds-card animate-in fade-in">
                <div className="ds-header mb-0">
                  <h2>Marketing & Promotions</h2>
                  <p>Boost your sales with campaigns and discounts</p>
                </div>
                
                <div className="empty-state mt-4">
                  <div className="empty-state-icon">🎉</div>
                  <h3>Create your first campaign</h3>
                  <p>Coming Soon! You will be able to create store-wide coupons and run flash sales to attract more customers.</p>
                  <button className="btn btn-primary mt-3" disabled>Create Coupon (Coming Soon)</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Product Modal */}
        {showProductModal && (
          <div className="modal-overlay">
            <div className="modal-content product-modal-container">
              <div className="product-modal-sidebar">
                <div className="pms-header">
                  <h3>Add Product</h3>
                  <p>List a new item for sale</p>
                </div>
                <nav className="pms-nav">
                  <button type="button" className={`pms-nav-item ${activeProductTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveProductTab('basic')}>Basic Info</button>
                  <button type="button" className={`pms-nav-item ${activeProductTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveProductTab('pricing')}>Pricing & Inventory</button>
                  <button type="button" className={`pms-nav-item ${activeProductTab === 'media' ? 'active' : ''}`} onClick={() => setActiveProductTab('media')}>Media</button>
                  <button type="button" className={`pms-nav-item ${activeProductTab === 'variants' ? 'active' : ''}`} onClick={() => setActiveProductTab('variants')}>Variants</button>
                </nav>
              </div>

              <div className="product-modal-content-area">
                <div className="modal-header border-bottom-0 pb-0">
                  <h3 className="tab-title">
                    {activeProductTab === 'basic' && 'Basic Information'}
                    {activeProductTab === 'pricing' && 'Pricing & Inventory'}
                    {activeProductTab === 'media' && 'Product Media'}
                    {activeProductTab === 'variants' && 'Options & Variants'}
                  </h3>
                  <button className="modal-close" onClick={() => setShowProductModal(false)}><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveProduct} id="add-product-form" className="product-modal-form">
                  <div className="product-tab-content">
                    {activeProductTab === 'basic' && (
                      <div className="animate-in fade-in">
                        <div className="form-group mb-4">
                          <label className="form-label">Product Name *</label>
                          <input type="text" className="form-input" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Premium Cotton T-Shirt" />
                        </div>
                        <div className="form-group mb-4">
                          <label className="form-label">Description *</label>
                          <textarea className="form-input" rows={6} required value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Describe your product in detail..." />
                        </div>
                      </div>
                    )}

                    {activeProductTab === 'pricing' && (
                      <div className="animate-in fade-in">
                        <div className="form-row mb-4">
                          <div className="form-group">
                            <label className="form-label">Price (₹) *</label>
                            <div className="input-with-prefix">
                              <span className="input-prefix">₹</span>
                              <input type="number" step="0.01" className="form-input" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="0.00" />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Discount Price (₹)</label>
                            <div className="input-with-prefix">
                              <span className="input-prefix">₹</span>
                              <input type="number" step="0.01" className="form-input" value={productForm.discount_price} onChange={e => setProductForm({ ...productForm, discount_price: e.target.value })} placeholder="0.00" />
                            </div>
                            <small className="text-muted mt-1" style={{ fontSize: 11 }}>Optional. Will display alongside a strikethrough original price.</small>
                          </div>
                        </div>
                        <div className="form-group mb-4">
                          <label className="form-label">Stock Quantity *</label>
                          <input type="number" className="form-input" required value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} placeholder="e.g. 50" />
                        </div>
                      </div>
                    )}

                    {activeProductTab === 'media' && (
                      <div className="animate-in fade-in">
                        <div className="form-group mb-4">
                          <label className="form-label">Product Images * (1–5)</label>
                          <div className="dropzone-area">
                            <Package size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                            <p style={{ fontWeight: 600, marginBottom: 4 }}>Drag & drop images here</p>
                            <p className="text-muted" style={{ fontSize: 12, marginBottom: 16 }}>or click to browse from your device</p>
                            <input type="file" className="dropzone-input" accept="image/*" multiple required onChange={handleImageChange} id="product-images-input" />
                            <button type="button" className="btn btn-outline btn-sm">Select Files</button>
                          </div>

                          {productImages.length > 0 && (
                            <div className="media-preview-grid">
                              {productImages.map((img, i) => (
                                <div key={i} className="media-preview-item">
                                  <img src={URL.createObjectURL(img)} alt="" />
                                  {i === 0 && <span className="media-badge">Main</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeProductTab === 'variants' && (
                      <div className="animate-in fade-in">
                        <div className="variants-section">
                          <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
                            Add variants if your product comes in different options like sizes or colors. Customers will need to select these when purchasing.
                          </p>

                          <div style={{ marginBottom: 24 }}>
                            <label className="form-label text-sm text-muted">Sizes</label>
                            <div className="variants-grid">
                              {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '5', '6', '7', '8', '9', '10', '11', '12', 'Free Size'].map(size => {
                                const isActive = productForm.variants.find(v => v.type === 'Size')?.values.includes(size);
                                return (
                                  <button type="button" key={size} className={`variant-size-box ${isActive ? 'active' : ''}`} onClick={() => handleToggleVariant('Size', size)}>
                                    {size}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="form-label text-sm text-muted">Colors</label>
                            <div className="variants-color-grid">
                              {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Brown', 'Grey', 'Navy', 'Pink', 'Purple', 'Orange', 'Gold', 'Silver'].map(color => {
                                const isActive = productForm.variants.find(v => v.type === 'Color')?.values.includes(color);
                                const colorHexMap = { Black:'#000', White:'#FFF', Red:'#FF3B30', Blue:'#007AFF', Green:'#34C759', Yellow:'#FFCC00', Brown:'#A2845E', Grey:'#8E8E93', Navy:'#000080', Pink:'#FFC0CB', Purple:'#800080', Orange:'#FFA500', Gold:'#FFD700', Silver:'#C0C0C0' };
                                const hex = colorHexMap[color] || color;
                                return (
                                  <div key={color} className={`variant-color-circle-wrap ${isActive ? 'active' : ''}`} onClick={() => handleToggleVariant('Color', color)} title={color}>
                                    <div className="variant-color-circle" style={{ backgroundColor: hex }} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <label className="form-label text-sm text-muted">Add Custom Variant (e.g. Material, Storage)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Type (e.g. Storage)" 
                                value={customVariant.type}
                                onChange={e => setCustomVariant({...customVariant, type: e.target.value})}
                              />
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Value (e.g. 128GB)" 
                                value={customVariant.value}
                                onChange={e => setCustomVariant({...customVariant, value: e.target.value})}
                              />
                              <button 
                                type="button" 
                                className="btn btn-outline"
                                onClick={() => {
                                  if(customVariant.type && customVariant.value) {
                                    handleToggleVariant(customVariant.type, customVariant.value);
                                    setCustomVariant({type: '', value: ''});
                                  }
                                }}
                              >
                                Add
                              </button>
                            </div>
                            
                            {/* Render active custom variants */}
                            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {productForm.variants.filter(v => v.type !== 'Size' && v.type !== 'Color').map(v => (
                                <div key={v.type} style={{ width: '100%' }}>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{v.type}</span>
                                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {v.values.map(val => (
                                      <button type="button" key={val} className="variant-size-box active" onClick={() => handleToggleVariant(v.type, val)}>
                                        {val} &times;
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="product-modal-footer">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowProductModal(false)}>Cancel</button>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {activeProductTab !== 'variants' ? (
                        <button type="button" className="btn btn-outline" onClick={() => {
                          const tabs = ['basic', 'pricing', 'media', 'variants'];
                          const nextTab = tabs[tabs.indexOf(activeProductTab) + 1];
                          setActiveProductTab(nextTab);
                        }}>Next Step</button>
                      ) : (
                        <button type="submit" className="btn btn-primary" disabled={savingProduct} id="submit-product-btn">
                          {savingProduct ? 'Saving...' : <><Save size={16} /> Publish Product</>}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
