import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../api/services/auth.service';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  const redirect = searchParams.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // If a seeded admin tries to login from the customer form,
      // route it to the admin auth endpoint.
      if (email.toLowerCase() === 'admin@vasanthicreations.com') {
        const res = await authService.adminLogin({ email, password });
        const { admin, accessToken, refreshToken } = (res as any).data;
        setAuth(admin, accessToken, refreshToken);
        toast.success('Admin Session Established');
        navigate('/admin');
        return;
      }

      // STANDARD BACKEND LOGIN
      const res = await authService.login({ email, password });
      
      if (res.data?.requiresOtp) {
        toast.success('Security Verification Required');
        navigate(`/otp-verification?email=${email}&type=login&redirect=${encodeURIComponent(redirect)}`);
        return;
      }
      
      setAuth(
        res.data.user,
        res.data.accessToken,
        res.data.refreshToken
      );
      
      try {
         const { cartService } = await import('../../api/services/cart.service');
         await cartService.mergeCart();
         const { useCartStore } = await import('../../store/cartStore');
         await useCartStore.getState().syncBackendCart();
      } catch (e) {
         console.error("Cart merge skipped", e);
      }
      
      toast.success(res.message || 'Successfully logged in');
      navigate(redirect);
      
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickLogin = async () => {
    setLoading(true);
    try {
      const res = await authService.adminLogin({ email: 'admin@vasanthicreations.com', password: 'Admin@12345!' });
      const { admin, accessToken, refreshToken } = (res as any).data;
      setAuth(admin, accessToken, refreshToken);
      toast.success('Admin Session Established');
      navigate('/admin');
    } catch (err: any) {
      toast.error('Admin quick login failed. Ensure database is seeded.');
    } finally {
       setLoading(false);
    }
  };

  const handleCustomerQuickLogin = async () => {
    setLoading(true);
    try {
      const res = await authService.login({ email: 'customer@test.com', password: 'Customer@123' });
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      
      try {
         const { cartService } = await import('../../api/services/cart.service');
         await cartService.mergeCart();
         const { useCartStore } = await import('../../store/cartStore');
         await useCartStore.getState().syncBackendCart();
      } catch (e) {
         console.error("Cart merge skipped", e);
      }

      toast.success('Customer Session Established');
      navigate(redirect);
    } catch (err: any) {
      toast.error('Customer quick login failed. Ensure database is seeded.');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-primary-950 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to access your bespoke orders and saved wishlist.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Password *</label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-800">Forgot Password?</Link>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-4 flex items-center justify-center text-gray-400 hover:text-primary-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary-950 text-white font-bold uppercase tracking-widest py-4 rounded hover:bg-primary-800 transition-colors shadow-soft disabled:opacity-70 flex justify-center items-center mb-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Sign In'
          )}
        </button>

        <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-widest">Or for testing</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={handleAdminQuickLogin}
            type="button" 
            className="bg-white border-2 border-accent text-primary-950 font-bold uppercase tracking-widest py-4 rounded hover:bg-accent-light transition-colors shadow-sm flex justify-center items-center text-xs"
          >
             [Dev] QA Admin
          </button>
          <button 
            onClick={handleCustomerQuickLogin}
            type="button" 
            className="bg-white border-2 border-primary-800 text-primary-950 font-bold uppercase tracking-widest py-4 rounded hover:bg-primary-50 transition-colors shadow-sm flex justify-center items-center text-xs"
          >
             [Dev] QA Customer
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center flex flex-col space-y-4">
        <p className="text-sm text-gray-600">
          New to Vasanthi Creations? <Link to="/register" className="text-primary-700 font-semibold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
