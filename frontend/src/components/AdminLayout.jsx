// frontend/src/components/AdminLayout.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import {
  FiHome,
  FiPackage,
  FiUsers,
  FiStar,
  FiSettings,
  FiLogOut,
  FiSearch,
  FiBell,
  FiUser,
  FiMenu,
  FiX,
  FiShoppingCart,
  FiChevronDown
} from 'react-icons/fi';

const AdminLayout = ({ children, title = 'Dashboard' }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/admin/products', icon: FiPackage, label: 'Products' },
    { path: '/admin/users', icon: FiUsers, label: 'Customers' },
    { path: '/admin/reviews', icon: FiStar, label: 'Reviews' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') return true;
    if (path !== '/admin/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const notifications = [
    { id: 1, message: 'New order #ORD-1234 placed', time: '5 min ago', unread: true },
    { id: 2, message: 'Product "Liora Black Blazer" is low in stock', time: '1 hour ago', unread: true },
    { id: 3, message: 'New review from John Doe', time: '2 hours ago', unread: true },
    { id: 4, message: 'Order #ORD-1230 delivered', time: '5 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            {sidebarOpen && <span className="text-xl font-bold text-gray-800">Liora Admin</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-gray-100"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* User info */}
        <div className={`flex items-center px-4 py-4 border-b border-gray-200 ${!sidebarOpen && 'justify-center'}`}>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <FiUser className="text-gray-600" size={20} />
          </div>
          {sidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@liora.com'}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${!sidebarOpen && 'justify-center'}`}
                >
                  <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'text-gray-500'} />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 ${!sidebarOpen && 'justify-center'}`}
          >
            <FiLogOut size={20} className="text-gray-500" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 md:hidden ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Liora Admin</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex items-center px-4 py-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <FiUser className="text-gray-600" size={20} />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">{user?.username || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'admin@liora.com'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'text-gray-500'} />
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          >
            <FiLogOut size={20} className="text-gray-500" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded hover:bg-gray-100 relative"
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <p className="text-xs text-gray-500">{unreadCount} unread</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${notif.unread ? 'bg-blue-50' : ''}`}>
                        <p className="text-sm text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="text-sm text-black hover:underline w-full text-center">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiUser className="text-gray-600" size={18} />
                </div>
                <FiChevronDown className="text-gray-400" size={16} />
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'admin@liora.com'}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;