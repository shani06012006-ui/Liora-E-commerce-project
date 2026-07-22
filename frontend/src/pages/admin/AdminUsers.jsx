// frontend/src/pages/admin/AdminUsers.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import {
  FiSearch,
  FiTrash2,
  FiEye,
  FiUsers,
  FiUserPlus,
  FiRepeat,
  FiLock,
  FiUnlock,
  FiChevronLeft,
  FiChevronRight,
  FiXCircle,
} from 'react-icons/fi';
import {FaRupeeSign} from "react-icons/fa6"

 
const EMPTY_USER_FORM = {
  username: '', email: '', password: '', full_name: '', phone: '', role: 'user',
};
 
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
 
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers();
      const userData = res.data || [];
      const customers = userData.filter((u) => !(u.role === 'admin' || u.is_staff === true));
      setUsers(customers);
    } catch (error) {
      toast.error('Failed to load customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
 
  const thirtyDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }, []);
 
  const stats = useMemo(() => {
    const newCustomers = users.filter((u) => new Date(u.created_at) > thirtyDaysAgo);
    const repeatCustomers = users.filter((u) => (u.orders_count || 0) > 1);
    const totalSpent = users.reduce((sum, u) => sum + (u.total_spent || 0), 0);
    const topCustomers = users.filter((u) => (u.total_spent || 0) > 1000);
 
    return {
      total: users.length,
      new: newCustomers.length,
      repeat: repeatCustomers.length,
      totalSpent,
      topCustomers: topCustomers.length,
    };
  }, [users, thirtyDaysAgo]);
 
  // Filter users
  const filteredUsers = useMemo(() => {
    let result = [...users];
 
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.full_name?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q)
      );
    }
 
    return result;
  }, [users, search]);
 
  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
 
  const getStatusColor = (isBlocked) => 
    isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
 
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
 
  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
 
  // ✅ Toggle block/unblock user
  const toggleBlock = async (userId, isBlocked) => {
    try {
      await adminAPI.toggleUserBlock(userId, isBlocked);
      toast.success(`Customer ${!isBlocked ? 'blocked' : 'unblocked'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update customer');
    }
  };
 
  // ✅ Delete user - with confirmation
  const deleteUser = async (userId) => {
    if (!window.confirm('⚠️ Are you sure you want to permanently delete this customer?\n\nThis action cannot be undone. All user data including orders, addresses, and wishlist will be permanently removed.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await adminAPI.deleteUser(userId);
      toast.success(response.data?.message || 'Customer deleted successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.error || 'Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };
 
  const openAddUser = () => {
    setEditUser(null);
    setUserForm(EMPTY_USER_FORM);
    setShowUserForm(true);
  };
 
 
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        const rest = { ...userForm };
        delete rest.password;
        await adminAPI.updateUser(editUser.id, rest);
        toast.success('Customer updated');
      } else {
        await adminAPI.createUser(userForm);
        toast.success('Customer created');
      }
      setShowUserForm(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save customer');
    }
  };
 
  // Handle view user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };
 
  // Handle close modal
  const handleCloseModal = () => {
    setShowUserDetail(false);
    setSelectedUser(null);
  };
 
  const statCards = [
    { title: 'Total Customers', value: stats.total, icon: FiUsers, color: 'blue' },
    { title: 'New Customers (30d)', value: stats.new, icon: FiUserPlus, color: 'green' },
    { title: 'Repeat Customers', value: stats.repeat, icon: FiRepeat, color: 'purple' },
    { title: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: FaRupeeSign, color: 'orange' },
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
          <button
            onClick={openAddUser}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <FiUserPlus className="mr-2" size={16} />
            Add Customer
          </button>
        </div>
 
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
 
        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
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
          </div>
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
                                  {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-3 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.full_name || user.username || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500">#{user.id?.toString().padStart(4, '0') || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 truncate max-w-[150px]">{user.email || '-'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.phone || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.orders_count || 0}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(user.total_spent)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.last_order_date)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(user.is_blocked)}`}>
                              {user.is_blocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                title="View Details"
                              >
                                <FiEye size={16} />
                              </button>
 
                              <button
                                onClick={() => toggleBlock(user.id, user.is_blocked)}
                                className={`p-2 rounded-lg transition ${
                                  user.is_blocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
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
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-black outline-none"
                      >
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-500">/ page</span>
                    </div>
 
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                              currentPage === pageNum ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'
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
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-8 h-8 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 transition"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
 
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FiXCircle size={24} className="text-gray-400" />
              </button>
            </div>
 
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-medium text-gray-600">
                    {(selectedUser.full_name || selectedUser.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-gray-900">{selectedUser.full_name || selectedUser.username}</h4>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <p className="text-gray-500">{selectedUser.phone || 'No phone number'}</p>
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{selectedUser.orders_count || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedUser.total_spent)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-1 ${getStatusColor(selectedUser.is_blocked)}`}>
                    {selectedUser.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(selectedUser.created_at)}
                  </p>
                </div>
              </div>
 
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">
                    {selectedUser.address || <span className="text-gray-400">No address added</span>}
                  </p>
                </div>
              </div>
 
              <div className="border-t pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    toggleBlock(selectedUser.id, selectedUser.is_blocked);
                    handleCloseModal();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedUser.is_blocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {selectedUser.is_blocked ? 'Unblock Customer' : 'Block Customer'}
                </button>
                <button
                  onClick={() => {
                    deleteUser(selectedUser.id);
                    handleCloseModal();
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  Delete Customer
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add / Edit User Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editUser ? 'Edit Customer' : 'Add Customer'}
              </h3>
              <button onClick={() => setShowUserForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FiXCircle size={24} className="text-gray-400" />
              </button>
            </div>
 
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none"
                  required
                  disabled={!!editUser}
                />
              </div>
 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none"
                  required
                  disabled={!!editUser}
                />
              </div>
 
              {!editUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>
              )}
 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none"
                >
                  <option value="user">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
 
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
                >
                  {editUser ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
 
export default AdminUsers;