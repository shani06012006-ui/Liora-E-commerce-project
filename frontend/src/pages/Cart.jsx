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
 
  const fetchCart = useCallback(() => {
    refreshCart(dispatch);
  }, [dispatch]);
 
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
 
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartAPI.updateQuantity(itemId, newQuantity);
      await refreshCart(dispatch);
      toast.success('Cart updated');
    } catch {
      toast.error('Failed to update');
    }
  };
 
  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      await refreshCart(dispatch);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove');
    }
  };
 
  const handleCheckout = () => {
    navigate('/checkout');
  };
 
  const getProductImage = (product) => {
    if (!product) return 'https://placehold.co/200x200/e0e0e0/2D2D2D?text=No+Image';
    if (product.image_url) return product.image_url.replace('127.0.0.1', 'localhost');
    if (product.image)     return `http://localhost:8000/media/${product.image}`;
    return 'https://placehold.co/200x200/e0e0e0/2D2D2D?text=No+Image';
  };
 
  // ─── Not logged in ───────────
  if (!localStorage.getItem('access_token')) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Login to View Cart</h2>
        <p className="text-secondary mb-8">You need to be logged in to see your cart items</p>
        <Link to="/Login" className="bg-primary text-white px-6 py-3 rounded-lg">Login Now</Link>
      </div>
    );
  }
 
  // ─── Empty cart ─────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-serif text-primary mb-4">Your Cart is Empty</h2>
        <p className="text-secondary mb-8">Looks like you haven't added any items yet</p>
        <Link to="/Collections" className="bg-primary text-white px-6 py-3 rounded-lg">
          Continue Shopping
        </Link>
      </div>
    );
  }
 
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-serif text-gray-800 mb-8">Shopping Cart</h1>
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product  = item.product_details;
              const imageUrl = getProductImage(product);
 
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
 
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={product?.name || 'Product'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/200x200/e0e0e0/2D2D2D?text=No+Image';
                      }}
                    />
                  </div>
 
                  {/* Product Details */}
                  <div className="flex-1">
                    <Link to={`/product/${product?.id}`}>
                      <h3 className="font-medium text-gray-800 hover:text-gray-600 transition">
                        {product?.name || 'Product'}
                      </h3>
                    </Link>
                    <p className="text-gray-400 text-sm mt-1">
                      {product?.category?.toUpperCase() || ''}
                    </p>
                    <p className="text-gray-800 font-bold mt-2">₹{product?.price || 0}</p>
                  </div>
 
                  {/* Quantity & Remove */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
 
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-xl font-serif text-gray-800 mb-4">Order Summary</h2>
 
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-gray-800">₹{total}</span>
                  </div>
                </div>
              </div>
 
              <button
                onClick={handleCheckout}
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition cursor-pointer"
              >
                Proceed to Checkout
              </button>
 
              <p className="text-center text-gray-400 text-xs mt-4">
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