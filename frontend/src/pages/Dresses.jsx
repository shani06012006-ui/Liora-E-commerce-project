import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI, wishlistAPI } from '../services/api';
import { useDispatch } from 'react-redux';
import { setCart } from '../redux/cartSlice';
import { HeartIcon, ShoppingBagIcon, BoltIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const Dresses = () => {
  const { style } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Dresses');
  const [wishlist, setWishlist] = useState(new Set());
  const [wishlistIds, setWishlistIds] = useState({});
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, [style]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let params = { category: 'dress' };
      
      switch(style) {
        case 'party':
          setTitle('Party Dresses');
          params.style = 'party';
          break;
        case 'casual':
          setTitle('Casual Dresses');
          params.style = 'casual';
          break;
        case 'office-wear':
          setTitle('Office Wear Dresses');
          params.style = 'office';
          break;
        case 'aesthetic':
          setTitle('Aesthetic Dresses');
          params.style = 'aesthetic';
          break;
        default:
          setTitle('Dresses');
      }
      
      const res = await productAPI.getAll(params);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setWishlist(new Set());
      setWishlistIds({});
      return;
    }
    try {
      const res = await wishlistAPI.getWishlist();
      const wishlistMap = {};
      const wishlistSet = new Set();
      res.data.forEach(item => {
        const productId = item.product_details?.id || item.product;
        wishlistMap[productId] = item.id;
        wishlistSet.add(productId);
      });
      setWishlistIds(wishlistMap);
      setWishlist(wishlistSet);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const addToWishlist = async (productId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please login to add to wishlist');
      navigate('/Login');
      return;
    }
    try {
      await wishlistAPI.addToWishlist(productId);
      // Update local state immediately
      setWishlist(prev => new Set([...prev, productId]));
      toast.success('Added to wishlist');
      // Refresh to get the wishlist ID
      setTimeout(() => fetchWishlist(), 500);
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      toast.error('Already in wishlist');
    }
  };

  const removeFromWishlist = async (productId) => {
    const wishlistItemId = wishlistIds[productId];
    if (!wishlistItemId) {
      toast.error('Item not found in wishlist');
      return;
    }
    try {
      await wishlistAPI.removeFromWishlist(wishlistItemId);
      // Update local state immediately
      setWishlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      // Also remove from wishlistIds
      setWishlistIds(prev => {
        const newMap = { ...prev };
        delete newMap[productId];
        return newMap;
      });
      toast.success('Removed from wishlist');
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const addToCart = async (productId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please login to add to cart');
      navigate('/Login');
      return;
    }
    setAddingToCart(productId);
    try {
      await cartAPI.addToCart({ product_id: productId, quantity: 1 });
      const cartRes = await cartAPI.getCart();
      dispatch(setCart(cartRes.data));
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const buyNow = async (productId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please login to buy');
      navigate('/Login');
      return;
    }
    
    try {
      await cartAPI.addToCart({ product_id: productId, quantity: 1 });
      const cartRes = await cartAPI.getCart();
      dispatch(setCart(cartRes.data));
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/checkout');
    } catch (error) {
      toast.error('Failed to proceed');
    }
  };

  const getImageUrl = (product) => {
    if (product?.image_url) return product.image_url;
    if (product?.image) return `http://localhost:8000${product.image}`;
    return 'https://placehold.co/400x500/f5f5f5/999999?text=No+Image';
  };

  // Categories for filter bar
  const categories = [
    { name: 'ALL DRESSES', path: '/dresses', active: !style },
    { name: 'PARTY', path: '/dresses/party', active: style === 'party' },
    { name: 'CASUAL', path: '/dresses/casual', active: style === 'casual' },
    { name: 'OFFICE WEAR', path: '/dresses/office-wear', active: style === 'office-wear' },
    { name: 'AESTHETIC', path: '/dresses/aesthetic', active: style === 'aesthetic' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 tracking-wide mb-4">{title}</h1>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
            French know-how with high-quality craftsmanship. Discover elegant pieces that 
            blend timeless style with modern sophistication.
          </p>
          <div className="mt-6">
            <span className="inline-block border-b-2 border-gray-900 pb-1 text-sm font-medium tracking-wide">
              BUY 1 GET 1 15% OFF
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-8 py-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition ${
                  cat.active 
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-2' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👗</div>
            <h3 className="text-xl font-light text-gray-700 mb-2">No dresses found</h3>
            <p className="text-gray-500 mb-6">Check back later for new arrivals!</p>
            <Link to="/new-arrivals" className="inline-block bg-gray-900 text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-gray-800 transition">
              SHOP NEW ARRIVALS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => {
              const isInWishlist = wishlist.has(product.id);
              const isAdding = addingToCart === product.id;   //Current product oda id um addingToCart value um same ah irukka nu check panrathu.
              
              return (
                <div key={product.id} className="group">
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-gray-100 mb-4">
                    <Link to={`/product/${product.id}`}>
                      <img 
                        src={getImageUrl(product)} 
                        alt={product.name}
                        className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={() => isInWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition z-10"
                    >
                      {isInWishlist ? (
                        <HeartSolidIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    
                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-black text-white text-[10px] px-2 py-1 tracking-wide">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="text-center">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-gray-800 text-sm font-medium tracking-wide mb-1 hover:text-gray-500 transition">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-gray-900 font-medium">₹{product.price}</span>
                      {product.original_price && (
                        <span className="text-gray-400 line-through text-sm">₹{product.original_price}</span>
                      )}
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={isAdding}
                        className="flex-1 bg-gray-900 text-white py-2 text-[11px] font-medium tracking-wide uppercase hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <ShoppingBagIcon className="w-3 h-3" />
                        {isAdding ? 'ADDING...' : 'ADD TO CART'}
                      </button>
                      <button
                        onClick={() => buyNow(product.id)}
                        className="flex-1 border border-gray-900 text-gray-900 py-2 text-[11px] font-medium tracking-wide uppercase hover:bg-gray-900 hover:text-white transition flex items-center justify-center gap-1"
                      >
                        <BoltIcon className="w-3 h-3" />
                        BUY NOW
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-200 mt-12 py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">NEWSLETTER</p>
          <h3 className="text-2xl font-light text-gray-900 mb-3">Subscribe to get 15% off</h3>
          <p className="text-gray-500 text-sm mb-6">Be the first to know about new arrivals and exclusive offers</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address"
              className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-900"
            />
            <button className="px-6 py-2 bg-gray-900 text-white text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition">
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dresses;