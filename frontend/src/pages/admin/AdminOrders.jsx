// frontend/src/pages/admin/AdminOrders.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { FiEye, FiTrash2, FiSearch, FiPrinter, FiXCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const statusOptions = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      packed: 'bg-indigo-100 text-indigo-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
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
      const response = await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
      fetchOrders();
      // If the order detail modal is open, update the selected order
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(response.data);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      
      // Extract error message from response
      let errorMessage = 'Failed to update order status';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await adminAPI.deleteOrder(orderId);
      toast.success('Order deleted successfully');
      fetchOrders();
      setShowOrderDetail(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const printInvoice = (order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Please allow popups to print invoice');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 10px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; }
            td { padding: 10px; border: 1px solid #ddd; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #1a1a2e; }
            .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #888; font-size: 12px; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
            .status-delivered { background: #d1fae5; color: #065f46; }
            .status-shipped { background: #e9d5ff; color: #5b21b6; }
            .status-confirmed { background: #bfdbfe; color: #1e40af; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <div style="text-align: right;">
              <p style="font-size: 24px; font-weight: bold; margin: 0;">LIORA</p>
              <p style="color: #888; margin: 0;">#${order.order_number}</p>
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
              <p><span class="label">Status:</span> <span class="status-badge status-${order.status}">${order.status}</span></p>
              <p><span class="label">Payment:</span> ${order.payment_status || 'N/A'}</p>
            </div>
          </div>
          
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product_name}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price}</td>
                  <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="5" style="text-align: center;">No items found</td></tr>'}
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

  // Pagination
  const filteredOrders = useMemo(() => {
    return orders;
  }, [orders]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));

  return (
    <AdminLayout title="Orders">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Manage customer orders</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order #..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black w-64"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
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
                            <FiSearch size={40} className="text-gray-300 mb-2" />
                            <p>No orders found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">#{order.order_number}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-gray-900">{order.user_name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">{order.shipping_address}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.items?.length || 0} items
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">₹{order.total_amount}</td>
                          <td className="px-6 py-4">
                            <select
                              className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(order.status)}`}
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              disabled={updatingOrderId === order.id}
                            >
                              {statusOptions.map(status => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                              ))}
                            </select>
                            {updatingOrderId === order.id && (
                              <span className="ml-2 text-xs text-gray-400">Updating...</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredOrders.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredOrders.length)} of {filteredOrders.length} orders
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

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Order #{selectedOrder.order_number}
              </h3>
              <button 
                onClick={() => setShowOrderDetail(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiXCircle size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedOrder.user_name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <select
                    className={`px-2 py-1 text-sm font-medium rounded-full border-0 ${getStatusColor(selectedOrder.status)}`}
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      updateStatus(selectedOrder.id, newStatus);
                    }}
                    disabled={updatingOrderId === selectedOrder.id}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  {updatingOrderId === selectedOrder.id && (
                    <span className="ml-2 text-xs text-gray-400">Updating...</span>
                  )}
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
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                    selectedOrder.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedOrder.payment_status || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{selectedOrder.phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Shipping Address</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800">{selectedOrder.shipping_address}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Order Items</p>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between p-3">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => printInvoice(selectedOrder)}
                  className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  <FiPrinter className="mr-2" size={16} />
                  Print Invoice
                </button>
                <button
                  onClick={() => {
                    deleteOrder(selectedOrder.id);
                  }}
                  className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  <FiTrash2 className="mr-2" size={16} />
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