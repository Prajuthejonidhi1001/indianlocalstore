import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

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
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return false; }
    try {
      await cartAPI.addItem(productId, quantity, variants);
      await fetchCart();
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      await fetchCart();
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart(null);
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await cartAPI.applyCoupon(code);
      setCart(data);
      toast.success('Coupon applied!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon');
      return false;
    }
  };

  const removeCoupon = async () => {
    try {
      const { data } = await cartAPI.removeCoupon();
      setCart(data);
      toast.success('Coupon removed');
    } catch {
      toast.error('Failed to remove coupon');
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
