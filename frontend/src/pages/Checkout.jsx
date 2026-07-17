// frontend/src/pages/Checkout.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { orderAPI, authAPI } from '../services/api';
import { getImageUrl } from '../services/api';
import { clearCart } from '../redux/cartSlice';
import { CreditCardIcon, BanknotesIcon, WalletIcon } from '@heroicons/react/24/outline';
import { getTokens, getCurrentUser } from '../utils/storage';
import toast from 'react-hot-toast';

const Checkout = () => {
  const location = useLocation();
  const buyNowData = location.state;
  const isBuyNow = buyNowData?.buyNow === true;

  const { items, total: cartTotal } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //Check authentication - wrapped in useCallback
  const isUserAuthenticated = useCallback(() => {
    const { accessToken } = getTokens();
    const currentUser = getCurrentUser() || user;
    return !!(accessToken && currentUser);
  }, [user]); //Added user as dependency

  //Redirect if not authenticated
  useEffect(() => {
    if (!isUserAuthenticated()) {
      navigate('/Login');
      return;
    }
  }, [isUserAuthenticated, navigate]);

  const displayItems = isBuyNow
    ? [{ product_details: buyNowData.product, quantity: buyNowData.quantity, price: buyNowData.product?.price }]
    : items;

  const total = isBuyNow
    ? buyNowData.product?.price * buyNowData.quantity
    : cartTotal;

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

  //Check if cart is empty
  useEffect(() => {
    if (!isBuyNow && items.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [items, navigate, orderPlaced, isBuyNow]);

  //Load addresses from API
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await authAPI.getAddresses();
        setAddresses(res.data || []);
      } catch (error) {
        console.error('Error loading addresses:', error);
        const savedAddresses = localStorage.getItem('user_addresses');
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        }
      }
    };
    loadAddresses();
  }, []);

  //Update when user changes
  useEffect(() => {
    if (user?.address && addresses.length === 0) {
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
      setAddresses(prev => [profileAddress, ...prev.filter(a => a.id !== 'profile')]);
    }
  }, [user, addresses.length]);

  //Set default address when addresses change
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
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
  }, [addresses, user, selectedAddress]);

  //Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //Handle address selection
  const handleAddrSelect = (address) => {
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
    const newAddress = { id: Date.now(), ...formData };
    const updated = [...addresses, newAddress];
    setAddresses(updated);
    localStorage.setItem('user_addresses', JSON.stringify(updated.filter(a => a.id !== 'profile')));
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

    setLoading(true);
    setOrderPlaced(true);
    toast.loading('Placing your order...', { id: 'order' });

    const fullAddress = `${formData.address_line1}, ${formData.address_line2 ? formData.address_line2 + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`;

    try {
      let response;
      if (isBuyNow) {
        response = await orderAPI.buyNow({
          product_id: buyNowData.product.id,
          quantity: buyNowData.quantity,
          shipping_address: fullAddress,
          phone: formData.phone,
          payment_method: paymentMethod,
        });
      } else {
        response = await orderAPI.checkout({
          shipping_address: fullAddress,
          phone: formData.phone,
          payment_method: paymentMethod,
        });
        dispatch(clearCart());
      }
      toast.success('Order placed successfully!', { id: 'order' });
      setTimeout(() => navigate('/order-success', { state: { order: response.data } }), 1500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order', { id: 'order' });
      setLoading(false);
      setOrderPlaced(false);
    }
  };

  const getProductImage = (product) => getImageUrl(product);

  const shippingCharge = total >= 999 ? 0 : 99;
  const finalTotal = total + shippingCharge;

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
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-serif text-gray-800 mb-6 md:mb-8">Checkout</h1>

      <div className="lg:hidden bg-white rounded-xl shadow-sm p-4 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Your Order ({displayItems.length} items)</h2>
        <div className="space-y-2 mb-3">
          {displayItems.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <img src={getProductImage(item.product_details)} alt={item.product_details?.name}
                className="w-12 h-12 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.product_details?.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} • ₹{item.product_details?.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>₹{total}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping</span><span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t">
            <span>Total</span><span>₹{finalTotal}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {addresses.length > 0 && !showAddressForm && (
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base md:text-xl font-semibold text-gray-800">Select Address</h2>
                <button onClick={() => setShowAddressForm(true)}
                  className="text-sm text-gray-600 hover:text-gray-900">+ Add New</button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {addresses.map((address) => (
                  <label key={address.id}
                    className={`flex items-start gap-3 p-3 md:p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedAddress?.id === address.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                    }`}>
                    <input type="radio" name="savedAddress" checked={selectedAddress?.id === address.id}
                      onChange={() => handleAddrSelect(address)} className="mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm">{address.full_name}</p>
                        {address.is_default && <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded">Default</span>}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">{address.address_line1}</p>
                      <p className="text-xs md:text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                      <p className="text-xs text-gray-500 mt-1">📞 {address.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(showAddressForm || addresses.length === 0) && (
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base md:text-xl font-semibold text-gray-800">
                  {addresses.length === 0 ? 'Add Delivery Address' : 'Add New Address'}
                </h2>
                {addresses.length > 0 && (
                  <button onClick={() => setShowAddressForm(false)} className="text-sm text-gray-500">Cancel</button>
                )}
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {[['full_name', 'Full Name *', 'text'], ['phone', 'Phone *', 'tel']].map(([name, label, type]) => (
                    <div key={name}>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type={type} name={name} value={formData[name]} onChange={handleChange}
                        className="w-full px-3 md:px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none" />
                    </div>
                  ))}
                </div>
                {[['address_line1', 'Address Line 1 *', 'House number, building, street'], ['address_line2', 'Address Line 2 (Optional)', 'Apartment, suite']].map(([name, label, placeholder]) => (
                  <div key={name}>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type="text" name={name} value={formData[name]} onChange={handleChange}
                      placeholder={placeholder}
                      className="w-full px-3 md:px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none" />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {[['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']].map(([name, label]) => (
                    <div key={name}>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{label} *</label>
                      <input type="text" name={name} value={formData[name]} onChange={handleChange}
                        className="w-full px-2 md:px-4 py-2 border border-gray-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none" />
                    </div>
                  ))}
                </div>
                <button onClick={saveNewAddress}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition text-sm">
                  Save Address
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h2 className="text-base md:text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-2 md:space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label key={method.id}
                    className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === method.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                    }`}>
                    <input type="radio" name="paymentMethod" value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                        <p className="font-medium text-gray-900 text-sm md:text-base">{method.name}</p>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">{method.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="lg:hidden">
            <button onClick={handleSubmit} disabled={loading}
              className={`w-full py-3.5 rounded-lg transition font-medium ${
                loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}>
              {loading ? 'Placing Order...' : `Place Order • ₹${finalTotal}`}
            </button>
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Order</h2>
            <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
              {displayItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 pb-3 border-b">
                  <img src={getProductImage(item.product_details)} alt={item.product_details?.name}
                    className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.product_details?.name}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    <p className="text-gray-800 font-medium text-sm">₹{item.product_details?.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-3 border-t">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span><span>₹{total}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Shipping</span><span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span><span className="text-gray-800">₹{finalTotal}</span>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className={`w-full mt-6 py-3 rounded-lg transition ${
                loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}>
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