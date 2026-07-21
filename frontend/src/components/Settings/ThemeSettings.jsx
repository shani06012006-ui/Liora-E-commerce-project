// frontend/src/components/Settings/ThemeSettings.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiDroplet, FiCheckCircle } from 'react-icons/fi';
import ThemeSelector from '../ThemeSelector';
import { ADMIN_THEMES, getStoredAdminTheme, applyAdminTheme } from '../../theme/adminThemes';
 
const ThemeSettings = () => {
  const [selectedId, setSelectedId] = useState(getStoredAdminTheme());
 
  const handleSelect = (themeId) => {
    if (themeId === selectedId) return;
    const applied = applyAdminTheme(themeId);
    setSelectedId(applied);
 
    const theme = ADMIN_THEMES.find((t) => t.id === applied);
    toast.success(`✨ ${theme?.name || 'Theme'} applied`);
  };
 
  return (
    <div className="settings-section animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Theme</h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <FiDroplet size={14} />
            Choose how your admin dashboard looks and feels
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
          <FiCheckCircle size={16} />
          Applies instantly, no save needed
        </div>
      </div>
 
      {/* Theme cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <ThemeSelector
          themes={ADMIN_THEMES}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>
 
      <p className="text-xs text-gray-400 mt-4">
        Your theme is saved on this device and stays applied every time you open the admin panel.
      </p>
    </div>
  );
};
 
export default ThemeSettings;
 