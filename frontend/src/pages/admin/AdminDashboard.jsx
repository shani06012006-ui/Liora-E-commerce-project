// frontend/src/pages/admin/AdminDashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import {
  FiDollarSign, FiShoppingCart, FiPackage, FiUsers, FiBox,
  FiAlertTriangle, FiXCircle, FiCalendar, 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {adminAPI , getImageUrl} from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await adminAPI.getDashboardStats();
      setStats(res.data);
      setRecentOrders(res.data.recent_orders || []);
      setTopProducts(res.data.popular_products || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      </AdminLayout>
    );
  }

  // If no data, show empty state
  if (!stats) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500 text-lg">No data available</p>
          <p className="text-gray-400 text-sm mt-2">Please check your API connection</p>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats?.monthly_revenue?.toLocaleString() || 0}`, icon: FiDollarSign, color: 'green' },
    { title: 'Total Orders', value: stats?.total_orders || 0, icon: FiShoppingCart, color: 'blue' },
    { title: 'Total Products', value: stats?.total_products || 0, icon: FiPackage, color: 'purple' },
    { title: 'Total Customers', value: stats?.total_users || 0, icon: FiUsers, color: 'orange' },
    { title: 'In Stock', value: stats?.in_stock || 0, icon: FiBox, color: 'green' },
    { title: 'Low Stock', value: stats?.low_stock || 0, icon: FiAlertTriangle, color: 'yellow' },
    { title: 'Out of Stock', value: stats?.out_of_stock || 0, icon: FiXCircle, color: 'red' },
    { title: "Today's Orders", value: stats?.today_orders || 0, icon: FiCalendar, color: 'blue' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-black to-gray-800 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold">Welcome back, Admin! 👋</h2>
          <p className="text-gray-300 mt-1">Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-black hover:underline">
                View All →
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-xs text-gray-500">{order.user_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{order.total_amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No recent orders</p>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
              <Link to="/admin/products" className="text-sm text-black hover:underline">
                View All →
              </Link>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div className="flex items-center">
                      <img src={getImageUrl(product)} alt={product.name}
                         className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                        onError={(e) => { e.target.src = 'https://placehold.co/40x40'; }}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category_name || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">₹{product.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No products data</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;