import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/api';
import { setCredentials } from '../redux/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      dispatch(setCredentials({
        user: response.data.user,
        access: response.data.access,
      }));
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      toast.success(`Welcome back, ${response.data.user?.username || ''}! 👋`);
      navigate('/');
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Invalid email or password.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:8000/api/auth/google/', {
        credential: credentialResponse.credential,
      });

      dispatch(setCredentials({
        user: res.data.user,
        access: res.data.access,
      }));

      localStorage.setItem('refresh_token', res.data.refresh);

      toast.success(
        res.data.created
          ? `Welcome to Liora, ${res.data.user.username}! 🎉`
          : `Welcome back, ${res.data.user.username}! 👋`
      );
      navigate('/');
    } catch {
      toast.error('Google login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-md px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-light text-gray-900 tracking-wide mb-2">
            Liora
          </h1>
          <p className="text-gray-500 text-sm">Welcome back</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">Login</h2>

          {/* Google Login Button */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed.')}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              shape="rectangular"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
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