// frontend/src/pages/admin/AdminOrders.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminAPI, getImageUrl } from '../../services/api';
import { FiSearch, FiEye, FiTrash2, FiChevronLeft, FiChevronRight, FiXCircle, FiPrinter, FiRefreshCw, FiShoppingBag, FiDownload } from 'react-icons/fi';
 
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
 
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    { value: 'packed', label: 'Packed', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  ];
 
  const getStatusColor = (status) => {
    const found = statusOptions.find(s => s.value === status);
    return found ? found.color : 'bg-gray-100 text-gray-700';
  };
 
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await adminAPI.getOrders(params);
      setOrders(res.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);
 
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
 
  const updateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };
 
  const deleteOrder = async (orderId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this order?\n\nThis action cannot be undone.')) return;
    try {
      await adminAPI.deleteOrder(orderId);
      toast.success('Order deleted successfully');
      fetchOrders();
      setShowOrderDetail(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete order');
    }
  };
 
  const printInvoice = (order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Please allow popups to print invoice');
      return;
    }
    
    const statusColor = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      packed: '#6366F1',
      shipped: '#8B5CF6',
      delivered: '#10B981',
      cancelled: '#EF4444',
    };
 
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${order.order_number}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
            h1 { color: #1a1a2e; border-bottom: 3px solid #1a1a2e; padding-bottom: 10px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .brand { font-size: 24px; font-weight: 300; letter-spacing: 3px; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; background: #f9fafb; padding: 20px; border-radius: 8px; }
            .label { font-weight: 600; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; }
            td { padding: 12px; border: 1px solid #e5e7eb; }
            .total { font-size: 20px; font-weight: 700; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 3px solid #1a1a2e; }
            .status-badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${statusColor[order.status] || '#6b7280'}; color: white; }
            .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
            .items-table { width: 100%; }
            .items-table th { background: #f3f4f6; }
            .items-table td { padding: 10px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">L I O R A</div>
              <div style="color: #6b7280; font-size: 12px;">Aesthetic Fashion</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 20px; font-weight: 700;">INVOICE</div>
              <div style="color: #6b7280;">#${order.order_number}</div>
            </div>
          </div>
          
          <div class="info">
            <div>
              <p><span class="label">Customer:</span> ${order.user_name || 'N/A'}</p>
              <p><span class="label">Email:</span> ${order.user_email || 'N/A'}</p>
              <p><span class="label">Phone:</span> ${order.phone || 'N/A'}</p>
            </div>
            <div>
              <p><span class="label">Date:</span> ${new Date(order.created_at).toLocaleString()}</p>
              <p><span class="label">Status:</span> <span class="status-badge">${order.status.toUpperCase()}</span></p>
              <p><span class="label">Payment:</span> ${order.payment_status || 'N/A'}</p>
            </div>
          </div>
          
          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product_name}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${item.price.toFixed(2)}</td>
                  <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">No items found</td></tr>'}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total Amount: ₹${order.total_amount}</p>
          </div>
          
          <div class="footer">
            <p>Thank you for shopping with Liora!</p>
            <p>This is a system-generated invoice</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
 
  // Stats
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
 
    return { total, pending, confirmed, shipped, delivered, cancelled, totalRevenue };
  }, [orders]);
 
  // Pagination
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => 
        o.order_number?.toLowerCase().includes(q) ||
        o.user_name?.toLowerCase().includes(q) ||
        o.user_email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, search]);
 
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
 
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
 
  // Resolve a thumbnail for an order: use the first item's product image.
  // Works for any order (old or newly placed) because the backend always
  // sends `product_image` on every order item.
  const getOrderThumbnail = (order) => {
    const firstItem = order.items?.[0];
    return getImageUrl({ image: firstItem?.product_image });
  };
 
  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
 
  if (loading) {
    return (
      <AdminLayout title="Orders">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </AdminLayout>
    );
  }
 
  return (
    <AdminLayout title="Orders">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Manage customer orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
 
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            <p className="text-xs text-gray-500">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
            <p className="text-xs text-gray-500">Shipped</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-xs text-gray-500">Delivered</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-gray-500">Cancelled</p>
          </div>
        </div>
 
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by order # or customer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition flex items-center gap-2">
              <FiDownload size={16} />
              Export
            </button>
          </div>
        </div>
 
        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FiShoppingBag size={40} className="text-gray-300 mb-2" />
                        <p>No orders found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((order) => {
                    const statusColor = getStatusColor(order.status);
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={getOrderThumbnail(order)}
                                alt={order.items?.[0]?.product_name || 'Product'}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-gray-50"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/100x100/e0e0e0/2D2D2D?text=No+Image';
                                }}
                              />
                              {order.items?.length > 1 && (
                                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                  +{order.items.length - 1}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs text-gray-500">
                              #{order.order_number || order.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.user_name || 'Guest'}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{order.user_email || ''}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          {order.items?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <select
                              className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${statusColor}`}
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              disabled={updatingOrderId === order.id}
                            >
                              {statusOptions.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            {updatingOrderId === order.id && (
                              <span className="text-xs text-gray-400 animate-pulse">...</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderDetail(true);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => printInvoice(order)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                              title="Print Invoice"
                            >
                              <FiPrinter size={16} />
                            </button>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Order"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
 
          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredOrders.length)} of {filteredOrders.length} orders
              </p>
 
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
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
                </div>
 
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
 
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
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
 
      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Order #{selectedOrder.order_number || selectedOrder.id}
              </h3>
              <button onClick={() => setShowOrderDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiXCircle size={24} className="text-gray-400" />
              </button>
            </div>
 
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <select
                    className={`mt-1 px-2 py-1 text-sm font-medium rounded-full border-0 ${getStatusColor(selectedOrder.status)}`}
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      updateStatus(selectedOrder.id, newStatus);
                    }}
                    disabled={updatingOrderId === selectedOrder.id}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                    selectedOrder.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedOrder.payment_status || 'N/A'}
                  </span>
                </div>
              </div>
 
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Customer Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p><span className="text-xs text-gray-500">Name:</span> {selectedOrder.user_name || 'Guest'}</p>
                  <p><span className="text-xs text-gray-500">Email:</span> {selectedOrder.user_email || 'N/A'}</p>
                  <p><span className="text-xs text-gray-500">Phone:</span> {selectedOrder.phone || 'N/A'}</p>
                  <p><span className="text-xs text-gray-500">Address:</span> {selectedOrder.shipping_address || 'N/A'}</p>
                </div>
              </div>
 
              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl({ image: item.product_image })}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-gray-50"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100/e0e0e0/2D2D2D?text=No+Image';
                          }}
                        />
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
 
              {/* Actions */}
              <div className="border-t pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => printInvoice(selectedOrder)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  <FiPrinter size={16} />
                  Print Invoice
                </button>
                <button
                  onClick={() => {
                    deleteOrder(selectedOrder.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  <FiTrash2 size={16} />
                  Delete Order
                </button>
                <button
                  onClick={() => setShowOrderDetail(false)}
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
 
export default AdminOrders;