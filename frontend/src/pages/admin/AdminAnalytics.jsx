// frontend/src/pages/admin/AdminAnalytics.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { useLocation } from 'react-router-dom';
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart,
  FiUsers, FiPackage, FiDownload,
  FiPieChart, FiBarChart2, 
} from 'react-icons/fi';

// Stats Card Component
const StatsCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change?.startsWith('+');
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

// Sales Report Component
const SalesReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [sortBy, setSortBy] = useState('date');

  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnalyticsSales({ range: dateRange });
      setData(res.data || []);
    } catch (error) {
      toast.error('Failed to load sales data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const sortedData = useMemo(() => {
    const sorted = [...data];
    if (sortBy === 'date') {
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'sales') {
      sorted.sort((a, b) => b.total_sales - a.total_sales);
    } else if (sortBy === 'orders') {
      sorted.sort((a, b) => b.total_orders - a.total_orders);
    }
    return sorted;
  }, [data, sortBy]);

  const totalSales = data.reduce((sum, d) => sum + (d.total_sales || 0), 0);
  const totalOrders = data.reduce((sum, d) => sum + (d.total_orders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    if (dateRange === 'week') return `Week ${getWeekNumber(date)}, ${d.getFullYear()}`;
    if (dateRange === 'month') return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard 
          title="Total Sales" 
          value={`$${totalSales.toLocaleString()}`} 
          change="+12.5%" 
          icon={FiDollarSign} 
          color="green" 
        />
        <StatsCard 
          title="Total Orders" 
          value={totalOrders.toLocaleString()} 
          change="+8.3%" 
          icon={FiShoppingCart} 
          color="blue" 
        />
        <StatsCard 
          title="Avg Order Value" 
          value={`$${avgOrderValue.toFixed(2)}`} 
          change="+4.2%" 
          icon={FiBarChart2} 
          color="purple" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sales Report</h3>
            <p className="text-sm text-gray-500">Detailed breakdown of sales by period</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            >
              <option value="date">Sort by Date</option>
              <option value="sales">Sort by Sales</option>
              <option value="orders">Sort by Orders</option>
            </select>
            <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition flex items-center gap-2">
              <FiDownload size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales ($)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    No sales data available
                  </td>
                </tr>
              ) : (
                sortedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      {item.total_orders || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      ${(item.total_sales || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      ${(item.total_orders > 0 ? (item.total_sales / item.total_orders) : 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Revenue Report Component
const RevenueReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [revenueType, setRevenueType] = useState('all');

  const fetchRevenueData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnalyticsRevenue({ range: dateRange, type: revenueType });
      setData(res.data || []);
    } catch (error) {
      toast.error('Failed to load revenue data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, revenueType]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalProfit = data.reduce((sum, d) => sum + (d.profit || 0), 0);
  const totalCost = data.reduce((sum, d) => sum + (d.cost || 0), 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change="+15.2%" icon={FiDollarSign} color="green" />
        <StatsCard title="Total Profit" value={`$${totalProfit.toLocaleString()}`} change="+18.7%" icon={FiTrendingUp} color="blue" />
        <StatsCard title="Total Cost" value={`$${totalCost.toLocaleString()}`} change="+10.3%" icon={FiPackage} color="yellow" />
        <StatsCard title="Profit Margin" value={`${profitMargin.toFixed(1)}%`} change="+3.5%" icon={FiPieChart} color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
            <p className="text-sm text-gray-500">Detailed revenue and profit analysis</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <select
              value={revenueType}
              onChange={(e) => setRevenueType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            >
              <option value="all">All Types</option>
              <option value="product">Products</option>
              <option value="shipping">Shipping</option>
              <option value="tax">Tax</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue ($)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost ($)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit ($)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No revenue data available
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                      ${(item.revenue || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-red-600">
                      ${(item.cost || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                      ${(item.profit || 0).toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${item.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Customer Report Component
const CustomerReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [segment, setSegment] = useState('all');

  const fetchCustomerData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnalyticsCustomers({ range: dateRange, segment });
      setData(res.data || []);
    } catch (error) {
      toast.error('Failed to load customer data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, segment]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const totalCustomers = data.length;
  const totalOrders = data.reduce((sum, d) => sum + (d.total_orders || 0), 0);
  const totalSpent = data.reduce((sum, d) => sum + (d.total_spent || 0), 0);
  const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Customers" value={totalCustomers.toLocaleString()} change="+5.7%" icon={FiUsers} color="blue" />
        <StatsCard title="Total Orders" value={totalOrders.toLocaleString()} change="+12.3%" icon={FiShoppingCart} color="green" />
        <StatsCard title="Total Spent" value={`$${totalSpent.toLocaleString()}`} change="+14.1%" icon={FiDollarSign} color="purple" />
        <StatsCard title="Avg Spent" value={`$${avgSpent.toFixed(2)}`} change="+7.9%" icon={FiBarChart2} color="indigo" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Analysis</h3>
            <p className="text-sm text-gray-500">Detailed customer spending patterns</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            >
              <option value="all">All Customers</option>
              <option value="new">New Customers</option>
              <option value="repeat">Repeat Customers</option>
              <option value="high">High Value</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent ($)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order ($)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No customer data available
                  </td>
                </tr>
              ) : (
                data.map((customer, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {customer.total_orders || 0}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${(customer.total_spent || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      ${(customer.total_orders > 0 ? (customer.total_spent / customer.total_orders) : 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        (customer.total_orders || 0) > 5 ? 'bg-green-100 text-green-700' :
                        (customer.total_orders || 0) > 1 ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {(customer.total_orders || 0) > 5 ? 'VIP' :
                         (customer.total_orders || 0) > 1 ? 'Regular' : 'New'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Product Performance Component
const ProductPerformance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [sortBy, setSortBy] = useState('revenue');

  const fetchProductData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnalyticsProducts({ range: dateRange });
      setData(res.data || []);
    } catch (error) {
      toast.error('Failed to load product performance data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const sortedData = useMemo(() => {
    const sorted = [...data];
    if (sortBy === 'revenue') sorted.sort((a, b) => b.revenue - a.revenue);
    else if (sortBy === 'sales') sorted.sort((a, b) => b.sales - a.sales);
    else if (sortBy === 'profit') sorted.sort((a, b) => b.profit - a.profit);
    return sorted;
  }, [data, sortBy]);

  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalSales = data.reduce((sum, d) => sum + (d.sales || 0), 0);
  const totalProfit = data.reduce((sum, d) => sum + (d.profit || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change="+18.5%" icon={FiDollarSign} color="green" />
        <StatsCard title="Total Sales" value={totalSales.toLocaleString()} change="+10.2%" icon={FiShoppingCart} color="blue" />
        <StatsCard title="Total Profit" value={`$${totalProfit.toLocaleString()}`} change="+16.7%" icon={FiTrendingUp} color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
            <p className="text-sm text-gray-500">Detailed product sales and revenue analysis</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="sales">Sort by Sales</option>
              <option value="profit">Sort by Profit</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue ($)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit ($)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin (%)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    No product performance data available
                  </td>
                </tr>
              ) : (
                sortedData.map((product, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.image_url || 'https://placehold.co/40x40'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                          onError={(e) => { e.target.src = 'https://placehold.co/40x40'; }}
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {product.sales || 0}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                      ${(product.revenue || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-blue-600">
                      ${(product.profit || 0).toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-medium ${(product.profit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        (product.trend || 0) > 10 ? 'bg-green-100 text-green-700' :
                        (product.trend || 0) > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {(product.trend || 0) > 0 ? '↑' : '↓'} {Math.abs(product.trend || 0)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main Analytics Component
const AdminAnalytics = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    { id: 'sales', label: 'Sales Report' },
    { id: 'revenue', label: 'Revenue Report' },
    { id: 'customers', label: 'Customer Report' },
    { id: 'products', label: 'Product Performance' },
  ];

  // Set active tab based on route path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('revenue')) setActiveTab('revenue');
    else if (path.includes('customers')) setActiveTab('customers');
    else if (path.includes('products')) setActiveTab('products');
    else setActiveTab('sales');
  }, [location]);

  const renderContent = () => {
    switch (activeTab) {
      case 'sales': return <SalesReport />;
      case 'revenue': return <RevenueReport />;
      case 'customers': return <CustomerReport />;
      case 'products': return <ProductPerformance />;
      default: return <SalesReport />;
    }
  };

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Track and analyze your store performance</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;