// frontend/src/redux/authUtils.js
import { logout } from './authSlice';
import { setCart } from './cartSlice';
import { fullLogout } from '../utils/storage';
import toast from 'react-hot-toast';

export const handleLogout = (dispatch, navigate) => {
  console.log('🚪 Logging out from current tab...');
  
  fullLogout();
  
  dispatch(logout());
  dispatch(setCart({ items: [] }));
  
  toast.success('Logged out successfully!');
  navigate('/');
};

export const logoutAllTabs = (dispatch, navigate) => {
  console.log('Logging out from ALL tabs...');
  
  localStorage.removeItem('last_user');
  localStorage.removeItem('last_token');
  fullLogout();
  
  dispatch(logout());
  dispatch(setCart({ items: [] }));
  
  toast.success('Logged out from all devices!');
  navigate('/');
};