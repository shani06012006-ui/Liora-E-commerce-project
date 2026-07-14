// frontend/src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/api';
import { setCredentials } from '../redux/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('blocked') === 'true') {
      toast.error('Your account has been blocked by the administrator.');
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
    
    dispatch(setCredentials({
      user: userData,
      access: accessToken,
    }));
    
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    
    toast.success(`Welcome back, ${userData?.username || 'User'}!`);
    
    console.log('User data:', userData);
    console.log('Is admin?', userData?.role === 'admin' || userData?.is_staff === true);
    
    if (userData?.role === 'admin' || userData?.is_staff === true) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Invalid email or password.'
    );
  } finally {
    setLoading(false);
  }
};

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:5174/api/auth/google/', {
        credential: credentialResponse.credential,
      });
      
      const userData = res.data.user;
      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;
      
      dispatch(setCredentials({
        user: userData,
        access: accessToken,
      }));
      
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success(
        res.data.created
          ? `Welcome to Liora, ${userData?.username || 'User'}!`
          : `Welcome back, ${userData?.username || 'User'}!`
      );
      
      // Redirect based on user role
      if (userData?.role === 'admin' || userData?.is_staff === true) {
        navigate('/admin');
      } else {
        navigate('/');
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
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-light text-gray-900 tracking-wide mb-2">
            Liora
          </h1>
          <p className="text-gray-500 text-sm">Welcome back</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-medium text-gray-900 mb-5 md:mb-6 text-center">
            Login
          </h2>

          {/* Google Login - Comment out if causing issues */}
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

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5 md:mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div className="mb-5 md:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter your Liora account password
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
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

          <p className="mt-4 text-sm text-center text-gray-500">
            No account?{' '}
            <Link to="/register" className="text-gray-900 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;