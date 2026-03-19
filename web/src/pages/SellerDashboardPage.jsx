import { useState, useEffect } from 'react';
import { Store, Package, ShoppingBag, Plus, Save, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { shopAPI, productAPI, orderAPI } from '../api';
import toast from 'react-hot-toast';
import './SellerDashboardPage.css';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shop Form
  const [shopForm, setShopForm] = useState({ name: '', description: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' });
  const [savingShop, setSavingShop] = useState(false);

  // Product Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', discount_price: '', stock: '', category: '' });
  const [categories, setCategories] = useState([]);
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch seller's shop
        const shopRes = await shopAPI.getShops({ seller: user.id });
        if (shopRes.data.results?.length > 0) {
          const myShop = shopRes.data.results[0];
          setShop(myShop);
          setShopForm(myShop);

          // Fetch shop products
          const prodRes = await productAPI.getProducts({ seller: myShop.id });
          setProducts(prodRes.data.results || prodRes.data);

          // Need categories for product form
          const catRes = await productAPI.getCategories();
          setCategories(catRes.data.results || catRes.data);
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

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      if (!shop) { toast.error('Please complete shop setup first'); return; }
      
      const res = await productAPI.createProduct({
        ...productForm,
        seller: shop.id
      });
      
      setProducts([res.data, ...products]);
      setShowProductModal(false);
      setProductForm({ name: '', description: '', price: '', discount_price: '', stock: '', category: '' });
      toast.success('Product added successfully');
      
    } catch {
      toast.error('Failed to add product');
    } finally {
      setSavingProduct(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page pb-section">
      <div className="container" style={{ paddingTop: '2.5rem' }}>
        <div className="dashboard-header">
          <div>
            <h1 id="dashboard-heading">Seller Dashboard</h1>
            <p className="text-muted">Manage your shop, products, and incoming orders</p>
          </div>
          {shop && (
            <span className={`badge badge-${shop.verification_status === 'verified' ? 'green' : 'orange'}`}>
              Shop Status: {shop.verification_status.toUpperCase()}
            </span>
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
            <button className={`dsb-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} disabled id="tab-orders">
              <ShoppingBag size={18} /> Orders <span className="badge badge-orange" style={{marginLeft:'auto'}}>Soon</span>
            </button>
          </div>

          {/* Content */}
          <div className="dashboard-content">
            {activeTab === 'overview' && (
              <div className="card ds-card animate-in">
                <div className="ds-header">
                  <h2>Shop Information</h2>
                  <p>Update your public shop profile</p>
                </div>
                
                <form onSubmit={handleSaveShop} className="ds-form">
                  <div className="form-group mb-3">
                    <label className="form-label">Shop Name</label>
                    <input type="text" className="form-input" required value={shopForm.name} onChange={e => setShopForm({...shopForm, name: e.target.value})} />
                  </div>
                  
                  <div className="form-group mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={3} required value={shopForm.description} onChange={e => setShopForm({...shopForm, description: e.target.value})} />
                  </div>

                  <div className="form-row mb-3">
                    <div className="form-group">
                      <label className="form-label">Phone Support</label>
                      <input type="tel" className="form-input" required value={shopForm.phone} onChange={e => setShopForm({...shopForm, phone: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Support</label>
                      <input type="email" className="form-input" required value={shopForm.email} onChange={e => setShopForm({...shopForm, email: e.target.value})} />
                    </div>
                  </div>

                  <h3 className="mt-4 mb-3" style={{fontSize: '1rem'}}>Shop Location</h3>
                  <div className="form-group mb-3">
                    <label className="form-label">Full Address</label>
                    <textarea className="form-input" rows={2} required value={shopForm.address} onChange={e => setShopForm({...shopForm, address: e.target.value})} />
                  </div>

                  <div className="form-row mb-4">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="form-input" required value={shopForm.city} onChange={e => setShopForm({...shopForm, city: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input type="text" className="form-input" required value={shopForm.state} onChange={e => setShopForm({...shopForm, state: e.target.value})} />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={savingShop} id="save-shop-btn">
                    {savingShop ? 'Saving...' : <><Save size={16}/> Save Shop Settings</>}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="card ds-card animate-in">
                <div className="ds-header flex-between mb-0">
                  <div>
                    <h2>My Products</h2>
                    <p>Manage your inventory catalog</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowProductModal(true)} disabled={!shop} id="add-product-btn">
                    <Plus size={16}/> Add Product
                  </button>
                </div>

                {!shop ? (
                  <div className="empty-state mt-4">
                    <h3>Shop setup required</h3>
                    <p>Please complete your shop settings first.</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="empty-state mt-4">
                    <div className="empty-state-icon">📦</div>
                    <h3>No products yet</h3>
                    <p>Click the button above to add your first product.</p>
                  </div>
                ) : (
                  <div className="table-responsive mt-4">
                    <table className="ds-table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td className="font-medium">{p.name}</td>
                            <td>₹{p.price}</td>
                            <td>{p.stock}</td>
                            <td>
                              <span className={`badge ${p.is_active ? 'badge-green' : 'badge-orange'}`}>
                                {p.is_active ? 'Active' : 'Draft'}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-ghost btn-sm">Edit</button>
                            </td>
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

        {/* Add Product Modal (Simplified) */}
        {showProductModal && (
          <div className="modal-overlay">
            <div className="modal-content card max-w-md">
              <div className="modal-header">
                <h3>Add New Product</h3>
                <button className="modal-close" onClick={() => setShowProductModal(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleSaveProduct} id="add-product-form">
                <div className="form-group mb-3">
                  <label className="form-label">Product Name</label>
                  <input type="text" className="form-input" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Category</label>
                  <select className="form-input" required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-row mb-3">
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input type="number" step="0.01" className="form-input" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Qty</label>
                    <input type="number" className="form-input" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} />
                  </div>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowProductModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={savingProduct}>
                    {savingProduct ? 'Adding...' : 'Add Product'}
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
