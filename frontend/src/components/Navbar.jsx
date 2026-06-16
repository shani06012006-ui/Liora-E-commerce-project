import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBagIcon, UserIcon, MagnifyingGlassIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { logout } from '../redux/authSlice';
import { cartAPI, wishlistAPI } from '../services/api';
import { setCart } from '../redux/cartSlice';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user: reduxUser } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    
    if (storedToken && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      fetchCartCount();
      fetchWishlistCount();
    } else if (reduxUser) {
      setCurrentUser(reduxUser);
      fetchCartCount();
      fetchWishlistCount();
    } else {
      setCurrentUser(null);
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [reduxUser]);

  // Update cart count when Redux cart changes
  useEffect(() => {
    if (items && items.length > 0) {
      const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);
    } else {
      setCartCount(0);
    }
  }, [items]);

  // Listen for cart and wishlist updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    
    const handleWishlistUpdate = () => {
      fetchWishlistCount();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCartCount = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const res = await cartAPI.getCart();
      dispatch(setCart(res.data));
      const totalCount = res.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(totalCount);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchWishlistCount = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const res = await wishlistAPI.getWishlist();
      setWishlistCount(res.data.length);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    dispatch(logout());
    setCurrentUser(null);
    setIsDropdownOpen(false);
    setCartCount(0);
    setWishlistCount(0);
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/Collections?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-serif font-light tracking-wide text-gray-900">
            Liora
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
            {/* Search Icon */}
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-gray-600 hover:text-gray-900 transition">
              {isSearchOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5" />
              )}
            </button>

            {currentUser && (
              <>
                {/* Wishlist Icon */}
                <Link to="/wishlist" className="relative">
                  <HeartIcon className="h-5 w-5 text-gray-600 hover:text-gray-900 transition" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Icon */}
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
                <button onClick={toggleDropdown} className="flex items-center space-x-1 focus:outline-none">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-xs text-gray-600 hidden md:inline">{currentUser.username}</span>
                  <svg className={`h-3 w-3 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 shadow-lg rounded-lg z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsDropdownOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsDropdownOpen(false)}>
                      My Orders
                    </Link>
                    <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsDropdownOpen(false)}>
                      My Wishlist
                    </Link>
                    <Link to="/address" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsDropdownOpen(false)}>
                      Address
                    </Link>
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-b-lg">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/Login" className="text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900 transition">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Expandable Search Bar */}
        {isSearchOpen && (
          <div className="py-3 border-t border-gray-100 animate-fadeIn">
            <div className="relative max-w-2xl mx-auto">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="What are you looking for?" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearch}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                autoFocus
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
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
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;