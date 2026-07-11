import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';

const token   = () => localStorage.getItem('access_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const STATUS = ['pending','confirmed','shipped','delivered','cancelled'];
const PAY_STATUS = ['pending','paid','failed','refunded'];

const statusStyle = (s) => ({
  pending:   { bg: '#fff4e6', color: '#cc7700' },
  confirmed: { bg: '#e8f0fe', color: '#1a56db' },
  shipped:   { bg: '#f0e8fe', color: '#7c3aed' },
  delivered: { bg: '#e8f5ee', color: '#2d9c5a' },
  cancelled: { bg: '#feecec', color: '#d94f4f' },
  paid:      { bg: '#e8f5ee', color: '#2d9c5a' },
  failed:    { bg: '#feecec', color: '#d94f4f' },
  refunded:  { bg: '#f0efeb', color: '#666'    },
}[s] || { bg: '#f0efeb', color: '#666' });

const APOrders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('');
  const [payFilt, setPayFilt] = useState('');

  const fetchOrders = async () => {
  try {
    const r = await axios.get(
      "http://localhost:8000/api/admin/orders/",
      { headers: headers() }
    );
    setOrders(r.data);
  } catch {
    toast.error("Failed to load orders");
  }
};

  useEffect(() => {
  const loadOrders = async () => {
    try {
      const r = await axios.get(
        "http://localhost:8000/api/admin/orders/",
        { headers: headers() }
      );
      setOrders(r.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  loadOrders();
}, []);

  const updateOrder = async (id, data) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/orders/${id}/`, data, { headers: headers() });
      toast.success('Updated');
      fetchOrders();
    } catch { toast.error('Failed'); }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete order?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/orders/${id}/`, { headers: headers() });
      toast.success('Deleted');
      fetchOrders();
    } catch { toast.error('Failed'); }
  };

  const paid    = orders.filter(o => o.payment_status === 'paid').length;
  const pending = orders.filter(o => o.payment_status === 'pending').length;
  const failed  = orders.filter(o => o.payment_status === 'failed').length;

  const filtered = orders.filter(o => {
    const ms = o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
               String(o.user_name || '').toLowerCase().includes(search.toLowerCase());
    const mf = filter  ? o.status === filter        : true;
    const mp = payFilt ? o.payment_status === payFilt : true;
    return ms && mf && mp;
  });

  const inputStyle = { padding: '7px 11px', border: '1px solid #e8e6e1', borderRadius: 6, fontSize: 12, outline: 'none', background: '#fff', fontFamily: 'inherit', color: '#333' };

  return (
    <AdminLayout title="Orders">
      {/* Payment Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Paid Orders',      value: paid,    icon: '✅', color: '#2d9c5a', bg: '#e8f5ee' },
          { label: 'Pending Payments', value: pending, icon: '⏳', color: '#cc7700', bg: '#fff4e6' },
          { label: 'Failed Payments',  value: failed,  icon: '❌', color: '#d94f4f', bg: '#feecec' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} style={{ background: '#fff', border: `1px solid ${bg}`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 11, color: '#aaa' }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 400, color, fontFamily: 'Georgia, serif' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e8e6e1', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500, fontFamily: 'Georgia, serif', color: '#111' }}>All Orders</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order # or customer..." style={{ ...inputStyle, width: 220 }} />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={inputStyle}>
            <option value="">Order Status</option>
            {STATUS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <select value={payFilt} onChange={e => setPayFilt(e.target.value)} style={inputStyle}>
            <option value="">Payment</option>
            {PAY_STATUS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 32, height: 32, border: '2px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Order #', 'Customer', 'Amount', 'Order Status', 'Payment', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, color: '#aaa', fontWeight: 500, borderBottom: '1px solid #f0efeb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ borderBottom: '1px solid #f8f7f5' }}>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#666', fontFamily: 'monospace' }}>#{order.order_number}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: '#333' }}>{order.user_name || `#${order.user}`}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: '#111' }}>₹{order.total_amount}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <select value={order.status}
                      onChange={e => updateOrder(order.id, { status: e.target.value })}
                      style={{ border: 'none', background: statusStyle(order.status).bg, color: statusStyle(order.status).color, padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer', outline: 'none' }}>
                      {STATUS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <select value={order.payment_status || 'pending'}
                      onChange={e => updateOrder(order.id, { payment_status: e.target.value })}
                      style={{ border: 'none', background: statusStyle(order.payment_status || 'pending').bg, color: statusStyle(order.payment_status || 'pending').color, padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer', outline: 'none' }}>
                      {PAY_STATUS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <button onClick={() => deleteOrder(order.id)}
                      style={{ width: 30, height: 30, border: '1px solid #e8e6e1', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#d94f4f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='#d94f4f'; e.currentTarget.style.background='#feecec'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='#e8e6e1'; e.currentTarget.style.background='#fff'; }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e8e6e1', fontSize: 12, color: '#aaa' }}>
          Showing {filtered.length} of {orders.length} orders
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
};

export default APOrders;