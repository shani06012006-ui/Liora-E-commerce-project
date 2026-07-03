import { useEffect, useState } from 'react';
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
import NewArrivals from './pages/NewArrivals';
import Collections from './pages/Collections';
import BestSellers from './pages/BestSellers';
import Sale from './pages/Sale';
import OTPVerify from './pages/OTPVerify';
import AdminRoute      from './components/AdminRoute';
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminUsers      from './pages/admin/AdminUsers';
import AdminOrders     from './pages/admin/AdminOrders';
import AdminProducts   from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReviews    from './pages/admin/AdminReviews';

//Resuable layout 
const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

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
  const { user, token } = useSelector((state) => state.auth);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser  = localStorage.getItem('user');
    return !!(storedToken && storedUser && storedUser !== 'undefined');
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser  = localStorage.getItem('user');
    setIsAuthenticated(!!(storedToken && storedUser && storedUser !== 'undefined'));
  }, [user, token]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/verify-otp" element={<OTPVerify />} />

      <Route path="/admin"            element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users"      element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/products"   element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
      <Route path="/admin/orders"     element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/reviews"    element={<AdminRoute><AdminReviews /></AdminRoute>} />
      
      <Route path="/new-arrivals" element={<MainLayout><NewArrivals /></MainLayout>} />
      <Route path="/new-arrivals/:subcategory" element={<MainLayout><NewArrivals /></MainLayout>} />
      
      <Route path="/collections" element={<MainLayout><Collections /></MainLayout>} />
      <Route path="/collections/:style" element={<MainLayout><Collections /></MainLayout>} />
      
      <Route path="/best-sellers" element={<MainLayout><BestSellers /></MainLayout>} />
      <Route path="/best-sellers/:category" element={<MainLayout><BestSellers /></MainLayout>} />
      
      <Route path="/sale" element={<MainLayout><Sale /></MainLayout>} />
      <Route path="/sale/:category" element={<MainLayout><Sale /></MainLayout>} />
      
      <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
      <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
      <Route path="/order-success" element={<MainLayout><OrderSuccess /></MainLayout>} />
      
      <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
      <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
      <Route path="/help" element={<MainLayout><Help /></MainLayout>} />
      
      <Route path="/Login" element={!isAuthenticated ? <MainLayout><Login /></MainLayout> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <MainLayout><Register /></MainLayout> : <Navigate to="/" />} />
      
      <Route path="/checkout" element={isAuthenticated ? <MainLayout><Checkout /></MainLayout> : <Navigate to="/Login" />} />
      <Route path="/address" element={isAuthenticated ? <MainLayout><Address /></MainLayout> : <Navigate to="/Login" />} />
      <Route path="/notifications" element={isAuthenticated ? <MainLayout><Notifications /></MainLayout> : <Navigate to="/Login" />} />
      <Route path="/wishlist" element={isAuthenticated ? <MainLayout><Wishlist /></MainLayout> : <Navigate to="/Login" />} />
      
      <Route path="/profile" element={isAuthenticated ? <ProfileLayout><Profile /></ProfileLayout> : <Navigate to="/Login" />} />
      <Route path="/settings" element={isAuthenticated ? <ProfileLayout><Settings /></ProfileLayout> : <Navigate to="/Login" />} />
      <Route path="/orders" element={isAuthenticated ? <MainLayout><Orders /></MainLayout> : <Navigate to="/Login" />} />

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