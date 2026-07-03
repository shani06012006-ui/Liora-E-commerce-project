import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/register/', formData);
      toast.success('OTP sent to your email!');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || err.response?.data?.username?.[0] || err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-2">Liora</h1>
          <p className="text-sm text-gray-500">Create your account</p>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-3" />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-medium text-gray-900 mb-5 md:mb-6 text-center">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              ['username', 'Username *', 'text', 'Choose a username'],
              ['email',    'Email *',    'email', 'you@example.com'],
              ['password', 'Password *', 'password', '••••••••'],
            ].map(([name, label, type, placeholder]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={type} name={name} placeholder={placeholder}
                  value={formData[name]} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm" />
                {name === 'password' && (
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 characters (Numbers / Text)</p>
                )}
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 text-sm md:text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-gray-500">
            Already have an account?{' '}
            <Link to="/Login" className="text-gray-900 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;