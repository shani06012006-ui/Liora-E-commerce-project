import { logout } from './authSlice';
import { setCart } from './cartSlice';
import toast from 'react-hot-toast';

export const handleLogout = (dispatch, navigate) => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  dispatch(logout());
  dispatch(setCart({ items: [] }));
  toast.success('Logged out successfully!');
  navigate('/');
};