import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { FiEye, FiEyeOff } from "react-icons/fi";

const Register = () => {
  const [formData, setFormData] = useState({
      firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });
      toast.success('OTP sent to your email!');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      toast.error(
        err.response?.data?.email?.[0]    ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.error         ||
        'Registration failed'
      );
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'firstName', label: 'First Name *', type: 'text', placeholder: 'Enter your first name',},    
    { name: 'lastName',  label: 'Last Name',    type: 'text', placeholder: 'Enter your last name', },
    { name: 'email',     label: 'Email Address *', type: 'email', placeholder: 'you@example.com',  },
    { name: 'phone',     label: 'Phone Number (Optional)', type: 'tel', placeholder: '+94 77 123 4567',},   
    { name: 'password',  label: 'Password *',    type: 'password',   placeholder: '••••••••', }, 
    { name: 'confirmPassword', label: 'Confirm Password *', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-2">Liora</h1>
          <p className="text-sm text-gray-500">Create your account</p>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-3" />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-medium text-gray-900 mb-5 md:mb-6 text-center">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative">
              <input type={
                  name === "password"
                  ? (showPassword ? "text" : "password")
                  : name === "confirmPassword"
                  ? (showConfirmPassword ? "text" : "password")
                  : type }
                name={name} placeholder={placeholder} value={formData[name]}
                onChange={handleChange} required={name !== "phone"}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm transition ${
                 name === "confirmPassword" &&
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                ? "border-red-400 bg-red-50"
                : name === "confirmPassword" &&
                  formData.confirmPassword &&
                  formData.password === formData.confirmPassword
                ? "border-green-400 bg-green-50"
                : "border-gray-300"
              }`}
               />

            {(name === "password" || name === "confirmPassword") && (
          <button type="button" onClick={() => {
            if (name === "password") {
            setShowPassword(prev => !prev);
          } else {
            setShowConfirmPassword(prev => !prev);
          }
          }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition" >
        {name === "password"
        ? (showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />)
        : (showConfirmPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />)}
        </button>
        )}
  
</div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading || (formData.confirmPassword && formData.password !== formData.confirmPassword)}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 text-sm md:text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Sending OTP...
                </span>
              ) : 'Create My Account'}
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