// frontend/src/pages/admin/AdminDashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { FiDollarSign, FiShoppingCart, FiPackage, FiUsers, FiBox, FiAlertTriangle, FiXCircle,
  FiCalendar,
  FiPlus,
  FiFolder,
  FiBarChart2,
  FiLayers,
  FiPercent,
  FiClipboard,
  FiPieChart,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { adminAPI, getImageUrl } from '../../services/api';
 
 
 
const formatCurrencyShort = (value) => {
  if (value >= 1000) return `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `₹${value}`;
};
 
const RevenueBarChart = ({ data }) => {
  const [progress, setProgress] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);
  const dataKey = data.map((d) => `${d.label}:${d.revenue}`).join('|');
 
  useEffect(() => {
    setProgress(0);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgress(1));
    });
    return () => cancelAnimationFrame(raf);
  }, [dataKey]);
 
  // Guard: only ever render real, fetched data — never fabricate placeholder bars.
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm gap-1">
        <FiBarChart2 size={22} className="text-gray-300" />
        No revenue data available for this period
      </div>
    );
  }
 
  const width = 700;
  const height = 260;
  const padLeft = 56;
  const padRight = 16;
  const padTop = 24;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
 
  const values = data.map((d) => d.revenue);
  const maxValue = Math.max(...values, 0);
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue || 1)));
  const axisMax = maxValue > 0 ? Math.ceil((maxValue * 1.15) / magnitude) * magnitude : 1;
 
  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => (axisMax / gridLines) * i).reverse();
 
  const n = data.length;
  const slot = plotW / n;
  const barWidth = Math.min(48, slot * 0.55);
  const gap = slot - barWidth;
 
  const bars = data.map((d, i) => {
    const x = padLeft + i * slot + gap / 2;
    const barHeight = axisMax > 0 ? (d.revenue / axisMax) * plotH : 0;
    const y = padTop + plotH - barHeight;
    return { ...d, x, y, barHeight, index: i };
  });
 
  const hovered = hoverIndex !== null ? bars[hoverIndex] : null;
  const peakIndex = values.indexOf(Math.max(...values));
 
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
          <linearGradient id="barGradientPeak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
        </defs>
 
        {/* Gridlines + Y axis labels */}
        {yTicks.map((tick, i) => {
          const y = padTop + plotH - (tick / axisMax) * plotH;
          return (
            <g key={i}>
              <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#F3F4F6" strokeWidth="1" />
              <text x={padLeft - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#9CA3AF">
                {formatCurrencyShort(Math.round(tick))}
              </text>
            </g>
          );
        })}
 
        {/* Baseline */}
        <line x1={padLeft} y1={padTop + plotH} x2={width - padRight} y2={padTop + plotH} stroke="#E5E7EB" strokeWidth="1.5" />
 
        {/* Bars */}
        {bars.map((b, i) => {
          const isHovered = hoverIndex === i;
          const isPeak = i === peakIndex && b.revenue > 0;
          const animatedHeight = b.barHeight * progress;
          const animatedY = padTop + plotH - animatedHeight;
          return (
            <g
              key={i}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible full-height hit area so hovering near a short bar still works */}
              <rect x={b.x - gap / 2} y={padTop} width={barWidth + gap} height={plotH} fill="transparent" />
              <rect
                x={b.x}
                y={animatedY}
                width={barWidth}
                height={Math.max(animatedHeight, 0)}
                rx={6}
                ry={6}
                fill={isPeak ? 'url(#barGradientPeak)' : 'url(#barGradient)'}
                opacity={isHovered || hoverIndex === null ? 1 : 0.55}
                style={{ transition: 'height 0.8s cubic-bezier(0.4,0,0.2,1), y 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease' }}
              />
              {/* X axis label */}
              <text x={b.x + barWidth / 2} y={height - 10} textAnchor="middle" fontSize="10.5" fill={isHovered ? '#111827' : '#9CA3AF'} fontWeight={isHovered ? 600 : 400}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
 
      {/* Floating tooltip */}
      {hovered && (
        <div
          className="absolute bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg -translate-x-1/2 -translate-y-full z-10"
          style={{
            left: `${((hovered.x + barWidth / 2) / width) * 100}%`,
            top: `${(hovered.y / height) * 100}%`,
            marginTop: '-10px',
          }}
        >
          <div className="font-medium">{hovered.label}</div>
          <div className="text-gray-300">₹{hovered.revenue.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};
 
const STATUS_CONFIG = [
  { key: 'pending', label: 'Pending', color: '#8B5CF6' },
  { key: 'confirmed', label: 'Confirmed', color: '#2563EB' },
  { key: 'packed', label: 'Packed', color: '#14B8A6' },
  { key: 'shipped', label: 'Shipped', color: '#F59E0B' },
  { key: 'delivered', label: 'Delivered', color: '#10B981' },
  { key: 'cancelled', label: 'Cancelled', color: '#EF4444' },
];
 
const DonutPieChart = ({ counts }) => {
  const [grow, setGrow] = useState(0);
  const [hovered, setHovered] = useState(null);
 
  const total = STATUS_CONFIG.reduce((sum, s) => sum + (counts[s.key] || 0), 0);
  const isEmpty = total === 0;
 
  const countsKey = STATUS_CONFIG.map((s) => counts[s.key] || 0).join('-');
 
  useEffect(() => {
    setGrow(0);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setGrow(1));
    });
    return () => cancelAnimationFrame(raf1);
  }, [countsKey]);
 
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
 
  let cumulative = 0;
  const slices = STATUS_CONFIG.map((s) => {
    const value = counts[s.key] || 0;
    const fraction = isEmpty ? 0 : value / total;
    const dash = fraction * circumference * grow;
    const offset = -cumulative * circumference * grow;
    cumulative += fraction;
    return { ...s, value, fraction, dash, offset };
  });
 
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
      {/* Donut Chart */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isEmpty ? '#D1D5DB' : '#F3F4F6'}
            strokeWidth={strokeWidth}
          />
          {!isEmpty &&
            slices.map(
              (s) =>
                s.value > 0 && (
                  <circle
                    key={s.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={hovered?.key === s.key ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                    strokeDashoffset={s.offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    strokeLinecap="butt"
                    className="cursor-pointer"
                    style={{
                      transition:
                        'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1), stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke-width 0.2s ease',
                    }}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(null)}
                  />
                )
            )}
        </svg>
 
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {hovered ? (
            <>
              <span className="text-sm font-semibold" style={{ color: hovered.color }}>
                {hovered.label}
              </span>
              <span className="text-2xl font-bold text-gray-900">{hovered.value}</span>
              <span className="text-xs text-gray-400">
                {total > 0 ? ((hovered.value / total) * 100).toFixed(0) : 0}% of orders
              </span>
            </>
          ) : isEmpty ? (
            <>
              <span className="text-2xl font-bold text-gray-400">0</span>
              <span className="text-xs text-gray-400">Orders</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-gray-900">{total}</span>
              <span className="text-xs text-gray-400">Total Orders</span>
            </>
          )}
        </div>
      </div>
 
      <div className="flex-1 min-w-[180px] space-y-2">
        {STATUS_CONFIG.map((s) => {
          const value = counts[s.key] || 0;
          const pct = total > 0 ? (value / total) * 100 : 0;
          return (
            <div
              key={s.key}
              className="flex items-center justify-between group cursor-pointer"
              onMouseEnter={() => setHovered({ ...s, value })}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-sm text-gray-700">{s.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{value}</span>
                <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
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
 
  // ---- Order status counts (drives the donut chart) — always has all 6 keys ----
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    confirmed: 0,
    packed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
 
  const [dateRange, setDateRange] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
 
  const [revenuePeriod, setRevenuePeriod] = useState('week');
  const [revenueTrend, setRevenueTrend] = useState([]);
 
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange !== 'all') params.append('range', dateRange);
      if (dateRange === 'custom' && customFrom && customTo) {
        params.append('date_from', customFrom);
        params.append('date_to', customTo);
      }
      params.append('revenue_period', revenuePeriod);
 
      const res = await adminAPI.getDashboardStats(params);
 
      setStats(res.data);
      setRecentOrders(res.data.recent_orders || []);
      setTopProducts(res.data.popular_products || []);
      setTopCategories(res.data.top_categories || []);
      setLowStockProducts(res.data.low_stock_products || []);
 
      setStatusCounts({
        pending: res.data.pending_orders || 0,
        confirmed: res.data.confirmed_orders || 0,
        packed: res.data.packed_orders || 0,
        shipped: res.data.shipped_orders || 0,
        delivered: res.data.delivered_orders || 0,
        cancelled: res.data.cancelled_orders || 0,
      });
 
      setRevenueTrend(
        (res.data.revenue_trend || []).map((item) => ({
          label: item.label,
          revenue: item.revenue,
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, customFrom, customTo, revenuePeriod]);
 
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
 
  if (loading && !stats) {
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
      pending: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-red-100 text-red-700',
      confirmed: 'bg-blue-100 text-blue-700',
      packed: 'bg-teal-100 text-teal-700',
      shipped: 'bg-amber-100 text-amber-700',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };
 
  const getStatusDotColor = (status) => {
    const colors = {
      delivered: 'bg-green-500',
      pending: 'bg-purple-500',
      cancelled: 'bg-red-500',
      confirmed: 'bg-blue-500',
      packed: 'bg-teal-500',
      shipped: 'bg-amber-500',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-500';
  };
 
  const rangeButtons = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
  ];
 
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
          {/* Revenue Overview - Bar Chart (real data from backend revenue_trend) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <div className="relative">
                <select
                  value={revenuePeriod}
                  onChange={(e) => setRevenuePeriod(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-sm text-gray-700 font-medium focus:ring-2 focus:ring-black cursor-pointer"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
 
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-500">
                Total: ₹{revenueTrend.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
              </span>
            </div>
 
            <RevenueBarChart data={revenueTrend} />
          </div>
 
          {/* Orders Overview - Donut Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiPieChart className="mr-2 text-blue-600" size={16} />
                Orders Overview
              </h2>
 
              {/* Date range filter */}
              <div className="flex flex-wrap items-center gap-1 bg-gray-100 rounded-lg p-1 text-xs">
                {rangeButtons.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setDateRange(r.key)}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      dateRange === r.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
                <button
                  onClick={() => setDateRange('custom')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    dateRange === 'custom' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Custom
                </button>
                {dateRange !== 'all' && (
                  <button
                    onClick={() => setDateRange('all')}
                    className="px-2.5 py-1 rounded-md font-medium text-gray-400 hover:text-gray-600 transition"
                    title="Clear filter"
                  >
                    All
                  </button>
                )}
              </div>
            </div>
 
            {dateRange === 'custom' && (
              <div className="flex flex-wrap gap-2 mb-4">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-black"
                />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-black"
                />
              </div>
            )}
 
            <DonutPieChart counts={statusCounts} />
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