// frontend/src/App.jsx
import { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { syncFromTab } from './redux/authSlice';
import { setupTabSync, getCurrentUser, getTokens, isAuthenticated as checkAuth } from './utils/storage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import { NotificationProvider } from './context/NotificationProvider'; 

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OTPVerify = lazy(() => import('./pages/OTPVerify'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Address = lazy(() => import('./pages/Address'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Collections = lazy(() => import('./pages/Collections'));
const NewArrivals = lazy(() => import('./pages/NewArrivals'));
const BestSellers = lazy(() => import('./pages/BestSellers'));
const Sale = lazy(() => import('./pages/Sale'));
const Help = lazy(() => import('./pages/Help'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Notifications = lazy(() => import('./pages/Notifications'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotificationsPage'));

// Layouts
const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main className="flex-grow">
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </main>
    <Footer />
  </div>
);

const ProfileLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6 flex-col md:flex-row">
          <Sidebar activeTab="personal" setActiveTab={() => {}} />
          <div className="flex-1">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

// Route Guard
const ProtectedRoute = ({ children, redirectTo = '/Login' }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  const isAuthenticated = () => {
    const { accessToken } = getTokens();
    const currentUser = getCurrentUser() || user;
    return !!(accessToken && currentUser);
  };

  const authStatus = isAuthenticated();
  
  useEffect(() => {
    if (!authStatus) {
      sessionStorage.setItem('redirect_after_login', location.pathname);
    }
  }, [authStatus, location.pathname]);

  if (!authStatus) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  const isAdmin = () => {
    const currentUser = getCurrentUser() || user;
    return currentUser && (currentUser.role === 'admin' || currentUser.is_staff === true);
  };

  const authStatus = () => {
    const { accessToken } = getTokens();
    const currentUser = getCurrentUser() || user;
    return !!(accessToken && currentUser);
  };

  if (!authStatus() || !isAdmin()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStatus = checkAuth();
    setIsAuthenticated(authStatus);
    
    if (!user && authStatus) {
      const storedUser = getCurrentUser();
      const { accessToken } = getTokens();
      if (storedUser && accessToken) {
        dispatch(syncFromTab({
          user: storedUser,
          token: accessToken,
        }));
      }
    }
    
    setIsLoading(false);
  }, [user, dispatch]);

  useEffect(() => {
    const cleanup = setupTabSync((data) => {
      if (data) {
        dispatch(syncFromTab({
          user: data.user,
          token: data.token,
        }));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return cleanup;
  }, [dispatch]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/Home" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/verify-otp" element={<OTPVerify />} />
      <Route path="/Login" element={!isAuthenticated ? <MainLayout><Login /></MainLayout> : <Navigate to="/" replace />} />
      <Route path="/register" element={!isAuthenticated ? <MainLayout><Register /></MainLayout> : <Navigate to="/" replace />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/analytics/sales" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/analytics/revenue" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/analytics/customers" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/analytics/products" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
      <Route path="/admin/payments/methods" element={<AdminRoute><AdminPayments /></AdminRoute>} />
      <Route path="/admin/payments/transactions" element={<AdminRoute><AdminPayments /></AdminRoute>} />
      <Route path="/admin/payments/refunds" element={<AdminRoute><AdminPayments /></AdminRoute>} />
      <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />

      {/* Protected Routes */}
      <Route path="/profile" element={<ProtectedRoute><ProfileLayout><Profile /></ProfileLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><ProfileLayout><Settings /></ProfileLayout></ProtectedRoute>} />
      <Route path="/address" element={<ProtectedRoute><MainLayout><Address /></MainLayout></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><MainLayout><Cart /></MainLayout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><MainLayout><Checkout /></MainLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><MainLayout><Orders /></MainLayout></ProtectedRoute>} />
      <Route path="/order-success" element={<ProtectedRoute><MainLayout><OrderSuccess /></MainLayout></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><MainLayout><Wishlist /></MainLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />

      {/* Public Product Routes */}
      <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
      <Route path="/collections" element={<MainLayout><Collections /></MainLayout>} />
      <Route path="/collections/:style" element={<MainLayout><Collections /></MainLayout>} />
      <Route path="/new-arrivals" element={<MainLayout><NewArrivals /></MainLayout>} />
      <Route path="/new-arrivals/:subcategory" element={<MainLayout><NewArrivals /></MainLayout>} />
      <Route path="/best-sellers" element={<MainLayout><BestSellers /></MainLayout>} />
      <Route path="/best-sellers/:category" element={<MainLayout><BestSellers /></MainLayout>} />
      <Route path="/sale" element={<MainLayout><Sale /></MainLayout>} />
      <Route path="/sale/:category" element={<MainLayout><Sale /></MainLayout>} />
      
      {/* Static Pages */}
      <Route path="/help" element={<MainLayout><Help /></MainLayout>} />
      <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
      <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />

      {/* 404 */}
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
};

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-6xl font-light text-gray-900 mb-4">404</h1>
    <p className="text-gray-500 text-lg mb-6">Page not found</p>
    <Link to="/" className="text-gray-900 hover:text-gray-600 transition">
      Go back home →
    </Link>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <Router>
        <NotificationProvider>
          <Toaster position="top-right" />
          <AppContent />
        </NotificationProvider>
      </Router>
    </Provider>
  );
}

export default App;