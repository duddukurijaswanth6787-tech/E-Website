import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Mail, Lock, ShieldCheck, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../api/services/auth.service';
import { Input } from '../../components/common/Input';
import { useValidation } from '../../utils/validation/useValidation';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm
  } = useValidation({ email: '', password: '' });

  const redirect = searchParams.get('redirect') || '/my/profile';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please enter valid credentials');
      return;
    }

    setLoading(true);
    
    try {
      if (values.email.toLowerCase() === 'admin@vasanthicreations.com' || values.email.toLowerCase() === 'admin@gmail.com') {
        const res = await authService.adminLogin(values);
        const { admin, accessToken, refreshToken } = (res as any).data;
        setAuth(admin, accessToken, refreshToken);
        toast.success('Admin Session Established');
        navigate('/admin');
        return;
      }

      const res = await authService.login(values);
      
      if (res.data?.requiresOtp) {
        toast.success('Security Verification Required');
        navigate(`/otp-verification?email=${values.email}&type=login&redirect=${encodeURIComponent(redirect)}`);
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

  const handleQuickLogin = async (role: 'admin' | 'customer') => {
    setLoading(true);
    try {
      const credentials = role === 'admin' 
        ? { email: 'admin@gmail.com', password: 'Admin@123' }
        : { email: 'customer@test.com', password: 'Customer@123' };
        
      const res = role === 'admin' 
        ? await authService.adminLogin(credentials)
        : await authService.login(credentials);
        
      const payload = (res as any).data || res.data;
      setAuth(payload.admin || payload.user, payload.accessToken, payload.refreshToken);
      
      if (role === 'customer') {
        try {
           const { cartService } = await import('../../api/services/cart.service');
           await cartService.mergeCart();
           const { useCartStore } = await import('../../store/cartStore');
           await useCartStore.getState().syncBackendCart();
        } catch (e) {}
      }

      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} Session Established`);
      navigate(role === 'admin' ? '/admin' : redirect);
    } catch (err) {
      toast.error('Quick login failed. Ensure database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary-50 text-primary-600 mb-6">
          <LogIn size={32} />
        </div>
        <h1 className="text-4xl font-serif text-stone-950 mb-3 tracking-tight">Welcome Back</h1>
        <p className="text-stone-500 text-sm">Sign in to your private bespoke vault.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : ''}
          success={touched.email && !errors.email}
          leftIcon={<Mail size={18} />}
          placeholder="example@gmail.com"
          required
        />
        
        <div>
          <div className="flex justify-end mb-1">
            <Link to="/forgot-password" className="text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:text-primary-800 transition-colors">Forgot Password?</Link>
          </div>
          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ''}
            success={touched.password && !errors.password && values.password.length > 0}
            leftIcon={<Lock size={18} />}
            placeholder="Enter your password"
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-primary-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-stone-950 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-stone-800 transition-all shadow-xl disabled:opacity-50 flex justify-center items-center mt-2 group"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="flex items-center gap-2">
              Enter Boutique
            </span>
          )}
        </button>

        <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-stone-100"></div>
            <span className="flex-shrink-0 mx-4 text-stone-400 text-[10px] font-bold uppercase tracking-widest">Rapid Access (Dev)</span>
            <div className="flex-grow border-t border-stone-100"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleQuickLogin('admin')}
            type="button" 
            className="group relative overflow-hidden bg-white border border-stone-200 text-stone-950 font-bold uppercase tracking-wider py-4 rounded-xl hover:border-accent transition-all text-[10px] shadow-sm flex items-center justify-center gap-2"
          >
             <ShieldCheck size={14} className="text-stone-400 group-hover:text-accent transition-colors" />
             QA Admin
          </button>
          <button 
            onClick={() => handleQuickLogin('customer')}
            type="button" 
            className="group relative overflow-hidden bg-white border border-stone-200 text-stone-950 font-bold uppercase tracking-wider py-4 rounded-xl hover:border-primary-600 transition-all text-[10px] shadow-sm flex items-center justify-center gap-2"
          >
             <User size={14} className="text-stone-400 group-hover:text-primary-600 transition-colors" />
             QA Member
          </button>
        </div>
      </form>

      <div className="mt-10 pt-8 border-t border-stone-100 text-center">
        <p className="text-sm text-stone-500">
          Not a member? <Link to="/register" className="text-primary-700 font-bold hover:text-primary-800 transition-colors">Join the House</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
