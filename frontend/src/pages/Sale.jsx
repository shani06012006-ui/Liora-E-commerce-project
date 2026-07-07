import { useReducer, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI, wishlistAPI } from '../services/api';
import { useDispatch } from 'react-redux';
import { refreshCart } from '../redux/cartUtils';
import { addToWishlistUtil, removeFromWishlistUtil } from '../redux/wishlistUtils';
import { HeartIcon, ShoppingBagIcon, BoltIcon, FireIcon, TruckIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':          return { ...state, products: action.payload };
    case 'SET_LOADING':           return { ...state, loading: action.payload };
    case 'SET_WISHLIST':          return { ...state, wishlist: action.payload.wishlistSet, wishlistIds: action.payload.wishlistMap };
    case 'ADD_WISHLIST':          return { ...state, wishlist: new Set([...state.wishlist, action.payload]) };
    case 'REMOVE_WISHLIST': {
      const s = new Set(state.wishlist); s.delete(action.payload);
      const m = { ...state.wishlistIds }; delete m[action.payload];
      return { ...state, wishlist: s, wishlistIds: m };
    }
    case 'SET_ADDING_TO_CART':    return { ...state, addingToCart: action.payload };
    case 'SET_SELECTED_CATEGORY': return { ...state, selectedCategory: action.payload };
    case 'SET_SORT_BY':           return { ...state, sortBy: action.payload };
    case 'TICK_TIMER': {
      let { days, hours, minutes, seconds } = state.timeLeft;
      if (seconds > 0) return { ...state, timeLeft: { days, hours, minutes, seconds: seconds - 1 } };
      if (minutes > 0) return { ...state, timeLeft: { days, hours, minutes: minutes - 1, seconds: 59 } };
      if (hours > 0)   return { ...state, timeLeft: { days, hours: hours - 1, minutes: 59, seconds: 59 } };
      if (days > 0)    return { ...state, timeLeft: { days: days - 1, hours: 23, minutes: 59, seconds: 59 } };
      return state;
    }
    default: return state;
  }
};

const initialState = {
  products:         [],
  loading:          true,
  wishlist:         new Set(),
  wishlistIds:      {},
  addingToCart:     null,
  selectedCategory: 'all',
  sortBy:           'discount',
  timeLeft:         { days: 7, hours: 23, minutes: 59, seconds: 59 },
};

const Sale = () => {
  const reduxDispatch = useDispatch();
  const navigate      = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  const { products, loading, wishlist, wishlistIds, addingToCart, selectedCategory, sortBy, timeLeft } = state;

  useEffect(() => {
    const timer = setInterval(() => dispatch({ type: 'TICK_TIMER' }), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSaleProducts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = { sale: true };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (sortBy === 'discount')   params.sort = 'discount_desc';
      if (sortBy === 'price_low')  params.sort = 'price_asc';
      if (sortBy === 'price_high') params.sort = 'price_desc';
      const res = await productAPI.getAll(params);
      dispatch({ type: 'SET_PRODUCTS', payload: res.data });
    } catch (err) { console.error(err); }
    finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  }, [selectedCategory, sortBy]);

  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await wishlistAPI.getWishlist();
      const wishlistSet = new Set();
      const wishlistMap = {};
      res.data.forEach(item => {
        const productId = item.product_details?.id || item.product;
        wishlistSet.add(productId);
        wishlistMap[productId] = item.id;
      });
      dispatch({ type: 'SET_WISHLIST', payload: { wishlistSet, wishlistMap } });
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchSaleProducts();
    fetchWishlist();
  }, [fetchSaleProducts, fetchWishlist]);

  const addToWishlist = async (productId) => {
    const result = await addToWishlistUtil(productId, navigate);
    if (result.success) {
      dispatch({ type: 'ADD_WISHLIST', payload: productId });
      await fetchWishlist();
      toast.success('Added to wishlist');
    } else { toast.error(result.message); }
  };

  const removeFromWishlist = async (productId) => {
    const wishlistItemId = wishlistIds[productId];
    if (!wishlistItemId) { toast.error('Item not found in wishlist'); return; }
    const result = await removeFromWishlistUtil(wishlistItemId);
    if (result.success) {
      dispatch({ type: 'REMOVE_WISHLIST', payload: productId });
      toast.success('Removed from wishlist');
    } else { toast.error(result.message); }
  };

  const addToCart = async (productId) => {
    const token = localStorage.getItem('access_token');
    if (!token) { toast.error('Please login to add to cart'); navigate('/Login'); return; }
    dispatch({ type: 'SET_ADDING_TO_CART', payload: productId });
    try {
      await cartAPI.addToCart({ product_id: productId, quantity: 1 });
      await refreshCart(reduxDispatch);
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
    finally { dispatch({ type: 'SET_ADDING_TO_CART', payload: null }); }
  };

  const buyNow = (productId) => {
    const token = localStorage.getItem('access_token');
    if (!token) { toast.error('Please login to buy'); navigate('/Login'); return; }
    navigate('/checkout', {
      state: { buyNow: true, product: products.find(p => p.id === productId), quantity: 1 }
    });
  };

  const getImageUrl = (product) => {
    if (product?.image_url) return product.image_url;
    if (product?.image)     return `http://localhost:8000${product.image}`;
    return 'https://placehold.co/400x500/f5f5f5/999999?text=Image';
  };

  const categories  = [
    { value: 'all',   label: 'ALL SALE'    },
  ];
  const sortOptions = [
    { value: 'discount',   label: 'BIGGEST DISCOUNT'   },
    { value: 'price_low',  label: 'PRICE: LOW TO HIGH' },
    { value: 'price_high', label: 'PRICE: HIGH TO LOW' },
  ];

  const fallbackProducts = [
    { id: 1, name: 'Designer Silk Gown', price: 8999,  original_price: 17999, discount: 50, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&auto=format' },
    { id: 2, name: 'Linen Summer Dress', price: 2499,  original_price: 4999,  discount: 50, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&auto=format' },
    { id: 3, name: 'Velvet Blazer',      price: 3999,  original_price: 7999,  discount: 50, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format' },
    { id: 4, name: 'Cashmere Sweater',   price: 4499,  original_price: 8999,  discount: 50, image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format' },
    { id: 5, name: 'Party Wear Gown',    price: 5999,  original_price: 11999, discount: 50, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&auto=format' },
    { id: 6, name: 'Leather Jacket',     price: 5499,  original_price: 10999, discount: 50, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&auto=format' },
    { id: 7, name: 'Designer Handbag',   price: 2999,  original_price: 5999,  discount: 50, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format' },
  ];

  const displayProducts = products.length > 0 ? products : fallbackProducts;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      <div className="relative min-h-[320px] md:min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="SL.png"
            alt="Sale Banner"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 text-center text-white z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 md:px-4 py-1 rounded-full mb-3 md:mb-4">
            <FireIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs uppercase tracking-wider">Limited Time Offer</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-light tracking-wide mb-3 md:mb-4">SALE</h1>

          {/* Subtitle */}
          <p className="text-lg md:text-2xl font-light mb-1 md:mb-2">
            UP TO <span className="font-bold text-3xl md:text-4xl">50% OFF</span>
          </p>
          <p className="text-white/80 text-xs md:text-sm max-w-xs md:max-w-md mx-auto mb-6 md:mb-0">
            Don't miss out on our biggest sale of the season!
          </p>

          {/* Countdown Timer */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-5 md:mt-8">
            {[
              { value: timeLeft.days,    label: 'Days'  },
              { value: timeLeft.hours,   label: 'Hours' },
              { value: timeLeft.minutes, label: 'Mins'  },
              { value: timeLeft.seconds, label: 'Secs'  },
            ].map(({ value, label }) => (
              <div key={label}
                className="bg-white/20 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2 text-center min-w-[58px] md:min-w-[80px] border border-white/20">
                <span className="block text-xl md:text-2xl font-bold">{String(value).padStart(2, '0')}</span>
                <span className="text-[9px] md:text-[10px] uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center gap-3 flex-wrap">
            <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button key={cat.value}
                  onClick={() => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: cat.value })}
                  className={`text-[11px] md:text-xs uppercase tracking-[0.2em] font-medium transition pb-1 whitespace-nowrap ${
                    selectedCategory === cat.value
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <select value={sortBy}
              onChange={(e) => dispatch({ type: 'SET_SORT_BY', payload: e.target.value })}
              className="text-[10px] md:text-xs uppercase border border-gray-300 rounded-md px-2 md:px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-gray-900">
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product count */}
      <div className="max-w-7xl mx-auto px-4 pt-4 md:pt-6">
        <p className="text-xs md:text-sm text-gray-400">{displayProducts.length} products on sale</p>
      </div>

      {/* ── Products Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-10">
          {displayProducts.map((product) => {
            const isInWishlist    = wishlist.has(product.id);
            const isAdding        = addingToCart === product.id;
            const discountPercent = product.discount ||
              Math.round(((product.original_price - product.price) / product.original_price) * 100);

            return (
              <div key={product.id} className="group">
                {/* Image */}
                <div className="relative overflow-hidden bg-gray-100 mb-3">
                  <Link to={`/product/${product.id}`}>
                    <img src={getImageUrl(product)} alt={product.name}
                      className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105" />
                  </Link>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="bg-gray-900 text-white text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1 font-bold tracking-wide">
                      -{discountPercent}%
                    </span>
                    {product.discount > 40 && (
                      <span className="bg-gray-700 text-white text-[7px] md:text-[8px] px-1.5 md:px-2 py-0.5 font-bold tracking-wide">
                        HOT DEAL
                      </span>
                    )}
                  </div>

                  {/* Wishlist */}
                  <button
                    onClick={() => isInWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 md:p-2 shadow-md hover:bg-gray-100 transition z-10">
                    {isInWishlist
                      ? <HeartSolidIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                      : <HeartIcon      className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />}
                  </button>
                </div>

                {/* Info */}
                <div className="text-center">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-gray-800 text-xs md:text-sm font-medium tracking-wide mb-1 hover:text-gray-500 transition line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center gap-1.5 mb-2 md:mb-3">
                    <span className="text-gray-900 font-bold text-xs md:text-sm">₹{product.price}</span>
                    <span className="text-gray-400 line-through text-[11px] md:text-sm">
                      ₹{product.original_price || product.price * 2}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-1.5 md:gap-2">
                    <button onClick={() => addToCart(product.id)} disabled={isAdding}
                      className="flex-1 bg-gray-900 text-white py-1.5 md:py-2 text-[10px] md:text-[11px] font-medium tracking-wide uppercase hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-1">
                      <ShoppingBagIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">{isAdding ? 'ADDING...' : 'ADD TO CART'}</span>
                      <span className="sm:hidden">{isAdding ? '...' : 'CART'}</span>
                    </button>
                    <button onClick={() => buyNow(product.id)}
                      className="flex-1 border border-gray-900 text-gray-900 py-1.5 md:py-2 text-[10px] md:text-[11px] font-medium tracking-wide uppercase hover:bg-gray-900 hover:text-white transition flex items-center justify-center gap-1">
                      <BoltIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">BUY NOW</span>
                      <span className="sm:hidden">BUY</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {displayProducts.length === 0 && !loading && (
        <div className="text-center py-16 md:py-20">
          <div className="text-5xl mb-4">🛍️</div>
          <h3 className="text-lg font-light text-gray-700 mb-2">No products on sale</h3>
          <Link to="/Collections"
            className="inline-block bg-gray-900 text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-gray-800 transition">
            SHOP ALL PRODUCTS
          </Link>
        </div>
      )}

      {/* ── Shipping Info ── */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            {[
              [TruckIcon,       'Free shipping on orders above ₹999'],
              [ArrowPathIcon,   '7-day easy returns'],
              [ShieldCheckIcon, 'Secure payments'],
            ].map(([Icon, text]) => (
              <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-700 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Newsletter ── */}
      <div className="border-t border-gray-200 py-12 md:py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">SALE ALERTS</p>
          <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-2 md:mb-3">Get exclusive sale updates</h3>
          <p className="text-gray-400 text-sm mb-5 md:mb-6">Subscribe to get early access to sales and special offers</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Your email address"
              className="flex-1 px-4 py-2.5 border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-900" />
            <button className="px-6 py-2.5 bg-gray-900 text-white text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition">
              NOTIFY ME
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Sale;