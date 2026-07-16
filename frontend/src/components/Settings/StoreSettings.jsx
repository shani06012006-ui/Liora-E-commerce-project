// frontend/src/components/Settings/StoreSettings.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FiSave, FiRefreshCw, FiUpload, FiImage, FiShoppingBag,
  FiTag, FiHeart, FiStar, FiUsers, FiEye, FiCheck,
} from 'react-icons/fi';

const StoreSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    store_name: 'Liora Aesthetic Fashion',
    store_tagline: 'Premium aesthetic fashion for the modern individual',
    store_logo: null,
    store_icon: null,
    store_banner: null,
    allow_guest_checkout: true,
    require_account_to_order: false,
    show_stock_quantity: true,
    show_sales_badge: true,
    enable_wishlist: true,
    enable_reviews: true,
    enable_comparison: false,
  });

  useEffect(() => {
    let cancelled = false;
    const fetchSettings = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (cancelled) return;
      } catch {
        if (!cancelled) toast.error('Failed to load store settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSettings();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success('🎨 Store settings updated successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result });
        toast.success(`📸 ${field.replace('_', ' ')} uploaded!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFeature = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <div className="mt-4 text-sm text-gray-500 font-medium">Loading store settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <FiShoppingBag size={24} className="text-gray-700" />
            Store Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configure your store appearance and functionality</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="group relative px-6 py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl font-medium text-sm hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-70"
        >
          {saving ? (
            <>
              <FiRefreshCw className="animate-spin" size={18} />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiSave size={18} className="group-hover:scale-110 transition-transform" />
              <span>Save Changes</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-8">
        {/* Store Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiTag size={16} className="text-gray-400" />
                Store Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                placeholder="Enter store name"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiStar size={16} className="text-gray-400" />
                Store Tagline
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none"
                value={settings.store_tagline}
                onChange={(e) => setSettings({ ...settings, store_tagline: e.target.value })}
                placeholder="Enter store tagline"
              />
            </div>
          </div>
        </div>

        {/* Branding Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiImage size={20} className="text-gray-600" />
            Branding
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Store Logo</label>
              <div className="relative group">
                <div className="w-full aspect-square max-w-[200px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-black group-hover:shadow-lg">
                  {settings.store_logo ? (
                    <img src={settings.store_logo} alt="Logo" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-gray-600">L</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">LIORA</p>
                      <p className="text-[10px] text-gray-400">AESTHETIC FASHION</p>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 p-2 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800 transition-all shadow-lg">
                  <FiUpload size={14} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('store_logo', e.target.files[0])}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 2MB</p>
              </div>
            </div>

            {/* Favicon Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Favicon</label>
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-black group-hover:shadow-lg">
                  {settings.store_icon ? (
                    <img src={settings.store_icon} alt="Favicon" className="w-full h-full object-contain p-4" />
                  ) : (
                    <span className="text-5xl">👗</span>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 p-2 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800 transition-all shadow-lg">
                  <FiUpload size={14} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('store_icon', e.target.files[0])}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">ICO, PNG up to 1MB</p>
              </div>
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Store Banner</label>
              <div className="relative group">
                <div className="w-full aspect-[16/6] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-black group-hover:shadow-lg">
                  {settings.store_banner ? (
                    <img src={settings.store_banner} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-gray-400">No banner set</span>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 p-2 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800 transition-all shadow-lg">
                  <FiUpload size={14} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('store_banner', e.target.files[0])}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Toggle - Enhanced */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FiCheck size={20} className="text-gray-600" />
            Store Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'allow_guest_checkout', label: 'Guest Checkout', icon: FiUsers, desc: 'Allow checkout without account' },
              { key: 'require_account_to_order', label: 'Account Required', icon: FiUsers, desc: 'Require account for orders' },
              { key: 'show_stock_quantity', label: 'Show Stock', icon: FiEye, desc: 'Display available stock' },
              { key: 'show_sales_badge', label: 'Sales Badge', icon: FiTag, desc: 'Show "On Sale" badge' },
              { key: 'enable_wishlist', label: 'Wishlist', icon: FiHeart, desc: 'Save products to wishlist' },
              { key: 'enable_reviews', label: 'Reviews', icon: FiStar, desc: 'Allow product reviews' },
            ].map((feature) => {
              const Icon = feature.icon;
              const isEnabled = settings[feature.key];
              return (
                <div
                  key={feature.key}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isEnabled 
                      ? 'border-black/20 bg-gray-50/50 hover:border-black/40' 
                      : 'border-gray-100 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => toggleFeature(feature.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isEnabled ? 'bg-black/5' : 'bg-gray-100'}`}>
                      <Icon size={18} className={isEnabled ? 'text-black' : 'text-gray-400'} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{feature.label}</p>
                      <p className="text-xs text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    isEnabled ? 'bg-black' : 'bg-gray-300'
                  } relative`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
                      isEnabled ? 'right-1' : 'left-1'
                    }`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;