import { useState, useEffect } from 'react';
import { Store, Package, ShoppingBag, Plus, Save, X, Truck, Hash, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { shopAPI, productAPI } from '../api';
import toast from 'react-hot-toast';
import './SellerDashboardPage.css';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shop Form
  const [shopForm, setShopForm] = useState({
    name: '', description: '', phone: '', email: '',
    address: '', city: '', state: '', pincode: '',
    is_open: true,
    online_delivery_enabled: false,
  });
  const [savingShop, setSavingShop] = useState(false);

  // Product Form — no category/subcategory
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', discount_price: '', stock: '',
  });
  const [productImages, setProductImages] = useState([]);
  const [savingProduct, setSavingProduct] = useState(false);

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
      Object.keys(productForm).forEach(key => {
        if (productForm[key]) formData.append(key, productForm[key]);
      });
      formData.append('image', productImages[0]);
      productImages.slice(1).forEach(img => formData.append('images', img));

      await productAPI.createProduct(formData);
      const freshProducts = await productAPI.getMyProducts();
      setProducts(freshProducts.data.results || freshProducts.data);
      setShowProductModal(false);
      setProductForm({ name: '', description: '', price: '', discount_price: '', stock: '' });
      setProductImages([]);
      toast.success('✅ Product added!');
    } catch (err) {
      const data = err?.response?.data;
      const msg = data ? Object.values(data)[0]?.[0] || JSON.stringify(data) : 'Failed to add product';
      toast.error(msg);
    } finally {
      setSavingProduct(false);
    }
  };

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
            <button className={`dsb-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} id="tab-overview">
              <Store size={18} /> Shop Settings
            </button>
            <button className={`dsb-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')} id="tab-products">
              <Package size={18} /> My Products
            </button>
            <button className={`dsb-link`} disabled id="tab-orders">
              <ShoppingBag size={18} /> Orders <span className="badge badge-orange" style={{ marginLeft: 'auto' }}>Soon</span>
            </button>
          </div>

          {/* Content */}
          <div className="dashboard-content">

            {/* ── SHOP SETTINGS ── */}
            {activeTab === 'overview' && (
              <div className="card ds-card animate-in">
                <div className="ds-header">
                  <h2>Shop Settings</h2>
                  <p>Manage your shop status and profile</p>
                </div>
                <form onSubmit={handleSaveShop} className="ds-form">

                  {/* Two toggles at TOP */}
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
          </div>
        </div>

        {/* Add Product Modal */}
        {showProductModal && (
          <div className="modal-overlay">
            <div className="modal-content card" style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <h3>Add New Product</h3>
                <button className="modal-close" onClick={() => setShowProductModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveProduct} id="add-product-form">
                <div className="form-group mb-3">
                  <label className="form-label">Product Name *</label>
                  <input type="text" className="form-input" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Images * (1–5, square preferred)</label>
                  <input type="file" className="form-input" accept="image/*" multiple required onChange={handleImageChange} style={{ padding: '0.6rem' }} id="product-images-input" />
                  {productImages.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      {productImages.map((img, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={URL.createObjectURL(img)} alt="" className="product-thumb-square" />
                          {i === 0 && <span style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 9, background: 'var(--primary)', color: '#fff', borderRadius: 3, padding: '1px 4px' }}>Main</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-row mb-3">
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input type="number" step="0.01" className="form-input" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Price (₹)</label>
                    <input type="number" step="0.01" className="form-input" value={productForm.discount_price} onChange={e => setProductForm({ ...productForm, discount_price: e.target.value })} />
                  </div>
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Stock *</label>
                  <input type="number" className="form-input" required value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Description *</label>
                  <textarea className="form-input" rows={3} required value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowProductModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={savingProduct} id="submit-product-btn">
                    {savingProduct ? 'Adding...' : <><Plus size={16} /> Add Product</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
