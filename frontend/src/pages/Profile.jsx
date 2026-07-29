﻿// frontend/src/pages/Profile.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { authAPI, orderAPI, wishlistAPI } from '../services/api';
import { setCredentials } from '../redux/authSlice';
import { getTokens, getCurrentUser } from '../utils/storage';
import toast from 'react-hot-toast';
import {
  PencilIcon, UserCircleIcon, LockClosedIcon, CameraIcon,
} from '@heroicons/react/24/outline';
 
// Splits the single `full_name` field the backend stores into first/last
const splitName = (fullName) => {
  const parts = (fullName || '').trim().split(/\s+/);
  return { first: parts[0] || '', last: parts.slice(1).join(' ') || '' };
};
 
const formatAddress = (a) => {
  if (!a) return '';
  return [a.address_line1, a.address_line2, a.city, a.state].filter(Boolean).join(', ');
};
 
const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
 
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', username: '', email: '', phone: '',
    date_of_birth: '', gender: '', location: '', bio: '',
  });
 
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState('');
  const [stats, setStats] = useState({ orders: null, wishlist: null, addresses: null });
 
  // ✅ Check if user is authenticated
  const isUserAuthenticated = () => {
    const { accessToken } = getTokens();
    const currentUser = getCurrentUser() || user;
    return !!(accessToken && currentUser);
  };
 
  useEffect(() => {
    if (!user) return;
    const { first, last } = splitName(user.full_name);
    setFormData({
      first_name: user.first_name || first,
      last_name: user.last_name || last,
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
      location: user.location || '',
      bio: user.bio || '',
    });
  }, [user]);
 
  const loadSidebarData = useCallback(async () => {
    try {
      const [addressesRes, ordersRes, wishlistRes] = await Promise.allSettled([
        authAPI.getAddresses(),
        orderAPI.getOrders(),
        wishlistAPI.getWishlist(),
      ]);
      if (addressesRes.status === 'fulfilled') {
        const list = addressesRes.value.data;
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setDefaultAddressId(String(def.id));
      }
      setStats({
        orders: ordersRes.status === 'fulfilled' ? ordersRes.value.data.length : 0,
        wishlist: wishlistRes.status === 'fulfilled' ? wishlistRes.value.data.length : 0,
        addresses: addressesRes.status === 'fulfilled' ? addressesRes.value.data.length : 0,
      });
    } catch (err) {
      console.error(err);
    }
  }, []);
 
  useEffect(() => { loadSidebarData(); }, [loadSidebarData]);
 
  useEffect(() => {
    return () => { if (previewImage) URL.revokeObjectURL(previewImage); };
  }, [previewImage]);
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
 
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
 
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
 
    // ✅ Show the picked image immediately instead of waiting for the
    // server round-trip; swap to the real, persisted profile_pic_url once
    // the upload succeeds.
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewImage(localPreviewUrl);
    setPhotoLoading(true);
 
    const formDataPic = new FormData();
    formDataPic.append('profile_pic', file);
 
    try {
      const res = await authAPI.updateProfilePicture(formDataPic);
      const { accessToken } = getTokens();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...res.data };
      dispatch(setCredentials({ user: updatedUser, access: accessToken }));
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload picture');
    } finally {
      setPhotoLoading(false);
      setPreviewImage(null);
      URL.revokeObjectURL(localPreviewUrl);
    }
  };
 
  const handleDefaultAddressChange = async (e) => {
    const id = e.target.value;
    setDefaultAddressId(id);
    try {
      await authAPI.setDefaultAddress(id);
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update default address');
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender,
        location: formData.location,
        bio: formData.bio,
      };
 
      const res = await authAPI.updateProfile(updateData);
      const { accessToken } = getTokens();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
 
      dispatch(setCredentials({ user: updatedUser, access: accessToken }));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
 
  const handleCancel = () => {
    if (!user) return;
    const { first, last } = splitName(user.full_name);
    setFormData({
      first_name: user.first_name || first,
      last_name: user.last_name || last,
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
      location: user.location || '',
      bio: user.bio || '',
    });
    setIsEditing(false);
  };
 
  const avatarSrc = previewImage || user?.profile_pic_url || null;
 
  const memberSince = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';
 
  if (!isUserAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Please login to view profile</p>
          <Link to="/Login" className="inline-block mt-4 px-6 py-2 bg-gray-900 text-white text-sm uppercase tracking-wide hover:bg-gray-800 transition">
            Login
          </Link>
        </div>
      </div>
    );
  }
 
  const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-500";
 
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
 
      {/* Middle: Personal Information form */}
      <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-gray-100">
          <h2 className="text-xl font-serif text-gray-900">Personal Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                disabled={!isEditing} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                disabled={!isEditing} className={inputClass} />
            </div>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                disabled={!isEditing} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                disabled={!isEditing} className={inputClass} />
            </div>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange}
                disabled={!isEditing} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Gender</label>
              <select name="gender" value={formData.gender || ''} onChange={handleChange}
                disabled={!isEditing} className={inputClass}>
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Country</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange}
                disabled={!isEditing} placeholder="e.g., Sri Lanka" className={inputClass} />
            </div>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Username</label>
              {/* ✅ Read-only: changing usernames touches uniqueness/auth
                  elsewhere in the app, so this stays display-only for now. */}
              <input type="text" value={formData.username} disabled className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Bio</label>
              <input type="text" name="bio" value={formData.bio} onChange={handleChange}
                disabled={!isEditing} placeholder="Tell us about yourself..." className={inputClass} />
            </div>
          </div>
 
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Default Address</label>
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No saved addresses yet — add one from the Addresses page.</p>
            ) : (
              <select value={defaultAddressId} onChange={handleDefaultAddressChange}
                disabled={!isEditing} className={inputClass}>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>{formatAddress(a)}</option>
                ))}
              </select>
            )}
          </div>
 
          {isEditing && (
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-60">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
 
      {/* Right: profile summary card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative group cursor-pointer" onClick={handleImageClick}>
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-14 h-14 text-gray-400" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition">
              <CameraIcon className="w-4 h-4 text-white" />
            </div>
            {photoLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">
            {formData.first_name} {formData.last_name}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">Member since {memberSince}</p>
        </div>
 
        <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Account Status</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              user?.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {user?.is_blocked ? 'Blocked' : 'Active'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Orders</span>
            <span className="text-sm font-medium text-gray-900">
              {stats.orders === null ? '—' : `${stats.orders} Orders`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Wishlist Items</span>
            <span className="text-sm font-medium text-gray-900">
              {stats.wishlist === null ? '—' : `${stats.wishlist} Items`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Saved Addresses</span>
            <span className="text-sm font-medium text-gray-900">
              {stats.addresses === null ? '—' : `${stats.addresses} Addresses`}
            </span>
          </div>
        </div>
 
        <Link to="/settings"
          className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
          <LockClosedIcon className="w-4 h-4" />
          Change Password
        </Link>
      </div>
    </div>
  );
};
 
export default Profile;
 