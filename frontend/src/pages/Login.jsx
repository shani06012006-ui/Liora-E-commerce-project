import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import { setCredentials } from '../redux/authSlice';
import toast from 'react-hot-toast';
 
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
 
  const navigate = useNavigate();
  const dispatch = useDispatch();
 
  const handleSubmit = async (event) => {
    event.preventDefault();
 
    if (!username || !password) {
      toast.error('Enter username and password');
      return; //Function-ah immediately stop pannum
    } 
 
    setLoading(true);
    try {
      const response = await authAPI.login({ username, password });
 
      dispatch(setCredentials({
        user: response.data.user,
        access: response.data.access,
      }));
 
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
 
      toast.success(`Welcome ${response.data.user?.username || ''}`);
      navigate('/');
 
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'Login failed';
      toast.error(message);
 
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-80 bg-white p-6 rounded-lg shadow border">
 
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
 
        {/* Username input */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full border p-2 rounded mb-3"
        />
 
        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
 
        {/* THIS is the actual Login button - type="submit" triggers handleSubmit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
 
        <p className="mt-3 text-sm text-center">
          No account? <Link to="/register" className="underline">Register</Link>
        </p>
 
      </form>
    </div>
  );
};
 
export default Login;