// frontend/src/components/UserThemeMenu.jsx

import { useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { USER_THEMES, getStoredUserTheme, applyUserTheme } from '../theme/userThemes';
import './UserThemeMenu.css';

const LIGHT_THEME_ID = 'elegant-light';
const DARK_THEME_ID = 'midnight-black';

const UserThemeMenu = () => {
  const [selectedId, setSelectedId] = useState(getStoredUserTheme());

  const isDark = selectedId === DARK_THEME_ID;

  const handleToggle = () => {
    const nextId = isDark ? LIGHT_THEME_ID : DARK_THEME_ID;
    const applied = applyUserTheme(nextId);
    setSelectedId(applied);

    const theme = USER_THEMES.find((t) => t.id === applied);
    toast.success(`${theme?.name || 'Theme'} applied`);
  };

  return (
    <button
      type="button"
      className="user-theme-toggle"
      onClick={handleToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <FiSun size={19} /> : <FiMoon size={19} />}
    </button>
  );
};

export default UserThemeMenu;