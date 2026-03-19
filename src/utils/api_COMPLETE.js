/**
 * API Utilities
 * =============
 * 
 * This file handles all communication with the Django backend.
 * All API calls go through here, making it easy to:
 * - Update API endpoint
 * - Handle tokens
 * - Manage errors globally
 * - Log requests/responses
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ============ CONFIGURE THIS ============
// Replace with your computer's IP address or API server URL
const API_BASE_URL = 'http://YOUR_IP:8000/api/';
// ========================================

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/**
 * Add token to every request header
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Handle responses and refresh token if expired
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired (401), try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        await AsyncStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, user needs to login again
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION ====================

/**
 * Register new user
 * 
 * Endpoint: POST /api/users/register/
 * 
 * @param {Object} userData - User registration data
 * @returns {Promise<{success, error}>}
 * 
 * Example:
 * registerUser({
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   phone: '9876543210',
 *   password: 'Pass123',
 *   role: 'customer'
 * })
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post('users/register/', userData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.[Object.keys(error.response.data)[0]][0] || 'Registration failed',
    };
  }
};

/**
 * Login user and get tokens
 * 
 * Endpoint: POST /api/token/
 * 
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<{success, error}>}
 * 
 * Example:
 * loginUser('john_doe', 'Pass123')
 */
export const loginUser = async (username, password) => {
  try {
    const response = await api.post('token/', {
      username,
      password,
    });

    const { access, refresh } = response.data;

    // Store tokens in device storage
    await AsyncStorage.setItem('access_token', access);
    await AsyncStorage.setItem('refresh_token', refresh);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Login failed',
    };
  }
};

/**
 * Logout user
 * Clears tokens from storage
 */
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
};

/**
 * Get current logged-in user info
 * 
 * Endpoint: GET /api/users/me/
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('users/me/');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || 'Failed to fetch user',
    };
  }
};

// ==================== CATEGORIES & PRODUCTS ====================

/**
 * Get all product categories
 * 
 * Endpoint: GET /api/products/categories/
 * 
 * Example:
 * getCategories()
 */
export const getCategories = async () => {
  try {
    const response = await api.get('products/categories/');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch categories',
    };
  }
};

/**
 * Get subcategories for a category
 * 
 * Endpoint: GET /api/products/categories/{id}/subcategories/
 */
export const getSubcategories = async (categoryId) => {
  try {
    const response = await api.get(`products/categories/${categoryId}/subcategories/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch subcategories',
    };
  }
};

/**
 * Get products with filters
 * 
 * Endpoint: GET /api/products/?category={id}&search={query}&page={page}
 * 
 * Example:
 * getProducts({ category: 1, search: 'rice', page: 1 })
 */
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);

    const response = await api.get(`products/?${params.toString()}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch products',
    };
  }
};

/**
 * Get products by subcategory
 * 
 * Endpoint: GET /api/products/subcategory/{id}/
 */
export const getProductsBySubcategory = async (subcategoryId) => {
  try {
    const response = await api.get(`products/subcategory/${subcategoryId}/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch products',
    };
  }
};

/**
 * Get single product details
 * 
 * Endpoint: GET /api/products/{id}/
 */
export const getProductDetail = async (productId) => {
  try {
    const response = await api.get(`products/${productId}/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch product details',
    };
  }
};

// ==================== SHOPS ====================

/**
 * Get nearby shops
 * 
 * Endpoint: GET /api/shops/?latitude={lat}&longitude={lng}
 * 
 * Example:
 * getNearbyShops(28.6139, 77.2090)  // Delhi coordinates
 */
export const getNearbyShops = async (latitude, longitude) => {
  try {
    const response = await api.get(
      `shops/?latitude=${latitude}&longitude=${longitude}`
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch shops',
    };
  }
};

/**
 * Get shop details
 * 
 * Endpoint: GET /api/shops/{id}/
 */
export const getShopDetail = async (shopId) => {
  try {
    const response = await api.get(`shops/${shopId}/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch shop details',
    };
  }
};

/**
 * Get products from specific shop
 * 
 * Endpoint: GET /api/shops/{id}/products/
 */
export const getShopProducts = async (shopId) => {
  try {
    const response = await api.get(`shops/${shopId}/products/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch shop products',
    };
  }
};

// ==================== CART ====================

/**
 * Add item to cart
 * 
 * Endpoint: POST /api/orders/cart/
 * 
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to add
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post('orders/cart/', {
      product: productId,
      quantity,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Failed to add to cart',
    };
  }
};

/**
 * Get cart items
 * 
 * Endpoint: GET /api/orders/cart/
 */
export const getCart = async () => {
  try {
    const response = await api.get('orders/cart/');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch cart',
    };
  }
};

/**
 * Update cart item quantity
 * 
 * Endpoint: PUT /api/orders/cart/{id}/
 */
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await api.put(`orders/cart/${cartItemId}/`, {
      quantity,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update cart',
    };
  }
};

/**
 * Remove item from cart
 * 
 * Endpoint: DELETE /api/orders/cart/{id}/
 */
export const removeFromCart = async (cartItemId) => {
  try {
    await api.delete(`orders/cart/${cartItemId}/`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to remove from cart',
    };
  }
};

// ==================== ORDERS ====================

/**
 * Create order
 * 
 * Endpoint: POST /api/orders/
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('orders/', orderData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || 'Failed to create order',
    };
  }
};

/**
 * Get user orders
 * 
 * Endpoint: GET /api/orders/
 */
export const getOrders = async () => {
  try {
    const response = await api.get('orders/');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch orders',
    };
  }
};

/**
 * Get order details
 * 
 * Endpoint: GET /api/orders/{id}/
 */
export const getOrderDetail = async (orderId) => {
  try {
    const response = await api.get(`orders/${orderId}/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch order details',
    };
  }
};

// ==================== SEARCH ====================

/**
 * Search products, shops, categories
 * 
 * Endpoint: GET /api/search/?q={query}
 */
export const search = async (query) => {
  try {
    const response = await api.get(`search/?q=${query}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Search failed',
    };
  }
};
