import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { authService } from '../../api/services/auth.service';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await authService.forgotPassword(email);
      if (res.requiresOtp) {
        toast.success(res.message || 'OTP sent to your email.');
        navigate(`/otp-verification?email=${encodeURIComponent(email)}&type=forgot`);
      } else {
        toast.success('Security bypass enabled. Directing to password reset matrix.');
        navigate(`/reset-password?email=${encodeURIComponent(email)}&bypass=true`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate recovery protocol.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link to="/login" className="inline-flex items-center text-sm font-semibold tracking-widest uppercase text-gray-500 hover:text-primary-700 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Login
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-primary-950 mb-2">Reset Password</h1>
        <p className="text-gray-600 max-w-sm mx-auto">
          {submitted 
            ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."
            : "Enter the email associated with your account and we'll send you a link to reset your password."}
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your email"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !email}
            className="w-full bg-primary-950 text-white font-bold uppercase tracking-widest py-4 rounded hover:bg-primary-800 transition-colors shadow-soft disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      ) : (
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => setSubmitted(false)}
            className="text-primary-700 font-semibold tracking-widest uppercase text-sm hover:underline"
          >
            Try another email
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
