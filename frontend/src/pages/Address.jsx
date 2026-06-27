import { useState, useEffect , useCallback} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import { setCredentials } from '../redux/authSlice';
import toast from 'react-hot-toast';
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, HomeIcon, BuildingOfficeIcon, XMarkIcon} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';

const Address = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
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

const loadAddresses = useCallback(() => {
  if (!user) return;

  const savedAddresses = [];

  if (user.address && user.address.trim() !== "") {
    const parts = user.address.split(",");

    savedAddresses.push({
      id: 1,
      full_name: user.full_name || user.username,
      phone: user.phone,
      address_line1: parts[0] || "",
      city: parts[1]?.trim() || "",
      state: parts[2]?.split("-")[0]?.trim() || "",
      pincode: parts[2]?.split("-")[1]?.trim() || "",
      landmark: "",
      address_type: "home",
      is_default: true,
    });
  }

  const savedAddressesList = localStorage.getItem("user_addresses");

  if (savedAddressesList) {
    const parsed = JSON.parse(savedAddressesList);
    savedAddresses.push(...parsed);
  }

  setAddresses(savedAddresses);
}, [user]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const saveAddressesToStorage = (updatedAddresses) => {
    const nonDefaultAddresses = updatedAddresses.filter(addr => !addr.is_default);
    localStorage.setItem('user_addresses', JSON.stringify(nonDefaultAddresses));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedAddresses = addresses.map(addr => 
        addr.id === formData.id ? { ...formData, id: addr.id } : addr
      );
      
      if (formData.is_default) {
        const fullAddress = `${formData.address_line1}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
        const updateData = {
          address: fullAddress,
          phone: formData.phone,
          full_name: formData.full_name,
        };
        await authAPI.updateProfile(updateData);
        dispatch(setCredentials({ 
          user: { ...user, ...updateData }, 
          access: localStorage.getItem('access_token') 
        }));
      }
      
      setAddresses(updatedAddresses);
      saveAddressesToStorage(updatedAddresses);
      
      toast.success('Address updated successfully!');
      setShowAddForm(false);
      setEditingAddress(null);
      resetForm();
    } catch {
      toast.error('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const newAddress = {
      id: crypto.randomUUID(),
      ...formData,
    };
    
    try {
      if (formData.is_default) {
        const fullAddress = `${formData.address_line1}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
        const updateData = {
          address: fullAddress,
          phone: formData.phone,
          full_name: formData.full_name,
        };
        await authAPI.updateProfile(updateData);
        dispatch(setCredentials({ 
          user: { ...user, ...updateData }, 
          access: localStorage.getItem('access_token') 
        }));
        
        const updatedAddresses = addresses.map(addr => ({ ...addr, is_default: false }));
        updatedAddresses.push(newAddress);
        setAddresses(updatedAddresses);
      } else {
        const updatedAddresses = [...addresses, newAddress];
        setAddresses(updatedAddresses);
        saveAddressesToStorage(updatedAddresses);
      }
      
      toast.success('Address added successfully!');
      setShowAddForm(false);
      resetForm();
    } catch{
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (id) => {
    const addressToDelete = addresses.find(addr => addr.id === id);
    
    if (!addressToDelete) return;
    
    if (addressToDelete.is_default) {
      const confirmDelete = window.confirm(
        'This is your default address. Deleting it will remove it from your profile. Are you sure?'
      );
      
      if (!confirmDelete) return;
      
      try {
        const updateData = {
          address: '',
          phone: user?.phone || '',
          full_name: user?.full_name || '',
        };
        await authAPI.updateProfile(updateData);
        dispatch(setCredentials({ 
          user: { ...user, ...updateData }, 
          access: localStorage.getItem('access_token') 
        }));
        
        toast.success('Default address removed successfully!');
      } catch {
        toast.error('Failed to remove default address');
        return;
      }
    }
    
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    setAddresses(updatedAddresses);
    saveAddressesToStorage(updatedAddresses);
    toast.success('Address removed');
  };

  const handleSetDefault = async (id) => {
    const addressToSet = addresses.find(addr => addr.id === id);
    if (!addressToSet) return;
    
    const fullAddress = `${addressToSet.address_line1}, ${addressToSet.city}, ${addressToSet.state} - ${addressToSet.pincode}`;
    
    try {
      const updateData = {
        address: fullAddress,
        phone: addressToSet.phone,
        full_name: addressToSet.full_name,
      };
      await authAPI.updateProfile(updateData);
      dispatch(setCredentials({ 
        user: { ...user, ...updateData }, 
        access: localStorage.getItem('access_token') 
      }));
      
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        is_default: addr.id === id
      }));
      setAddresses(updatedAddresses);
      saveAddressesToStorage(updatedAddresses.filter(addr => !addr.is_default));
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update default address');
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
              {(showAddForm || editingAddress) && (
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingAddress(null);
                        resetForm();
                      }}
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
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingAddress(null);
                          resetForm();
                        }}
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
                {addresses.length === 0 ? (
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
                            className="mt-3 text-xs text-gray-600 hover:text-gray-900 font-medium"
                          >
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