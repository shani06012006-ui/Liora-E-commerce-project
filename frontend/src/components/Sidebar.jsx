// frontend/src/components/Sidebar.jsx
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { handleLogout } from '../redux/authUtils';
import {
  UserIcon, HeartIcon, ArchiveBoxIcon, MapPinIcon, CreditCardIcon,
  UserCircleIcon, LockClosedIcon, BellIcon, ShieldCheckIcon,
  ArrowRightOnRectangleIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
 
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
 
  // ✅ Matches the "Personal Details" mockup: a core section (Personal
  // Detail / Orders / Wishlist / Addresses / Payments) followed by an
  // "Account Settings" section. Note: Payments and "Privacy & Security"
  // both currently route to /settings since there's no dedicated backend
  // for either yet — see the note in AccountDashboard.jsx.
  const coreItems = [
    { id: 'personal',   name: 'Personal Detail', icon: UserIcon,       path: '/profile/edit' },
    { id: 'orders',     name: 'Orders',          icon: ArchiveBoxIcon, path: '/orders'        },
    { id: 'wishlist',   name: 'Wishlist',        icon: HeartIcon,      path: '/wishlist'      },
    { id: 'addresses',  name: 'Addresses',       icon: MapPinIcon,     path: '/address'       },
    { id: 'payments',   name: 'Payments',        icon: CreditCardIcon, path: '/settings'      },
  ];
 
  const settingsItems = [
    { id: 'edit_profile',   name: 'Edit Profile',              icon: UserCircleIcon,  path: '/profile/edit' },
    { id: 'change_password', name: 'Change Password',          icon: LockClosedIcon,  path: '/settings'     },
    { id: 'saved_addresses', name: 'Saved Addresses',          icon: MapPinIcon,      path: '/address'      },
    { id: 'notification_prefs', name: 'Notification Preferences', icon: BellIcon,     path: '/notifications' },
    { id: 'privacy_security', name: 'Privacy & Security',      icon: ShieldCheckIcon, path: '/settings'     },
  ];
 
  const onLogout = () => {
    handleLogout(dispatch, navigate);
  };
 
  const handleNavigation = (path, id) => {
    setActiveTab(id);
    navigate(path);
  };
 
  const renderItem = (item) => (
    <button
      key={item.id}
      onClick={() => handleNavigation(item.path, item.id)}
      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
        activeTab === item.id
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="flex items-center gap-3">
        <item.icon className="w-5 h-5" />
        <span className="text-sm font-medium">{item.name}</span>
      </span>
      <ChevronRightIcon className="w-4 h-4 text-gray-300" />
    </button>
  );
 
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
 
      {/* Core section */}
      <div className="space-y-1">
        {coreItems.map(renderItem)}
      </div>
 
      {/* Divider */}
      <div className="my-4 border-t border-gray-100"></div>
 
      {/* Account Settings section */}
      <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account Settings</p>
      <div className="space-y-1">
        {settingsItems.map(renderItem)}
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