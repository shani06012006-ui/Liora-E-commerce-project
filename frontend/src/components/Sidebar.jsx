// frontend/src/components/Sidebar.jsx
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { handleLogout } from '../redux/authUtils';
import { UserIcon, HeartIcon, ShoppingBagIcon, MapPinIcon, ShieldCheckIcon, DocumentTextIcon, QuestionMarkCircleIcon, ArrowRightOnRectangleIcon, BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  
  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    return user.full_name || user.username || 'User';
  };

  const getUserInitial = () => {
    if (!user) return 'U';
    const name = user.full_name || user.username || 'User';
    return name.charAt(0).toUpperCase();
  };

  const menuItems = [
    { id: 'personal',       name: 'Personal Detail',    icon: UserIcon,                 path: '/profile'        },
    { id: 'favourites',     name: 'My Favourite',       icon: HeartIcon,                path: '/wishlist'       },
    { id: 'orders',         name: 'My Orders',          icon: ShoppingBagIcon,          path: '/orders'         },
    { id: 'address',        name: 'Address',            icon: MapPinIcon,               path: '/address'        },
    { id: 'notifications',  name: 'Notifications',      icon: BellIcon,                 path: '/notifications'  },
    { id: 'privacy',        name: 'Privacy Policy',     icon: ShieldCheckIcon,          path: '/privacy'        },
    { id: 'terms',          name: 'Terms & Conditions', icon: DocumentTextIcon,         path: '/terms'          },
    { id: 'help',           name: 'Help & Support',     icon: QuestionMarkCircleIcon,   path: '/help'           },
    { id: 'settings',       name: 'Settings',           icon: Cog6ToothIcon,            path: '/settings'       },
  ];

  const onLogout = () => {
    handleLogout(dispatch, navigate);
  };

  const handleNavigation = (path, id) => {
    setActiveTab(id);
    navigate(path);
  };

  return (
    <div className="w-72 bg-white rounded-2xl shadow-sm p-4">
      <div className="text-center mb-6 pb-4 border-b border-gray-100">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 mx-auto mb-3 overflow-hidden flex items-center justify-center">
          {user?.profile_pic_url ? (
            <img src={user.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-white font-medium">
              {getUserInitial()}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-800">{getUserDisplayName()}</h3>
        <p className="text-xs text-gray-400 mt-1">{user?.email || ''}</p>
      </div>

      {/* Menu Items */}
      <div className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path, item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-gray-100"></div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;