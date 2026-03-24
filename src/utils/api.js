import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

// Configure API base URL
const API_URL = config.API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh_token = await AsyncStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/users/token/refresh/`, {
          refresh: refresh_token,
        });

        const { access } = response.data;
        await AsyncStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ========== Authentication API ==========
export const authAPI = {
  register: (data) => api.post('/users/register/', data),
  login: (email, password) => api.post('/users/token/', { username: email, password }),
  refreshToken: (refresh_token) => api.post('/users/token/refresh/', { refresh: refresh_token }),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data) => api.put('/users/update_profile/', data),
  getSellers: () => api.get('/users/sellers/'),
};

// ========== Product API ==========
export const productAPI = {
  getCategories: () => api.get('/products/categories/'),
  getSubCategories: (categoryId) => api.get(`/products/subcategories/?category=${categoryId}`),
  getProducts: (params) => api.get('/products/products/', { params }),
  getProductDetail: (id) => api.get(`/products/products/${id}/`),
  searchProducts: (query) => api.get('/products/products/search/', { params: { q: query } }),
  createProduct: (data) => api.post('/products/products/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id, data) => api.put(`/products/products/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (id) => api.delete(`/products/products/${id}/`),
  addProductReview: (productId, data) => api.post(`/products/products/${productId}/add_review/`, data),
  getMyProducts: () => api.get('/products/products/?my_products=true'),
};

// ========== Shop API ==========
export const shopAPI = {
  getShops: (params) => api.get('/shops/', { params }),
  getShopDetail: (id) => api.get(`/shops/${id}/`),
  getNearbyShops: (params) => api.get('/shops/nearby/', { params }),
  createShop: (data) => api.post('/shops/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateShop: (id, data) => api.put(`/shops/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyShop: () => api.get('/shops/my_shop/'),
  addShopReview: (shopId, data) => api.post(`/shops/${shopId}/add_review/`, data),
};

// ========== Cart API ==========
export const cartAPI = {
  getCart: () => api.get('/orders/cart/my_cart/'),
  addItem: (productId, quantity) => api.post('/orders/cart/add_item/', {
    product_id: productId,
    quantity,
  }),
  removeItem: (productId) => api.delete('/orders/cart/remove_item/', {
    data: { product_id: productId },
  }),
  clearCart: () => api.delete('/orders/cart/clear_cart/'),
};

// ========== Order API ==========
export const orderAPI = {
  createOrder: (data) => api.post('/orders/orders/', data),
  getMyOrders: () => api.get('/orders/orders/my_orders/'),
  getOrderDetail: (id) => api.get(`/orders/orders/${id}/`),
  createPayment: (orderId) => api.post(`/orders/orders/${orderId}/create_payment/`),
  verifyPayment: (orderId, data) => api.post(`/orders/orders/${orderId}/verify_payment/`, data),
};

export default api;
