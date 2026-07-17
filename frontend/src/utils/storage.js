// frontend/src/utils/storage.js

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';
const TAB_ID_KEY = 'tab_id';

// Generate a unique tab ID
export const getTabId = () => {
  let tabId = sessionStorage.getItem(TAB_ID_KEY);
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(TAB_ID_KEY, tabId);
  }
  return tabId;
};

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    // Also store in localStorage for cross-tab sync
    localStorage.setItem(TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getTokens = () => {
  let accessToken = sessionStorage.getItem(TOKEN_KEY);
  if (!accessToken) {
    accessToken = localStorage.getItem(TOKEN_KEY);
    if (accessToken) {
      sessionStorage.setItem(TOKEN_KEY, accessToken);
    }
  }
  
  let refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }
  
  return { accessToken, refreshToken };
};

export const setUser = (user) => {
  if (user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    // Also store in localStorage for cross-tab sync
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getUser = () => {
  try {
    let user = sessionStorage.getItem(USER_KEY);
    if (!user || user === 'undefined') {
      user = localStorage.getItem(USER_KEY);
      if (user && user !== 'undefined') {
        sessionStorage.setItem(USER_KEY, user);
      }
    }
    return user && user !== 'undefined' ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  // Don't remove TAB_ID_KEY
};

export const fullLogout = () => {
  clearSession();
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('last_user');
  localStorage.removeItem('last_token');
};

export const getCurrentUser = () => {
  return getUser();
};

export const isAuthenticated = () => {
  const { accessToken } = getTokens();
  const user = getUser();
  return !!(accessToken && user);
};

export const isAdmin = () => {
  const user = getUser();
  return user && (user.role === 'admin' || user.is_staff === true);
};

export const setupTabSync = (callback) => {
  const handleStorageChange = (e) => {
    if (e.key === TOKEN_KEY || e.key === USER_KEY) {
      // Another tab changed auth data
      const user = getUser();
      const { accessToken } = getTokens();
      if (user && accessToken) {
        callback({ user, token: accessToken });
      } else {
        callback(null);
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
};