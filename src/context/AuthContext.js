import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const fetchUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await authAPI.getProfile();
      setUser(data);
    } catch (error) {
      console.error('Fetch user error:', error);
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const res = await authAPI.getWishlist();
      setWishlist(res.data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setWishlist([]);
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  const loginWithPhoneOTP = async (firebase_token, email_otp) => {
    try {
      setLoading(true);
      const { data } = await authAPI.verifyOtp(firebase_token, email_otp);
      await AsyncStorage.setItem('access_token', data.access);
      await AsyncStorage.setItem('refresh_token', data.refresh);
      await fetchUser();
      return { success: true, is_new_user: data.is_new_user, data };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      const message = error.response?.data?.error || 'Invalid OTP';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const refresh = await AsyncStorage.getItem('refresh_token');
    if (refresh) {
      try { await authAPI.logout(refresh); } catch { /* still clear locally */ }
    }
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    setUser(null);
    setWishlist([]);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  const toggleWishlist = async (productId) => {
    if (!user) return false;
    try {
      await authAPI.toggleWishlist(productId);
      setWishlist(prev => {
        const itemIndex = prev.findIndex(item => item.product === productId);
        if (itemIndex >= 0) {
          const newWishlist = [...prev];
          newWishlist.splice(itemIndex, 1);
          return newWishlist;
        } else {
          // For now we'll return a simplified structure
          // In a real app, we would fetch the product details
          return [...prev, { product: productId }];
        }
      });
      return true;
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      return false;
    }
  };

  const getWishlist = async () => {
    try {
      const response = await authAPI.getWishlist();
      return response.data;
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user;
  const isSeller = user?.role === 'seller';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      isSeller,
      loginWithPhoneOTP,
      logout,
      updateUser,
      refetchUser: fetchUser,
      wishlist,
      toggleWishlist,
      getWishlist
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
