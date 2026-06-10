import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import { setCredentials } from '../redux/authSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('LOGIN SUBMIT:', formData);

    if (!formData.username || !formData.password) {
      toast.error('Enter username and password');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      console.log('LOGIN RESPONSE:', response.data);

      const { access, refresh, user } = response.data;

      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      dispatch(
        setCredentials({
          user: user || null,
          access,
        })
      );

      toast.success(user?.username ? `Welcome ${user.username}` : 'Login successful');

      navigate('/');
    } catch (error) {
      console.error('LOGIN ERROR:', error);

      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        'Login failed';

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 border rounded-md w-96">

        <h2 className="text-xl mb-4">Login</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border p-2 mb-3"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-2 mb-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-3 text-sm">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;