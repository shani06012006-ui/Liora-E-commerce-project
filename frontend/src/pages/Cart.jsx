// frontend/src/pages/Cart.jsx
import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI, getImageUrl } from '../services/api';
import { refreshCart } from '../redux/cartUtils';
import { getTokens, getCurrentUser } from '../utils/storage';
import toast from 'react-hot-toast';
import { LockClosedIcon, ShoppingBagIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
 
const Cart = () => {
  const { items, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [pendingId, setPendingId] = useState(null);
 
  const fetchCart = useCallback(() => { refreshCart(dispatch); }, [dispatch]);
  useEffect(() => { fetchCart(); }, [fetchCart]);
 
  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1 || pendingId) return;
 
    const stock = item.product_details?.stock;
    if (typeof stock === 'number' && newQuantity > stock) {
      toast.error(`Only ${stock} in stock`);
      return;
    }
 
    setPendingId(item.id);
    try {
      await cartAPI.updateQuantity(item.id, newQuantity);
      await refreshCart(dispatch);
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setPendingId(null);
    }
  };
 
  const removeItem = async (itemId) => {
    if (pendingId) return;
    setPendingId(itemId);
    try {
      await cartAPI.removeItem(itemId);
      await refreshCart(dispatch);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setPendingId(null);
    }
  };
 
  const getProductImage = (product) => getImageUrl(product);
 
  const isUserAuthenticated = () => {
    const { accessToken } = getTokens();
    const currentUser = getCurrentUser() || user;
    return !!(accessToken && currentUser);
  };
 
  if (!isUserAuthenticated()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
        <LockClosedIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl md:text-2xl font-serif text-gray-900 mb-3">Please Login to View Cart</h2>
        <p className="text-gray-500 text-sm mb-6">You need to be logged in to see your cart items</p>
        <Link to="/Login" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg text-sm hover:bg-gray-800 transition">
          Login Now
        </Link>
      </div>
    );
  }
 
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
        <ShoppingBagIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl md:text-2xl font-serif text-gray-900 mb-3">Your Cart is Empty</h2>
        <p className="text-gray-500 text-sm mb-6">Looks like you haven't added any items yet</p>
        <Link to="/Collections" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg text-sm hover:bg-gray-800 transition">
          Continue Shopping
        </Link>
      </div>
    );
  }
 
  const shippingCharge = total >= 999 ? 0 : 99;
  const finalTotal = total + shippingCharge;
 
  const totalSavings = items.reduce((sum, item) => {
    const p = item.product_details;
    if (p?.original_price && p.original_price > p.price) {
      return sum + (p.original_price - p.price) * item.quantity;
    }
    return sum;
  }, 0);
 
  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-baseline gap-3 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-serif text-gray-900">Shopping Cart</h1>
          <span className="text-gray-500 text-sm">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
 
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {items.map((item) => {
              const product = item.product_details;
              const imageUrl = getProductImage(product);
              const isPending = pendingId === item.id;
              const stock = product?.stock;
              const atMax = typeof stock === 'number' && item.quantity >= stock;
              const lineTotal = (product?.price || 0) * item.quantity;
 
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-sm p-3 md:p-4 flex gap-3 md:gap-4 transition-opacity ${isPending ? 'opacity-60' : ''}`}
                >
                  {/* Image */}
                  <Link to={`/product/${product?.id}`} className="flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={product?.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/200x200/e0e0e0/2D2D2D?text=No+Image'; }}
                      />
                    </div>
                  </Link>
 
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${product?.id}`} className="min-w-0">
                        <h3 className="font-medium text-gray-900 hover:text-gray-600 transition text-sm md:text-base truncate">
                          {product?.name || 'Product'}
                        </h3>
                      </Link>
                      {/* Remove — icon on all sizes now, always visible & consistent with the rest of the site's iconography */}
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isPending}
                        aria-label={`Remove ${product?.name || 'item'} from cart`}
                        className="flex-shrink-0 text-gray-300 hover:text-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <TrashIcon className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
 
                    <p className="text-gray-400 text-xs mt-0.5">{product?.category?.toUpperCase() || ''}</p>
 
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-900 font-bold text-sm md:text-base">₹{product?.price || 0}</p>
                      {product?.original_price > product?.price && (
                        <p className="text-gray-400 line-through text-xs md:text-sm">₹{product.original_price}</p>
                      )}
                    </div>
 
                    {atMax && (
                      <p className="text-amber-600 text-[11px] mt-1">Max available stock reached</p>
                    )}
 
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity stepper */}
                      <div className="flex items-center gap-2" aria-busy={isPending}>
                        <button
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          disabled={isPending || item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 md:w-8 md:h-8 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition"
                        >
                          <MinusIcon className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm text-gray-900">
                          {isPending ? '…' : item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          disabled={isPending || atMax}
                          aria-label="Increase quantity"
                          className="w-7 h-7 md:w-8 md:h-8 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
 
                      {/* Line total — makes it clear at a glance what this row contributes */}
                      <p className="text-gray-500 text-xs md:text-sm">
                        ₹{lineTotal} total
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
 
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 lg:sticky lg:top-20">
              <h2 className="text-lg md:text-xl font-serif text-gray-900 mb-4">Order Summary</h2>
 
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium text-gray-900">₹{total}</span>
                </div>
 
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">You're saving</span>
                    <span className="font-medium text-green-600">₹{totalSavings}</span>
                  </div>
                )}
 
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shippingCharge === 0 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                    {shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}
                  </span>
                </div>
                {shippingCharge > 0 && (
                  <p className="text-xs text-gray-400">Add ₹{999 - total} more for free shipping</p>
                )}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between font-bold text-base md:text-lg">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{finalTotal}</span>
                  </div>
                </div>
              </div>
 
              <button
                onClick={() => navigate('/checkout')}
                disabled={!!pendingId}
                style={{ background: 'var(--user-accent)', color: 'var(--user-accent-text)' }}
                className="w-full py-3 rounded-lg font-semibold uppercase tracking-wide text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
 
              <Link to="/Collections"
                className="block text-center text-gray-500 hover:text-gray-900 text-xs mt-3 transition">
                ← Continue Shopping
              </Link>
 
              <p className="text-center text-gray-400 text-xs mt-3">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Cart;
 