// frontend/src/pages/Address.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, HomeIcon, BuildingOfficeIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';

const Address = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('address');
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    address_type: 'home',
    is_default: false,
  });

  const loadAddresses = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await authAPI.getAddresses();
      setAddresses(res.data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      address_type: 'home',
      is_default: false,
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      id: address.id,
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      address_type: address.address_type || 'home',
      is_default: address.is_default,
    });
    setShowAddForm(true);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.createAddress(formData);
      toast.success('Address added successfully!');
      await loadAddresses();
      resetForm();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error(error.response?.data?.error || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.updateAddress(formData.id, formData);
      toast.success('Address updated successfully!');
      await loadAddresses();
      resetForm();
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error(error.response?.data?.error || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    setLoading(true);
    try {
      await authAPI.deleteAddress(id);
      toast.success('Address deleted successfully!');
      await loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error(error.response?.data?.error || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    setLoading(true);
    try {
      await authAPI.setDefaultAddress(id);
      toast.success('Default address updated!');
      await loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    } finally {
      setLoading(false);
    }
  };

  const getAddressTypeIcon = (type) => {
    switch(type) {
      case 'home': return <HomeIcon className="w-5 h-5 text-gray-600" />;
      case 'work': return <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />;
      default: return <MapPinIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAddressTypeLabel = (type) => {
    switch(type) {
      case 'home': return 'Home';
      case 'work': return 'Work';
      default: return 'Other';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Please login to view addresses</p>
          <Link to="/Login" className="inline-block mt-4 px-6 py-2 bg-gray-900 text-white text-sm uppercase tracking-wide hover:bg-gray-800 transition">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6 flex-col md:flex-row">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h1 className="text-2xl font-serif text-gray-900">Address Book</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your shipping addresses</p>
                  </div>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowAddForm(!showAddForm);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add New Address
                  </button>
                </div>
              </div>

              {/* Add/Edit Address Form */}
              {showAddForm && (
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                      <input
                        type="text"
                        name="address_line1"
                        value={formData.address_line1}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="House number, building name, street"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        name="address_line2"
                        value={formData.address_line2}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Apartment, suite, unit, etc."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Near any landmark"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                        <select
                          name="address_type"
                          value={formData.address_type}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="is_default"
                            checked={formData.is_default}
                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                            className="w-4 h-4 text-gray-900 rounded focus:ring-gray-900"
                          />
                          <span className="text-sm text-gray-700">Set as default address</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={loading} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
                        {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                      </button>
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses Grid View */}
              <div className="p-6">
                {loading && addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No addresses added yet</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-4 text-gray-900 hover:text-gray-600 font-medium"
                    >
                      + Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-xl p-5 transition-all hover:shadow-md ${
                          address.is_default ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {getAddressTypeIcon(address.address_type)}
                            <span className="text-sm font-medium text-gray-600">{getAddressTypeLabel(address.address_type)}</span>
                            {address.is_default && (
                              <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded">Default</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-gray-400 hover:text-gray-700 transition"
                              title="Edit address"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-gray-400 hover:text-red-500 transition"
                              title="Delete address"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{address.full_name}</p>
                          <p className="text-gray-600 text-sm">{address.address_line1}</p>
                          {address.address_line2 && <p className="text-gray-600 text-sm">{address.address_line2}</p>}
                          <p className="text-gray-600 text-sm">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.landmark && <p className="text-gray-500 text-xs">📍 {address.landmark}</p>}
                          <p className="text-gray-500 text-xs">📞 {address.phone}</p>
                        </div>
                        
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="mt-3 text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                          >
                            <CheckIcon className="w-3 h-3" />
                            Set as Default
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;