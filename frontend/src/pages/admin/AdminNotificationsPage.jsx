// frontend/src/pages/admin/AdminNotificationsPage.jsx
import { useState, useEffect, useContext } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { NotificationContext } from '../../context/NotificationContext';
import {
  FiBell, FiCheck, FiTrash2, FiCheckCircle,
  FiShoppingBag, FiPackage, FiStar, FiCreditCard,
  FiFilter
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminNotificationsPage = () => {
  const { 
    notifications, 
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    fetchNotifications
  } = useContext(NotificationContext);

  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date().getTime();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTypeIcon = (type) => {
    const icons = {
      order: FiShoppingBag,
      inventory: FiPackage,
      review: FiStar,
      payment: FiCreditCard,
    };
    return icons[type] || FiBell;
  };

  const getTypeColor = (type) => {
    const colors = {
      order: 'bg-blue-100 text-blue-700',
      inventory: 'bg-yellow-100 text-yellow-700',
      review: 'bg-green-100 text-green-700',
      payment: 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    orders: notifications.filter(n => n.type === 'order').length,
    inventory: notifications.filter(n => n.type === 'inventory').length,
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error('No notifications selected');
      return;
    }
    if (window.confirm(`Delete ${selectedIds.length} notifications?`)) {
      selectedIds.forEach(id => deleteNotification(id));
      setSelectedIds([]);
    }
  };

  const handleBulkMarkRead = () => {
    if (selectedIds.length === 0) {
      toast.error('No notifications selected');
      return;
    }
    selectedIds.forEach(id => markAsRead(id));
    setSelectedIds([]);
    toast.success(`${selectedIds.length} notifications marked as read`);
  };

  if (loading) {
    return (
      <AdminLayout title="Notifications">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Notifications">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.unread} unread · {stats.total} total
            </p>
          </div>
          <div className="flex gap-2">
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition"
              >
                <FiCheckCircle size={16} />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition"
              >
                <FiTrash2 size={16} />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
            <p className="text-xs text-gray-500">Unread</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.orders}</p>
            <p className="text-xs text-gray-500">Orders</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.inventory}</p>
            <p className="text-xs text-gray-500">Inventory</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <FiFilter size={16} className="text-gray-400" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-lg transition ${
              filter === 'all' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-lg transition ${
              filter === 'unread' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
            }`}
          >
            Unread ({stats.unread})
          </button>
          <button
            onClick={() => setFilter('order')}
            className={`px-3 py-1 text-sm rounded-lg transition ${
              filter === 'order' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
            }`}
          >
            Orders ({stats.orders})
          </button>
          <button
            onClick={() => setFilter('inventory')}
            className={`px-3 py-1 text-sm rounded-lg transition ${
              filter === 'inventory' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
            }`}
          >
            Inventory ({stats.inventory})
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
            <span className="text-sm text-gray-600">
              {selectedIds.length} notification{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkMarkRead}
                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
              >
                Mark read
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 text-xs bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FiBell size={48} className="mb-3" />
              <p className="text-lg font-medium text-gray-600">No notifications</p>
              <p className="text-sm">All caught up! 🎉</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                </div>
                <div className="col-span-6">Notification</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {/* Notifications */}
              {filteredNotifications.map((notification) => {
                const Icon = getTypeIcon(notification.type);
                const isSelected = selectedIds.includes(notification.id);
                const typeColor = getTypeColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                      !notification.read ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedIds(prev => prev.filter(id => id !== notification.id));
                          } else {
                            setSelectedIds(prev => [...prev, notification.id]);
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                    </div>

                    <div className="col-span-6 flex items-start gap-3 cursor-pointer" onClick={() => markAsRead(notification.id)}>
                      <div className="flex-shrink-0 mt-1">
                        <Icon size={18} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {getTimeAgo(notification.created_at)}
                          </span>
                          {!notification.read && (
                            <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColor}`}>
                        {notification.type || 'General'}
                      </span>
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-2">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition"
                          title="Mark as read"
                        >
                          <FiCheck size={14} />
                        </button>
                      )}
                      {notification.action_link && (
                        <Link
                          to={notification.action_link}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                          title="View"
                        >
                          <FiCheckCircle size={14} />
                        </Link>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;