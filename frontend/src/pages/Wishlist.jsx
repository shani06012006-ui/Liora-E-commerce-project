// frontend/src/pages/Wishlist.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HeartIcon, TrashIcon, UserCircleIcon, ChevronLeftIcon, ChevronRightIcon, 
  UserIcon, ArchiveBoxIcon, MapPinIcon, CreditCardIcon, LockClosedIcon,
  BellIcon, ArrowRightOnRectangleIcon, CheckIcon,
  LockClosedIcon as SecureIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { wishlistAPI, cartAPI, getImageUrl } from '../services/api';
import { refreshCart } from '../redux/cartUtils';
import { handleLogout } from '../redux/authUtils';
import { getTokens, getCurrentUser } from '../utils/storage';
import toast from 'react-hot-toast';
 
const ITEMS_PER_PAGE = 10;
 
const sortOptions = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
];
 
const accountNav = [
  { label: 'Personal Detail', icon: UserIcon, to: '/profile/edit' },
  { label: 'Orders', icon: ArchiveBoxIcon, to: '/orders' },
  { label: 'Wishlist', icon: HeartIcon, to: '/wishlist' },
  { label: 'Addresses', icon: MapPinIcon, to: '/address' },
  { label: 'Payments', icon: CreditCardIcon, to: '/settings' },
];
 
const settingsNav = [
  { label: 'Edit Profile', icon: UserCircleIcon, to: '/profile/edit' },
  { label: 'Change Password', icon: LockClosedIcon, to: '/settings' },
  { label: 'Saved Addresses', icon: MapPinIcon, to: '/address' },
  { label: 'Notification Preferences', icon: BellIcon, to: '/notifications' },
  { label: 'Privacy & Security', icon: SecureIcon, to: '/settings' },
];
 
const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
 
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [movingAll, setMovingAll] = useState(false);
 
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortBy, setSortBy] = useState('recent');
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
 
  const isUserAuthenticated = () => {
    const { accessToken } = getTokens();
    const currentUser = getCurrentUser();
    return !!(accessToken && currentUser);
  };
 
  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.getWishlist();
      setWishlistItems(res.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      if (error.response?.status === 401) navigate('/Login');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (!isUserAuthenticated()) {
      navigate('/Login');
      return;
    }
    fetchWishlist();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
 
  const removeFromWishlist = async (id) => {
    try {
      await wishlistAPI.removeFromWishlist(id);
      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      window.dispatchEvent(new Event('wishlistUpdated'));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };
 
  const addToCart = async (productId, wishlistId) => {
    setBusyId(wishlistId);
    try {
      await cartAPI.addToCart({ product_id: productId, quantity: 1 });
      await refreshCart(dispatch);
      await wishlistAPI.removeFromWishlist(wishlistId);
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId));
      window.dispatchEvent(new Event('wishlistUpdated'));
      toast.success('Added to bag!');
    } catch {
      toast.error('Failed to add to bag');
    } finally {
      setBusyId(null);
    }
  };
 
 
  const moveSelectedToBag = async () => {
    const items = wishlistItems.filter((item) => selectedIds.has(item.id));
    if (items.length === 0) return;
    setMovingAll(true);
    let moved = 0;
    for (const item of items) {
      try {
        await cartAPI.addToCart({ product_id: item.product_details.id, quantity: 1 });
        await wishlistAPI.removeFromWishlist(item.id);
        moved += 1;
      } catch {
        // continue with the rest
      }
    }
    await refreshCart(dispatch);
    window.dispatchEvent(new Event('wishlistUpdated'));
    await fetchWishlist();
    setMovingAll(false);
    setSelectedIds(new Set());
    if (moved > 0) toast.success(`Moved ${moved} item${moved > 1 ? 's' : ''} to bag`);
  };
 
  const removeSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    for (const id of ids) {
      try {
        await wishlistAPI.removeFromWishlist(id);
      } catch {
        // continue
      }
    }
    setWishlistItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    window.dispatchEvent(new Event('wishlistUpdated'));
    setSelectedIds(new Set());
    toast.success('Removed selected items');
  };
 
  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
 
  const onLogout = () => handleLogout(dispatch, navigate);
 
  const sortedItems = useMemo(() => {
    const items = [...wishlistItems];
    switch (sortBy) {
      case 'price_low':
        return items.sort((a, b) => a.product_details.price - b.product_details.price);
      case 'price_high':
        return items.sort((a, b) => b.product_details.price - a.product_details.price);
      case 'name':
        return items.sort((a, b) => a.product_details.name.localeCompare(b.product_details.name));
      default:
        return items.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
  }, [wishlistItems, sortBy]);
 
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
 
  const getProductImage = (product) => getImageUrl(product);
  const displayName = user?.full_name || user?.username || 'there';
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }
 
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#f4f1ee] to-[#e7e3e0] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif tracking-wide text-gray-900">MY WISHLIST</h1>
            <p className="text-gray-600 mt-3">Your saved items, ready when you are.</p>
          </div>
          <div className="hidden md:flex w-56 h-40 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 items-center justify-center shrink-0 overflow-hidden">
            {user?.profile_pic_url ? (
              <img src={user.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <HeartSolid className="w-16 h-16 text-white/30" />
            )}
          </div>
        </div>
      </div>
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
                <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                  {user?.profile_pic_url ? (
                    <img src={user.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircleIcon className="w-9 h-9 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-lg text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
 
              <nav className="py-3">
                {accountNav.map(({ label, icon: Icon, to }) => {
                  const active = label === 'Wishlist';
                  return (
                    <Link
                      key={label}
                      to={to}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${
                        active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                        {label}
                      </span>
                      <ChevronRightIcon className={`w-4 h-4 ${active ? 'text-white/60' : 'text-gray-300'}`} />
                    </Link>
                  );
                })}
              </nav>
 
              <p className="text-xs uppercase tracking-wider text-gray-400 px-3 pt-4 pb-2 border-t border-gray-100">
                Account Settings
              </p>
              <nav>
                {settingsNav.map(({ label, icon: Icon, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-400" />
                      {label}
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-300" />
                  </Link>
                ))}
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <span className="flex items-center gap-3">
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-red-200" />
                </button>
              </nav>
            </div>
          </div>
 
          {/* Wishlist grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-6">
 
              {wishlistItems.length === 0 ? (
                <div className="text-center py-16">
                  <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                  <Link
                    to="/collections"
                    className="inline-block bg-gray-900 text-white px-6 py-2 text-sm uppercase tracking-wide rounded-lg hover:bg-gray-800 transition"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <>
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-gray-100">
                    <p className="text-sm text-gray-600">{sortedItems.length} Items</p>
 
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectMode((v) => !v);
                          setSelectedIds(new Set());
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition ${
                          selectMode
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <CheckIcon className="w-4 h-4" />
                        {selectMode ? 'Cancel' : 'Select'}
                      </button>
 
                      <div className="relative">
                        <button
                          onClick={() => setSortOpen((v) => !v)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                        >
                          Sort by: {sortOptions.find((o) => o.value === sortBy)?.label}
                        </button>
                        {sortOpen && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-10 overflow-hidden">
                            {sortOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => { setSortBy(opt.value); setSortOpen(false); setPage(1); }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                                  sortBy === opt.value ? 'text-gray-900 font-medium' : 'text-gray-600'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
 
                    </div>
                  </div>
 
                  {/* Bulk action bar */}
                  {selectMode && selectedIds.size > 0 && (
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-5">
                      <p className="text-sm text-gray-700">{selectedIds.size} selected</p>
                      <div className="flex gap-2">
                        <button
                          onClick={moveSelectedToBag}
                          disabled={movingAll}
                          className="px-3 py-1.5 text-xs uppercase tracking-wider rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50"
                        >
                          Move to Bag
                        </button>
                        <button
                          onClick={removeSelected}
                          className="px-3 py-1.5 text-xs uppercase tracking-wider rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
 
                  {/* Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {paginatedItems.map((item) => {
                      const p = item.product_details;
                      const selected = selectedIds.has(item.id);
                      return (
                        <div key={item.id} className="group relative">
                          <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[4/5]">
                            <Link to={`/product/${p.id}`}>
                              <img
                                src={getProductImage(p)}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                onError={(e) => { e.target.src = 'https://placehold.co/400x500/e0e0e0/2D2D2D?text=No+Image'; }}
                              />
                            </Link>
 
                            {selectMode ? (
                              <button
                                onClick={() => toggleSelected(item.id)}
                                className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border transition ${
                                  selected ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white/90 border-gray-200 text-transparent'
                                }`}
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => removeFromWishlist(item.id)}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition"
                                title="Remove from wishlist"
                              >
                                <HeartSolid className="w-4 h-4 text-gray-900" />
                              </button>
                            )}
 
                            {p.discount > 0 && (
                              <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                                {p.discount}% OFF
                              </span>
                            )}
                          </div>
 
                          <Link to={`/product/${p.id}`}>
                            <h3 className="mt-3 text-sm font-medium text-gray-900 truncate hover:text-gray-600 transition">
                              {p.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-900 font-medium">₹{p.price}</p>
                            {p.original_price && (
                              <p className="text-xs text-gray-400 line-through">₹{p.original_price}</p>
                            )}
                          </div>
                          {p.category && (
                            <p className="text-xs text-gray-400 uppercase mt-0.5">{p.category}</p>
                          )}
 
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => addToCart(p.id, item.id)}
                              disabled={busyId === item.id}
                              className="flex-1 py-2 bg-gray-900 text-white text-xs uppercase tracking-wider rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                            >
                              {busyId === item.id ? 'Adding...' : 'Add to Bag'}
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 transition"
                              title="Remove"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
 
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          onClick={() => setPage(n)}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm border transition ${
                            n === currentPage
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Wishlist;
 