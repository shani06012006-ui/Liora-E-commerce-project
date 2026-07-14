import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { refreshCart } from '../redux/cartUtils';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items, total } = useSelector((state) => state.cart);
  const dispatch         = useDispatch();
  const navigate         = useNavigate();

  const fetchCart = useCallback(() => { refreshCart(dispatch); }, [dispatch]);
  useEffect(() => { fetchCart(); }, [fetchCart]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartAPI.updateQuantity(itemId, newQuantity);
      await refreshCart(dispatch);
      toast.success('Cart updated');
    } catch { toast.error('Failed to update'); }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      await refreshCart(dispatch);
      toast.success('Item removed');
    } catch { toast.error('Failed to remove'); }
  };

  const getProductImage = (product) => {
    if (!product) return 'https://placehold.co/200x200/e0e0e0/2D2D2D?text=No+Image';
    if (product.image_url) return product.image_url.replace('127.0.0.1', 'localhost');
    if (product.image)     return `http://localhost:5174/media/${product.image}`;
    return 'https://placehold.co/200x200/e0e0e0/2D2D2D?text=No+Image';
  };

  if (!localStorage.getItem('access_token')) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
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
        <div className="text-5xl md:text-6xl mb-4">🛒</div>
        <h2 className="text-xl md:text-2xl font-serif text-gray-900 mb-3">Your Cart is Empty</h2>
        <p className="text-gray-500 text-sm mb-6">Looks like you haven't added any items yet</p>
        <Link to="/Collections" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg text-sm hover:bg-gray-800 transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shippingCharge = total >= 999 ? 0 : 99;
  const finalTotal     = total + shippingCharge;

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-serif text-gray-800 mb-6 md:mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {items.map((item) => {
              const product  = item.product_details;
              const imageUrl = getProductImage(product);

              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-3 md:p-4 flex gap-3 md:gap-4">
                  {/* Image */}
                  <Link to={`/product/${product?.id}`} className="flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={imageUrl} alt={product?.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/200x200/e0e0e0/2D2D2D?text=No+Image'; }} />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product?.id}`}>
                      <h3 className="font-medium text-gray-800 hover:text-gray-600 transition text-sm md:text-base truncate">
                        {product?.name || 'Product'}
                      </h3>
                    </Link>
                    <p className="text-gray-400 text-xs mt-0.5">{product?.category?.toUpperCase() || ''}</p>
                    <p className="text-gray-800 font-bold mt-1 text-sm md:text-base">₹{product?.price || 0}</p>

                    {/* Mobile: quantity + remove inline */}
                    <div className="flex items-center justify-between mt-2 md:hidden">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center text-sm">-</button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center text-sm">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition text-xs">Remove</button>
                    </div>
                  </div>

                  {/* Desktop: quantity + remove */}
                  <div className="hidden md:flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center">-</button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition text-sm">Remove</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 lg:sticky lg:top-20">
              <h2 className="text-lg md:text-xl font-serif text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({items.length} items)</span>
                  <span className="font-medium">₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shippingCharge === 0 ? 'text-green-600' : 'text-gray-700'}>
                    {shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}
                  </span>
                </div>
                {shippingCharge > 0 && (
                  <p className="text-xs text-gray-400">Add ₹{999 - total} more for free shipping</p>
                )}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between font-bold text-base md:text-lg">
                    <span>Total</span>
                    <span className="text-gray-800">₹{finalTotal}</span>
                  </div>
                </div>
              </div>

              <button onClick={() => navigate('/checkout')}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition text-sm md:text-base">
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