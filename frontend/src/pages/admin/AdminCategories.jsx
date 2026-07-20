import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
 
const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [search, setSearch] = useState('');
 
  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { fetchCategories(); }, [fetchCategories]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCategory) {
        await adminAPI.updateCategory(editCategory.id, form);
        toast.success('Category updated!');
      } else {
        await adminAPI.createCategory(form);
        toast.success('Category created!');
      }
      setShowForm(false);
      fetchCategories();
    } catch {
      toast.error('Failed to save category');
    }
  };
 
  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await adminAPI.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };
 
  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );
    return (
    <AdminLayout title="Categories">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500 mt-1">Manage product categories</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => {
                setEditCategory(null);
                setForm({ name: '', description: '' });
                setShowForm(true);
              }}
              className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <FiPlus className="mr-2" />
              Add Category
            </button>
          </div>
        </div>
       {/* Form Modal */}
       {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                  >
                    {editCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Categories Grid */}
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(category => (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.description || 'No description'}</p>
                    <span className={`text-xs font-medium ${category.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditCategory(category);
                        setForm({ name: category.name, description: category.description || '' });
                        setShowForm(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
 
export default AdminCategories;