import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NearbyShopsPage from './pages/NearbyShopsPage';
import ShopDetailPage from './pages/ShopDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import SellerDashboardPage from './pages/SellerDashboardPage';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function SellerRoute({ children }) {
  const { isAuthenticated, isSeller, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSeller) return <Navigate to="/home" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/shops" element={<NearbyShopsPage />} />
          <Route path="/shops/:id" element={<ShopDetailPage />} />
          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/seller" element={<SellerRoute><SellerDashboardPage /></SellerRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <LocationProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#131920',
                  color: '#F0F4FF',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                },
                success: { iconTheme: { primary: '#2ECC71', secondary: '#131920' } },
                error: { iconTheme: { primary: '#E74C3C', secondary: '#131920' } },
              }}
            />
          </LocationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
