import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';

const token   = () => localStorage.getItem('access_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const EMPTY = {
  name: '', description: '', price: '', original_price: '',
  discount: '', stock: '', category: '', style: '',
  is_new_arrival: false, is_best_seller: false, is_on_sale: false, image_url: '',
};

const Badge = ({ status }) => {
  const map = {
    in:  { bg: '#e8f5ee', color: '#2d9c5a', label: 'In Stock'     },
    low: { bg: '#fff4e6', color: '#cc7700', label: 'Low Stock'    },
    out: { bg: '#feecec', color: '#d94f4f', label: 'Out of Stock' },
  };
  const s = status === 0 ? map.out : status <= 10 ? map.low : map.in;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
};

const APProducts = () => {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editProduct, setEdit]        = useState(null);
  const [form,        setForm]        = useState(EMPTY);
  const [imageFile,   setImageFile]   = useState(null);
  const [preview,     setPreview]     = useState('');
  const [search,      setSearch]      = useState('');
  const [catFilter,   setCatFilter]   = useState('');
  const [statusFilter,setStatusFilter]= useState('');

  const fetchAll = async () => {
  try {
    const [pr, cr] = await Promise.all([
      axios.get("http://localhost:8000/api/admin/products/", {
        headers: headers(),
      }),
      axios.get("http://localhost:8000/api/admin/categories/", {
        headers: headers(),
      }),
    ]);

    setProducts(pr.data);
    setCategories(cr.data);
  } catch {
    toast.error("Failed to load products");
  }
};

useEffect(() => {
  const loadData = async () => {
    try {
      const [pr, cr] = await Promise.all([
        axios.get("http://localhost:8000/api/admin/products/", {
          headers: headers(),
        }),
        axios.get("http://localhost:8000/api/admin/categories/", {
          headers: headers(),
        }),
      ]);

      setProducts(pr.data);
      setCategories(cr.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  const openAdd = () => { setEdit(null); setForm(EMPTY); setImageFile(null); setPreview(''); setShowModal(true); };
  const openEdit = (p) => {
    setEdit(p);
    setForm({ ...EMPTY, ...p });
    setPreview(p.image_url || (p.image ? `http://localhost:8000${p.image}` : ''));
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'image' && v !== null && v !== undefined) fd.append(k, v); });
      if (imageFile) fd.append('image', imageFile);
      const config = { headers: { ...headers(), 'Content-Type': 'multipart/form-data' } };
      if (editProduct) {
        await axios.patch(`http://localhost:8000/api/admin/products/${editProduct.id}/`, fd, config);
        toast.success('Product updated!');
      } else {
        await axios.post('http://localhost:8000/api/admin/products/', fd, config);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchAll();
    } catch { toast.error('Failed to save product'); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/products/${id}/`, { headers: headers() });
      toast.success('Deleted'); fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const updateStock = async (id, stock) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/products/${id}/`, { stock }, { headers: headers() });
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter    ? String(p.category) === catFilter    : true;
    const mx = statusFilter === 'in'  ? p.stock > 10 :
               statusFilter === 'low' ? (p.stock > 0 && p.stock <= 10) :
               statusFilter === 'out' ? p.stock === 0 : true;
    return ms && mc && mx;
  });

  const inStock  = products.filter(p => p.stock > 10).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outStock = products.filter(p => p.stock === 0).length;

  const inputStyle = {
    width: '100%', padding: '8px 12px',
    border: '1px solid #e8e6e1', borderRadius: 6,
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
    background: '#fff',
  };

  return (
    <AdminLayout
      title="Products"
      actions={
        <button
          onClick={openAdd}
          style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          + Add Product
        </button>
      }
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { icon: '🏷', label: 'Total Products', value: products.length, delta: '12.5%', up: true },
          { icon: '📦', label: 'In Stock',        value: inStock,         delta: '8.4%',  up: true  },
          { icon: '⚠',  label: 'Low Stock',       value: lowStock,        delta: '4.2%',  up: false },
          { icon: '🚫', label: 'Out of Stock',     value: outStock,        delta: '2.1%',  up: false },
        ].map(({ icon, label, value, delta, up }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 8, background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 400, color: '#111', fontFamily: 'Georgia, serif' }}>{value}</div>
              <div style={{ fontSize: 10, color: up ? '#2d9c5a' : '#d94f4f', marginTop: 2 }}>{up ? '↑' : '↓'} {delta} vs last month</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8e6e1', borderRadius: 10, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e8e6e1', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#111', fontFamily: 'Georgia, serif' }}>All Products</div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..." style={{ ...inputStyle, width: 180 }} />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            style={{ ...inputStyle, width: 130 }}>
            <option value="">Category</option>
            {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, width: 120 }}>
            <option value="">Status</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid #e8e6e1', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#666' }}>
            ↑ Export
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 32, height: 32, border: '2px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, color: '#aaa', fontWeight: 500, borderBottom: '1px solid #f0efeb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}
                  style={{ borderBottom: '1px solid #f8f7f5' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', width: 40 }}><input type="checkbox" /></td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 44, background: '#f5f4f0', borderRadius: 6, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {p.image_url || p.image
                          ? <img src={p.image_url || `http://localhost:8000${p.image}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
                          : '👗'}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: '#666' }}>
                    {categories.find(c => c.id === p.category)?.name || p.category || '—'}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: '#111', fontWeight: 500 }}>₹{p.price}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateStock(p.id, Math.max(0, p.stock - 1))} style={{ width: 22, height: 22, border: '1px solid #e8e6e1', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 500, minWidth: 24, textAlign: 'center' }}>{p.stock}</span>
                      <button onClick={() => updateStock(p.id, p.stock + 1)} style={{ width: 22, height: 22, border: '1px solid #e8e6e1', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px' }}><Badge status={p.stock} /></td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(p)} style={{ width: 30, height: 30, border: '1px solid #e8e6e1', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor='#111'}
                        onMouseLeave={e => e.currentTarget.style.borderColor='#e8e6e1'}>✏</button>
                      <button onClick={() => deleteProduct(p.id)} style={{ width: 30, height: 30, border: '1px solid #e8e6e1', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d94f4f' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='#d94f4f'; e.currentTarget.style.background='#feecec'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='#e8e6e1'; e.currentTarget.style.background='#fff'; }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #e8e6e1' }}>
          <div style={{ fontSize: 12, color: '#aaa' }}>Showing {filtered.length} of {products.length} products</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,'…'].map((p, i) => (
              <div key={i} style={{
                width: 30, height: 30,
                border: `1px solid ${p === 1 ? '#111' : '#e8e6e1'}`,
                borderRadius: 5, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', fontSize: 12,
                background: p === 1 ? '#111' : '#fff',
                color: p === 1 ? '#fff' : '#666',
              }}>{p}</div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#aaa' }}>8 / page</div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 500, fontFamily: 'Georgia, serif', color: '#111' }}>
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Image Upload */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Product Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {preview && <img src={preview} alt="preview" style={{ width: 56, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #e8e6e1' }} />}
                    <label style={{ cursor: 'pointer', border: '2px dashed #e8e6e1', borderRadius: 7, padding: '10px 16px', fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
                      📷 Upload Image
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                        const f = e.target.files[0];
                        if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)); }
                      }} />
                    </label>
                    <span style={{ fontSize: 11, color: '#ccc' }}>or</span>
                    <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                      placeholder="Image URL" style={{ ...inputStyle, flex: 1 }} />
                  </div>
                </div>

                {/* Name */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>Product Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Style */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>Style</label>
                  <select value={form.style} onChange={e => setForm({ ...form, style: e.target.value })} style={inputStyle}>
                    <option value="">Select</option>
                    {['party','casual','office','aesthetic'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>

                {/* Price fields */}
                {[['price','Price (₹) *',true],['original_price','Original Price',false],['discount','Discount (%)',false],['stock','Stock *',true]].map(([key, label, req]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>{label}</label>
                    <input type="number" required={req} min="0" value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                  </div>
                ))}

                {/* Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>Description</label>
                  <textarea value={form.description} rows={3}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                {/* Badges */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 20 }}>
                  {[['is_new_arrival','New Arrival'],['is_best_seller','Best Seller'],['is_on_sale','On Sale']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '9px 18px', border: '1px solid #e8e6e1', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ padding: '9px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  {editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
};

export default APProducts;