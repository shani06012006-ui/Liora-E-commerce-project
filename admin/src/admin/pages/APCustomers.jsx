import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';

const token   = () => localStorage.getItem('access_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const APCustomers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await axios.get('http://localhost:8000/api/admin/users/', { headers: headers() });
      setUsers(r.data);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
  const loadUsers = async () => {
    setLoading(true);

    try {
      const r = await axios.get(
        "http://localhost:8000/api/admin/users/",
        { headers: headers() }
      );
      setUsers(r.data);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  loadUsers();
}, []);

  const toggleBlock = async (user) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/users/${user.id}/`,
        { is_blocked: !user.is_blocked }, { headers: headers() });
      toast.success(user.is_blocked ? 'User unblocked' : 'User blocked');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/users/${id}/`, { headers: headers() });
      toast.success('Deleted'); fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const active   = users.filter(u => !u.is_blocked && u.is_active).length;
  const blocked  = users.filter(u => u.is_blocked).length;
  const admins   = users.filter(u => u.role === 'admin').length;

  return (
    <AdminLayout title="Customers">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { icon: '👥', label: 'Total Customers', value: users.length,  color: '#111',    bg: '#f5f4f0' },
          { icon: '✅', label: 'Active Users',     value: active,        color: '#2d9c5a', bg: '#e8f5ee' },
          { icon: '🚫', label: 'Blocked Users',    value: blocked,       color: '#d94f4f', bg: '#feecec' },
          { icon: '👑', label: 'Admins',           value: admins,        color: '#7c3aed', bg: '#f0e8fe' },
        ].map(({ icon, label, value, color, bg }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 11, color: '#aaa' }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 400, color, fontFamily: 'Georgia, serif' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e8e6e1', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500, fontFamily: 'Georgia, serif', color: '#111' }}>All Customers</div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ padding: '7px 12px', border: '1px solid #e8e6e1', borderRadius: 6, fontSize: 12, outline: 'none', width: 240, background: '#fff' }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 32, height: 32, border: '2px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Customer', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, color: '#aaa', fontWeight: 500, borderBottom: '1px solid #f0efeb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ borderBottom: '1px solid #f8f7f5' }}>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#555', flexShrink: 0 }}>
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{user.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: '#666' }}>{user.email}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ background: user.role === 'admin' ? '#f0e8fe' : '#f5f4f0', color: user.role === 'admin' ? '#7c3aed' : '#666', fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 500 }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ background: user.is_blocked ? '#feecec' : '#e8f5ee', color: user.is_blocked ? '#d94f4f' : '#2d9c5a', fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 500 }}>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#aaa' }}>
                    {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toggleBlock(user)}
                        style={{ padding: '4px 10px', border: '1px solid #e8e6e1', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 11, color: user.is_blocked ? '#2d9c5a' : '#cc7700', fontWeight: 500 }}>
                        {user.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                      <button onClick={() => deleteUser(user.id)}
                        style={{ width: 30, height: 30, border: '1px solid #e8e6e1', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#d94f4f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e8e6e1', fontSize: 12, color: '#aaa' }}>
          Showing {filtered.length} of {users.length} customers
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
};

export default APCustomers;