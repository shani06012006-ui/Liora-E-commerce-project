import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setCredentials } from '../redux/authSlice';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { 
  PencilIcon, 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserCircleIcon,
  CheckBadgeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || user.username || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setLoading(true);
      const formDataPic = new FormData();
      formDataPic.append('profile_pic', file);
      
      try {
        const res = await authAPI.updateProfilePicture(formDataPic);
        dispatch(setCredentials({ 
          user: res.data, 
          access: localStorage.getItem('access_token') 
        }));
        toast.success('Profile picture updated!');
      } catch (error) {
        toast.error('Failed to upload picture');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
      };
      
      const res = await authAPI.updateProfile(updateData);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      dispatch(setCredentials({ 
        user: updatedUser, 
        access: localStorage.getItem('access_token') 
      }));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Please login to view profile</p>
          <Link to="/login" className="inline-block mt-4 px-6 py-2 bg-gray-900 text-white text-sm uppercase tracking-wide hover:bg-gray-800 transition">
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Personal Detail Tab
  const renderPersonalDetail = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Personal Detail</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                placeholder="e.g., Tamil Nadu, India"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center py-3 border-b border-gray-100">
            <div className="w-28 text-sm text-gray-500">Full Name</div>
            <div className="flex-1 text-gray-900 font-medium">{formData.full_name || 'Not provided'}</div>
          </div>
          
          <div className="flex items-center py-3 border-b border-gray-100">
            <div className="w-28 text-sm text-gray-500">Username</div>
            <div className="flex-1 text-gray-900 font-medium">@{user.username}</div>
          </div>
          
          <div className="flex items-center py-3 border-b border-gray-100">
            <div className="w-28 text-sm text-gray-500">Email</div>
            <div className="flex-1 text-gray-900 font-medium flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 text-gray-400" />
              {user.email || 'Not provided'}
            </div>
          </div>
          
          <div className="flex items-center py-3 border-b border-gray-100">
            <div className="w-28 text-sm text-gray-500">Phone</div>
            <div className="flex-1 text-gray-900 font-medium flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-gray-400" />
              {user.phone || 'Not provided'}
            </div>
          </div>
          
          <div className="flex items-center py-3 border-b border-gray-100">
            <div className="w-28 text-sm text-gray-500">Location</div>
            <div className="flex-1 text-gray-900 font-medium flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-gray-400" />
              {formData.location || 'Not provided'}
            </div>
          </div>
          
          <div className="flex items-start py-3">
            <div className="w-28 text-sm text-gray-500">Bio</div>
            <div className="flex-1 text-gray-900 font-medium whitespace-pre-line">
              {formData.bio || 'Not provided'}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'personal':
        return renderPersonalDetail();
      default:
        return renderPersonalDetail();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6 flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-72">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Profile Header with Gradient */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-8">
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Profile Picture */}
                  <div className="relative group cursor-pointer" onClick={handleImageClick}>
                    <div className="w-24 h-24 rounded-full bg-white p-0.5">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                        {user?.profile_pic_url ? (
                          <img 
                            src={user.profile_pic_url} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="w-14 h-14 text-gray-500" />
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all flex items-center justify-center">
                      <PencilIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    {loading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  {/* User Info */}
                  <div>
                    <h1 className="text-2xl font-semibold text-white">{formData.full_name || user.username}</h1>
                    <p className="text-gray-300 text-sm mt-1">@{user.username}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                        <CheckBadgeIcon className="w-3 h-3" />
                        Verified Member
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                        <CalendarIcon className="w-3 h-3" />
                        Joined {new Date(user.date_joined || Date.now()).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Dynamic Content */}
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;