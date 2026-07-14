import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminAPI, getImageUrl } from '../../services/api';
import {
  FiSearch, FiEdit, FiTrash2, FiEye, FiFilter, FiChevronLeft, FiChevronRight,
  FiGrid, FiList, FiPackage, FiBox, FiAlertTriangle, FiXCircle, FiTrendingUp,
  FiDownload, FiCheckSquare, FiSquare
} from 'react-icons/fi';

const EMPTY_FORM = {
  name: '', description: '', price: '', original_price: '',
  stock: '', category: '', style: '', discount: '',
  is_new_arrival: false, is_best_seller: false, is_on_sale: false, image_url: '',
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEdit] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('list');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // Calculate stats from products
  const calculateStats = useCallback((productsData) => {
    const total = productsData.length;
    const inStock = productsData.filter(p => p.stock > 10).length;
    const lowStock = productsData.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = productsData.filter(p => p.stock === 0).length;
    return { total, inStock, lowStock, outOfStock };
  }, []);

  const fetchProducts = useCallback(async () => {
  try {
    const res = await adminAPI.getProducts();
    setProducts(res.data);
    setStats(calculateStats(res.data));
  } catch { toast.error('Failed to load products'); }
  finally { setLoading(false); }
  }, [calculateStats]);

  useEffect(() => { 
    fetchProducts();
    
    // Listen for add product event
    const handleOpenAdd = () => {
      setEdit(null);
      setForm(EMPTY_FORM);
      setShowForm(true);
    };
    document.addEventListener('openAddProductModal', handleOpenAdd);
    return () => document.removeEventListener('openAddProductModal', handleOpenAdd);
  }, [fetchProducts]);


  const openEdit = (product) => {
    setEdit(product);
    setForm({ ...EMPTY_FORM, ...product });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await adminAPI.updateProduct(editProduct.id, form);
        toast.success('Product updated!');
      } else {
        await adminAPI.createProduct(form);
        toast.success('Product created!');
      }
      setShowForm(false);
      fetchProducts();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const toggleSelect = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filtered.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filtered.map(p => p.id));
    }
  };

  const exportProducts = () => {
    const data = filtered.map(p => ({
      Name: p.name,
      Category: p.category,
      Price: p.price,
      Stock: p.stock,
      Status: p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock',
      Sales: p.sales || 0
    }));
    
    // Create CSV
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(','), ...data.map(row => headers.map(h => row[h]).join(','))].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
  };

  // Filter products
  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || 
      (selectedStatus === 'In Stock' && p.stock > 10) ||
      (selectedStatus === 'Low Stock' && p.stock > 0 && p.stock <= 10) ||
      (selectedStatus === 'Out of Stock' && p.stock === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories
  const getCategories = () => {
    const cats = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusColor = (stock) => {
    if (stock > 10) return { bg: 'bg-green-100', text: 'text-green-700', label: 'In Stock', dot: 'bg-green-500' };
    if (stock > 0) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Low Stock', dot: 'bg-yellow-500' };
    return { bg: 'bg-red-100', text: 'text-red-700', label: 'Out of Stock', dot: 'bg-red-500' };
  };

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Products" 
            value={stats.total.toLocaleString()} 
            change="+12.5%"
            icon={FiPackage}
            color="blue"
          />
          <StatCard 
            title="In Stock" 
            value={stats.inStock.toLocaleString()} 
            change="+8.4%"
            icon={FiBox}
            color="green"
          />
          <StatCard 
            title="Low Stock" 
            value={stats.lowStock.toLocaleString()} 
            change="-4.2%"
            icon={FiAlertTriangle}
            color="yellow"
            trend="down"
          />
          <StatCard 
            title="Out of Stock" 
            value={stats.outOfStock.toLocaleString()} 
            change="-2.1%"
            icon={FiXCircle}
            color="red"
            trend="down"
          />
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                <FiFilter className="mr-2" size={16} />
                Filter
              </button>
              <select 
                className="px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-black cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {getCategories().map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select 
                className="px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-black cursor-pointer"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <button 
                onClick={exportProducts}
                className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <FiDownload className="mr-2" size={16} />
                Export
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button 
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                  onClick={() => setViewMode('list')}
                >
                  <FiList size={18} />
                </button>
                <button 
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FiGrid size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-black text-white rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm">{selectedProducts.length} products selected</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white/20 rounded text-sm hover:bg-white/30">
                Bulk Delete
              </button>
              <button className="px-3 py-1 bg-white/20 rounded text-sm hover:bg-white/30">
                Bulk Status
              </button>
              <button 
                onClick={() => setSelectedProducts([])}
                className="px-3 py-1 bg-white/20 rounded text-sm hover:bg-white/30"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left">
                      <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                        {selectedProducts.length === filtered.length && filtered.length > 0 ? 
                          <FiCheckSquare size={18} /> : <FiSquare size={18} />
                        }
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((product) => {
                    const status = getStatusColor(product.stock);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <button onClick={() => toggleSelect(product.id)} className="text-gray-400 hover:text-gray-600">
                            {selectedProducts.includes(product.id) ? 
                              <FiCheckSquare size={18} /> : <FiSquare size={18} />
                            }
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={getImageUrl(product)}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                              onError={(e) => { e.target.src = 'https://placehold.co/40x40'; }}
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              {product.style && (
                                <p className="text-xs text-gray-500">{product.style}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{product.price}</div>
                          {product.original_price && product.original_price > product.price && (
                            <div className="text-xs text-gray-400 line-through">₹{product.original_price}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${status.dot}`}></span>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.sales || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="View"
                            >
                              <FiEye size={16} />
                            </button>
                            <button 
                              onClick={() => openEdit(product)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-gray-600">
                Showing {filtered.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filtered.length)} of {filtered.length} products
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  className="text-sm border border-gray-200 rounded px-2 py-1"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={8}>8 / page</option>
                  <option value={16}>16 / page</option>
                  <option value={32}>32 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft size={18} />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  if (pageNumber > 0 && pageNumber <= totalPages) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNumber
                            ? 'bg-black text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  return null;
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <button
                      onClick={() => paginate(totalPages)}
                      className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiXCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {[
                  ['name', 'Product Name', 'text', true],
                  ['category', 'Category', 'text', false],
                  ['style', 'Style', 'text', false],
                  ['price', 'Price (₹)', 'number', false],
                  ['original_price', 'Original Price (₹)', 'number', false],
                  ['discount', 'Discount (%)', 'number', false],
                  ['stock', 'Stock', 'number', false],
                  ['image_url', 'Image URL', 'text', false],
                ].map(([key, label, type, fullWidth]) => (
                  <div key={key} className={fullWidth || key === 'image_url' ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none"
                      required={['name', 'price', 'stock'].includes(key)}
                    />
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div className="col-span-2 flex gap-6 flex-wrap">
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
                        className="w-4 h-4 accent-black"
                      />
                      {label}
                    </label>
                  ))}
                </div>

                <div className="col-span-2 flex gap-3 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
                  >
                    {editProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color, trend = 'up' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50'
  };

  const trendColors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600'
  };

  const isPositive = trend === 'up' ? change.startsWith('+') : change.startsWith('-');
  const trendIcon = isPositive ? <FiTrendingUp className="inline mr-1" size={12} /> : 
    <FiTrendingUp className="inline mr-1 transform rotate-180" size={12} />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-xs font-medium mt-2 ${trendColors[color]} inline-block px-2 py-0.5 rounded-full`}>
            {trendIcon}
            {change} vs last month
          </p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;