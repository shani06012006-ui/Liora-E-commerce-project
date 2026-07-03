import { useReducer, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, productAPI } from '../services/api';
import { ClockIcon, CheckCircleIcon, TruckIcon, ShoppingBagIcon, XCircleIcon, MapPinIcon, PhoneIcon, EyeIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ORDERS':         return { ...state, orders:        action.payload };
    case 'SET_LOADING':        return { ...state, loading:       action.payload };
    case 'SET_PRODUCT_IMAGES': return { ...state, productImages: action.payload };
    case 'SET_SELECTED_ORDER': return { ...state, selectedOrder: action.payload };
    default:                   return state;
  }
};

const Orders = () => {
  const [state, dispatch] = useReducer(reducer, { orders: [], loading: true, productImages: {}, selectedOrder: null });
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
              const p = await productAPI.getById(item.product);
              images[item.product] = p.data.image_url || p.data.image;
            } catch (err) { console.error(err); }
          }
        }
      }
      dispatch({ type: 'SET_PRODUCT_IMAGES', payload: images });
    } catch (err) { console.error(err); }
    finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const statusConfig = {
    pending:   { icon: ClockIcon,       color: 'text-yellow-600', bg: 'text-yellow-800 bg-yellow-100' },
    confirmed: { icon: CheckCircleIcon, color: 'text-blue-600',   bg: 'text-blue-800 bg-blue-100'     },
    shipped:   { icon: TruckIcon,       color: 'text-purple-600', bg: 'text-purple-800 bg-purple-100' },
    delivered: { icon: ShoppingBagIcon, color: 'text-green-600',  bg: 'text-green-800 bg-green-100'   },
    cancelled: { icon: XCircleIcon,     color: 'text-red-600',    bg: 'text-red-700 bg-red-100'       },
  };

  const getProductImage = (productId) => {
    const image = productImages[productId];
    if (image) return image.startsWith('http') ? image : `http://localhost:8000${image}`;
    return 'https://placehold.co/60x60/e0e0e0/2D2D2D?text=No+Image';
  };

  const toggleOrder = (order) =>
    dispatch({ type: 'SET_SELECTED_ORDER', payload: selectedOrder?.id === order.id ? null : order });

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Loading your orders...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex justify-between items-center mb-6 md:mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your orders</p>
        </div>
        <Link to="/Collections"
          className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-500 text-sm mb-6">Looks like you haven't placed any orders</p>
          <Link to="/Collections" className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {orders.map((order) => {
            const cfg       = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            const firstItem  = order.items?.[0];
            const firstImage = firstItem ? getProductImage(firstItem.product) : null;
            const isExpanded = selectedOrder?.id === order.id;

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">

                {/* Header */}
                <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b">
                  <div className="flex items-center gap-3 md:gap-4">
                    {firstImage && (
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img src={firstImage} alt="product"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://placehold.co/60x60'; }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Order Date</p>
                          <p className="text-gray-900 font-medium text-sm">
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-lg md:text-2xl font-bold text-gray-900">₹{order.total_amount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status + toggle */}
                <div className="px-4 md:px-6 py-3 border-b flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <StatusIcon className={`h-4 w-4 md:h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`text-xs md:text-sm font-semibold capitalize px-2 py-0.5 rounded-full ${cfg.bg}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => toggleOrder(order)}
                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 font-medium">
                    <EyeIcon className="h-4 w-4" />
                    {isExpanded ? 'Hide' : 'View Details'}
                    <ChevronDownIcon className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="p-4 md:p-6 border-b">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Order Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={getProductImage(item.product)} alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://placehold.co/60x60'; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{item.product_name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm flex-shrink-0">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between font-bold text-sm md:text-base">
                      <span>Total Paid</span>
                      <span className="text-gray-900">₹{order.total_amount}</span>
                    </div>
                  </div>
                )}

                {/* Shipping */}
                <div className="p-4 md:p-6 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Shipping Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Delivery Address</p>
                        <p className="text-gray-900 text-sm">{order.shipping_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <PhoneIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-gray-900 text-sm">{order.phone}</p>
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