import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../api/services/auth.service';
import toast from 'react-hot-toast';

const isDevOtpBypass = import.meta.env.VITE_ENABLE_DEV_OTP_BYPASS === 'true';

const OtpVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'signup'; 
  const redirect = searchParams.get('redirect') || '/';
  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Allow pasting full 6 digits
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      // Focus last filled input
      const focusIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // DEV BYPASS CHECK
      if (isDevOtpBypass && otpCode === '123456') {
        toast.success('Development OTP Verified!');
        // Mock successful registration payload
        setAuth(
          { id: '456', name: 'New Customer', email: email, role: 'customer' },
          'mock-jwt-token-access',
          'mock-jwt-token-refresh'
        );
        navigate(redirect);
        return;
      }

      // REAL BACKEND VALIDATION
      let res;
      if (type === 'login') {
        res = await authService.verifyLogin(email, otpCode);
      } else if (type === 'admin') {
        res = await authService.verifyAdminLogin(email, otpCode);
      } else {
        res = await authService.verifyOtp(email, otpCode);
      }
      
      if (type === 'forgot') {
        toast.success('OTP verified. Proceed to update your credentials.');
        navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpCode}`);
        return;
      }

      setAuth(
        res.data.user || (res.data as any).admin,
        res.data.accessToken,
        res.data.refreshToken
      );
      
      toast.success(res.message || 'Verification successful!');
      navigate(redirect);

    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-primary-950 mb-2">Verify your email</h1>
        <p className="text-gray-600 text-sm">
          We've sent a 6-digit code to <br/>
          <span className="font-semibold text-gray-900">{email}</span>
        </p>
      </div>

      {isDevOtpBypass && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded mb-6 text-center shadow-sm">
          <strong>Development Mode:</strong> OTP verification bypass is enabled. <br/>Use code <strong>123456</strong>
        </div>
      )}

      <form onSubmit={verifyOtp} className="space-y-8">
        <div className="flex justify-between sm:justify-center max-w-xs mx-auto gap-1.5 sm:gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-white border border-gray-300 rounded focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-colors"
            />
          ))}
        </div>

        <button 
          type="submit" 
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-primary-950 text-white font-bold uppercase tracking-widest py-4 rounded hover:bg-primary-800 transition-colors shadow-soft disabled:opacity-70 flex justify-center items-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Verify Account'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Didn't receive the code?
        </p>
        <button className="text-primary-700 font-semibold text-sm hover:underline">
          Resend OTP
        </button>
        <div className="mt-4">
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-xs text-gray-400 hover:text-gray-600 underline">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
