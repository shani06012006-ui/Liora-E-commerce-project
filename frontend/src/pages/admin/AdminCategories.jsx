import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import toast from "react-hot-toast";
import { adminAPI } from "../../services/api";
import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(async () => {
  try {
    setLoading(true);

    const res = await adminAPI.getCategories();

    console.log("Categories Response:", res.data);

    setCategories(res.data);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load categories");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
    });

    setEditCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category) => {
    setEditCategory(category);

    setForm({
      name: category.name,
      description: category.description || "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editCategory) {
        const id = editCategory.id || editCategory._id;

        await adminAPI.updateCategory(id, form);

        toast.success("Category updated successfully");
      } else {
        await adminAPI.createCategory(form);

        toast.success("Category created successfully");
      }

      await fetchCategories();

      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
    }
  };

  const deleteCategory = async (id) => {
  console.log("Deleting category:", id);

  if (!window.confirm("Delete this category?")) return;

  try {
    const res = await adminAPI.deleteCategory(id);
    
    console.log("Delete success:", res);

    await fetchCategories();

    toast.success("Category deleted");
  } catch (err) {
    console.log("Delete error:", err.response);

    toast.error("Failed to delete category");
  }
};

  const filtered = categories.filter((category) => {
    return (
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      (category.description || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout title="Categories">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-sm text-gray-500">
              Manage product categories
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center px-4 py-2 bg-black text-white rounded-lg"
            >
              <FiPlus className="mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Modal */}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-5">
                {editCategory ? "Edit Category" : "Add Category"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label>Name</label>

                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label>Description</label>

                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-lg"
                  >
                    {editCategory ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cards */}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-b-2 border-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((category) => {
              const id = category.id || category._id;

              return (
                <div
                  key={id}
                  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {category.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2">
                        {category.description || "No description"}
                      </p>

                      <p
                        className={`mt-3 text-xs font-medium ${
                          category.is_active
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {category.is_active
                          ? "Active"
                          : "Inactive"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 rounded hover:bg-gray-100"
                      >
                        <FiEdit />
                      </button>

                      <button
                        onClick={() => deleteCategory(id)}
                        className="p-2 rounded hover:bg-red-100 hover:text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;