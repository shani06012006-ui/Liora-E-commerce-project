// frontend/src/pages/admin/AdminPayments.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { useLocation } from 'react-router-dom';
import {
  FiCreditCard,  FiRefreshCw, FiSearch,
  FiChevronLeft, FiChevronRight, FiXCircle, FiCheckCircle,
  FiClock, FiAlertCircle, FiEye, FiPrinter, 
  FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
 
// Payment Methods Component
const PaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMethod, setEditMethod] = useState(null);
  const [form, setForm] = useState({ name: '', type: '', is_active: true, config: {} });
 
  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPaymentMethods();
      setMethods(res.data || []);
    } catch {
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { fetchMethods(); }, [fetchMethods]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMethod) {
        await adminAPI.updatePaymentMethod(editMethod.id, form);
        toast.success('Payment method updated!');
      } else {
        await adminAPI.createPaymentMethod(form);
        toast.success('Payment method created!');
      }
      setShowForm(false);
      fetchMethods();
    } catch {
      toast.error('Failed to save payment method');
    }
  };
 
  const toggleMethod = async (id, isActive) => {
    try {
      await adminAPI.togglePaymentMethod(id, { is_active: !isActive });
      toast.success(`Payment method ${!isActive ? 'activated' : 'deactivated'}`);
      fetchMethods();
    } catch {
      toast.error('Failed to toggle payment method');
    }
  };
 
  const deleteMethod = async (id) => {
    if (!window.confirm('Delete this payment method?')) return;
    try {
      await adminAPI.deletePaymentMethod(id);
      toast.success('Payment method deleted');
      fetchMethods();
    } catch {
      toast.error('Failed to delete payment method');
    }
  };
 
  const methodTypes = ['credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay', 'C O D', 'bank_transfer', 'upi'];
 
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }
 
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-500">Manage available payment methods</p>
        </div>
        <button
          onClick={() => {
            setEditMethod(null);
            setForm({ name: '', type: '', is_active: true, config: {} });
            setShowForm(true);
          }}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition flex items-center gap-2"
        >
          <FiPlus size={16} />
          Add Method
        </button>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((method) => (
          <div key={method.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FiCreditCard size={24} className="text-gray-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-xs text-gray-500 capitalize">{method.type}</p>
                </div>
              </div>
              <button
                onClick={() => toggleMethod(method.id, method.is_active)}
                className="text-gray-400 hover:text-gray-600"
              >
                {method.is_active ? <FiToggleRight size={24} className="text-green-600" /> : <FiToggleLeft size={24} />}
              </button>
            </div>
 
            <div className="mt-3 flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                method.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {method.is_active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditMethod(method);
                    setForm({ name: method.name, type: method.type, is_active: method.is_active, config: method.config || {} });
                    setShowForm(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                >
                  <FiEdit size={14} />
                </button>
                <button
                  onClick={() => deleteMethod(method.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
 
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="">Select type</option>
                    {methodTypes.map((type) => (
                      <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 accent-black"
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                >
                  {editMethod ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
 
// Transactions Component
const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
 
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      
      const res = await adminAPI.getTransactions(params);
      setTransactions(res.data || []);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);
 
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
 
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.transaction_id?.toLowerCase().includes(q) ||
               t.order_number?.toLowerCase().includes(q) ||
               t.customer_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [transactions, search]);
 
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
 
  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
      processing: 'bg-blue-100 text-blue-700',
    };
    const Icon = {
      completed: FiCheckCircle,
      pending: FiClock,
      failed: FiAlertCircle,
      refunded: FiRefreshCw,
      processing: FiRefreshCw,
    }[status] || FiAlertCircle;
    return { className: colors[status] || 'bg-gray-100 text-gray-700', Icon };
  };
 
  const formatCurrency = (amount) => `₹${(amount || 0).toFixed(2)}`;
 
  const printReceipt = (transaction) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Please allow popups to print the receipt');
      return;
    }
 
    const statusColor = {
      completed: '#10B981',
      pending: '#F59E0B',
      failed: '#EF4444',
      refunded: '#6B7280',
      processing: '#3B82F6',
    };
 
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transaction.transaction_id || transaction.id}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #1a1a1a; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .brand { font-size: 24px; font-weight: 300; letter-spacing: 3px; }
            .info { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; background: #f9fafb; padding: 20px; border-radius: 8px; }
            .label { font-weight: 600; color: #6b7280; display: block; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 14px; margin-top: 2px; }
            .status-badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${statusColor[transaction.status] || '#6b7280'}; color: white; }
            .amount { font-size: 28px; font-weight: 700; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 3px solid #1a1a2e; }
            .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">L I O R A</div>
              <div style="color: #6b7280; font-size: 12px;">Aesthetic Fashion</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 20px; font-weight: 700;">RECEIPT</div>
              <div style="color: #6b7280;">#${transaction.transaction_id || transaction.id}</div>
            </div>
          </div>
 
          <div class="info">
            <div>
              <span class="label">Customer</span>
              <div class="value">${transaction.customer_name || 'N/A'}</div>
            </div>
            <div>
              <span class="label">Order</span>
              <div class="value">#${transaction.order_number || 'N/A'}</div>
            </div>
            <div>
              <span class="label">Payment Method</span>
              <div class="value" style="text-transform: capitalize;">${transaction.payment_method || 'N/A'}</div>
            </div>
            <div>
              <span class="label">Date</span>
              <div class="value">${transaction.created_at ? new Date(transaction.created_at).toLocaleString() : 'N/A'}</div>
            </div>
            <div>
              <span class="label">Status</span>
              <div class="value"><span class="status-badge">${(transaction.status || 'unknown').toUpperCase()}</span></div>
            </div>
          </div>
 
          <div class="amount">
            Amount Paid: ₹${(transaction.amount || 0).toFixed(2)}
          </div>
 
          <div class="footer">
            <p>Thank you for shopping with Liora!</p>
            <p>This is a system-generated receipt</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
        <p className="text-sm text-gray-500">View and manage all payment transactions</p>
      </div>
 
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
          >
            <option value="">All Types</option>
            <option value="payment">Payment</option>
            <option value="refund">Refund</option>
          </select>
        </div>
 
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                currentItems.map((transaction) => {
                  const status = getStatusBadge(transaction.status);
                  const StatusIcon = status.Icon;
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-900">
                          {transaction.transaction_id || transaction.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.customer_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        #{transaction.order_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {transaction.payment_method || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${status.className}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {transaction.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDetail(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
 
        {filteredTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredTransactions.length)} of {filteredTransactions.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
 
      {/* Transaction Detail Modal */}
      {showDetail && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiXCircle size={24} className="text-gray-400" />
              </button>
            </div>
 
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono text-sm font-medium">{selectedTransaction.transaction_id || selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedTransaction.status).className}`}>
                    {selectedTransaction.status || 'Unknown'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium capitalize">{selectedTransaction.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="text-sm font-medium">{selectedTransaction.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order</p>
                  <p className="text-sm font-medium">#{selectedTransaction.order_number || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-sm font-medium">
                    {selectedTransaction.created_at ? new Date(selectedTransaction.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
 
              <div className="border-t pt-4 flex flex-wrap gap-3">
                {selectedTransaction.status === 'pending' && (
                  <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100">
                    <FiCheckCircle className="inline mr-2" size={16} />
                    Mark as Complete
                  </button>
                )}
                <button
                  onClick={() => printReceipt(selectedTransaction)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  <FiPrinter className="inline mr-2" size={16} />
                  Print Receipt
                </button>
                <button onClick={() => setShowDetail(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
// Refunds Component
const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
 
  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await adminAPI.getRefunds(params);
      setRefunds(res.data || []);
    } catch {
      toast.error('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);
 
  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);
 
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = refunds.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(refunds.length / itemsPerPage));
 
  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      processing: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };
 
  const formatCurrency = (amount) => `₹${(amount || 0).toFixed(2)}`;
 
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }
 
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Refunds</h3>
          <p className="text-sm text-gray-500">Manage refund requests</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
 
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    No refunds found
                  </td>
                </tr>
              ) : (
                currentItems.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {refund.refund_id || refund.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      #{refund.order_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {refund.customer_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(refund.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate">
                      {refund.reason || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(refund.status)}`}>
                        {refund.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition">
                          <FiEye size={16} />
                        </button>
                        {refund.status === 'pending' && (
                          <button className="p-2 text-green-400 hover:text-green-600 rounded-lg transition">
                            <FiCheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
 
        {refunds.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, refunds.length)} of {refunds.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
// Main Payments Component
const AdminPayments = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('methods');
 
  const tabs = [
    { id: 'methods', label: 'Payment Methods' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'refunds', label: 'Refunds' },
  ];
 
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('transactions')) setActiveTab('transactions');
    else if (path.includes('refunds')) setActiveTab('refunds');
    else setActiveTab('methods');
  }, [location]);
 
  const renderContent = () => {
    switch (activeTab) {
      case 'methods': return <PaymentMethods />;
      case 'transactions': return <Transactions />;
      case 'refunds': return <Refunds />;
      default: return <PaymentMethods />;
    }
  };
 
  return (
    <AdminLayout title="Payments">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage payment methods, transactions, and refunds</p>
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
 
export default AdminPayments;