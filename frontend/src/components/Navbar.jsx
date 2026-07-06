import { useReducer, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingBagIcon, UserIcon, MagnifyingGlassIcon,
  HeartIcon, XMarkIcon, Bars3Icon,
} from '@heroicons/react/24/outline';
import { cartAPI, wishlistAPI } from '../services/api';
import { setCart } from '../redux/cartSlice';
import { handleLogout } from '../redux/authUtils';

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'SET_WISHLIST_COUNT':  return { ...state, wishlistCount:  action.payload };
    case 'SET_DROPDOWN':        return { ...state, isDropdownOpen: action.payload };
    case 'SET_SEARCH_OPEN':     return { ...state, isSearchOpen:   action.payload };
    case 'SET_SEARCH_TERM':     return { ...state, searchTerm:     action.payload };
    case 'SET_MOBILE_MENU':     return { ...state, isMobileOpen:   action.payload };
    case 'LOGOUT':              return { ...state, wishlistCount: 0, isDropdownOpen: false, isMobileOpen: false };
    default:                    return state;
  }
};

const initialUI = {
  wishlistCount:  0,
  isDropdownOpen: false,
  isSearchOpen:   false,
  searchTerm:     '',
  isMobileOpen:   false,
};

const Navbar = () => {
  const reduxDispatch  = useDispatch();
  const navigate       = useNavigate();
  const location       = useLocation();
  const [searchParams] = useSearchParams();

  const { user: reduxUser } = useSelector((state) => state.auth);
  const { items }           = useSelector((state) => state.cart);

  const currentUser = reduxUser ?? (() => {
    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    try { return JSON.parse(stored); } catch { return null; }
  })();

  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const [ui, uiDispatch] = useReducer(uiReducer, initialUI);
  const { wishlistCount, isDropdownOpen, isSearchOpen, searchTerm, isMobileOpen } = ui;

  const dropdownRef  = useRef(null);
  const mobileRef    = useRef(null);
  const debounceRef  = useRef(null);            // 🔴 ADD — for debounced live search

  const fetchCartCount = useCallback(async () => {
    if (!localStorage.getItem('access_token')) return;
    try {
      const res = await cartAPI.getCart();
      reduxDispatch(setCart(res.data));
    } catch (err) { console.error(err); }
  }, [reduxDispatch]);

  const fetchWishlistCount = useCallback(async () => {
    if (!localStorage.getItem('access_token')) return;
    try {
      const res = await wishlistAPI.getWishlist();
      uiDispatch({ type: 'SET_WISHLIST_COUNT', payload: res.data.length });
    } catch (err) { console.error(err); }
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
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        uiDispatch({ type: 'SET_MOBILE_MENU', payload: false });
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  useEffect(() => {
    uiDispatch({ type: 'SET_SEARCH_TERM', payload: searchParams.get('search') || '' });
  }, [location.pathname, location.search , searchParams]);

  const onLogout = () => {
    uiDispatch({ type: 'LOGOUT' });
    handleLogout(reduxDispatch, navigate);
  };

  const handleSearchChange = (value) => {
    uiDispatch({ type: 'SET_SEARCH_TERM', payload: value });

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set('search', value.trim());
      const query = params.toString();
      navigate(`/Collections${query ? `?${query}` : ''}`, { replace: true });
    }, 400);   // waits 400ms after the user stops typing before filtering
  };

  // 🔴 ADD — Clear All: wipes the input and removes the filter immediately
  const clearSearch = () => {
    clearTimeout(debounceRef.current);
    uiDispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    navigate('/Collections', { replace: true });
  };

  const closeMobile = () => uiDispatch({ type: 'SET_MOBILE_MENU', payload: false });

  const navLinks = [
    { to: '/new-arrivals', label: 'New Arrivals', className: 'text-gray-600 hover:text-gray-900' },
    { to: '/Collections',  label: 'Collections',  className: 'text-gray-600 hover:text-gray-900' },
    { to: '/best-sellers', label: 'Best Sellers', className: 'text-gray-600 hover:text-gray-900' },
    { to: '/sale',         label: 'Sale',         className: 'text-red-600 hover:text-red-700 font-medium' },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden text-gray-600 hover:text-gray-900 transition"
              onClick={() => uiDispatch({ type: 'SET_MOBILE_MENU', payload: !isMobileOpen })}
            >
              {isMobileOpen
                ? <XMarkIcon className="h-6 w-6" />
                : <Bars3Icon className="h-6 w-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="text-xl md:text-2xl font-serif font-light tracking-wide text-gray-900">
              L I O R A
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map(({ to, label, className }) => (
                <Link key={to} to={to}
                  className={`${className} transition text-sm uppercase tracking-wider`}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-3 md:space-x-5">
              {/* Search */}
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

              {/* User / Login */}
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => uiDispatch({ type: 'SET_DROPDOWN', payload: !isDropdownOpen })}
                    className="flex items-center space-x-1 focus:outline-none"
                  >
                    <UserIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-xs text-gray-600 hidden md:inline">{currentUser.username}</span>
                    <svg className={`h-3 w-3 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 shadow-lg rounded-lg z-50">
                      <Link to="/profile" onClick={() => uiDispatch({ type: 'SET_DROPDOWN', payload: false })}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                      <Link to="/orders" onClick={() => uiDispatch({ type: 'SET_DROPDOWN', payload: false })}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                      <hr className="my-1" />
                      <button onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-b-lg">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/Login"
                  className="text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900 transition">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* 🔴 CHANGED — simplified search bar: live-filter input + Clear All */}
          {isSearchOpen && (
            <div className="py-3 border-t border-gray-100 animate-fadeIn">
              <div className="flex items-center gap-2 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                    autoFocus
                  />
                </div>

                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm px-3 py-3 border border-gray-200 rounded-xl whitespace-nowrap transition"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Clear All
                  </button>
                )}

                <button onClick={() => uiDispatch({ type: 'SET_SEARCH_OPEN', payload: false })}
                  className="text-gray-400 hover:text-gray-600 text-xs px-1">
                  ESC
                </button>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        `}</style>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeMobile} />
          <div ref={mobileRef}
            className="absolute top-0 left-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
              <span className="text-xl font-serif font-light tracking-wide">L I O R A</span>
              <button onClick={closeMobile}>
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-1 overflow-y-auto">
              {navLinks.map(({ to, label, className }) => (
                <Link key={to} to={to} onClick={closeMobile}
                  className={`block py-3 text-sm uppercase tracking-wider border-b border-gray-100 ${className}`}>
                  {label}
                </Link>
              ))}

              {currentUser && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Account</p>
                  </div>
                  <Link to="/profile" onClick={closeMobile}
                    className="block py-3 text-sm text-gray-700 border-b border-gray-100">My Profile</Link>
                  <Link to="/orders" onClick={closeMobile}
                    className="block py-3 text-sm text-gray-700 border-b border-gray-100">My Orders</Link>
                  <Link to="/wishlist" onClick={closeMobile}
                    className="block py-3 text-sm text-gray-700 border-b border-gray-100">
                    Wishlist {wishlistCount > 0 && <span className="ml-2 bg-gray-900 text-white text-[10px] rounded-full px-1.5 py-0.5">{wishlistCount}</span>}
                  </Link>
                  <Link to="/cart" onClick={closeMobile}
                    className="block py-3 text-sm text-gray-700 border-b border-gray-100">
                    Cart {cartCount > 0 && <span className="ml-2 bg-gray-900 text-white text-[10px] rounded-full px-1.5 py-0.5">{cartCount}</span>}
                  </Link>
                </>
              )}
            </div>

            <div className="px-6 py-6 border-t border-gray-100">
              {currentUser ? (
                <button onClick={() => { onLogout(); closeMobile(); }}
                  className="w-full py-2.5 bg-gray-900 text-white text-sm uppercase tracking-wider rounded-lg hover:bg-gray-800 transition">
                  Logout
                </button>
              ) : (
                <Link to="/Login" onClick={closeMobile}
                  className="block w-full py-2.5 bg-gray-900 text-white text-sm uppercase tracking-wider rounded-lg hover:bg-gray-800 transition text-center">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;