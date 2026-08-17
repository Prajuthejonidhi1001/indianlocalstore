import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://indianlocalstore-api-cjiq.onrender.com/api' : '/api'),
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Don't attach token to auth endpoints, to prevent expired tokens from 
    // causing a 401 on endpoints that are meant to be AllowAny
    const isAuthEndpoint = config.url?.includes('/users/verify_otp/') || 
                           config.url?.includes('/users/send_otp/') || 
                           config.url?.includes('/users/token/') ||
                           config.url?.includes('/users/register/');
                           
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (
        original.url?.includes('/users/token/') ||
        original.url?.includes('/users/verify_otp/') ||
        original.url?.includes('/users/send_otp/')
      ) {
        return Promise.reject(error);
      }
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        
        // Use the configured api instance but skip the interceptor loop
        // by making sure the URL matches the skip condition above
        const { data } = await axios.post(
          `${api.defaults.baseURL}/users/token/refresh/`, 
          { refresh }
        );
        
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  sendPhoneOtp: (phone, email) => api.post('/users/send_otp/', { phone, email }),
  verifyPhoneOtp: (firebase_token, email_otp, role, first_name, last_name) => 
    api.post('/users/verify_otp/', { firebase_token, email_otp, role, first_name, last_name }),
  // Legacy register for testing if needed
  register: (data) => api.post('/users/register/', data),
  // Standard tokens
  refreshToken: (refresh) => api.post('/users/token/refresh/', { refresh }),
  logout: (refresh) => api.post('/users/logout/', { refresh }),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data) => api.put('/users/update_profile/', data),
  getSellers: () => api.get('/users/sellers/'),
};

// ── Products ──────────────────────────────────────────
export const productAPI = {
  getCategories: () => api.get('/products/categories/'),
  getSubCategories: (categoryId) => api.get(`/products/subcategories/?category=${categoryId}`),
  getProducts: (params) => api.get('/products/products/', { params }),
  getProductDetail: (id) => api.get(`/products/products/${id}/`),
  searchProducts: (query) => api.get('/products/products/search/', { params: { q: query } }),
  createProduct: (data) => api.post('/products/products/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, data) => api.patch(`/products/products/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/products/products/${id}/`),
  addReview: (productId, data) => api.post(`/products/products/${productId}/add_review/`, data),
  getMyProducts: () => api.get('/products/products/my_products/'),
};

// ── Shops ────────────────────────────────────────────
export const shopAPI = {
  getShops: (params) => api.get('/shops/', { params }),
  getShopDetail: (id) => api.get(`/shops/${id}/`),
  getNearbyShops: (lat, lng) => api.get('/shops/nearby/', { params: { latitude: lat, longitude: lng } }),
  createShop: (data) => api.post('/shops/', data),
  updateShop: (id, data) => api.patch(`/shops/${id}/`, data),
  getMyShop: () => api.get('/shops/my_shop/'),
  addReview: (shopId, data) => api.post(`/shops/${shopId}/add_review/`, data),
};

// ── Cart ──────────────────────────────────────────────
export const cartAPI = {
  getCart: () => api.get('/orders/cart/my_cart/'),
  addItem: (productId, quantity, variants = {}) => api.post('/orders/cart/add_item/', { product_id: productId, quantity, variants }),
  removeItem: (itemId) => api.delete('/orders/cart/remove_item/', { data: { item_id: itemId } }),
  clearCart: () => api.delete('/orders/cart/clear_cart/'),
};

// ── Orders ────────────────────────────────────────────
export const orderAPI = {
  createOrder: (data) => api.post('/orders/orders/', data),
  getMyOrders: () => api.get('/orders/orders/my_orders/'),
  getOrderDetail: (id) => api.get(`/orders/orders/${id}/`),
  createPayment: (id) => api.post(`/orders/orders/${id}/create_payment/`),
  verifyPayment: (id, data) => api.post(`/orders/orders/${id}/verify_payment/`, data),
  cancelOrder: (id) => api.post(`/orders/orders/${id}/cancel/`),
  
  // Seller Actions
  getSellerOrders: () => api.get('/orders/orders/seller_orders/'),
  dispatchOrder: (id) => api.post(`/orders/orders/${id}/dispatch_order/`),
};

export default api;
