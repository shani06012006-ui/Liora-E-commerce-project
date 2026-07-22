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

  {
  id: 'blush-pink',
  name: 'Blush Pink',
  description: 'Elegant blush monochrome with soft luxury tones',
  colors: ['#fff7f9', '#ffffff', '#d98fa8', '#2d1b22'],
  },

  {
  id: 'lavender',
  name: 'Lavender',
  description: 'Soft royal lavender with elegant luxury tones',
  colors: ['#f7f4fc', '#ffffff', '#8d74c7', '#2f2645'],
},

  {
  id: 'rose-gold',
  name: 'Rose Gold',
  description: 'Warm rose gold with timeless elegance',
  colors: ['#fcf6f3', '#ffffff', '#c98d79', '#3b2925'],
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
 