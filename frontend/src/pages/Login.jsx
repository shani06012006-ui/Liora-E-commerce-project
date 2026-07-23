// frontend/src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/api';
import { setCredentials } from '../redux/authSlice';
import { setTokens, setUser, getTabId } from '../utils/storage';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('blocked') === 'true') {
      toast.error('Your account has been blocked by the administrator. Please contact support.', {
        duration: 5000,
      });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      
      const userData = response.data.user;
      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;
      
      if (userData.is_blocked === true) {
        toast.error('Your account has been blocked by the administrator. Please contact support.');
        setLoading(false);
        return;
      }
      
      const fullUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name || userData.username,
        role: userData.role || 'user',
        is_staff: userData.is_staff || false,
        is_active: userData.is_active || true,
        is_blocked: userData.is_blocked || false,
        phone: userData.phone || '',
        address: userData.address || '',
        profile_pic_url: userData.profile_pic_url || '',
      };
      
      dispatch(setCredentials({
        user: fullUserData,
        access: accessToken,
        refresh: refreshToken,
      }));
      
      setUser(fullUserData);
      setTokens(accessToken, refreshToken);
      
      const tabId = getTabId();
      console.log('Login - Tab ID:', tabId);
      
      localStorage.setItem('last_user', JSON.stringify(fullUserData));
      localStorage.setItem('last_token', accessToken);
      
      console.log('Logged in user:', fullUserData.username);
      console.log('User role:', fullUserData.role);
      
      toast.success(`Welcome back, ${fullUserData.full_name || fullUserData.username}!`);
      
      const isAdmin = fullUserData.role === 'admin' || fullUserData.is_staff === true;
      
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data?.error?.includes('blocked')) {
        toast.error('Your account has been blocked by the administrator. Please contact support.');
      } else {
        toast.error(
          error.response?.data?.error ||
          error.response?.data?.detail ||
          'Invalid email or password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_URL}auth/google/`, {
        credential: credentialResponse.credential,
      });
      
      const userData = res.data.user;
      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;
      
      const fullUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name || userData.username,
        role: userData.role || 'user',
        is_staff: userData.is_staff || false,
        is_active: userData.is_active || true,
        is_blocked: userData.is_blocked || false,
        phone: userData.phone || '',
        address: userData.address || '',
        profile_pic_url: userData.profile_pic_url || '',
      };
      
      if (fullUserData.is_blocked === true) {
        toast.error('Your account has been blocked by the administrator. Please contact support.');
        return;
      }
      
      dispatch(setCredentials({
        user: fullUserData,
        access: accessToken,
        refresh: refreshToken,
      }));
      
      setUser(fullUserData);
      setTokens(accessToken, refreshToken);
      
      const tabId = getTabId();
      console.log('Google Login - Tab ID:', tabId);
      
      localStorage.setItem('last_user', JSON.stringify(fullUserData));
      localStorage.setItem('last_token', accessToken);
      
      toast.success(
        res.data.created
          ? `Welcome to Liora, ${fullUserData.full_name || fullUserData.username}!`
          : `Welcome back, ${fullUserData.full_name || fullUserData.username}!`
      );
      
      const isAdmin = fullUserData.role === 'admin' || fullUserData.is_staff === true;
      
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-center bg-black bg-no-repeat"
      style={{ backgroundImage: "url('https://i.pinimg.com/736x/21/42/2c/21422c461d630d34c776256c2f08bcb1.jpg')",
        backgroundSize: "80%", }}>     

      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-light text-white tracking-wide mb-2">
            Liora
          </h1>
          <p className="text-white text-sm">Welcome back</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-medium text-white mb-5 md:mb-6 text-center">
            Login
          </h2>

          

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-white focus:border-white"              />
            </div>

            <div className="mb-5 md:mb-6">
              <label className="block text-sm font-medium text-white mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-white focus:border-white"              />
              <p className="text-xs text-gray-200 mt-1">
                Enter your Liora account password
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition mb-7"            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>
          </form>

          <div className="flex items-center gap-3 mb-5 md:mb-10">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-white uppercase tracking-wider ">or</span>
            <div className="flex-1 h-px bg-white/40" />
          </div>          

          <div className="w-full flex justify-center mb-5 md:mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              width="400"
              text="continue_with"
              shape="rectangular"
            />
          </div>



          <p className="mt-4 text-sm text-center text-white">
            No account?{' '}
            <Link to="/register" className="text-white font-semibold hover:text-gray-200 underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;