// frontend/src/pages/OTPVerify.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice';
import { authAPI } from '../services/api';
import { setTokens, setUser } from '../utils/storage';
import toast from 'react-hot-toast';

const OTPVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(300);

  useEffect(() => {
    // Redirect if no email is provided
    if (!email) {
      toast.error('No email provided. Please register again.');
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.verifyOtp({ email, otp_code: otp });

      const userData = response.data.user;
      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      // Build full user data
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

      // Store in sessionStorage
      setUser(fullUserData);
      setTokens(accessToken, refreshToken);

      toast.success('Account verified successfully!');

      // Check if user is admin
      const isAdmin = fullUserData.role === 'admin' || fullUserData.is_staff === true;

      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      toast.error(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOtp({ email });
      toast.success('A new OTP has been sent.');
      setOtp('');
      setTimer(300);
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-light text-gray-900">Liora</h1>
          <p className="text-gray-500 text-sm mt-2">Verify your email</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-medium text-center mb-2">Enter OTP</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            We sent a verification code to
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          <form onSubmit={handleVerify}>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full border rounded-lg text-center text-2xl tracking-[0.5em] py-3 mb-5 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>

          <div className="text-center mt-5">
            {timer > 0 ? (
              <p className="text-sm text-gray-500">OTP expires in {formatTime(timer)}</p>
            ) : (
              <p className="text-red-500 text-sm">OTP expired</p>
            )}

            <button
              onClick={handleResend}
              disabled={resending || timer > 240}
              className="mt-4 text-gray-900 font-medium hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;