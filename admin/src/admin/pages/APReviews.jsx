import {useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';

const token   = () => localStorage.getItem('access_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const Stars = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} style={{ fontSize: 12, color: s <= rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
    ))}
  </div>
);

const APReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('');

  const fetchReviews = useCallback(async () => {
  setLoading(true);

  try {
    const r = await axios.get(
      "http://localhost:8000/api/admin/reviews/",
      { headers: headers() }
    );
    setReviews(r.data);
  } catch {
    toast.error("Failed to load reviews");
  } finally {
    setLoading(false);
  }
}, []);

   useEffect(() => {
    const fetchReviews = async () => {
        setLoading(true);

        try {
            const r = await axios.get(
                "http://localhost:8000/api/admin/reviews/",
                { headers: headers() }
            );
            setReviews(r.data);
        } catch {
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    fetchReviews();
}, []);

  const deleteReview = async (id) => {
    if (!window.confirm('Delete review?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/reviews/${id}/`, { headers: headers() });
      toast.success('Review deleted'); fetchReviews();
    } catch { toast.error('Failed'); }
  };

  const filtered = reviews.filter(r => {
    const ms = r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
               r.comment?.toLowerCase().includes(search.toLowerCase()) ||
               r.product_name?.toLowerCase().includes(search.toLowerCase());
    const mf = filter ? String(r.rating) === filter : true;
    return ms && mf;
  });

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <AdminLayout title="Reviews">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { icon: '💬', label: 'Total Reviews',   value: reviews.length },
          { icon: '⭐', label: 'Average Rating',  value: avg            },
          { icon: '5️⃣', label: '5 Star Reviews',  value: reviews.filter(r => r.rating === 5).length },
          { icon: '1️⃣', label: '1 Star Reviews',  value: reviews.filter(r => r.rating === 1).length },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 8, background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 11, color: '#aaa' }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 400, color: '#111', fontFamily: 'Georgia, serif' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e8e6e1', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500, fontFamily: 'Georgia, serif', color: '#111' }}>All Reviews</div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews..."
            style={{ padding: '7px 12px', border: '1px solid #e8e6e1', borderRadius: 6, fontSize: 12, outline: 'none', width: 220, background: '#fff' }} />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding: '7px 11px', border: '1px solid #e8e6e1', borderRadius: 6, fontSize: 12, outline: 'none', background: '#fff' }}>
            <option value="">All Ratings</option>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 32, height: 32, border: '2px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Customer', 'Product', 'Rating', 'Review', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, color: '#aaa', fontWeight: 500, borderBottom: '1px solid #f0efeb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(review => (
                <tr key={review.id}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ borderBottom: '1px solid #f8f7f5' }}>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500, color: '#111' }}>
                    {review.user_name || 'User'}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#666', maxWidth: 140 }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {review.product_name || `#${review.product}`}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px' }}><Stars rating={review.rating} /></td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#555', maxWidth: 240 }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {review.comment}
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>
                    {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <button onClick={() => deleteReview(review.id)}
                      style={{ width: 30, height: 30, border: '1px solid #e8e6e1', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#d94f4f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='#d94f4f'; e.currentTarget.style.background='#feecec'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='#e8e6e1'; e.currentTarget.style.background='#fff'; }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e8e6e1', fontSize: 12, color: '#aaa' }}>
          Showing {filtered.length} of {reviews.length} reviews
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
};

export default APReviews;