// frontend/src/pages/admin/AdminUsers.jsx
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { 
  FiSearch, 
  FiTrash2, 
  FiEye, 
  FiXCircle,
  FiUsers,
  FiUserPlus,
  FiRepeat,
  FiDollarSign,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
  FiLock,
  FiUnlock,
  FiCalendar,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiSliders,
  FiRefreshCw
} from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive
    minOrders: '',
    maxOrders: '',
    minSpent: '',
    maxSpent: '',
    dateJoined: 'all', // all, today, week, month, year
    sortBy: 'newest', // newest, oldest, mostOrders, mostSpent
  });
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    repeat: 0,
    totalSpent: 0,
    topCustomers: 0
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminAPI.getUsers();
      const userData = res.data || [];
      
      // Filter out admin users
      const customers = userData.filter(u => !(u.role === 'admin' || u.is_staff === true));
      setUsers(customers);
      
      // Calculate stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      
      const newCustomers = customers.filter(u => new Date(u.created_at) > thirtyDaysAgo);
      const repeatCustomers = customers.filter(u => (u.orders_count || 0) > 1);
      const totalSpent = customers.reduce((sum, u) => sum + (u.total_spent || 0), 0);
      const topCustomers = customers.filter(u => (u.total_spent || 0) > 1000);
      
      setStats({
        total: customers.length,
        new: newCustomers.length,
        repeat: repeatCustomers.length,
        totalSpent: totalSpent,
        topCustomers: topCustomers.length
      });
    } catch (error) {
      toast.error('Failed to load customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await adminAPI.toggleUserBlock(userId, isBlocked);
      toast.success(`Customer ${!isBlocked ? 'blocked' : 'unblocked'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update customer');
      console.error('Error updating customer:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('Customer deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete customer');
      console.error('Error deleting customer:', error);
    }
  };

  // Filter and sort users
  const getFilteredUsers = () => {
    let filtered = [...users];

    // Search filter
    if (search) {
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status === 'active') {
      filtered = filtered.filter(u => !u.is_blocked);
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(u => u.is_blocked);
    }

    // Orders range filter
    if (filters.minOrders) {
      filtered = filtered.filter(u => (u.orders_count || 0) >= parseInt(filters.minOrders));
    }
    if (filters.maxOrders) {
      filtered = filtered.filter(u => (u.orders_count || 0) <= parseInt(filters.maxOrders));
    }

    // Spent range filter
    if (filters.minSpent) {
      filtered = filtered.filter(u => (u.total_spent || 0) >= parseFloat(filters.minSpent));
    }
    if (filters.maxSpent) {
      filtered = filtered.filter(u => (u.total_spent || 0) <= parseFloat(filters.maxSpent));
    }

    // Date joined filter
    const now = new Date();
    if (filters.dateJoined === 'today') {
      const today = new Date(now.setHours(0, 0, 0, 0));
      filtered = filtered.filter(u => new Date(u.created_at) >= today);
    } else if (filters.dateJoined === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(u => new Date(u.created_at) >= weekAgo);
    } else if (filters.dateJoined === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filtered = filtered.filter(u => new Date(u.created_at) >= monthAgo);
    } else if (filters.dateJoined === 'year') {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      filtered = filtered.filter(u => new Date(u.created_at) >= yearAgo);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'mostOrders':
        filtered.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0));
        break;
      case 'mostSpent':
        filtered.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getStatusColor = (isBlocked) => {
    return isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      minOrders: '',
      maxOrders: '',
      minSpent: '',
      maxSpent: '',
      dateJoined: 'all',
      sortBy: 'newest',
    });
    setSearch('');
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.minOrders) count++;
    if (filters.maxOrders) count++;
    if (filters.minSpent) count++;
    if (filters.maxSpent) count++;
    if (filters.dateJoined !== 'all') count++;
    if (filters.sortBy !== 'newest') count++;
    if (search) count++;
    return count;
  };

  // Stat Cards
  const statCards = [
    { 
      title: 'Total Customers', 
      value: stats.total, 
      icon: FiUsers, 
      change: '+11.2%',
      color: 'blue'
    },
    { 
      title: 'New Customers', 
      value: stats.new, 
      icon: FiUserPlus, 
      change: '+8.4%',
      color: 'green'
    },
    { 
      title: 'Repeat Customers', 
      value: stats.repeat, 
      icon: FiRepeat, 
      change: '+12.6%',
      color: 'purple'
    },
    { 
      title: 'Total Spent', 
      value: formatCurrency(stats.totalSpent), 
      icon: FiDollarSign, 
      change: '+9.7%',
      color: 'orange'
    },
  ];

  // Filter Categories like in LIORA design
  const filterCategories = [
    { 
      id: 'status',
      label: 'Status',
      icon: FiCheckCircle,
      options: [
        { value: 'all', label: 'All Customers' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]
    },
    { 
      id: 'dateJoined',
      label: 'Date Joined',
      icon: FiCalendar,
      options: [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
      ]
    },
    { 
      id: 'sortBy',
      label: 'Sort By',
      icon: FiTrendingUp,
      options: [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'mostOrders', label: 'Most Orders' },
        { value: 'mostSpent', label: 'Highest Spent' },
      ]
    },
  ];

  return (
    <AdminLayout title="Customers">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your customer base</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition flex items-center space-x-2"
            >
              <FiSliders size={16} />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
            <button className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition">
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <span className="text-xs text-green-600 font-medium">{stat.change} vs last month</span>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Customers Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiAward className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Top Customers</p>
                <p className="text-sm text-gray-600">{stats.topCustomers} customers have spent over $1,000</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:underline font-medium">
              View all →
            </button>
          </div>
        </div>

        {/* Search and Filters - Like LIORA design */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 whitespace-nowrap">
                <span className="font-medium">{filteredUsers.length}</span>
                <span>customers found</span>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <FiRefreshCw size={12} />
                    <span>Clear all filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters Section - Like LIORA Categories */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterCategories.map((category) => (
                  <div key={category.id}>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      <span className="flex items-center space-x-1">
                        <category.icon size={14} />
                        <span>{category.label}</span>
                      </span>
                    </label>
                    <select
                      value={filters[category.id]}
                      onChange={(e) => {
                        setFilters({ ...filters, [category.id]: e.target.value });
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                    >
                      {category.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Custom Range Filters */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    <span className="flex items-center space-x-1">
                      <FiDollarSign size={14} />
                      <span>Spent Range</span>
                    </span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                      value={filters.minSpent}
                      onChange={(e) => {
                        setFilters({ ...filters, minSpent: e.target.value });
                        setCurrentPage(1);
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                      value={filters.maxSpent}
                      onChange={(e) => {
                        setFilters({ ...filters, maxSpent: e.target.value });
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    <span className="flex items-center space-x-1">
                      <FiClock size={14} />
                      <span>Orders Range</span>
                    </span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                      value={filters.minOrders}
                      onChange={(e) => {
                        setFilters({ ...filters, minOrders: e.target.value });
                        setCurrentPage(1);
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                      value={filters.maxOrders}
                      onChange={(e) => {
                        setFilters({ ...filters, maxOrders: e.target.value });
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {getActiveFilterCount() > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {search && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      Search: "{search}"
                      <button
                        onClick={() => { setSearch(''); setCurrentPage(1); }}
                        className="ml-2 hover:text-blue-900"
                      >
                        <FiXCircle size={12} />
                      </button>
                    </span>
                  )}
                  {filters.status !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      Status: {filters.status}
                      <button
                        onClick={() => { setFilters({ ...filters, status: 'all' }); setCurrentPage(1); }}
                        className="ml-2 hover:text-green-900"
                      >
                        <FiXCircle size={12} />
                      </button>
                    </span>
                  )}
                  {filters.dateJoined !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                      Joined: {filters.dateJoined}
                      <button
                        onClick={() => { setFilters({ ...filters, dateJoined: 'all' }); setCurrentPage(1); }}
                        className="ml-2 hover:text-purple-900"
                      >
                        <FiXCircle size={12} />
                      </button>
                    </span>
                  )}
                  {filters.minSpent && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                      Min Spent: ${filters.minSpent}
                      <button
                        onClick={() => { setFilters({ ...filters, minSpent: '' }); setCurrentPage(1); }}
                        className="ml-2 hover:text-orange-900"
                      >
                        <FiXCircle size={12} />
                      </button>
                    </span>
                  )}
                  {filters.maxSpent && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                      Max Spent: ${filters.maxSpent}
                      <button
                        onClick={() => { setFilters({ ...filters, maxSpent: '' }); setCurrentPage(1); }}
                        className="ml-2 hover:text-orange-900"
                      >
                        <FiXCircle size={12} />
                      </button>
                    </span>
                  )}
                  {filters.minOrders && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                      Min Orders: {filters.minOrders}
                      <button
                        onClick={() => { setFilters({ ...filters, minOrders: '' }); setCurrentPage(1); }}
                        className="ml-2 hover:text-indigo-900"
                      >
                        <FiXCircle size={12} />
                      </button>
                    </span>
                  )}
                  {filters.maxOrders && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                      Max Orders: {filters.maxOrders}
                      <button
                        onClick={() => { setFilters({ ...filters, maxOrders: '' }); setCurrentPage(1); }}
                        className="ml-2 hover:text-indigo-900"
                      >
                        <FiXCircle size={12} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <FiUsers size={40} className="text-gray-300 mb-2" />
                            <p>No customers found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">
                                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="ml-3 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.full_name || user.username || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: #{user.id?.toString().padStart(4, '0') || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 truncate max-w-[150px]">{user.email || '-'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.phone || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.orders_count || 0}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(user.total_spent || 0)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {user.last_order_date ? new Date(user.last_order_date).toLocaleDateString('en-US', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            }) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(user.is_blocked)}`}>
                              {user.is_blocked ? 'Inactive' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserDetail(true);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                title="View Details"
                              >
                                <FiEye size={16} />
                              </button>
                              <button
                                onClick={() => toggleBlock(user.id, user.is_blocked)}
                                className={`p-2 rounded-lg transition ${
                                  user.is_blocked 
                                    ? 'text-green-600 hover:bg-green-50' 
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
                                title={user.is_blocked ? 'Unblock Customer' : 'Block Customer'}
                              >
                                {user.is_blocked ? <FiUnlock size={16} /> : <FiLock size={16} />}
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Customer"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredUsers.length)} of {filteredUsers.length} customers
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    {/* Items per page */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-black outline-none"
                      >
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-500">/ page</span>
                    </div>

                    {/* Page buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition"
                      >
                        <FiChevronLeft size={18} />
                      </button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={i}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                              currentPage === pageNum
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="text-gray-400">...</span>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            className="w-8 h-8 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 transition"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition"
                      >
                        <FiChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
              <button
                onClick={() => setShowUserDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiXCircle size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Profile */}
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-medium text-gray-600">
                    {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : selectedUser.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-gray-900">{selectedUser.full_name || selectedUser.username}</h4>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <p className="text-gray-500">{selectedUser.phone || 'No phone number'}</p>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{selectedUser.orders_count || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedUser.total_spent || 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-1 ${getStatusColor(selectedUser.is_blocked)}`}>
                    {selectedUser.is_blocked ? 'Inactive' : 'Active'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Address */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">
                    {selectedUser.address ? (
                      selectedUser.address
                    ) : (
                      <span className="text-gray-400">No address added</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => toggleBlock(selectedUser.id, selectedUser.is_blocked)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedUser.is_blocked
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {selectedUser.is_blocked ? 'Unblock Customer' : 'Block Customer'}
                </button>
                <button
                  onClick={() => {
                    setShowUserDetail(false);
                    deleteUser(selectedUser.id);
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  Delete Customer
                </button>
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;