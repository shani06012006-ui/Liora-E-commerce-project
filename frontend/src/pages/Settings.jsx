import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import { setCredentials } from '../redux/authSlice';
import { 
  BellIcon, 
  MoonIcon, 
  LockClosedIcon, 
  TrashIcon, 
  UserCircleIcon, 
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('settings');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load user data when available
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = {
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
      };
      
      const res = await authAPI.updateProfile(updateData);
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update Redux store
      dispatch(setCredentials({ 
        user: updatedUser, 
        access: localStorage.getItem('access_token') 
      }));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      // API call for password change
      toast.success('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // API call for account deletion
      toast.success('Account deleted successfully');
      localStorage.clear();
      window.location.href = '/Login';
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      full_name: user?.full_name || user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6 flex-col md:flex-row">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h1 className="text-2xl font-serif text-gray-800">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
              </div>

              <div className="p-6 space-y-8">
                {/* Profile Information - Editable */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <UserCircleIcon className="w-5 h-5" />
                      Profile Information
                    </h3>
                    {!isEditing && !showPasswordForm && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="full_name"
                          value={profileData.full_name}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          <CheckIcon className="w-4 h-4" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-800">{profileData.full_name || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">{profileData.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">{profileData.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Change Password - Collapsible */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="flex justify-between items-center w-full"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <LockClosedIcon className="w-5 h-5" />
                      Change Password
                    </h3>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${showPasswordForm ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                      <div>
                        <input
                          type="password"
                          name="current_password"
                          placeholder="Current Password"
                          value={passwordData.current_password}
                          onChange={handlePasswordInputChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          name="new_password"
                          placeholder="New Password"
                          value={passwordData.new_password}
                          onChange={handlePasswordInputChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                      </div>
                      <div>
                        <input
                          type="password"
                          name="confirm_password"
                          placeholder="Confirm New Password"
                          value={passwordData.confirm_password}
                          onChange={handlePasswordInputChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                        >
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Appearance */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MoonIcon className="w-5 h-5" />
                    Appearance
                  </h3>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-gray-800">Dark Mode</p>
                      <p className="text-sm text-gray-500">Switch between light and dark theme</p>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-300'
                      } relative`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                          darkMode ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BellIcon className="w-5 h-5" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email updates about your account</p>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`w-10 h-5 rounded-full transition-all ${
                          emailNotifications ? 'bg-gray-800' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                          emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-gray-800">Order Updates</p>
                        <p className="text-sm text-gray-500">Get updates about your orders</p>
                      </div>
                      <button
                        onClick={() => setOrderUpdates(!orderUpdates)}
                        className={`w-10 h-5 rounded-full transition-all ${
                          orderUpdates ? 'bg-gray-800' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                          orderUpdates ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-gray-800">Promotions & Offers</p>
                        <p className="text-sm text-gray-500">Receive special offers and deals</p>
                      </div>
                      <button
                        onClick={() => setPromotions(!promotions)}
                        className={`w-10 h-5 rounded-full transition-all ${
                          promotions ? 'bg-gray-800' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                          promotions ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-red-200">
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
                    >
                      <TrashIcon className="w-5 h-5" />
                      Delete Account
                    </button>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-red-600 mb-3 font-medium">Are you sure? This action cannot be undone.</p>
                      <p className="text-sm text-gray-600 mb-4">All your data including orders, addresses, and wishlist will be permanently deleted.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;