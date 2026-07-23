// frontend/src/components/UserThemeMenu.jsx

import { useState, useRef, useEffect } from 'react';
import { MdPalette } from 'react-icons/md';
import { FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { USER_THEMES, getStoredUserTheme, applyUserTheme } from '../theme/userThemes';
import './UserThemeMenu.css';
 
const UserThemeMenu = () => {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(getStoredUserTheme());
  const menuRef = useRef(null);
 

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
      const applied = applyUserTheme(themeId);
      setSelectedId(applied);
      const theme = USER_THEMES.find((t) => t.id === applied);
      toast.success(` ${theme?.name || 'Theme'} applied`);
    }
    setOpen(false);
  };
 
  return (
    <div className="user-theme-menu" ref={menuRef}>
      <button
        type="button"
        className="user-theme-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        title="Theme"
      >
        <MdPalette size={19} />
      </button>
 
      {open && (
        <div className="user-theme-menu-dropdown">
          <div className="user-theme-menu-header">Theme</div>
          <div className="user-theme-menu-list">
            {USER_THEMES.map((theme) => {
              const isSelected = theme.id === selectedId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`user-theme-menu-item ${isSelected ? 'user-theme-menu-item-active' : ''}`}
                  onClick={() => handleSelect(theme.id)}
                >
                  <span className="user-theme-menu-item-palette">
                    {theme.colors.map((c, i) => (
                      <span key={i} className="user-theme-menu-swatch" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="user-theme-menu-item-name">{theme.name}</span>
                  {isSelected && (
                    <span className="user-theme-menu-item-check">
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
 
export default UserThemeMenu;