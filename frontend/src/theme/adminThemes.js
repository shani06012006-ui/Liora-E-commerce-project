// frontend/src/theme/adminThemes.js
//
// Single source of truth for admin dashboard themes.
// Each theme's `id` matches the CSS selector [data-admin-theme="<id>"]
// defined in adminThemes.css - keep these two files in sync.
 
export const ADMIN_THEMES = [
  {
    id: 'elegant-light',
    name: 'Elegant Light',
    description: 'Clean charcoal sidebar, soft light workspace',
    iconKey: 'sun',
    colors: ['#14141a', '#f5f6f8', '#d4a574', '#ffffff'],
  },
  {
    id: 'midnight-black',
    name: 'Midnight Black',
    description: 'Deep black, full dark mode for late-night work',
    iconKey: 'moon',
    colors: ['#0a0a0c', '#18181b', '#d4af7a', '#e5e7eb'],
  },
  {
    id: 'blush-pink',
    name: 'Blush Pink',
    description: 'Soft romantic pink, warm and inviting',
    iconKey: 'heart',
    colors: ['#2b1620', '#fdf1f5', '#e8a0b4', '#ffffff'],
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Deep royal purple with a rich violet glow',
    iconKey: 'droplet',
    colors: ['#1a1228', '#f3effc', '#8b5cf6', '#ffffff'],
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Warm metallic blush, luxe and premium',
    iconKey: 'award',
    colors: ['#2c1c1b', '#fdf3ee', '#dba590', '#f6d9c4'],
  },
];
 
export const DEFAULT_ADMIN_THEME = 'elegant-light';
 
const STORAGE_KEY = 'liora_admin_theme';
 
/** Read the saved theme id from localStorage, falling back to the default. */
export const getStoredAdminTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ADMIN_THEMES.some((t) => t.id === saved)) return saved;
  } catch {
    // localStorage may be unavailable (private browsing, etc.) - fall back silently
  }
  return DEFAULT_ADMIN_THEME;
};
 
/**
 * Apply a theme id to the document and persist it.
 * Setting the attribute on <html> means the theme survives across every
 * admin page (each of which mounts its own AdminLayout instance) without
 * needing a shared React context/provider.
 */
export const applyAdminTheme = (themeId) => {
  const valid = ADMIN_THEMES.some((t) => t.id === themeId) ? themeId : DEFAULT_ADMIN_THEME;
  document.documentElement.setAttribute('data-admin-theme', valid);
  try {
    localStorage.setItem(STORAGE_KEY, valid);
  } catch {
    // ignore write failures
  }
  return valid;
};
 