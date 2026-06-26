import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username || !password) {
      return toast.error('Enter username and password');
    }

    setLoading(true);

    try {
      const { data } = await authAPI.login(formData);

      const { access, refresh, user } = data;

      dispatch(setCredentials({ user, access }));

      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
      }

      toast.success(
        user?.username
          ? `Welcome ${user.username}`
          : 'Login successful'
      );

      navigate('/');
    } catch (error) {
      let message = 'Login failed';

      if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-96 p-6 border rounded-md"
      >
        <button type= "submit">Login</button>

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