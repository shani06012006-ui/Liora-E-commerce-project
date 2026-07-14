import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { FiEye, FiTrash2, FiSearch, FiPrinter, FiXCircle, FiMoreVertical, FiCalendar, FiFilter, FiDownload, FiShoppingBag, FiClock, FiTruck, FiCheckCircle} from 'react-icons/fi';
 
// Real status choices from Order.STATUS_CHOICES
const statusOptions = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const paymentStatusOptions = ['pending', 'paid', 'failed', 'refunded'];
const PAGE_SIZE_OPTIONS = [8, 10, 20, 50];
 
const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
 
const PAYMENT_STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
};
 
const AVATAR_COLORS = [
  'bg-pink-200 text-pink-800',
  'bg-blue-200 text-blue-800',
  'bg-green-200 text-green-800',
  'bg-purple-200 text-purple-800',
  'bg-yellow-200 text-yellow-800',
  'bg-indigo-200 text-indigo-800',
];
 
const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || '?';
 
const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
 
const label = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
 
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
 
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
 
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
 
  const datePickerRef = useRef(null);
  const menuRef = useRef(null);
 
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      if (paymentMethodFilter) params.payment_method = paymentMethodFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
 
      const res = await adminAPI.getOrders(params);
      setOrders(res.data);
      setPage(1);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentStatusFilter, paymentMethodFilter, dateFrom, dateTo]);
 
  useEffect(() => {
    const timeout = setTimeout(fetchOrders, search ? 350 : 0);
    return () => clearTimeout(timeout);
  } );
 
  // Close popovers on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
 
  const updateStatus = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to update order');
      console.error('Error updating order:', error);
    }
  };
 
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await adminAPI.deleteOrder(orderId);
      toast.success('Order deleted');
      setSelectedIds((prev) => prev.filter((id) => id !== orderId));
      fetchOrders();
    } catch (error) {
      toast.error('Failed to delete order');
      console.error('Error deleting order:', error);
    }
  };
 
  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected order(s)?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => adminAPI.deleteOrder(id)));
      toast.success('Selected orders deleted');
      setSelectedIds([]);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to delete some orders');
      console.error('Error bulk deleting orders:', error);
    }
  };
 
  const printInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print invoice');
      return;
    }
 
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; }
            td { padding: 10px; border: 1px solid #ddd; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE #${order.order_number}</h1>
            <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
          </div>
 
          <div class="info">
            <div>
              <p><span class="label">Customer:</span> ${order.user_name}</p>
              <p><span class="label">Email:</span> ${order.user_email || 'N/A'}</p>
            </div>
            <div>
              <p><span class="label">Status:</span> ${order.status.toUpperCase()}</p>
              <p><span class="label">Payment:</span> ${order.payment_status || 'N/A'}</p>
            </div>
          </div>
 
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td>₹${item.price * item.quantity}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No items found</td></tr>'}
            </tbody>
          </table>
 
          <div class="total">
            <p>Total Amount: ₹${order.total_amount}</p>
          </div>
 
          <div class="footer">
            <p>Thank you for shopping with Liora!</p>
            <p style="font-size: 12px;">This is a system-generated invoice</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
 
  const exportOrders = () => {
    if (!orders.length) {
      toast.error('No orders to export');
      return;
    }
    const header = ['Order #', 'Customer', 'Email', 'Items', 'Total', 'Payment Status', 'Order Status', 'Date'];
    const rows = orders.map((o) => [
      o.order_number,
      o.user_name,
      o.user_email || '',
      o.items?.length || 0,
      o.total_amount,
      o.payment_status,
      o.status,
      new Date(o.created_at).toLocaleDateString(),
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
 
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPaymentStatusFilter('');
    setPaymentMethodFilter('');
    setDateFrom('');
    setDateTo('');
  };
 
  const getStatusColor = (status) => STATUS_STYLES[status] || 'bg-gray-100 text-gray-700';
  const getPaymentStatusColor = (status) => PAYMENT_STATUS_STYLES[status] || 'bg-gray-100 text-gray-700';
 
  // Stats derived from currently loaded orders
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const processing = orders.filter((o) => ['confirmed', 'packed', 'shipped'].includes(o.status)).length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    return { total, pending, processing, delivered, cancelled };
  }, [orders]);
 
  const paymentMethods = useMemo(
    () => [...new Set(orders.map((o) => o.payment_method).filter(Boolean))],
    [orders]
  );
 
  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const paginatedOrders = orders.slice((page - 1) * pageSize, page * pageSize);
 
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    }
  };
 
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
 
  return (
    <AdminLayout title="Orders">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Manage customer orders</p>
          </div>
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700"
          >
            <FiDownload size={16} />
            Export Orders
          </button>
        </div>
 
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={<FiShoppingBag />} iconBg="bg-pink-50 text-pink-500" label="Total Orders" value={stats.total} />
          <StatCard icon={<FiClock />} iconBg="bg-emerald-50 text-emerald-500" label="Pending Orders" value={stats.pending} />
          <StatCard icon={<FiTruck />} iconBg="bg-orange-50 text-orange-500" label="Processing Orders" value={stats.processing} />
          <StatCard icon={<FiCheckCircle />} iconBg="bg-indigo-50 text-indigo-500" label="Delivered Orders" value={stats.delivered} />
          <StatCard icon={<FiXCircle />} iconBg="bg-red-50 text-red-500" label="Cancelled Orders" value={stats.cancelled} />
        </div>
 
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search by order ID, customer name, email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
 
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <FiCalendar size={14} />
              {dateFrom || dateTo ? `${dateFrom || '...'} → ${dateTo || '...'}` : 'Select Date Range'}
            </button>
            {showDatePicker && (
              <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col gap-2 w-56">
                <label className="text-xs text-gray-500">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border border-gray-200 rounded-md px-2 py-1 text-sm"
                />
                <label className="text-xs text-gray-500">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border border-gray-200 rounded-md px-2 py-1 text-sm"
                />
              </div>
            )}
          </div>
 
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Order Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{label(s)}</option>
            ))}
          </select>
 
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="">Payment Status</option>
            {paymentStatusOptions.map((s) => (
              <option key={s} value={s}>{label(s)}</option>
            ))}
          </select>
 
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          >
            <option value="">Payment Method</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>{label(m)}</option>
            ))}
          </select>
 
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <FiFilter size={14} />
            Clear
          </button>
 
          {selectedIds.length > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
            >
              <FiTrash2 size={14} />
              Delete ({selectedIds.length})
            </button>
          )}
        </div>
 
        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <div className="overflow-x-auto" ref={menuRef}>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-10 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => {
                      const extraItems = (order.items?.length || 0) - 2;
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(order.id)}
                              onChange={() => toggleSelect(order.id)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-rose-600">#{order.order_number}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${getAvatarColor(order.user_name)}`}>
                                {getInitials(order.user_name)}
                              </div>
                              <div>
                                <p className="text-sm text-gray-900">{order.user_name}</p>
                                <p className="text-xs text-gray-500">{order.user_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center -space-x-2">
                              {order.items?.slice(0, 2).map((item) => (
                                <div
                                  key={item.id}
                                  title={item.product_name}
                                  className="w-9 h-9 rounded-lg border-2 border-white bg-gray-100 overflow-hidden flex items-center justify-center"
                                >
                                  {item.product_image ? (
                                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <FiShoppingBag className="text-gray-300" size={14} />
                                  )}
                                </div>
                              ))}
                              {extraItems > 0 && (
                                <div className="w-9 h-9 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                  +{extraItems}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                            <div className="text-xs text-gray-400">
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{label(order.payment_method) || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                              {label(order.payment_status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(order.status)}`}
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>{label(status)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">₹{order.total_amount}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setSelectedOrder(order); setShowOrderDetail(true); }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                                title="View Details"
                              >
                                <FiEye size={16} />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                                  title="More"
                                >
                                  <FiMoreVertical size={16} />
                                </button>
                                {openMenuId === order.id && (
                                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm overflow-hidden">
                                    <button
                                      onClick={() => { printInvoice(order); setOpenMenuId(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700"
                                    >
                                      <FiPrinter size={14} /> Print Invoice
                                    </button>
                                    <button
                                      onClick={() => { deleteOrder(order.id); setOpenMenuId(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"
                                    >
                                      <FiTrash2 size={14} /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
 
          {/* Pagination */}
          {!loading && orders.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, orders.length)} of {orders.length} orders
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 text-sm rounded-md border border-gray-200 disabled:opacity-40"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-sm rounded-md ${p === page ? 'bg-rose-100 text-rose-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 text-sm rounded-md border border-gray-200 disabled:opacity-40"
                >
                  ›
                </button>
              </div>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="px-2 py-1 border border-gray-200 rounded-lg text-sm"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
 
      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order #{selectedOrder.order_number}</h3>
              <button onClick={() => setShowOrderDetail(false)} className="text-gray-400 hover:text-gray-600">
                <FiXCircle size={24} />
              </button>
            </div>
 
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedOrder.user_name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {label(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment</p>
                  <span className={`px-2 py-1 text-sm rounded-full ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {label(selectedOrder.payment_status)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{label(selectedOrder.payment_method)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">₹{selectedOrder.total_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shipping Address</p>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                </div>
              </div>
 
              <div>
                <p className="text-sm text-gray-500 mb-2">Items</p>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <FiShoppingBag className="text-gray-300" size={14} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
 
              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => printInvoice(selectedOrder)}
                  className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  <FiPrinter className="mr-2" />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
 
const StatCard = ({ icon, iconBg, label, value }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3">
    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${iconBg}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);
 
export default AdminOrders;