import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authAPI } from '../../services/api';
import { setCredentials } from '../../redux/authSlice';
import toast from 'react-hot-toast';
import { FiLock, FiMail } from 'react-icons/fi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const clearSession = () => {
    ['access_token', 'refresh_token', 'user'].forEach((key) =>
      localStorage.removeItem(key)
    );
  };

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

      const isAdmin = userData?.role === 'admin' || userData?.is_staff === true;

      if (!isAdmin) {
        clearSession();
        toast.error('Access denied. Admin credentials required.');
        return;
      }

      dispatch(setCredentials({ user: userData, access: accessToken }));
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success(`Welcome back, ${userData?.username || 'Admin'}!`);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">L</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Liora Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Restricted access — administrators only</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="admin@liora.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Verifying...' : 'Login to Admin Panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          This area is restricted. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;