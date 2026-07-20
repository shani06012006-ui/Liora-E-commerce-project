// frontend/src/pages/admin/AdminReviews.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { FiSearch, FiStar, FiTrash2, FiEye, FiEyeOff, FiCheckCircle, FiXCircle, FiClock, FiChevronLeft, FiChevronRight, FiFilter, FiRefreshCw, FiTrendingUp, FiMessageSquare, FiUser, FiPackage, FiCalendar } from 'react-icons/fi';
 
const StarIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="currentColor" 
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
 
const StatCard = ({ title, value, icon: Icon, color, change }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
 
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs font-medium mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              <FiTrendingUp className={`inline mr-1 ${change.startsWith('+') ? '' : 'transform rotate-180'}`} size={12} />
              {change} vs last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color] || colors.blue}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};
 
const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    rating: 'all',
    status: 'all',
    dateRange: 'all',
    verified: 'all',
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewDetail, setShowReviewDetail] = useState(false);
 
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReviews();
      setReviews(res.data || []);
    } catch (error) {
      toast.error('Failed to load reviews');
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);
 
  // Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter(r => !r.is_hidden && !r.is_approved).length;
    const approved = reviews.filter(r => r.is_approved && !r.is_hidden).length;
    const hidden = reviews.filter(r => r.is_hidden).length;
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) 
      : 0;
 
    return {
      total,
      pending,
      approved,
      hidden,
      avgRating: avgRating.toFixed(1),
    };
  }, [reviews]);
 
  // Filter reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];
 
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.user_name || '').toLowerCase().includes(q) ||
          (r.comment || '').toLowerCase().includes(q) ||
          (r.product_name || '').toLowerCase().includes(q) ||
          (r.title || '').toLowerCase().includes(q)
      );
    }
 
    if (filters.rating !== 'all') {
      result = result.filter((r) => (r.rating || 0) === parseInt(filters.rating));
    }
 
    if (filters.status === 'approved') {
      result = result.filter((r) => r.is_approved && !r.is_hidden);
    } else if (filters.status === 'pending') {
      result = result.filter((r) => !r.is_approved && !r.is_hidden);
    } else if (filters.status === 'hidden') {
      result = result.filter((r) => r.is_hidden);
    }
 
    if (filters.verified === 'verified') {
      result = result.filter((r) => r.is_verified_purchase);
    } else if (filters.verified === 'unverified') {
      result = result.filter((r) => !r.is_verified_purchase);
    }
 
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
 
      const cutoffs = {
        today: today,
        week: weekAgo,
        month: monthAgo,
      };
      const cutoff = cutoffs[filters.dateRange];
      if (cutoff) {
        result = result.filter((r) => new Date(r.created_at) >= cutoff);
      }
    }
 
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
 
    return result;
  }, [reviews, search, filters]);
 
  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
 
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };
 
  const clearFilters = () => {
    setFilters({
      rating: 'all',
      status: 'all',
      dateRange: 'all',
      verified: 'all',
    });
    setSearch('');
    setCurrentPage(1);
  };
 
  const toggleApprove = async (reviewId, isApproved) => {
    try {
      await adminAPI.updateReview(reviewId, { is_approved: !isApproved });
      toast.success(`Review ${!isApproved ? 'approved' : 'unapproved'}`);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review');
      console.error('Error updating review:', error);
    }
  };
 
  const toggleHide = async (reviewId, isHidden) => {
    try {
      await adminAPI.updateReview(reviewId, { is_hidden: !isHidden });
      toast.success(`Review ${!isHidden ? 'hidden' : 'shown'}`);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review');
      console.error('Error updating review:', error);
    }
  };
 
  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await adminAPI.deleteReview(reviewId);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
      console.error('Error deleting review:', error);
    }
  };
 
  const getStatusBadge = (review) => {
    if (review.is_hidden) {
      return { label: 'Hidden', color: 'bg-red-100 text-red-700', icon: FiEyeOff };
    }
    if (review.is_approved) {
      return { label: 'Approved', color: 'bg-green-100 text-green-700', icon: FiCheckCircle };
    }
    return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: FiClock };
  };
 
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon 
        key={i} 
        className={`w-4 h-4 ${i < (rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} 
      />
    ));
  };
 
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.rating !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.verified !== 'all') count++;
    if (search) count++;
    return count;
  }, [filters, search]);
 
  return (
    <AdminLayout title="Reviews">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
            <p className="text-sm text-gray-500 mt-1">Manage customer reviews and feedback</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="relative px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition flex items-center gap-2"
            >
              <FiFilter size={16} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={fetchReviews}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition flex items-center gap-2"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
 
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            title="Total Reviews" 
            value={stats.total} 
            icon={FiMessageSquare} 
            color="blue" 
            change="+15.6%" 
          />
          <StatCard 
            title="Pending Reviews" 
            value={stats.pending} 
            icon={FiClock} 
            color="yellow" 
            change="+8.2%" 
          />
          <StatCard 
            title="Approved Reviews" 
            value={stats.approved} 
            icon={FiCheckCircle} 
            color="green" 
            change="+13.4%" 
          />
          <StatCard 
            title="Hidden Reviews" 
            value={stats.hidden} 
            icon={FiEyeOff} 
            color="red" 
            change="-5.1%" 
          />
          <StatCard 
            title="Average Rating" 
            value={`${stats.avgRating} / 5`} 
            icon={FiStar} 
            color="purple" 
            change="+0.3" 
          />
        </div>
 
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by product or customer..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium">{filteredReviews.length}</span>
                <span>reviews found</span>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <FiRefreshCw size={12} />
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
 
          {showFilters && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1">
                      <FiStar size={14} />
                      Rating
                    </span>
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => updateFilter('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none bg-white"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
 
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1">
                      <FiCheckCircle size={14} />
                      Status
                    </span>
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
 
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={14} />
                      Date Range
                    </span>
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => updateFilter('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none bg-white"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
 
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1">
                      <FiCheckCircle size={14} />
                      Verified Purchase
                    </span>
                  </label>
                  <select
                    value={filters.verified}
                    onChange={(e) => updateFilter('verified', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none bg-white"
                  >
                    <option value="all">All</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Unverified Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
 
        {/* Reviews Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <FiMessageSquare size={40} className="text-gray-300 mb-2" />
                            <p>No reviews found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((review) => {
                        const status = getStatusBadge(review);
                        const StatusIcon = status.icon;
                        return (
                          <tr key={review.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <FiUser className="text-gray-600" size={14} />
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                  {review.user_name || 'Anonymous'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <FiPackage className="text-gray-400 mr-2" size={14} />
                                <span className="text-sm text-gray-600 truncate max-w-[120px]">
                                  {review.product_name || `#${review.product}`}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                                <span className="text-xs text-gray-500 ml-1">({review.rating || 0})</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-[200px]">
                                <p className="text-sm text-gray-900 font-medium truncate">{review.title || 'Review'}</p>
                                <p className="text-sm text-gray-600 truncate">{review.comment}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              }) : '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </span>
                              {review.is_verified_purchase && (
                                <span className="ml-1 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                                  Verified
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setShowReviewDetail(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                  title="View Details"
                                >
                                  <FiEye size={16} />
                                </button>
                                {!review.is_approved && !review.is_hidden && (
                                  <button
                                    onClick={() => toggleApprove(review.id, review.is_approved)}
                                    className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                    title="Approve Review"
                                  >
                                    <FiCheckCircle size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => toggleHide(review.id, review.is_hidden)}
                                  className={`p-2 rounded-lg transition ${
                                    review.is_hidden 
                                      ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                                      : 'text-orange-400 hover:text-orange-600 hover:bg-orange-50'
                                  }`}
                                  title={review.is_hidden ? 'Show Review' : 'Hide Review'}
                                >
                                  {review.is_hidden ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                </button>
                                <button
                                  onClick={() => deleteReview(review.id)}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete Review"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
 
              {/* Pagination */}
              {filteredReviews.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredReviews.length)} of {filteredReviews.length} reviews
                  </p>
 
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-black outline-none"
                      >
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-500">/ page</span>
                    </div>
 
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition"
                      >
                        <FiChevronLeft size={18} />
                      </button>
 
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
 
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                              currentPage === pageNum ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
 
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-8 h-8 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 transition"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
 
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition"
                      >
                        <FiChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
 
      {/* Review Detail Modal */}
      {showReviewDetail && selectedReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Review Details</h3>
              <button onClick={() => setShowReviewDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FiXCircle size={24} className="text-gray-400" />
              </button>
            </div>
 
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedReview.title || 'Review'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-gray-500">({selectedReview.rating || 0}/5)</span>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedReview).color}`}>
                  {getStatusBadge(selectedReview).label}
                </span>
              </div>
 
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900">{selectedReview.user_name || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-medium text-gray-900">{selectedReview.product_name || `#${selectedReview.product}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedReview.created_at ? new Date(selectedReview.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verified Purchase</p>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    selectedReview.is_verified_purchase ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {selectedReview.is_verified_purchase ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
 
              <div>
                <p className="text-sm text-gray-500 mb-2">Review Comment</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedReview.comment || 'No comment'}</p>
                </div>
              </div>
 
              <div className="border-t pt-4 flex flex-wrap gap-3">
                {!selectedReview.is_approved && !selectedReview.is_hidden && (
                  <button
                    onClick={() => {
                      toggleApprove(selectedReview.id, selectedReview.is_approved);
                      setShowReviewDetail(false);
                    }}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                  >
                    <FiCheckCircle className="inline mr-2" size={16} />
                    Approve Review
                  </button>
                )}
                <button
                  onClick={() => {
                    toggleHide(selectedReview.id, selectedReview.is_hidden);
                    setShowReviewDetail(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedReview.is_hidden 
                      ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' 
                      : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                  }`}
                >
                  {selectedReview.is_hidden ? 'Show Review' : 'Hide Review'}
                </button>
                <button
                  onClick={() => {
                    deleteReview(selectedReview.id);
                    setShowReviewDetail(false);
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  Delete Review
                </button>
                <button
                  onClick={() => setShowReviewDetail(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
 
export default AdminReviews;