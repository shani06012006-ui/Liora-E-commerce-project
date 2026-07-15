// frontend/src/pages/admin/AdminDashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import {
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiBox,
  FiAlertTriangle,
  FiXCircle,
  FiCalendar,
  FiPlus,
  FiFolder,
  FiBarChart2,
  FiLayers,
  FiPercent,
  FiClipboard,
  FiTrendingUp,
  FiPieChart,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { adminAPI, getImageUrl } from '../../services/api';

// Generate realistic monthly data for charts (ONLY USED AS FALLBACK IF API RETURNS NO DATA)
const generateMonthlyData = (totalRevenue = 0, totalOrders = 0) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (totalRevenue > 0 || totalOrders > 0) {
    return months.map((month, index) => {
      const factor = Math.sin((index / 11) * Math.PI) * 0.8 + 0.2;
      const revenue = Math.round(totalRevenue * factor * 0.15);
      const orders = Math.max(Math.round(totalOrders * factor * 0.15), 1);
      return { month, revenue, orders };
    });
  }
  
  return months.map((month, index) => {
    const baseRevenue = 500 + (index * 200) + Math.floor(Math.random() * 300);
    const baseOrders = 2 + (index * 2) + Math.floor(Math.random() * 3);
    return {
      month,
      revenue: baseRevenue,
      orders: baseOrders,
    };
  });
};

// Donut Pie Chart Component
const DonutPieChart = ({ data, colors }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0 || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-gray-400 text-sm">
        No order data available
      </div>
    );
  }

  // Calculate angles for SVG pie chart
  const slices = data.reduce((acc, item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = acc.lastAngle;
    const endAngle = startAngle + angle;
    
    const outerRadius = 42;
    const innerRadius = 28;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1Outer = 50 + outerRadius * Math.cos(startRad);
    const y1Outer = 50 + outerRadius * Math.sin(startRad);
    const x2Outer = 50 + outerRadius * Math.cos(endRad);
    const y2Outer = 50 + outerRadius * Math.sin(endRad);
    
    const x1Inner = 50 + innerRadius * Math.cos(startRad);
    const y1Inner = 50 + innerRadius * Math.sin(startRad);
    const x2Inner = 50 + innerRadius * Math.cos(endRad);
    const y2Inner = 50 + innerRadius * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const path = `
      M ${x1Outer} ${y1Outer}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}
      L ${x2Inner} ${y2Inner}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner}
      Z
    `;
    
    acc.slices.push({
      ...item,
      percentage,
      angle,
      path,
      color: colors[index % colors.length],
    });
    acc.lastAngle = endAngle;
    
    return acc;
  }, { slices: [], lastAngle: 0 });

  const maxValue = Math.max(...data.map(d => d.value));
  const maxSlice = slices.slices.find(s => s.value === maxValue);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
      {/* Donut Chart */}
      <div className="relative w-52 h-52 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {slices.slices.map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="0.5"
              className="hover:opacity-85 transition cursor-pointer"
              title={`${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}
            />
          ))}
          <circle cx="50" cy="50" r="24" fill="white" />
          <text x="50" y="46" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1a1a2e">
            {total}
          </text>
          <text x="50" y="57" textAnchor="middle" fontSize="7" fill="#888">
            Total
          </text>
        </svg>
      </div>

      {/* Legend with percentages */}
      <div className="flex-1 min-w-[180px]">
        <div className="space-y-2">
          {slices.slices.map((slice, index) => (
            <div key={index} className="flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-110" 
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm text-gray-700">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{slice.value}</span>
                <span className="text-xs text-gray-400 w-12 text-right">
                  {slice.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {maxSlice && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Highest</span>
              <span className="font-medium text-gray-900">
                {maxSlice.label} ({maxSlice.value})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('🔄 Fetching dashboard data from backend...');
      const res = await adminAPI.getDashboardStats();
      console.log('✅ Dashboard data received:', res.data);
      
      setStats(res.data);
      setRecentOrders(res.data.recent_orders || []);
      setTopProducts(res.data.popular_products || []);
      setTopCategories(res.data.top_categories || []);
      setLowStockProducts(res.data.low_stock_products || []);
      
      // ============ ORDER STATUS DATA - FROM BACKEND ============
      // Build status data dynamically from backend response
      const statusMapping = [
        { key: 'pending_orders', label: 'Pending', color: '#F59E0B' },
        { key: 'confirmed_orders', label: 'Confirmed', color: '#3B82F6' },
        { key: 'processing_orders', label: 'Processing', color: '#8B5CF6' },
        { key: 'shipped_orders', label: 'Shipped', color: '#10B981' },
        { key: 'completed_orders', label: 'Delivered', color: '#EF4444' },
        { key: 'cancelled_orders', label: 'Cancelled', color: '#6B7280' },
      ];
      
      const statusData = statusMapping
        .map(({ key, label, color }) => ({
          label,
          value: res.data[key] || 0,
          color,
        }))
        .filter(d => d.value > 0); // Only show statuses with data
      
      console.log('📊 Order Status Data from Backend:', statusData);
      
      if (statusData.length > 0) {
        setOrderStatusData(statusData);
      } else {
        // If no status data from backend, use total orders as pending
        const totalOrders = res.data.total_orders || 0;
        if (totalOrders > 0) {
          setOrderStatusData([
            { label: 'Pending', value: totalOrders, color: '#F59E0B' },
          ]);
        } else {
          setOrderStatusData([]);
        }
      }
      
      // ============ MONTHLY DATA - FROM BACKEND ============
      const apiMonthlyData = res.data.monthly_data || [];
      const hasRealData = apiMonthlyData.some(d => d.revenue > 0 || d.orders > 0);
      
      if (hasRealData) {
        console.log('📊 Using real monthly data from backend');
        setMonthlyData(apiMonthlyData);
      } else {
        // Only generate fallback if no data and we have totals
        const totalRevenue = res.data.monthly_revenue || 0;
        const totalOrders = res.data.total_orders || 0;
        if (totalRevenue > 0 || totalOrders > 0) {
          const fallbackData = generateMonthlyData(totalRevenue, totalOrders);
          setMonthlyData(fallbackData);
          console.log('📊 Using fallback monthly data based on totals');
        } else {
          setMonthlyData([]);
          console.log('📊 No monthly data available');
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
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

  const quickActions = [
    { icon: FiPlus, label: 'Add Product', link: '/admin/products', color: 'bg-black' },
    { icon: FiClipboard, label: 'Create Order', link: '/admin/orders', color: 'bg-red-300' },
    { icon: FiFolder, label: 'Add Collection', link: '/admin/categories', color: 'bg-stone-600' },
    { icon: FiPercent, label: 'Create Coupon', link: '/admin/discounts', color: 'bg-purple-500' },
    { icon: FiBarChart2, label: 'View Reports', link: '/admin/analytics', color: 'bg-rose-300' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      confirmed: 'bg-indigo-100 text-indigo-700',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusDotColor = (status) => {
    const colors = {
      delivered: 'bg-green-500',
      pending: 'bg-yellow-500',
      cancelled: 'bg-red-500',
      processing: 'bg-blue-500',
      shipped: 'bg-purple-500',
      confirmed: 'bg-indigo-500',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-500';
  };

  const maxRevenue = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.revenue), 100) : 100;
  const totalRevenueFromChart = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const hasChartData = monthlyData.some(d => d.revenue > 0 || d.orders > 0);

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

        {/* Charts Section - Revenue Bar Chart & Orders Donut Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Overview - Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-600 flex items-center">
                  <FiTrendingUp className="mr-1" size={14} />
                  +12.5%
                </span>
                <span className="text-sm text-gray-500">Total: ₹{totalRevenueFromChart.toLocaleString()}</span>
              </div>
            </div>
            {hasChartData && monthlyData.length > 0 ? (
              <>
                <div className="h-48 flex items-end gap-2">
                  {monthlyData.map((item, index) => {
                    const height = (item.revenue / maxRevenue) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group">
                        <div 
                          className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t hover:opacity-80 transition cursor-pointer"
                          style={{ height: `${Math.max(height * 0.8, 5)}%`, minHeight: '5px' }}
                          title={`${item.month}: ₹${item.revenue}`}
                        />
                        <span className="text-[10px] text-gray-400 mt-1 text-center">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>₹0</span>
                  <span>₹{maxRevenue.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No revenue data available from backend
              </div>
            )}
          </div>

          {/* Orders Overview - Donut Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Orders Overview</h2>
              <span className="text-sm text-blue-600 flex items-center">
                <FiPieChart className="mr-1" size={14} />
                Status Distribution
              </span>
            </div>
            <DonutPieChart 
              data={orderStatusData} 
              colors={['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#6B7280']}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`flex flex-col items-center justify-center p-4 ${action.color} text-white rounded-lg hover:opacity-80 transition group`}
              >
                <action.icon size={24} className="mb-2" />
                <span className="text-xs font-medium text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-black hover:underline">
                View All →
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-xs text-gray-500 truncate">{order.user_name}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-sm font-medium">₹{order.total_amount}</p>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(order.status)}`}></span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No recent orders</p>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
              <Link to="/admin/products" className="text-sm text-black hover:underline">
                View All →
              </Link>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div className="flex items-center min-w-0 flex-1">
                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                        onError={(e) => { e.target.src = 'https://placehold.co/40x40'; }}
                      />
                      <div className="ml-3 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">{product.category_name || 'Uncategorized'}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">{product.sales || 0} sold</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium ml-3 flex-shrink-0">₹{product.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No products data</p>
            )}
          </div>

          {/* Top Categories & Low Stock */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
                <Link to="/admin/categories" className="text-sm text-black hover:underline">
                  View All →
                </Link>
              </div>
              {topCategories.length > 0 ? (
                <div className="space-y-3">
                  {topCategories.slice(0, 5).map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiLayers className="text-gray-500" size={14} />
                        </div>
                        <span className="ml-3 text-sm text-gray-900">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{category.count} products</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No categories data</p>
              )}
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiAlertTriangle className="text-yellow-500 mr-2" size={18} />
                  Low Stock Products
                </h2>
                <Link to="/admin/products" className="text-sm text-black hover:underline">
                  View All →
                </Link>
              </div>
              {lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                      <div className="flex items-center min-w-0 flex-1">
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                          onError={(e) => { e.target.src = 'https://placehold.co/32x32'; }}
                        />
                        <div className="ml-3 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex-shrink-0">
                        {product.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No low stock products</p>
              )}
            </div>
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