import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getProfile();
      setUser(data);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
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

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  const loginWithPhoneOTP = async (idToken, emailOtp, email, role, firstName, lastName) => {
    const { data } = await authAPI.verifyPhoneOtp(idToken, emailOtp, email, role, firstName, lastName);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    await fetchUser();
    return data; // contains user info and is_new_user flag
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    return data;
  };

  const logout = async () => {
    // Blacklist refresh token server-side
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try { await authAPI.logout(refresh); } catch { /* ignore — still clear locally */ }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
          // Find the full product details to add to wishlist
          // This assumes we have access to product data somewhere
          // For now we'll return a simplified structure
          return [...prev, { product: productId }];
        }
      });
      return true;
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      return false;
    }
  };

  const isAuthenticated = !!user;
  const isSeller = user?.role === 'seller';
  const isAdmin = user?.is_staff || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      isSeller,
      isAdmin,
      loginWithPhoneOTP,
      register,
      logout,
      updateUser,
      refetchUser: fetchUser,
      wishlist,
      toggleWishlist,
      getWishlist: fetchWishlist
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
