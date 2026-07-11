import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import AdminLayout from '../components/AdminLayout';

const token   = () => localStorage.getItem('access_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const StatCard = ({ icon, label, value, delta, up }) => (
  <div style={{
    background: '#fff', border: '1px solid #e8e6e1',
    borderRadius: 10, padding: '18px 20px',
    display: 'flex', alignItems: 'flex-start', gap: 14,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 9,
      background: '#f5f4f0', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 20, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: '#aaa', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 400, color: '#111', fontFamily: 'Georgia, serif', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, marginTop: 5, color: up ? '#2d9c5a' : '#d94f4f' }}>
        {up ? '↑' : '↓'} {delta}
      </div>
    </div>
  </div>
);

const salesData = [
  { day: 'May 15', sales: 8200 }, { day: 'May 16', sales: 9100 },
  { day: 'May 17', sales: 7800 }, { day: 'May 18', sales: 11200 },
  { day: 'May 19', sales: 10500 }, { day: 'May 20', sales: 13400 },
  { day: 'May 21', sales: 15760 },
];

const channelData = [
  { name: 'Website', value: 45, color: '#111' },
  { name: 'Mobile',  value: 28, color: '#c9b89a' },
  { name: 'Social',  value: 17, color: '#d4c8bc' },
  { name: 'Others',  value: 10, color: '#e8e3dc' },
];

const APDashboard = () => {
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [users,    setUsers]    = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/admin/orders/',   { headers: headers() }).then(r => setOrders(r.data)).catch(() => {});
    axios.get('http://localhost:8000/api/admin/products/', { headers: headers() }).then(r => setProducts(r.data)).catch(() => {});
    axios.get('http://localhost:8000/api/admin/users/',    { headers: headers() }).then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const revenue = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);

  const statusColor = (s) => ({
    delivered: { bg: '#111',     color: '#fff'   },
    shipped:   { bg: '#e8f5ee', color: '#2d9c5a' },
    pending:   { bg: '#fff4e6', color: '#cc7700' },
    cancelled: { bg: '#feecec', color: '#d94f4f' },
    confirmed: { bg: '#e8f0fe', color: '#1a56db' },
  }[s] || { bg: '#f0efeb', color: '#666' });

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard icon="₹"  label="Total Revenue"    value={`₹${(revenue/1000).toFixed(1)}K`} delta="18.6% vs last week" up />
        <StatCard icon="📦" label="Total Orders"     value={orders.length}    delta="14.2% vs last week" up />
        <StatCard icon="👥" label="Total Customers"  value={users.length}     delta="16.8% vs last week" up />
        <StatCard icon="◈"  label="Total Products"   value={products.length}  delta="12.5% vs last week" up />
        <StatCard icon="📊" label="Avg Order Value"
          value={orders.length ? `₹${(revenue / orders.length).toFixed(0)}` : '₹0'}
          delta="8.7% vs last week" up />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 14, marginBottom: 24 }}>
        {/* Sales Line Chart */}
        <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, padding: '20px 20px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#111', fontFamily: 'Georgia, serif' }}>Sales Overview</div>
            <div style={{
              border: '1px solid #e8e6e1', borderRadius: 6,
              padding: '5px 12px', fontSize: 12, color: '#666', cursor: 'pointer',
            }}>This Week ▾</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesData}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
              <Tooltip
                contentStyle={{ background: '#111', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
                formatter={v => [`₹${v.toLocaleString()}`, 'Sales']}
              />
              <Line type="monotone" dataKey="sales" stroke="#111" strokeWidth={2} dot={{ fill: '#111', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#111', fontFamily: 'Georgia, serif', marginBottom: 16 }}>
            Sales by Channel
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={180} height={180}>
              <Pie data={channelData} cx={90} cy={90} innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={2}>
                {channelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {channelData.map(({ name, value, color }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 12, color: '#555' }}>{name}</span>
                </div>
                <span style={{ fontSize: 12, color: '#111', fontWeight: 500 }}>{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Recent Orders */}
        <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e8e6e1' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111', fontFamily: 'Georgia, serif' }}>Recent Orders</div>
            <Link to="/liora-admin/orders" style={{ fontSize: 12, color: '#666', border: '1px solid #e8e6e1', borderRadius: 6, padding: '4px 10px', textDecoration: 'none' }}>View All</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Order ID', 'Customer', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: 10, color: '#aaa', fontWeight: 500, borderBottom: '1px solid #f0efeb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => {
                const sc = statusColor(order.status);
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f8f7f5' }}>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#666', fontFamily: 'monospace' }}>#{order.order_number}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#333' }}>{order.user_name || `User ${order.user}`}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 500, color: '#111' }}>₹{order.total_amount}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: sc.bg, color: sc.color, fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 500 }}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e8e6e1' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111', fontFamily: 'Georgia, serif' }}>Top Products</div>
            <Link to="/liora-admin/products" style={{ fontSize: 12, color: '#666', border: '1px solid #e8e6e1', borderRadius: 6, padding: '4px 10px', textDecoration: 'none' }}>View All</Link>
          </div>
          <div style={{ padding: '8px 0' }}>
            {products.slice(0, 5).map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: i < 4 ? '1px solid #f8f7f5' : 'none' }}>
                <div style={{ width: 32, height: 38, background: '#f5f4f0', borderRadius: 5, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '👗'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{p.stock} in stock</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111', whiteSpace: 'nowrap' }}>₹{p.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default APDashboard;