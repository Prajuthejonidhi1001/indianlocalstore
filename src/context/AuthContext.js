import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../utils/api';
import { logger } from '../utils/logger';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth on app launch
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const access_token = await AsyncStorage.getItem('access_token');
      if (access_token) {
        // Verify token by getting user profile
        const response = await authAPI.getProfile();
        setUser(response.data);
        setIsLoggedIn(true);
      }
    } catch (error) {
      logger.error('Auth initialization failed:', error);
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      const { access, refresh, ...userData } = response.data;

      // Store tokens
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);

      // Decode token to get user data
      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.data);
      setIsLoggedIn(true);
      logger.log('Login successful');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      logger.error('Login error:', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);
      const response = await authAPI.register(data);
      
      // Auto-login after registration
      return loginAfterRegister(data.username, data.password);
    } catch (error) {
      const message = error.response?.data?.username?.[0] || 'Registration failed';
      logger.error('Registration error:', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const registerBuyer = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.register({
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' '),
        username: email,
        email: email,
        password: password,
        role: 'customer',
      });
      
      // Auto-login after registration
      return await login(email, password);
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.username?.[0] || 'Registration failed';
      logger.error('Buyer registration error:', message, error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const registerSeller = async (data) => {
    try {
      setLoading(true);
      const response = await authAPI.register({
        first_name: data.name.split(' ')[0],
        last_name: data.name.split(' ').slice(1).join(' '),
        username: data.email,
        email: data.email,
        password: data.password || 'TempPassword123!',
        role: 'seller',
      });
      
      // Auto-login after registration
      return await login(data.email, data.password || 'TempPassword123!');
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.username?.[0] || 'Registration failed';
      logger.error('Seller registration error:', message, error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const loginAfterRegister = async (username, password) => {
    try {
      return await login(username, password);
    } catch (error) {
      logger.error('Auto-login after registration failed');
      return { success: false, error: 'Registration successful, please login' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Update failed';
      logger.error('Profile update error:', message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      setUser(null);
      setIsLoggedIn(false);
      logger.log('Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      loading,
      login,
      register,
      registerBuyer,
      registerSeller,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
