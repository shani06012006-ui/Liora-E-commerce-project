// frontend/src/components/Settings/GeneralSettings.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FiSave, FiRefreshCw, FiGlobe, FiMail, FiPhone, FiMapPin, 
  FiClock, FiFlag, FiMoon, FiSun, FiCheckCircle, FiInfo
} from 'react-icons/fi';

const GeneralSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'Liora',
    site_description: 'Premium aesthetic fashion store',
    contact_email: 'support@liora.com',
    contact_phone: '+1 (555) 123-4567',
    address: '123 Fashion Street, New York, NY 10001',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en',
    maintenance_mode: false,
    dark_mode: false,
    analytics_enabled: true,
  });

  useEffect(() => {
    let cancelled = false;
    const fetchSettings = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (cancelled) return;
      } catch {
        if (!cancelled) toast.error('Failed to load general settings');
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
      toast.success('✨ General settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
          <div className="mt-4 text-sm text-gray-500 font-medium">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section animate-fadeIn">
      {/* Header - Flex row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">General Settings</h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <FiInfo size={14} />
            Manage your store's general configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="group relative px-6 py-3 bg-black text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-70 whitespace-nowrap"
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
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            </>
          )}
        </button>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {/* Grid layout - 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Site Name */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FiGlobe size={16} className="text-gray-400" />
                Site Name
              </span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none hover:bg-white"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              placeholder="Enter site name"
            />
          </div>

          {/* Site Description */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FiInfo size={16} className="text-gray-400" />
                Site Description
              </span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none hover:bg-white"
              value={settings.site_description}
              onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
              placeholder="Enter site description"
            />
          </div>

          {/* Contact Email */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FiMail size={16} className="text-gray-400" />
                Contact Email
              </span>
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none hover:bg-white"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              placeholder="Enter contact email"
            />
          </div>

          {/* Contact Phone */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FiPhone size={16} className="text-gray-400" />
                Contact Phone
              </span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none hover:bg-white"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              placeholder="Enter contact phone"
            />
          </div>

          {/* Store Address - Full width */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FiMapPin size={16} className="text-gray-400" />
                Store Address
              </span>
            </label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none hover:bg-white resize-none"
              rows="2"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Enter store address"
            />
          </div>

          {/* Timezone */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FiClock size={16} className="text-gray-400" />
                Timezone
              </span>
            </label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none cursor-pointer hover:bg-white appearance-none"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            >
              <option value="America/New_York">🌎 Eastern Time (EST/EDT)</option>
              <option value="America/Chicago">🌎 Central Time (CST/CDT)</option>
              <option value="America/Denver">🌎 Mountain Time (MST/MDT)</option>
              <option value="America/Los_Angeles">🌎 Pacific Time (PST/PDT)</option>
              <option value="UTC">🌎 UTC</option>
              <option value="Asia/Kolkata">🌏 India Standard Time (IST)</option>
              <option value="Europe/London">🌍 British Time (GMT/BST)</option>
            </select>
          </div>

          {/* Default Language */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FiFlag size={16} className="text-gray-400" />
                Default Language
              </span>
            </label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 outline-none cursor-pointer hover:bg-white appearance-none"
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="hi">🇮🇳 Hindi</option>
              <option value="zh">🇨🇳 Chinese</option>
            </select>
          </div>

          {/* Toggle Section - Full width */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 transition-all">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Maintenance Mode</p>
                    <p className="text-xs text-gray-500">Store unavailable</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenance_mode}
                      onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-2">
                    {settings.dark_mode ? <FiMoon className="text-gray-700" size={16} /> : <FiSun className="text-gray-700" size={16} />}
                    <p className="text-sm font-medium text-gray-800">Dark Mode</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.dark_mode}
                      onChange={(e) => setSettings({ ...settings, dark_mode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 transition-all">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Analytics</p>
                    <p className="text-xs text-gray-500">Track store data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.analytics_enabled}
                      onChange={(e) => setSettings({ ...settings, analytics_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <FiCheckCircle size={14} className="text-green-500 flex-shrink-0" />
          <span>All settings are up to date</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Last saved: Today, 2:30 PM</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;