import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

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
      refetchUser: fetchUser 
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
