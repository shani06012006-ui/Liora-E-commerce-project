// frontend/src/theme/userThemes.js
//
// This is the USER-SIDE theme system. It is intentionally a mirror of
// theme/adminThemes.js, but fully independent from it:
//   - separate localStorage key ('liora_user_theme' vs 'liora_admin_theme')
//   - separate <html> data-attribute ('data-user-theme' vs 'data-admin-theme')
//   - separate CSS variables ('--user-*' vs '--admin-*')
//
// Because both the storage key and the DOM attribute are different,
// switching the theme from the storefront never touches the admin theme,
// and switching it from the admin dashboard never touches the storefront.
 
export const USER_THEMES = [
  {
    id: 'elegant-light',
    name: 'Elegant Light',
    description: 'Clean charcoal navbar, soft light storefront',
    colors: ['#14141a', '#f5f6f8', '#d4a574', '#ffffff'],
  },
  {
    id: 'midnight-black',
    name: 'Midnight Black',
    description: 'Deep black, full dark mode for night browsing',
    colors: ['#0a0a0c', '#18181b', '#d4af7a', '#e5e7eb'],
  },
  {
    id: 'blush-pink',
    name: 'Blush Pink',
    description: 'Soft romantic pink, warm and inviting',
    colors: ['#2b1620', '#fdf1f5', '#e8a0b4', '#ffffff'],
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Deep royal purple with a rich violet glow',
    colors: ['#1a1228', '#f3effc', '#8b5cf6', '#ffffff'],
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Warm metallic blush, luxe and premium',
    colors: ['#2c1c1b', '#fdf3ee', '#dba590', '#f6d9c4'],
  },
];
 
export const DEFAULT_USER_THEME = 'elegant-light';
 
const STORAGE_KEY = 'liora_user_theme';
 
/** Read the saved USER theme id from localStorage, falling back to the default. */
export const getStoredUserTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && USER_THEMES.some((t) => t.id === saved)) return saved;
  } catch {
    // localStorage may be unavailable (private browsing, etc.) - fall back silently
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
 