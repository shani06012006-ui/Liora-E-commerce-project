// frontend/src/components/ThemeMenu.jsx
import { useState, useRef, useEffect } from 'react';
import { MdPalette } from 'react-icons/md';
import { FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ADMIN_THEMES, getStoredAdminTheme, applyAdminTheme } from '../theme/adminThemes';
import './ThemeMenu.css';
 
const ThemeMenu = () => {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(getStoredAdminTheme());
  const menuRef = useRef(null);
 
  // Close on outside click / Escape - same pattern users expect from
  // any other dropdown (notifications, profile menu, etc.)
  useEffect(() => {
    if (!open) return;
 
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);
 
  const handleSelect = (themeId) => {
    if (themeId !== selectedId) {
      const applied = applyAdminTheme(themeId);
      setSelectedId(applied);
      const theme = ADMIN_THEMES.find((t) => t.id === applied);
      toast.success(` ${theme?.name || 'Theme'} applied`);
    }
    setOpen(false);
  };
 
  return (
    <div className="theme-menu" ref={menuRef}>
      <button
        type="button"
        className="theme-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        title="Theme"
      >
        <MdPalette size={19} />
      </button>
 
      {open && (
        <div className="theme-menu-dropdown">
          <div className="theme-menu-header">Theme</div>
          <div className="theme-menu-list">
            {ADMIN_THEMES.map((theme) => {
              const isSelected = theme.id === selectedId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-menu-item ${isSelected ? 'theme-menu-item-active' : ''}`}
                  onClick={() => handleSelect(theme.id)}
                >
                  <span className="theme-menu-item-palette">
                    {theme.colors.map((c, i) => (
                      <span key={i} className="theme-menu-swatch" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="theme-menu-item-name">{theme.name}</span>
                  {isSelected && (
                    <span className="theme-menu-item-check">
                      <FiCheck size={13} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
 
export default ThemeMenu;
 