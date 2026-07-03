import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { handleLogout } from '../../redux/authUtils';
import { UsersIcon, ShoppingBagIcon, CubeIcon, ChartBarIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const navItems = [
  { label: 'Dashboard', path: '/admin',          icon: ChartBarIcon },
  { label: 'Users',     path: '/admin/users',    icon: UsersIcon },
  { label: 'Products',  path: '/admin/products', icon: CubeIcon },
  { label: 'Orders',    path: '/admin/orders',   icon: ShoppingBagIcon },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-serif tracking-wide">Liora Admin</h1>
          <p className="text-gray-400 text-xs mt-1">Management Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                location.pathname === path
                  ? 'bg-white text-gray-900 font-medium'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => handleLogout(dispatch, navigate)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-gray-800 w-full transition"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-gray-800 mt-1 transition"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;