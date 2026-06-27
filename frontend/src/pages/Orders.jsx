import { useReducer, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, productAPI } from '../services/api';
import {
  ClockIcon, CheckCircleIcon, TruckIcon, ShoppingBagIcon,
  XCircleIcon, MapPinIcon, PhoneIcon, EyeIcon,
} from '@heroicons/react/24/outline';
 
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PRODUCT_IMAGES':
      return { ...state, productImages: action.payload };
    case 'SET_SELECTED_ORDER':
      return { ...state, selectedOrder: action.payload };
    default:
      return state;
  }
};
 
const initialState = {
  orders:        [],
  loading:       true,
  productImages: {},
  selectedOrder: null,
};
 
 
const Orders = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { orders, loading, productImages, selectedOrder } = state;
 
  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderAPI.getOrders();
      dispatch({ type: 'SET_ORDERS', payload: res.data });
 
      const images = {};
      for (const order of res.data) {
        for (const item of order.items) {
          if (!images[item.product]) {
            try {
              const productRes = await productAPI.getById(item.product);
              images[item.product] =
                productRes.data.image_url || productRes.data.image;
            } catch (err) {
              console.error('Error fetching product image:', err);
            }
          }
        }
      }
      dispatch({ type: 'SET_PRODUCT_IMAGES', payload: images });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
 
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
 

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':   return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'confirmed': return <CheckCircleIcon className="h-5 w-5 text-blue-600" />;
      case 'shipped':   return <TruckIcon className="h-5 w-5 text-purple-600" />;
      case 'delivered': return <ShoppingBagIcon className="h-5 w-5 text-green-600" />;
      case 'cancelled': return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:          return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };
 
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':   return 'text-yellow-800 bg-yellow-100';
      case 'confirmed': return 'text-blue-800 bg-blue-100';
      case 'shipped':   return 'text-purple-800 bg-purple-100';
      case 'delivered': return 'text-green-800 bg-green-100';
      case 'cancelled': return 'text-red-700 bg-red-100';
      default:          return 'text-gray-800 bg-gray-100';
    }
  };
 
  const getProductImage = (productId) => {
    const image = productImages[productId];
    if (image) {
      if (image.startsWith('http')) return image;
      return `http://localhost:8000${image}`;
    }
    return 'https://placehold.co/60x60/e0e0e0/2D2D2D?text=No+Image';
  };
 
  const toggleOrder = (order) =>
    dispatch({
      type: 'SET_SELECTED_ORDER',
      payload: selectedOrder?.id === order.id ? null : order,
    });
 
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-secondary mt-4">Loading your orders...</p>
      </div>
    );
  }
 
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Orders</h1>
          <p className="text-secondary mt-1">Track and manage your orders</p>
        </div>
        <Link to="/Collections" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
 
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <ShoppingBagIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">No Orders Yet</h3>
          <p className="text-secondary mb-6">Looks like you haven't placed any orders</p>
          <Link to="/products" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon  = getStatusIcon(order.status);
            const statusColor = getStatusColor(order.status);
            const firstItem   = order.items?.[0];
            const firstImage  = firstItem ? getProductImage(firstItem.product) : null;
 
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
 
                {/* Order header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex items-center gap-4">
                    {firstImage && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src={firstImage}
                          alt={firstItem?.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/60x60/e0e0e0/2D2D2D?text=No+Image';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                          <p className="text-sm text-secondary">Order Date</p>
                          <p className="text-primary font-medium">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-secondary">Total Amount</p>
                          <p className="text-2xl font-bold text-primary">₹{order.total_amount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
 
                {/* Status + toggle */}
                <div className="px-6 py-3 border-b flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {StatusIcon}
                    </div>
                    <div>
                      <p className="text-sm text-secondary">Current Status</p>
                      <p className={`font-semibold capitalize px-2 py-0.5 rounded-full inline-block ${statusColor}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleOrder(order)}
                    className="text-primary font-medium hover:underline flex items-center gap-2"
                  >
                    <EyeIcon className="h-4 w-4" />
                    {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
 
                {/* Order items (expanded) */}
                {selectedOrder?.id === order.id && (
                  <div className="p-6 border-b">
                    <h3 className="font-semibold text-primary mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={getProductImage(item.product)}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/60x60/e0e0e0/2D2D2D?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-primary">{item.product_name}</p>
                            <p className="text-sm text-secondary">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-primary">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Paid</span>
                        <span className="text-primary">₹{order.total_amount}</span>
                      </div>
                    </div>
                  </div>
                )}
 
                {/* Shipping info */}
                <div className="p-6 bg-gray-50">
                  <h3 className="font-semibold text-primary mb-3">Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="h-5 w-5 text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm text-secondary">Delivery Address</p>
                        <p className="text-primary">{order.shipping_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <PhoneIcon className="h-5 w-5 text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm text-secondary">Contact Number</p>
                        <p className="text-primary">{order.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
 
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
 
export default Orders;