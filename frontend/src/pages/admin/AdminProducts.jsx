import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', price: '', original_price: '',
  stock: '', category: '', style: '', discount: '',
  is_new_arrival: false, is_best_seller: false, is_on_sale: false, image_url: '',
};

const AdminProducts = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editProduct, setEdit]    = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [search, setSearch]       = useState('');

  const token   = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/products/', { headers });
      setProducts(res.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); } );

  const openAdd = () => {
    setEdit(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEdit(product);
    setForm({ ...EMPTY_FORM, ...product });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await axios.patch(`http://localhost:8000/api/admin/products/${editProduct.id}/`, form, { headers });
        toast.success('Product updated!');
      } else {
        await axios.post('http://localhost:8000/api/admin/products/', form, { headers });
        toast.success('Product created!');
      }
      setShowForm(false);
      fetchProducts();
    } catch { toast.error('Failed to save product'); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/products/${id}/`, { headers });
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete product'); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {[
                  ['name', 'Product Name', 'text'],
                  ['price', 'Price (₹)', 'number'],
                  ['original_price', 'Original Price (₹)', 'number'],
                  ['discount', 'Discount (%)', 'number'],
                  ['stock', 'Stock', 'number'],
                  ['category', 'Category', 'text'],
                  ['style', 'Style', 'text'],
                  ['image_url', 'Image URL', 'text'],
                ].map(([key, label, type]) => (
                  <div key={key} className={key === 'image_url' || key === 'name' ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    />
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 flex gap-6">
                  {[
                    ['is_new_arrival', 'New Arrival'],
                    ['is_best_seller', 'Best Seller'],
                    ['is_on_sale', 'On Sale'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                        className="w-4 h-4 accent-gray-900"
                      />
                      {label}
                    </label>
                  ))}
                </div>

                <div className="col-span-2 flex gap-3 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
                  >
                    {editProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Image', 'Name', 'Category', 'Price', 'Stock', 'Badges', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={product.image_url || `http://localhost:8000${product.image}`}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                        onError={(e) => { e.target.src = 'https://placehold.co/40x40'; }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[150px] truncate">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.category}</td>
                    <td className="px-4 py-3 font-medium">₹{product.price}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10 ? 'bg-green-100 text-green-700' :
                        product.stock > 0  ? 'bg-yellow-100 text-yellow-700' :
                                             'bg-red-100 text-red-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {product.is_new_arrival && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded">New</span>}
                        {product.is_best_seller && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded">Best</span>}
                        {product.is_on_sale    && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded">Sale</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
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

export default AdminProducts;