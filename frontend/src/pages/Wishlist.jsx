// frontend/src/pages/Wishlist.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HeartIcon, TrashIcon, ShoppingBagIcon, BoltIcon } from '@heroicons/react/24/outline';
import { wishlistAPI, cartAPI, getImageUrl } from '../services/api';
import { refreshCart } from '../redux/cartUtils';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const navigate        = useNavigate();
  const dispatch        = useDispatch();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [addingToCart,  setAddingToCart]  = useState(null);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.getWishlist();
      setWishlistItems(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (id) => {
    try {
      await wishlistAPI.removeFromWishlist(id);
      setWishlistItems(wishlistItems.filter(item => item.id !== id));
      window.dispatchEvent(new Event('wishlistUpdated'));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const addToCart = async (productId, wishlistId) => {
    setAddingToCart(productId);
    try {
      await cartAPI.addToCart({ product_id: productId, quantity: 1 });
      await refreshCart(dispatch);

      await wishlistAPI.removeFromWishlist(wishlistId);
      setWishlistItems(wishlistItems.filter(item => item.id !== wishlistId));
      window.dispatchEvent(new Event('wishlistUpdated'));

      toast.success('Moved to cart!');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const buyNow = (productId, wishlistId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please login to buy');
      navigate('/Login');
      return;
    }
    const item = wishlistItems.find(i => i.id === wishlistId);
    navigate('/checkout', {
      state: {
        buyNow: true,
        product: item?.product_details,
        quantity: 1,
      }
    });
  };

  // ✅ Fixed: Use centralized getImageUrl
  const getProductImage = (product) => getImageUrl(product);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
        <HeartIcon className="w-7 h-7 text-gray-900" />
        <h1 className="text-3xl font-serif text-gray-900">My Wishlist</h1>
        <span className="text-sm text-gray-500">({wishlistItems.length} items)</span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Your wishlist is empty</p>
          <Link
            to="/Collections"
            className="inline-block bg-gray-900 text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-gray-800 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
            <div className="col-span-5">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Discount</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Wishlist Items */}
          <div className="divide-y divide-gray-100">
            {wishlistItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                  {/* Product Image & Name */}
                  <div className="md:col-span-5">
                    <div className="flex gap-4">
                      <Link to={`/product/${item.product_details.id}`} className="flex-shrink-0">
                        <img
                          src={getProductImage(item.product_details)}
                          alt={item.product_details.name}
                          className="w-20 h-24 object-cover rounded-lg bg-gray-100"
                          onError={(e) => { e.target.src = 'https://placehold.co/400x500/e0e0e0/2D2D2D?text=No+Image'; }}
                        />
                      </Link>
                      <div className="flex flex-col justify-center">
                        <Link to={`/product/${item.product_details.id}`}>
                          <h3 className="font-medium text-gray-900 hover:text-gray-600 transition">
                            {item.product_details.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-400 mt-1 uppercase">
                          {item.product_details.category}
                        </p>
                        <div className="flex items-center gap-3 mt-2 md:hidden">
                          <div>
                            <p className="text-xs text-gray-500">Price</p>
                            <p className="font-medium text-gray-900">₹{item.product_details.price}</p>
                          </div>
                          {item.product_details.discount > 0 && (
                            <div>
                              <p className="text-xs text-gray-500">Discount</p>
                              <p className="text-sm text-green-600 font-medium">
                                -{item.product_details.discount}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price - Desktop */}
                  <div className="hidden md:block md:col-span-2 text-center">
                    <p className="font-medium text-gray-900">₹{item.product_details.price}</p>
                    {item.product_details.original_price && (
                      <p className="text-xs text-gray-400 line-through">
                        ₹{item.product_details.original_price}
                      </p>
                    )}
                  </div>

                  {/* Discount - Desktop */}
                  <div className="hidden md:block md:col-span-2 text-center">
                    {item.product_details.discount > 0 ? (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        {item.product_details.discount}% OFF
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => addToCart(item.product_details.id, item.id)}
                      disabled={addingToCart === item.product_details.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-xs uppercase tracking-wider rounded hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      <ShoppingBagIcon className="w-3.5 h-3.5" />
                      {addingToCart === item.product_details.id ? 'Moving...' : 'Move to Cart'}
                    </button>
                    <button
                      onClick={() => buyNow(item.product_details.id, item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-900 text-gray-900 text-xs uppercase tracking-wider rounded hover:bg-gray-900 hover:text-white transition"
                    >
                      <BoltIcon className="w-3.5 h-3.5" />
                      BUY NOW
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition"
                      title="Remove"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;