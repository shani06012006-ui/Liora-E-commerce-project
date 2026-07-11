import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { handleLogout } from '../../redux/authUtils';

const navItems = [
  { label: 'Dashboard',  path: '/liora-admin',          icon: '⊞' },
  { label: 'Orders',     path: '/liora-admin/orders',   icon: '📦' },
  { label: 'Products',   path: '/liora-admin/products', icon: '◈'  },
  { label: 'Categories', path: '/liora-admin/categories',icon: '⊟' },
  { label: 'Customers',  path: '/liora-admin/customers',icon: '👥' },
  { label: 'Reviews',    path: '/liora-admin/reviews',  icon: '★'  },
  { label: 'Analytics',  path: '/liora-admin/analytics',icon: '📊' },
  { label: 'Settings',   path: '/liora-admin/settings', icon: '⚙'  },
];

const s = {
  sidebar: {
    width: 210, background: '#fff',
    borderRight: '1px solid #e8e6e1',
    display: 'flex', flexDirection: 'column',
    flexShrink: 0, height: '100vh',
  },
  logo: { padding: '22px 20px 18px', borderBottom: '1px solid #e8e6e1' },
  logoText: {
    fontFamily: 'Georgia, serif', fontSize: 24,
    fontWeight: 400, color: '#111', letterSpacing: '0.02em',
  },
  logoSub: {
    fontSize: 8, letterSpacing: '0.28em',
    color: '#aaa', textTransform: 'uppercase', marginTop: 2,
  },
  nav: { flex: 1, padding: '12px 0', overflowY: 'auto' },
  item: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: active ? '9px 12px' : '9px 18px',
    margin: active ? '2px 8px' : 0,
    borderRadius: active ? 7 : 0,
    background: active ? '#111' : 'transparent',
    color: active ? '#fff' : '#666',
    cursor: 'pointer', fontSize: 13,
    textDecoration: 'none', transition: 'all .15s',
    fontWeight: active ? 500 : 400,
  }),
  icon: { fontSize: 15, width: 18, textAlign: 'center' },
  footer: {
    padding: '14px 16px',
    borderTop: '1px solid #e8e6e1',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: '#e8e6e1', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 13, color: '#555', fontWeight: 600, flexShrink: 0,
  },
  footerName: { fontSize: 12, fontWeight: 500, color: '#111' },
  footerEmail: { fontSize: 11, color: '#aaa' },
  storeLink: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 18px', color: '#999', fontSize: 12,
    textDecoration: 'none', cursor: 'pointer',
    borderTop: '1px solid #f0efeb', marginTop: 4,
  },
};

const AdminSidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  return (
    <div style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoText}>Liora</div>
        <div style={s.logoSub}>Aesthetic Fashion</div>
      </div>

      <nav style={s.nav}>
        {navItems.map(({ label, path, icon }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={s.item(active)}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f5f4f0'; e.currentTarget.style.color = '#111'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; }}}>
              <span style={s.icon}>{icon}</span>
              {label}
            </Link>
          );
        })}
        <Link to="/" style={s.storeLink}>
          <span>←</span> Back to Store
        </Link>
      </nav>

      <div style={s.footer}>
        <div style={s.avatar}>{user.username?.[0]?.toUpperCase() || 'A'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.footerName}>{user.username || 'Admin'}</div>
          <div style={s.footerEmail}>{user.email || 'admin@liora.com'}</div>
        </div>
        <span
          onClick={() => handleLogout(dispatch, navigate)}
          title="Logout"
          style={{ color: '#bbb', cursor: 'pointer', fontSize: 16 }}>↩</span>
      </div>
    </div>
  );
};

export default AdminSidebar;