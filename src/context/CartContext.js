import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(null); return; }
    setCartLoading(true);
    try {
      const { data } = await cartAPI.getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, variants = {}) => {
    if (!isAuthenticated) { Alert.alert('Error', 'Please login to add items to cart'); return false; }
    try {
      await cartAPI.addItem(productId, quantity, variants);
      await fetchCart();
      Toast.show({ type: 'success', text1: 'Added to cart!', text2: 'View your cart to checkout.' });
      return true;
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.error || 'Failed to add to cart' });
      return false;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!isAuthenticated) return false;
    try {
      await cartAPI.updateItem(itemId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      await fetchCart();
      Toast.show({ type: 'success', text1: 'Removed from cart' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to remove item' });
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart(null);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to clear cart' });
    }
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await cartAPI.applyCoupon(code);
      setCart(data);
      Toast.show({ type: 'success', text1: 'Coupon applied!' });
      return true;
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.error || 'Invalid coupon' });
      return false;
    }
  };

  const removeCoupon = async () => {
    try {
      const { data } = await cartAPI.removeCoupon();
      setCart(data);
      Toast.show({ type: 'success', text1: 'Coupon removed' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to remove coupon' });
    }
  };

  const cartCount = cart?.items?.length || 0;
  const cartTotal = cart?.discount_total ? parseFloat(cart.discount_total) : (cart?.total ? parseFloat(cart.total) : 0);
  const cartSubtotal = cart?.total ? parseFloat(cart.total) : 0;

  return (
    <CartContext.Provider value={{ cart, cartLoading, cartCount, cartTotal, cartSubtotal, addToCart, removeFromCart, clearCart, applyCoupon, removeCoupon, refetchCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};


