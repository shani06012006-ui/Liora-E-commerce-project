// frontend/src/theme/userThemes.js

 
export const USER_THEMES = [
  {
    id: 'elegant-light',
    name: 'Elegant Light',
    description: 'Minimal black & white monochrome theme',
    colors: ['#000000', '#ffffff', '#000000', '#ffffff'],
  },

  {
  id: 'midnight-black',
  name: 'Midnight Black',
  description: 'Pure monochrome dark theme',
  colors: ['#000000', '#121212', '#ffffff', '#ffffff'],
  },


];
 
export const DEFAULT_USER_THEME = 'elegant-light';
 
const STORAGE_KEY = 'liora_user_theme';
 
export const getStoredUserTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && USER_THEMES.some((t) => t.id === saved)) return saved;
  } catch {
    // localStorage may be unavailable - fall back silently
  }
  return DEFAULT_USER_THEME;
};
 
export const applyUserTheme = (themeId) => {
  const valid = USER_THEMES.some((t) => t.id === themeId) ? themeId : DEFAULT_USER_THEME;
  document.documentElement.setAttribute('data-user-theme', valid);
  try {
    localStorage.setItem(STORAGE_KEY, valid);
  } catch {
    // ignore write failures
  }
  return valid;
};
 