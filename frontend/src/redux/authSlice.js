// frontend/src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { getUser, getTokens, clearSession, setUser, setTokens } from '../utils/storage';

const getUserFromStorage = () => {
  return getUser();
};

const getTokenFromStorage = () => {
  const { accessToken } = getTokens();
  return accessToken || null;
};

const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  tabId: sessionStorage.getItem('tab_id') || `tab_${Date.now()}`,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, access, refresh } = action.payload;
      
      console.log(' setCredentials - User:', user?.username);
      console.log(' setCredentials - Tab:', state.tabId);
      
      state.user = user;
      state.token = access;
      
      setUser(user);
      setTokens(access, refresh);
      
      localStorage.setItem('last_user', JSON.stringify(user));
      localStorage.setItem('last_token', access);
    },
    logout: (state) => {
      console.log('🚪 Logout - Tab:', state.tabId);
      state.user = null;
      state.token = null;
      clearSession();
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      setUser(state.user);
    },
    syncFromTab: (state, action) => {
      // Sync from another tab
      const { user, token } = action.payload;
      if (user && token) {
        state.user = user;
        state.token = token;
        setUser(user);
        setTokens(token, null);
      }
    },
  },
});

export const { setCredentials, logout, updateUser, syncFromTab } = authSlice.actions;
export default authSlice.reducer;