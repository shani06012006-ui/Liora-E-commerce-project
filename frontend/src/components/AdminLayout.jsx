// frontend/src/components/AdminLayout.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiMenu, FiSearch, FiBell, FiChevronDown, FiChevronRight, FiHome, FiShoppingCart, FiBox, FiUsers, FiStar, FiSettings, FiHeadphones, FiLogOut, FiBarChart2, FiCreditCard } from 'react-icons/fi';
import './AdminLayout.css';

const analyticsSubItems = [
  { label: 'Sales Report', path: '/admin/analytics/sales' },
  { label: 'Revenue Report', path: '/admin/analytics/revenue' },
  { label: 'Customer Report', path: '/admin/analytics/customers' },
  { label: 'Product Performance', path: '/admin/analytics/products' },
];

const paymentsSubItems = [
  { label: 'Payment Methods', path: '/admin/payments/methods' },
  { label: 'Transactions', path: '/admin/payments/transactions' },
  { label: 'Refunds', path: '/admin/payments/refunds' },
];

const navItems = [
  { label: 'Dashboard', icon: <FiHome />, path: '/admin/dashboard' },
  { label: 'Orders', icon: <FiShoppingCart />, path: '/admin/orders' },
  { label: 'Products', icon: <FiBox />, path: '/admin/products' },
  { divider: true },
  { label: 'Customers', icon: <FiUsers />, path: '/admin/users' },
  { label: 'Reviews', icon: <FiStar />, path: '/admin/reviews' },
  { divider: true },
  { label: 'Analytics', icon: <FiBarChart2 />, path: '/admin/analytics', children: analyticsSubItems },
  { label: 'Payments', icon: <FiCreditCard />, path: '/admin/payments', children: paymentsSubItems },
  { divider: true },
  { label: 'Settings', icon: <FiSettings />, path: '/admin/settings' },
];

const AdminLayout = ({ title, subtitle, children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // ✅ Get user from Redux
  const { user } = useSelector((state) => state.auth);

  // ✅ Use actual user data
  const admin = {
    name: user?.full_name || user?.username || 'Admin',
    role: user?.role === 'admin' || user?.is_staff ? 'Super Admin' : 'Admin',
    avatarUrl: user?.profile_pic_url || null,
  };

  // ✅ Log to verify
  console.log('🔍 AdminLayout - Current user:', admin.name);
  console.log('🔍 AdminLayout - User role:', admin.role);

  const notificationCount = 3;

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    navItems.forEach((item) => {
      if (item.children) {
        initial[item.label] =
          item.path === location.pathname ||
          item.children.some((c) => c.path === location.pathname);
      }
    });
    return initial;
  });

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (item) =>
    item.path === location.pathname ||
    (item.children && item.children.some((c) => c.path === location.pathname));

  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-text">
            <span className="brand-name">LIORA</span>
            <span className="brand-sub">AESTHETIC FASHION</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            if (item.divider) return <div className="sidebar-divider" key={`div-${idx}`} />;

            if (item.children) {
              const open = !!openGroups[item.label];
              return (
                <div className="sidebar-group" key={item.label}>
                  <div className={`sidebar-link sidebar-parent ${isParentActive(item) ? 'active' : ''}`}>
                    <Link to={item.path} className="sidebar-parent-link">
                      <span className="sidebar-link-icon">{item.icon}</span>
                      <span className="sidebar-link-label">{item.label}</span>
                    </Link>
                    <button
                      type="button"
                      className="sidebar-chevron-btn"
                      aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroup(item.label);
                      }}
                    >
                      {open ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                    </button>
                  </div>
                  {open && (
                    <div className="sidebar-submenu">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`sidebar-sublink ${isActive(sub.path) ? 'active' : ''}`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="help-card">
            <span className="help-icon"><FiHeadphones size={18} /></span>
            <div className="help-text">
              <strong>Need Help?</strong>
              <span>support@liora.com</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button className="header-menu-btn" onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? <FiMenu size={20} /> : <FiMenu size={20} />}
            </button>
            <div>
              <h1 className="header-title">{title}</h1>
              {subtitle && <p className="header-subtitle">{subtitle}</p>}
            </div>
          </div>

          <div className="header-right">
            <div className="header-search">
              <FiSearch size={16} className="header-search-icon" />
              <input type="text" placeholder="Search anything..." />
            </div>

            <button className="header-icon-btn" aria-label="Notifications">
              <FiBell size={20} />
              {notificationCount > 0 && (
                <span className="header-badge">{notificationCount}</span>
              )}
            </button>

            <div className="header-user" onClick={() => setUserMenuOpen((o) => !o)}>
              <div className="header-avatar">
                {admin.avatarUrl ? (
                  <img src={admin.avatarUrl} alt={admin.name} />
                ) : (
                  <span>{admin.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="header-user-text">
                <strong>{admin.name}</strong>
                <span>{admin.role}</span>
              </div>
              <FiChevronDown size={14} />

              {userMenuOpen && (
                <div className="header-user-menu">
                  <Link to="/admin/settings/profile">Admin Profile</Link>
                  <Link to="/admin/settings">Settings</Link>
                  <button type="button" className="logout-btn">
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;