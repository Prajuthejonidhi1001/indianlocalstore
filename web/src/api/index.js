import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post('/api/users/token/refresh/', { refresh });
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
  register: (data) => api.post('/users/register/', data),
  login: (username, password) => api.post('/users/token/', { username, password }),
  refreshToken: (refresh) => api.post('/users/token/refresh/', { refresh }),
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
  updateProduct: (id, data) => api.put(`/products/products/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/products/products/${id}/`),
  addReview: (productId, data) => api.post(`/products/products/${productId}/add_review/`, data),
  getMyProducts: () => api.get('/products/products/my_products/'),
};

// ── Shops ────────────────────────────────────────────
export const shopAPI = {
  getShops: (params) => api.get('/shops/', { params }),
  getShopDetail: (id) => api.get(`/shops/${id}/`),
  getNearbyShops: (lat, lng) => api.get('/shops/nearby/', { params: { latitude: lat, longitude: lng } }),
  createShop: (data) => api.post('/shops/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateShop: (id, data) => api.put(`/shops/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyShop: () => api.get('/shops/my_shop/'),
  addReview: (shopId, data) => api.post(`/shops/${shopId}/add_review/`, data),
};

// ── Cart ──────────────────────────────────────────────
export const cartAPI = {
  getCart: () => api.get('/orders/cart/my_cart/'),
  addItem: (productId, quantity) => api.post('/orders/cart/add_item/', { product_id: productId, quantity }),
  removeItem: (productId) => api.delete('/orders/cart/remove_item/', { data: { product_id: productId } }),
  clearCart: () => api.delete('/orders/cart/clear_cart/'),
};

// ── Orders ────────────────────────────────────────────
export const orderAPI = {
  createOrder: (data) => api.post('/orders/orders/', data),
  getMyOrders: () => api.get('/orders/orders/my_orders/'),
  getOrderDetail: (id) => api.get(`/orders/orders/${id}/`),
};

export default api;
