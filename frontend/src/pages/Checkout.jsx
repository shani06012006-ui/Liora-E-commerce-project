import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { orderAPI } from '../services/api';
import { clearCart } from '../redux/cartSlice';
import { CreditCardIcon, BanknotesIcon, WalletIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: BanknotesIcon, description: 'Pay when you receive the order' },
    { id: 'card', name: 'Credit / Debit Card', icon: CreditCardIcon, description: 'Visa, Mastercard, RuPay' },
    { id: 'upi', name: 'UPI / Wallet', icon: WalletIcon, description: 'Google Pay, PhonePe, Paytm' },
  ];



useEffect(() => {
  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
  }

  const savedAddresses = localStorage.getItem('user_addresses');
  let allAddresses = [];

  if (savedAddresses) {
    allAddresses = JSON.parse(savedAddresses);
  }

  if (user?.address && user.address.trim() !== '') {
    const parts = user.address.split(',');

    const profileAddress = {
      id: 'profile',
      full_name: user.full_name || user.username,
      phone: user.phone,
      address_line1: parts[0] || '',
      city: parts[1]?.trim() || '',
      state: parts[2]?.split('-')[0]?.trim() || '',
      pincode: parts[2]?.split('-')[1]?.trim() || '',
      is_default: true,
    };

    allAddresses = [
      profileAddress,
      ...allAddresses.filter(a => a.id !== 'profile'),
    ];
  }

  setAddresses(allAddresses);

  const defaultAddr =
    allAddresses.find(addr => addr.is_default) || allAddresses[0];

  if (defaultAddr) {
    setSelectedAddress(defaultAddr);

    setFormData({
      full_name: defaultAddr.full_name || user?.full_name || '',
      phone: defaultAddr.phone || user?.phone || '',
      address_line1: defaultAddr.address_line1 || '',
      address_line2: defaultAddr.address_line2 || '',
      city: defaultAddr.city || '',
      state: defaultAddr.state || '',
      pincode: defaultAddr.pincode || '',
    });
  }
}, [items, navigate, orderPlaced, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setFormData({
      full_name: address.full_name || user?.full_name || '',
      phone: address.phone || user?.phone || '',
      address_line1: address.address_line1 || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
    });
    setShowAddressForm(false);
  };

  const saveNewAddress = () => {
    const newAddress = {
      id: Date.now(),
      ...formData,
    };
    
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    localStorage.setItem('user_addresses', JSON.stringify(updatedAddresses.filter(a => a.id !== 'profile')));
    setSelectedAddress(newAddress);
    setShowAddressForm(false);
    toast.success('Address saved!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.address_line1 || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill complete address');
      return;
    }

    if (!formData.phone) {
      toast.error('Please enter phone number');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);
    setOrderPlaced(true);
    toast.loading('Placing your order...', { id: 'order' });

    const fullAddress = `${formData.address_line1}, ${formData.address_line2 ? formData.address_line2 + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`;
    
    const orderData = {
      shipping_address: fullAddress,
      phone: formData.phone,
      payment_method: paymentMethod,
    };

    try {
      const response = await orderAPI.checkout(orderData);
      console.log('Order response:', response.data);
      
      toast.success('Order placed successfully!', { id: 'order' });
      
      dispatch(clearCart());
      localStorage.removeItem('cart');
      
      setTimeout(() => {
        navigate('/order-success', { state: { order: response.data } });
      }, 1500);
      
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.error || 'Failed to place order', { id: 'order' });
      setLoading(false);
      setOrderPlaced(false);
    }
  };

  const getImageUrl = (product) => {
    if (product?.image_url) return product.image_url;
    if (product?.image) return `http://localhost:8000${product.image}`;
    return 'https://placehold.co/60x60/e0e0e0/2D2D2D?text=No';
  };

  const shippingCharge = total >= 999 ? 0 : 99;
  const finalTotal = total + shippingCharge;

  // Loading overlay
  if (orderPlaced && loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif text-gray-800 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Address Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Selection */}
          {addresses.length > 0 && !showAddressForm && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Select Address</h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  + Add New
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedAddress?.id === address.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddress?.id === address.id}
                      onChange={() => handleAddressSelect(address)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{address.full_name}</p>
                        {address.is_default && (
                          <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{address.address_line1}</p>
                      {address.address_line2 && <p className="text-sm text-gray-600">{address.address_line2}</p>}
                      <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                      <p className="text-sm text-gray-500 mt-1">📞 {address.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add New Address Form */}
          {showAddressForm && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Add New Address</h2>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800"
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      required
                    />
                  </div>
                </div>
                
                <button
                  onClick={saveNewAddress}
                  className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  Save Address
                </button>
              </div>
            </div>
          )}

          {/* Payment Method Section - NEW */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <p className="font-medium text-gray-900">{method.name}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Order</h2>
            
            <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b">
                  <img 
                    src={getImageUrl(item.product_details)} 
                    alt={item.product_details.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.product_details.name}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    <p className="text-gray-800 font-medium text-sm">₹{item.product_details.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 pt-3 border-t">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-gray-800">₹{finalTotal}</span>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
              className={`w-full mt-6 py-3 rounded-lg transition ${
                loading || items.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {loading ? 'Placing Order...' : `Place Order • ₹${finalTotal}`}
            </button>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              By placing this order, you agree to our{' '}
              <a href="/terms" className="text-gray-600 hover:text-gray-900">Terms & Conditions</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;