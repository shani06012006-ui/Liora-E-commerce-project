// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import Help from './pages/Help';
import Notifications from './pages/Notifications';
import Address from './pages/Address';
import Settings from './pages/Settings';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';

// New pages
import NewArrivals from './pages/NewArrivals';
import Dresses from './pages/Dresses';
import BestSellers from './pages/BestSellers';
import Sale from './pages/Sale';

// Layout for all pages (with Navbar and Footer)
const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

// Layout for profile pages (with Sidebar)
const ProfileLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="py-8">
      {children}
    </main>
    <Footer />
  </div>
);

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user, token]);

  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      
      {/* New Arrivals Routes */}
      <Route path="/new-arrivals" element={<MainLayout><NewArrivals /></MainLayout>} />
      <Route path="/new-arrivals/:subcategory" element={<MainLayout><NewArrivals /></MainLayout>} />
      
      {/* Dresses Routes */}
      <Route path="/dresses" element={<MainLayout><Dresses /></MainLayout>} />
      <Route path="/dresses/:style" element={<MainLayout><Dresses /></MainLayout>} />
      
      {/* Best Sellers Routes */}
      <Route path="/best-sellers" element={<MainLayout><BestSellers /></MainLayout>} />
      <Route path="/best-sellers/:category" element={<MainLayout><BestSellers /></MainLayout>} />
      

      
      {/* Sale Routes */}
      <Route path="/sale" element={<MainLayout><Sale /></MainLayout>} />
      <Route path="/sale/:category" element={<MainLayout><Sale /></MainLayout>} />
      
      {/* Product Routes */}
      <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
      <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
      <Route path="/order-success" element={<MainLayout><OrderSuccess /></MainLayout>} />
      
      {/* Static Pages */}
      <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
      <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
      <Route path="/help" element={<MainLayout><Help /></MainLayout>} />
      
      {/* Auth Routes */}
      <Route path="/login" element={!isAuthenticated ? <MainLayout><Login /></MainLayout> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <MainLayout><Register /></MainLayout> : <Navigate to="/" />} />
      
      {/* Protected Routes */}
      <Route path="/checkout" element={isAuthenticated ? <MainLayout><Checkout /></MainLayout> : <Navigate to="/login" />} />
      <Route path="/address" element={isAuthenticated ? <MainLayout><Address /></MainLayout> : <Navigate to="/login" />} />
      <Route path="/notifications" element={isAuthenticated ? <MainLayout><Notifications /></MainLayout> : <Navigate to="/login" />} />
      <Route path="/wishlist" element={isAuthenticated ? <MainLayout><Wishlist /></MainLayout> : <Navigate to="/login" />} />
      
      {/* Profile Routes */}
      <Route path="/profile" element={isAuthenticated ? <ProfileLayout><Profile /></ProfileLayout> : <Navigate to="/login" />} />
      <Route path="/settings" element={isAuthenticated ? <ProfileLayout><Settings /></ProfileLayout> : <Navigate to="/login" />} />
      <Route path="/orders" element={isAuthenticated ? <MainLayout><Orders /></MainLayout> : <Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster position="top-right" />
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;