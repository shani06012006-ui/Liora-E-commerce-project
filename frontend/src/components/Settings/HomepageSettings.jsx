// frontend/src/components/Settings/HomepageSettings.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiRefreshCw, FiEye, FiEyeOff, FiArrowUp, FiArrowDown, FiPlus, FiTrash2 } from 'react-icons/fi';
 
const HomepageSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    hero_section: {
      enabled: true,
      title: 'Premium Aesthetic Fashion',
      subtitle: 'Discover the latest trends in sustainable fashion',
      button_text: 'Shop Now',
      button_link: '/collections',
      image: null,
    },
    featured_categories: [
      { id: 1, name: 'New Arrivals', enabled: true, order: 1 },
      { id: 2, name: 'Best Sellers', enabled: true, order: 2 },
      { id: 3, name: 'Sale', enabled: true, order: 3 },
      { id: 4, name: 'Accessories', enabled: false, order: 4 },
    ],
    featured_products_count: 8,
    show_banner: true,
    banner_text: 'Free shipping on orders over $50',
    banner_link: '/collections',
    sections_order: ['hero', 'categories', 'featured', 'banner', 'newsletter'],
  });
 
  // ---- CRUD UI state ----
  const [newCategoryName, setNewCategoryName] = useState('');
 
  useEffect(() => {
    let cancelled = false;
 
    const fetchSettings = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (cancelled) return;
      } catch {
        if (!cancelled) toast.error('Failed to load homepage settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
 
    fetchSettings();
 
    return () => {
      cancelled = true;
    };
  }, []);
 
  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Homepage settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
 
  const toggleCategory = (id) => {
    setSettings({
      ...settings,
      featured_categories: settings.featured_categories.map(c =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      )
    });
  };
 
  const moveCategory = (id, direction) => {
    const index = settings.featured_categories.findIndex(c => c.id === id);
    if (index < 0) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= settings.featured_categories.length) return;
 
    const items = [...settings.featured_categories];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    items.forEach((c, i) => c.order = i + 1);
    setSettings({ ...settings, featured_categories: items });
  };
 
  // ---- CRUD: Add a new featured category ----
  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (settings.featured_categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error('That category is already in the list');
      return;
    }
    const nextOrder = settings.featured_categories.length + 1;
    setSettings({
      ...settings,
      featured_categories: [
        ...settings.featured_categories,
        { id: Date.now(), name, enabled: true, order: nextOrder },
      ],
    });
    setNewCategoryName('');
    toast.success(`${name} added to featured categories`);
  };
 
  // ---- CRUD: Delete a featured category ----
  const deleteCategory = (id) => {
    const category = settings.featured_categories.find((c) => c.id === id);
    const remaining = settings.featured_categories
      .filter((c) => c.id !== id)
      .map((c, i) => ({ ...c, order: i + 1 }));
    setSettings({ ...settings, featured_categories: remaining });
    toast.success(`${category?.name || 'Category'} removed`);
  };
 
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }
 
  return (
    <div className="settings-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Homepage Settings</h2>
          <p className="section-subtitle">Customize your store homepage layout and content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? <FiRefreshCw className="animate-spin" size={16} /> : <FiSave size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
 
      <form className="settings-form">
        {/* Hero Section */}
        <div className="form-section">
          <div className="flex items-center justify-between mb-4">
            <h3 className="form-section-title mb-0">Hero Section</h3>
            <div className="toggle-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.hero_section.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    hero_section: { ...settings.hero_section, enabled: e.target.checked }
                  })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Hero Title</label>
              <input
                type="text"
                className="form-input"
                value={settings.hero_section.title}
                onChange={(e) => setSettings({
                  ...settings,
                  hero_section: { ...settings.hero_section, title: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hero Subtitle</label>
              <input
                type="text"
                className="form-input"
                value={settings.hero_section.subtitle}
                onChange={(e) => setSettings({
                  ...settings,
                  hero_section: { ...settings.hero_section, subtitle: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Button Text</label>
              <input
                type="text"
                className="form-input"
                value={settings.hero_section.button_text}
                onChange={(e) => setSettings({
                  ...settings,
                  hero_section: { ...settings.hero_section, button_text: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Button Link</label>
              <input
                type="text"
                className="form-input"
                value={settings.hero_section.button_link}
                onChange={(e) => setSettings({
                  ...settings,
                  hero_section: { ...settings.hero_section, button_link: e.target.value }
                })}
              />
            </div>
          </div>
        </div>
 
        {/* Featured Categories — full CRUD */}
        <div className="form-section">
          <h3 className="form-section-title">Featured Categories</h3>
 
          {settings.featured_categories.length === 0 ? (
            <div className="crud-empty">No featured categories yet. Add one below.</div>
          ) : (
            <div className="space-y-2">
              {settings.featured_categories.map((category) => (
                <div key={category.id} className="homepage-section">
                  <div className="section-info">
                    <span className="text-gray-400 text-sm">#{category.order}</span>
                    <span className="section-label">{category.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      category.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {category.enabled ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveCategory(category.id, -1)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      aria-label="Move up"
                    >
                      <FiArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCategory(category.id, 1)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      aria-label="Move down"
                    >
                      <FiArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      aria-label={category.enabled ? 'Hide category' : 'Show category'}
                    >
                      {category.enabled ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(category.id)}
                      className="crud-icon-btn danger"
                      aria-label="Delete category"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
 
          {/* Add new category */}
          <div className="crud-add-row">
            <input
              type="text"
              className="form-input"
              placeholder="New category name (e.g. Winter Collection)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              type="button"
              className="crud-add-btn"
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
            >
              <FiPlus size={15} /> Add Category
            </button>
          </div>
        </div>
 
        {/* Other Settings */}
        <div className="form-section">
          <h3 className="form-section-title">Other Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Featured Products Count</label>
              <input
                type="number"
                className="form-input"
                value={settings.featured_products_count}
                onChange={(e) => setSettings({ ...settings, featured_products_count: parseInt(e.target.value) })}
                min="0"
                max="20"
              />
            </div>
            <div className="form-group flex items-end">
              <div className="toggle-group w-full">
                <div className="toggle-label">
                  <span>Show Banner</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.show_banner}
                    onChange={(e) => setSettings({ ...settings, show_banner: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">Banner Text</label>
              <input
                type="text"
                className="form-input"
                value={settings.banner_text}
                onChange={(e) => setSettings({ ...settings, banner_text: e.target.value })}
              />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">Banner Link</label>
              <input
                type="text"
                className="form-input"
                value={settings.banner_link}
                onChange={(e) => setSettings({ ...settings, banner_link: e.target.value })}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
 
export default HomepageSettings;
