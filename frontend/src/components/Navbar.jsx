import { useReducer, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBagIcon, UserIcon, MagnifyingGlassIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { logout } from '../redux/authSlice';
import { cartAPI, wishlistAPI } from '../services/api';
import { setCart } from '../redux/cartSlice';
import toast from 'react-hot-toast';
 
const uiReducer = (state, action) => {
  switch (action.type) {
    case 'SET_WISHLIST_COUNT': 
     return { ...state, wishlistCount: action.payload };
    case 'SET_DROPDOWN':       
     return { ...state, isDropdownOpen: action.payload };
    case 'SET_SEARCH_OPEN':    
     return { ...state, isSearchOpen: action.payload };
    case 'SET_SEARCH_TERM':    
     return { ...state, searchTerm: action.payload };
    case 'LOGOUT':             
     return { ...state, wishlistCount: 0, isDropdownOpen: false };
    default:                   
     return state;
  }
};
 
const initialUI = {
  wishlistCount:  0,
  isDropdownOpen: false,
  isSearchOpen:   false,
  searchTerm:     '',
};
  
const Navbar = () => {
  const reduxDispatch = useDispatch();
  const navigate      = useNavigate();
 
  const { user: reduxUser } = useSelector((state) => state.auth);
  const { items }           = useSelector((state) => state.cart);
 
  const currentUser =
    reduxUser ??
    (() => {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    })();
 
  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
 
  const [ui, uiDispatch] = useReducer(uiReducer, initialUI);
  const { wishlistCount, isDropdownOpen, isSearchOpen, searchTerm } = ui;
 
  const dropdownRef = useRef(null);

  const fetchCartCount = useCallback(async () => {
    if (!localStorage.getItem('access_token')) return;
    try {
      const res = await cartAPI.getCart();
      reduxDispatch(setCart(res.data));
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  }, [reduxDispatch]);
 
  const fetchWishlistCount = useCallback(async () => {
    if (!localStorage.getItem('access_token')) return;
    try {
      const res = await wishlistAPI.getWishlist();
      uiDispatch({ type: 'SET_WISHLIST_COUNT', payload: res.data.length });
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  }, []);
 
  useEffect(() => {
    if (!localStorage.getItem('access_token')) return;
    fetchCartCount();
    fetchWishlistCount();
  }, [reduxUser, fetchCartCount, fetchWishlistCount]);
 
  useEffect(() => {
    window.addEventListener('cartUpdated',     fetchCartCount);
    window.addEventListener('wishlistUpdated', fetchWishlistCount);
    return () => {
      window.removeEventListener('cartUpdated',     fetchCartCount);
      window.removeEventListener('wishlistUpdated', fetchWishlistCount);
    };
  }, [fetchCartCount, fetchWishlistCount]);
 
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        uiDispatch({ type: 'SET_DROPDOWN', payload: false });
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
 

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    reduxDispatch(logout());
    reduxDispatch(setCart({ items: [] }));
    uiDispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully!');
    navigate('/');
  };
 
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/Collections?search=${encodeURIComponent(searchTerm)}`);
      uiDispatch({ type: 'SET_SEARCH_TERM', payload: '' });
      uiDispatch({ type: 'SET_SEARCH_OPEN', payload: false });
    }
  };
 

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
 
          {/* Logo */}
          <Link to="/" className="text-2xl font-serif font-light tracking-wide text-gray-900">
            L I O R A
          </Link>
 
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/new-arrivals" className="text-gray-600 hover:text-gray-900 transition text-sm uppercase tracking-wider">
              New Arrivals
            </Link>
            <Link to="/Collections" className="text-gray-600 hover:text-gray-900 transition text-sm uppercase tracking-wider">
              Collections
            </Link>
            <Link to="/best-sellers" className="text-gray-600 hover:text-gray-900 transition text-sm uppercase tracking-wider">
              Best Sellers
            </Link>
            <Link to="/sale" className="text-red-600 hover:text-red-700 transition text-sm uppercase tracking-wider font-medium">
              Sale
            </Link>
          </div>
 
          {/* Right Side Icons */}
          <div className="flex items-center space-x-5">
 
            {/* Search toggle */}
            <button
              onClick={() => uiDispatch({ type: 'SET_SEARCH_OPEN', payload: !isSearchOpen })}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              {isSearchOpen
                ? <XMarkIcon className="h-5 w-5" />
                : <MagnifyingGlassIcon className="h-5 w-5" />}
            </button>
 
            {currentUser && (
              <>
                {/* Wishlist */}
                <Link to="/wishlist" className="relative">
                  <HeartIcon className="h-5 w-5 text-gray-600 hover:text-gray-900 transition" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
 
                {/* Cart */}
                <Link to="/cart" className="relative">
                  <ShoppingBagIcon className="h-5 w-5 text-gray-600 hover:text-gray-900 transition" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
 
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => uiDispatch({ type: 'SET_DROPDOWN', payload: !isDropdownOpen })}
                  className="flex items-center space-x-1 focus:outline-none"
                >
                  <UserIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-xs text-gray-600 hidden md:inline">
                    {currentUser.username}
                  </span>
                  <svg
                    className={`h-3 w-3 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
 
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 shadow-lg rounded-lg z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => uiDispatch({ type: 'SET_DROPDOWN', payload: false })}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => uiDispatch({ type: 'SET_DROPDOWN', payload: false })}
                    >
                      My Orders
                    </Link>

                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/Login"
                className="text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
 
        {/* Expandable Search Bar */}
        {isSearchOpen && (
          <div className="py-3 border-t border-gray-100 animate-fadeIn">
            <div className="relative max-w-2xl mx-auto">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchTerm}
                onChange={(e) => uiDispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                onKeyPress={handleSearch}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                autoFocus
              />
              <button
                onClick={() => uiDispatch({ type: 'SET_SEARCH_OPEN', payload: false })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ESC
              </button>
            </div>
          </div>
        )}
      </div>
 
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </nav>
  );
};
 
export default Navbar;