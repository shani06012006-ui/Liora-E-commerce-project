// frontend/src/pages/Orders.jsx
import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, productAPI, cartAPI, getImageUrl } from '../services/api';
import toast from 'react-hot-toast';
import {
  ClockIcon, CheckCircleIcon, TruckIcon, ShoppingBagIcon, XCircleIcon,
  MapPinIcon, MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon,
  ChevronRightIcon, ArchiveBoxIcon, XMarkIcon, ArrowDownTrayIcon,
  ArrowPathIcon, CreditCardIcon, CheckIcon,
} from '@heroicons/react/24/outline';
 
const PAGE_SIZE = 5;
 
const initialState = {
  orders: [], loading: true, productImages: {}, selectedOrder: null,
  search: '', statusFilter: 'all', sortOrder: 'newest', page: 1,
};
 
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ORDERS':         return { ...state, orders: action.payload };
    case 'SET_LOADING':        return { ...state, loading: action.payload };
    case 'SET_PRODUCT_IMAGES': return { ...state, productImages: action.payload };
    case 'OPEN_ORDER':         return { ...state, selectedOrder: action.payload };
    case 'CLOSE_ORDER':        return { ...state, selectedOrder: null };
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
 
 
const TRACK_STEPS = [
  { key: 'placed',     label: 'Placed'     },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped',    label: 'Shipped'    },
  { key: 'delivered',  label: 'Delivered'  },
];
 
const stepIndexForStatus = (status) => {
  if (status === 'pending') return 0;
  if (status === 'confirmed' || status === 'packed') return 1;
  if (status === 'shipped') return 2;
  if (status === 'delivered') return 3;
  return -1; // cancelled or unknown — timeline not shown
};
 
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
 
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
 
const Orders = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { orders, loading, productImages, selectedOrder, search, statusFilter, sortOrder, page } = state;
 
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
 
  // Lock body scroll while the drawer is open, and close on Escape.
  useEffect(() => {
    if (!selectedOrder) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => { if (e.key === 'Escape') dispatch({ type: 'CLOSE_ORDER' }); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedOrder]);
 
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
 
  // ✅ No invoice-generation endpoint exists on the backend, so this builds
  // a printable invoice client-side (same approach used on the admin side
  // in AdminOrders.jsx) and opens the browser's print dialog, which lets
  // the customer save it as a PDF.
  const handleDownloadInvoice = (order) => {
    if (!order) {
      toast.error('Unable to generate invoice for this order.');
      return;
    }
 
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Please allow popups to download the invoice');
      return;
    }
 
    const subtotal = order.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const shipping = 0; // No shipping-fee field exists on the backend order model.
    const tax = Math.max(0, Number(order.total_amount) - subtotal - shipping);
 
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Order #${order.order_number || order.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; padding: 40px; color: #1f2937; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; }
            .brand { font-size: 22px; font-weight: bold; letter-spacing: 2px; }
            .invoice-title { text-align: right; }
            .invoice-title h2 { font-size: 18px; margin-bottom: 4px; }
            .invoice-title p { font-size: 12px; color: #6b7280; }
            .section { margin-bottom: 24px; }
            .section h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { text-align: left; padding: 8px; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; text-transform: uppercase; font-size: 11px; color: #6b7280; }
            .totals { margin-top: 16px; width: 260px; margin-left: auto; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
            .totals .grand { font-weight: bold; font-size: 15px; border-top: 1px solid #111827; padding-top: 8px; margin-top: 4px; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">LIORA</div>
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <p>Order #${order.order_number || order.id}</p>
              <p>${formatDateTime(order.created_at)}</p>
            </div>
          </div>
 
          <div class="section">
            <h3>Shipping Address</h3>
            <p style="font-size:13px; white-space: pre-line;">${order.shipping_address || 'N/A'}</p>
            <p style="font-size:13px;">${order.phone || ''}</p>
          </div>
 
          <div class="section">
            <h3>Payment Method</h3>
            <p style="font-size:13px;">${paymentMethodLabel(order.payment_method)}</p>
          </div>
 
          <div class="section">
            <h3>Items</h3>
            <table>
              <thead>
                <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${order.items.map((it) => `
                  <tr>
                    <td>${it.product_name}</td>
                    <td>${it.quantity}</td>
                    <td>₹${it.price}</td>
                    <td>₹${(it.price * it.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
 
          <div class="totals">
            <div><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
            <div><span>Shipping</span><span>₹${shipping.toFixed(2)}</span></div>
            <div><span>Tax</span><span>₹${tax.toFixed(2)}</span></div>
            <div class="grand"><span>Total</span><span>₹${order.total_amount}</span></div>
          </div>
 
          <div class="footer">Thank you for shopping with Liora — this is a system-generated invoice.</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
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
                    onClick={() => dispatch({ type: 'OPEN_ORDER', payload: order })}
                    className="flex items-center gap-1.5 text-xs md:text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
                  >
                    View Details
                  </button>
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="text-xs md:text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
                    >
                      Download Invoice
                    </button>
                  )}
                  {canTrack && (
                    <button
                      onClick={() => dispatch({ type: 'OPEN_ORDER', payload: order })}
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
 
      {/* ✅ NEW: right-side "Order Details" drawer, replacing the old
          inline expand-in-card panel. */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => dispatch({ type: 'CLOSE_ORDER' })}
          getProductImage={getProductImage}
          onDownloadInvoice={handleDownloadInvoice}
          onBuyAgain={handleBuyAgain}
        />
      )}
    </div>
  );
};
 
const OrderDetailsDrawer = ({ order, onClose, getProductImage, onDownloadInvoice, onBuyAgain }) => {
  const cfg = statusConfig[order.status] || statusConfig.pending;
  const currentStep = stepIndexForStatus(order.status);
  const isCancelled = order.status === 'cancelled';
  const subtotal = order.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shipping = 0; // ✅ Assumption: no shipping-fee field exists on the backend order model.
  const tax = Math.max(0, Number(order.total_amount) - subtotal - shipping);
  const canTrack = ['confirmed', 'packed', 'shipped'].includes(order.status);
 
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
 
      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto animate-[slideIn_0.25s_ease-out]">
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
 
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-serif tracking-wide text-gray-900">ORDER DETAILS</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 transition">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
 
        <div className="p-6 space-y-6">
          {/* Header card */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order.order_number || order.id}</h3>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${cfg.bg}`}>
                    <cfg.icon className="w-3 h-3" />
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Placed on {formatDateTime(order.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">₹{order.total_amount}</p>
              </div>
            </div>
 
            {/* Tracker */}
            {!isCancelled ? (
              <div className="flex items-center justify-between mt-6">
                {TRACK_STEPS.map((step, i) => {
                  const reached = i <= currentStep;
                  const isLast = i === TRACK_STEPS.length - 1;
                  return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                          reached ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-300'
                        }`}>
                          {reached ? <CheckIcon className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </div>
                        <p className={`text-xs mt-2 font-medium ${reached ? 'text-green-600' : 'text-gray-400'}`}>{step.label}</p>
                        {/* Only "Placed" and "Delivered" have a real stored
                            timestamp on the backend — see note below. */}
                        {step.key === 'placed' && (
                          <p className="text-[11px] text-gray-400">{formatDate(order.created_at)}</p>
                        )}
                        {step.key === 'delivered' && reached && (
                          <p className="text-[11px] text-gray-400">{formatDate(order.updated_at)}</p>
                        )}
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">
                This order was cancelled.
              </div>
            )}
          </div>
 
          {/* Items */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0 border-gray-100">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/60x60'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.product_name}</p>
                    {/* ✅ Size/Colour aren't stored per order-item on the
                        backend (OrderItem only has product, quantity,
                        price), so only Qty is shown here. */}
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm flex-shrink-0">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
 
          {/* Totals */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span><span>Free</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span><span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span><span>₹{order.total_amount}</span>
            </div>
          </div>
 
          {/* Address + payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-100 pt-4">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-2">
                <MapPinIcon className="w-4 h-4" />
                Shipping Address
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
              <p className="text-sm text-gray-600 mt-1">{order.phone}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-2">
                <CreditCardIcon className="w-4 h-4" />
                Payment Information
              </div>
              {/* ✅ No card brand/last-4 is stored on the backend — only a
                  generic payment_method string — so we show that instead
                  of a fabricated masked card number. */}
              <p className="text-sm text-gray-600">{paymentMethodLabel(order.payment_method)}</p>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                {order.payment_status === 'paid' ? `Paid on ${formatDate(order.created_at)}` : (order.payment_status || 'Pending')}
              </p>
            </div>
          </div>
 
          {/* Notes */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-semibold text-gray-900 mb-1">Order Notes</h4>
            {/* ✅ No order-notes field exists on the backend yet. */}
            <p className="text-sm text-gray-400">No notes added</p>
          </div>
        </div>
 
        {/* Sticky action bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex flex-wrap gap-2">
          {canTrack && (
            <button onClick={onClose}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg py-2.5 text-sm hover:bg-gray-800 transition">
              Track Order
            </button>
          )}
          {order.status === 'delivered' && (
            <button onClick={() => onDownloadInvoice(order)}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download Invoice
            </button>
          )}
          {order.status === 'delivered' && (
            <button onClick={() => onBuyAgain(order)}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition">
              <ArrowPathIcon className="w-4 h-4" />
              Buy Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default Orders;