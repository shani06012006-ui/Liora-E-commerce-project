// frontend/src/pages/Orders.jsx
import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, productAPI, cartAPI, getImageUrl } from '../services/api';
import toast from 'react-hot-toast';
import {
  ClockIcon, CheckCircleIcon, TruckIcon, ShoppingBagIcon, XCircleIcon,
  MapPinIcon, PhoneIcon, ChevronDownIcon, MagnifyingGlassIcon,
  FunnelIcon, ChevronLeftIcon, ChevronRightIcon, ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
 
const PAGE_SIZE = 5;
 
const initialState = {
  orders: [], loading: true, productImages: {}, expandedOrderId: null,
  search: '', statusFilter: 'all', sortOrder: 'newest', page: 1,
};
 
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ORDERS':         return { ...state, orders: action.payload };
    case 'SET_LOADING':        return { ...state, loading: action.payload };
    case 'SET_PRODUCT_IMAGES': return { ...state, productImages: action.payload };
    case 'TOGGLE_ORDER':       return { ...state, expandedOrderId: state.expandedOrderId === action.payload ? null : action.payload };
    case 'SET_SEARCH':         return { ...state, search: action.payload, page: 1 };
    case 'SET_STATUS_FILTER':  return { ...state, statusFilter: action.payload, page: 1 };
    case 'SET_SORT':           return { ...state, sortOrder: action.payload, page: 1 };
    case 'SET_PAGE':           return { ...state, page: action.payload };
    case 'RESET_FILTERS':      return { ...state, search: '', statusFilter: 'all', sortOrder: 'newest', page: 1 };
    default:                   return state;
  }
};
 
const statusConfig = {
  pending:   { icon: ClockIcon,       color: 'text-yellow-600', bg: 'text-yellow-800 bg-yellow-100' },
  confirmed: { icon: CheckCircleIcon, color: 'text-blue-600',   bg: 'text-blue-800 bg-blue-100'     },
  packed:    { icon: ArchiveBoxIcon,  color: 'text-indigo-600', bg: 'text-indigo-800 bg-indigo-100'  },
  shipped:   { icon: TruckIcon,       color: 'text-purple-600', bg: 'text-purple-800 bg-purple-100' },
  delivered: { icon: CheckCircleIcon, color: 'text-green-600',  bg: 'text-green-800 bg-green-100'   },
  cancelled: { icon: XCircleIcon,     color: 'text-red-600',    bg: 'text-red-700 bg-red-100'       },
};
 
const paymentMethodLabel = (method) => {
  const map = { cod: 'Cash on Delivery', card: 'Card', razorpay: 'Razorpay', upi: 'UPI' };
  return map[method?.toLowerCase()] || method || 'N/A';
};
 
const Orders = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { orders, loading, productImages, expandedOrderId, search, statusFilter, sortOrder, page } = state;
 
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
 
  const getProductImage = (productId) => {
    const image = productImages[productId];
    if (image) return getImageUrl({ image_url: image, image });
    return 'https://placehold.co/60x60/e0e0e0/2D2D2D?text=No+Image';
  };
 
  // ✅ The user-facing /orders/ endpoint doesn't support search/filter/sort
  // query params (only the admin endpoint does), so all of this is done
  // client-side against the orders already fetched above.
  const filteredOrders = useMemo(() => {
    let result = [...orders];
 
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((o) =>
        String(o.id).includes(q) ||
        o.order_number?.toLowerCase().includes(q) ||
        o.items?.some((it) => it.product_name?.toLowerCase().includes(q))
      );
    }
 
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }
 
    result.sort((a, b) => {
      const diff = new Date(b.created_at) - new Date(a.created_at);
      return sortOrder === 'newest' ? diff : -diff;
    });
 
    return result;
  }, [orders, search, statusFilter, sortOrder]);
 
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
 
  const handleBuyAgain = async (order) => {
    try {
      await Promise.all(
        order.items.map((item) => cartAPI.addToCart({ product_id: item.product, quantity: item.quantity }))
      );
      toast.success('Items added to your cart!');
    } catch {
      toast.error('Some items could not be added — they may be out of stock.');
    }
  };
 
  const handleDownloadInvoice = () => {
    // ✅ No invoice-generation endpoint exists yet on the backend.
    toast('Invoice download is coming soon!', { icon: '🧾' });
  };
 
  const pageNumbers = useMemo(() => {
    const nums = [];
    for (let i = 1; i <= totalPages; i++) nums.push(i);
    return nums;
  }, [totalPages]);
 
  if (loading) return (
    <div className="py-16 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Loading your orders...</p>
    </div>
  );
 
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            placeholder="Search orders by ID or product..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => dispatch({ type: 'SET_STATUS_FILTER', payload: e.target.value })}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => dispatch({ type: 'SET_SORT', payload: e.target.value })}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          {/* ✅ Acts as a "clear filters" shortcut since the two selects
              above are already live/reactive — there's nothing extra to
              "apply". */}
          <button
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            title="Clear all filters"
            className="flex items-center gap-2 px-3 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <FunnelIcon className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>
 
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {orders.length === 0 ? 'No Orders Yet' : 'No orders match your filters'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {orders.length === 0 ? "Looks like you haven't placed any orders" : 'Try adjusting your search or filters'}
          </p>
          <Link to="/Collections" className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pagedOrders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            const firstItem = order.items?.[0];
            const isExpanded = expandedOrderId === order.id;
            const canTrack = ['confirmed', 'packed', 'shipped'].includes(order.status);
 
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {firstItem && (
                      <img
                        src={getProductImage(firstItem.product)}
                        alt={firstItem.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/60x60'; }}
                      />
                    )}
                  </div>
 
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">#{order.order_number || order.id}</p>
                    <p className="text-sm text-gray-700 truncate">{firstItem?.product_name}</p>
                    <p className="text-xs text-gray-400">
                      Qty: {firstItem?.quantity}
                      {order.items.length > 1 && ` (+${order.items.length - 1} more)`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
 
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-bold text-gray-900">₹{order.total_amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="text-sm text-gray-800">{paymentMethodLabel(order.payment_method)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${cfg.bg}`}>
                      <StatusIcon className="w-3 h-3" />
                      {order.status}
                    </span>
                  </div>
                </div>
 
                <div className="px-4 md:px-5 pb-4 flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_ORDER', payload: order.id })}
                    className="flex items-center gap-1.5 text-xs md:text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {order.status === 'delivered' && (
                    <button
                      onClick={handleDownloadInvoice}
                      className="text-xs md:text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
                    >
                      Download Invoice
                    </button>
                  )}
                  {canTrack && (
                    <button
                      onClick={() => dispatch({ type: 'TOGGLE_ORDER', payload: order.id })}
                      className="text-xs md:text-sm bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-800 transition"
                    >
                      Track Order
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleBuyAgain(order)}
                      className="text-xs md:text-sm bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-800 transition"
                    >
                      Buy Again
                    </button>
                  )}
                </div>
 
                {isExpanded && (
                  <div className="px-4 md:px-5 pb-5 border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Order Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0 border-gray-100">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={getProductImage(item.product)}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://placehold.co/60x60'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{item.product_name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm flex-shrink-0">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-bold text-sm">
                      <span>Total Paid</span>
                      <span className="text-gray-900">₹{order.total_amount}</span>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Delivery Address</p>
                          <p className="text-gray-900 text-sm">{order.shipping_address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Contact</p>
                          <p className="text-gray-900 text-sm">{order.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
 
      {/* Pagination */}
      {filteredOrders.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.max(1, page - 1) })}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => dispatch({ type: 'SET_PAGE', payload: n })}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition ${
                n === page ? 'bg-gray-900 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.min(totalPages, page + 1) })}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
 
export default Orders;
 