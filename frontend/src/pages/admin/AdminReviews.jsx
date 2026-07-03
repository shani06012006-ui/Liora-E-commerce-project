import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';
import { StarIcon } from '@heroicons/react/24/solid';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const token   = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/reviews/', { headers });
      setReviews(res.data);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); } );

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/reviews/${id}/`, { headers });
      toast.success('Review deleted');
      fetchReviews();
    } catch { toast.error('Failed to delete review'); }
  };

  const filtered = reviews.filter(r =>
    r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Reviews</h2>
          <input
            type="text" placeholder="Search reviews..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['User', 'Product', 'Rating', 'Review', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(review => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{review.user_name || 'User'}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{review.product_name || `#${review.product}`}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <StarIcon key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{review.comment}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteReview(review.id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;