import { useEffect, useState , useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, TruckIcon, ClockIcon, MapPinIcon, PhoneIcon, CalendarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  

const [estimatedDelivery, setEstimatedDelivery] = useState("");

const triggerConfetti = useCallback(() => {
  confetti({
    particleCount: 200,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#1a1a1a', '#333333', '#666666', '#999999', '#ffffff'],
  });

  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7, x: 0.3 },
      colors: ['#1a1a1a', '#333333'],
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7, x: 0.7 },
      colors: ['#666666', '#999999'],
    });
  }, 400);
}, []);

useEffect(() => {
  const orderData = location.state?.order;

  if (!orderData) {
    navigate("/", { replace: true });
    return;
  }

  setOrder(orderData);

  const deliveryDate = new Date(orderData.created_at);
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  const formattedDelivery = deliveryDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  setEstimatedDelivery(formattedDelivery);

  triggerConfetti();
}, [location.state, navigate, triggerConfetti]);


  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto" />
          <p className="text-gray-500 mt-4 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header - Black & White */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">Order Confirmed</h1>
          <p className="text-gray-500 text-sm tracking-wide">Thank you for shopping with Liora</p>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-5" />
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Order Number</p>
              <p className="text-base font-medium text-gray-900">#{order.order_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Order Date</p>
              <p className="text-base font-medium text-gray-900">
              {new Date(order.created_at).toLocaleDateString("en-IN", {
               day: "numeric",
               month: "long",
               year: "numeric",
              })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Amount</p>
              <p className="text-xl font-semibold text-gray-900">₹{order.total_amount}</p>
            </div>
          </div>

          {/* Order Status Tracker - Black & White */}
          <div className="mt-10 mb-6">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-6">Order Status</h3>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-wide">Placed</p>
              </div>
              <div className="flex-1 h-px bg-gray-900"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wide">Confirmed</p>
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wide">Shipped</p>
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wide">Delivered</p>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="border-t border-gray-100 pt-5 mt-2">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">Shipping Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Address</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{order.shipping_address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PhoneIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Contact</p>
                  <p className="text-sm text-gray-700">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Estimated Delivery</p>
                  <p className="text-sm text-gray-700">
                    {estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-5">Order Items ({order.items?.length || 0})</h3>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.product_name}</p>
                  <p className="text-xs text-gray-400 mt-1">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-900">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-5 mt-3 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-900 uppercase tracking-wide">Total Paid</span>
            <span className="text-xl font-semibold text-gray-900">₹{order.total_amount}</span>
          </div>
        </div>

        {/* Action Buttons - Black & White */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/Collections" 
            className="bg-gray-900 text-white px-8 py-3 text-center text-xs uppercase tracking-wider font-medium hover:bg-gray-800 transition inline-flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
          <Link 
            to="/orders" 
            className="border border-gray-300 text-gray-700 px-8 py-3 text-center text-xs uppercase tracking-wider font-medium hover:border-gray-900 hover:text-gray-900 transition inline-flex items-center justify-center gap-2"
          >
            View Orders
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;