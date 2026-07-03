import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const token   = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/orders/', { headers });
      setOrders(res.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); } );

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/orders/${orderId}/`, {
        status: newStatus,
      }, { headers });
      toast.success('Order status updated');
      fetchOrders();
    } catch { toast.error('Failed to update order'); }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/orders/${orderId}/`, { headers });
      toast.success('Order deleted');
      fetchOrders();
    } catch { toast.error('Failed to delete order'); }
  };

  const statusColor = (s) => ({
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped:   'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-600');

  return (
    <AdminLayout>
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Orders</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Order #', 'User', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-900">{order.order_number}</td>
                    <td className="px-4 py-3 text-gray-600">{order.user_name || order.user}</td>
                    <td className="px-4 py-3 font-medium">₹{order.total_amount}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColor(order.status)}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;