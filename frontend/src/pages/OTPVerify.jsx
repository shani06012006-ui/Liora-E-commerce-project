import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const OTPVerify = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const email     = location.state?.email || '';

  const [otp,       setOtp]       = useState('');
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [timer,     setTimer]     = useState(300);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter 6-digit OTP'); return; }

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/verify-otp/', {
        email,
        otp_code: otp,
      });

      toast.success('Account verified! Please login to continue 🎉');

      // ✅ Login page redirect — auto login இல்லை
      setTimeout(() => navigate('/Login'), 1500);

    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post('http://localhost:8000/api/resend-otp/', { email });
      toast.success('New OTP sent to your email!');
      setTimer(300);
      setOtp('');
    } catch { toast.error('Failed to resend OTP'); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-light text-gray-900 tracking-wide mb-2">
            Liora
          </h1>
          <p className="text-gray-500 text-sm">Verify your email address</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">

          {/* Icon + Info */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg md:text-xl font-medium text-gray-900 mb-1">Check your email</h2>
            <p className="text-gray-500 text-sm">We sent a 6-digit code to</p>
            <p className="text-gray-900 font-medium text-sm mt-1">{email}</p>
          </div>

          {/* Flow Steps — visual */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['Register', 'OTP Sent', 'Verify', 'Login'].map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`flex flex-col items-center`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    idx < 2 ? 'bg-gray-900 text-white' :
                    idx === 2 ? 'bg-gray-900 text-white ring-2 ring-gray-300' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {idx < 2 ? '✓' : idx + 1}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap">{step}</span>
                </div>
                {idx < 3 && <div className="w-6 h-px bg-gray-200 mb-3" />}
              </div>
            ))}
          </div>

          <form onSubmit={handleVerify}>
            {/* OTP Input */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                autoFocus
              />
            </div>

            {/* Timer */}
            <div className="text-center mb-5">
              {timer > 0 ? (
                <p className="text-xs text-gray-400">
                  Code expires in{' '}
                  <span className={`font-medium ${timer < 60 ? 'text-red-500' : 'text-gray-600'}`}>
                    {formatTime(timer)}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-red-500">OTP expired. Please request a new one.</p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify & Continue to Login'}
            </button>
          </form>

          {/* Resend */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resending || timer > 240}
                className="text-gray-900 font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </p>
            {timer > 240 && (
              <p className="text-xs text-gray-400 mt-1">
                Resend available in {formatTime(timer - 240)}
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Wrong email?{' '}
          <button onClick={() => navigate('/register')} className="text-gray-600 hover:underline">
            Go back to Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default OTPVerify;