import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editCat, setEditCat]       = useState(null);
  const [form, setForm]             = useState({ name: '', slug: '', description: '', is_hidden: false });

  const token   = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/admin/categories/', { headers });
      setCategories(res.data);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); } );

  const openAdd = () => {
    setEditCat(null);
    setForm({ name: '', slug: '', description: '', is_hidden: false });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, is_hidden: cat.is_hidden });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-');
    try {
      if (editCat) {
        await axios.patch(`http://localhost:8000/api/admin/categories/${editCat.id}/`, { ...form, slug }, { headers });
        toast.success('Category updated!');
      } else {
        await axios.post('http://localhost:8000/api/admin/categories/', { ...form, slug }, { headers });
        toast.success('Category created!');
      }
      setShowForm(false);
      fetchCategories();
    } catch { toast.error('Failed to save category'); }
  };

  const toggleHide = async (cat) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/categories/${cat.id}/`,
        { is_hidden: !cat.is_hidden }, { headers });
      toast.success(cat.is_hidden ? 'Category shown' : 'Category hidden');
      fetchCategories();
    } catch { toast.error('Failed to update category'); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Products in this category may be affected.')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/categories/${id}/`, { headers });
      toast.success('Category deleted');
      fetchCategories();
    } catch { toast.error('Failed to delete category'); }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Categories</h2>
          <button onClick={openAdd}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition">
            + Add Category
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editCat ? 'Edit Category' : 'Add Category'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated if empty)</label>
                  <input type="text" value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder={form.name.toLowerCase().replace(/\s+/g, '-')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} rows={2}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_hidden}
                    onChange={(e) => setForm({ ...form, is_hidden: e.target.checked })}
                    className="w-4 h-4 accent-gray-900" />
                  Hide this category
                </label>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">
                    {editCat ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Name', 'Slug', 'Description', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{cat.description || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cat.is_hidden ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                      }`}>
                        {cat.is_hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(cat)}
                          className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition">Edit</button>
                        <button onClick={() => toggleHide(cat)}
                          className={`px-3 py-1 rounded text-xs font-medium transition ${
                            cat.is_hidden
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}>
                          {cat.is_hidden ? 'Show' : 'Hide'}
                        </button>
                        <button onClick={() => deleteCategory(cat.id)}
                          className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition">Delete</button>
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

export default AdminCategories;