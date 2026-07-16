// frontend/src/components/Settings/AdminProfileSettings.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FiSave, FiRefreshCw, FiUser, FiMail, FiPhone, FiCamera, FiEyeOff,FiEye, FiAward, FiClock, FiCalendar,  FiShield, FiKey ,FiEdit2 ,FiCheck
} from 'react-icons/fi';

const AdminProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: 'Shani',
    email: 'shani@liora.com',
    phone: '+1 (555) 123-4567',
    role: 'Super Admin',
    avatar: null,
    bio: 'Lead administrator at Liora Aesthetic Fashion',
    join_date: 'January 2024',
    last_active: 'Today, 2:30 PM',
    permissions: ['Manage Store', 'Manage Users', 'View Analytics', 'Full Access'],
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (cancelled) return;
      } catch {
        if (!cancelled) toast.error('Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success('👤 Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success('🔑 Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
        toast.success('📸 Avatar updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <div className="mt-4 text-sm text-gray-500 font-medium">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <FiUser size={24} className="text-gray-700" />
            Admin Profile
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="group px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-70"
        >
          {saving ? (
            <>
              <FiRefreshCw className="animate-spin" size={18} />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiSave size={18} className="group-hover:scale-110 transition-transform" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-bold text-violet-600">{profile.full_name.charAt(0)}</span>
                )}
              </div>
              <label className="absolute bottom-2 right-2 p-3 bg-violet-600 text-white rounded-full cursor-pointer hover:bg-violet-700 transition-all shadow-lg hover:scale-110">
                <FiCamera size={16} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleAvatarUpload(e.target.files[0])}
                />
              </label>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-gray-900">{profile.full_name}</h3>
              <span className="inline-flex items-center gap-1 px-3 py-1 mt-1 bg-violet-50 text-violet-600 rounded-full text-xs font-medium">
                <FiAward size={12} />
                {profile.role}
              </span>
            </div>
            <div className="mt-4 flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FiCalendar size={12} />
                Joined {profile.join_date}
              </span>
              <span className="w-px h-4 bg-gray-300"></span>
              <span className="flex items-center gap-1">
                <FiClock size={12} />
                Active {profile.last_active}
              </span>
            </div>
          </div>

          {/* Profile Form */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <FiUser size={14} className="text-gray-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <FiMail size={14} className="text-gray-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <FiPhone size={14} className="text-gray-400" />
                  Phone Number
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <FiShield size={14} className="text-gray-400" />
                  Role
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                  value={profile.role}
                  disabled
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <FiEdit2 size={14} className="text-gray-400" />
                  Bio
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none resize-none"
                  rows="2"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {profile.permissions.map((perm, idx) => (
                  <span key={idx} className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-xs font-medium flex items-center gap-1">
                    <FiCheck size={12} />
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Change Password */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
              >
                <FiKey size={16} />
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>

              {showPasswordForm && (
                <div className="mt-4 p-5 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none pr-10"
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none pr-10"
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={saving}
                    className="mt-4 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-all disabled:opacity-70"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileSettings;