import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';
import { authService } from '../../api/services/auth.service';
import { Input } from '../../components/common/Input';
import { useValidation } from '../../utils/validation/useValidation';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm
  } = useValidation({ name: '', email: '', password: '', mobile: '' });

  const redirect = searchParams.get('redirect') || '/';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    
    try {
      const res = await authService.register(values);
      const payload = res.data || res;
      
      if (payload.requiresOtp) {
        toast.success(res.message || 'Registration successful. Please verify email.');
        navigate(`/otp-verification?email=${encodeURIComponent(values.email)}&type=signup&redirect=${encodeURIComponent(redirect)}`);
      } else {
        const { user, accessToken, refreshToken } = payload;
        const { useAuthStore } = await import('../../store/authStore'); 
        useAuthStore.getState().setAuth(user, accessToken, refreshToken);
        
        try {
           const { cartService } = await import('../../api/services/cart.service');
           await cartService.mergeCart();
           const { useCartStore } = await import('../../store/cartStore');
           await useCartStore.getState().syncBackendCart();
        } catch (e) {
           console.error("Cart merge skipped", e);
        }

        toast.success('Registration successful. Welcome!');
        navigate(redirect);
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary-50 text-primary-600 mb-6">
          <User size={32} />
        </div>
        <h1 className="text-4xl font-serif text-stone-950 mb-3 tracking-tight">Create Account</h1>
        <p className="text-stone-500 text-sm">Join the house of Vasanthi Creations for bespoke elegance.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        <Input
          label="Full Name"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.name ? errors.name : ''}
          success={touched.name && !errors.name}
          leftIcon={<User size={18} />}
          placeholder="Enter your full name"
          required
        />
        
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
        
        <Input
          label="Mobile Number"
          name="mobile"
          type="tel"
          value={values.mobile}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.mobile ? errors.mobile : ''}
          success={touched.mobile && values.mobile && !errors.mobile}
          leftIcon={<Phone size={18} />}
          placeholder="10-digit mobile number"
          maxLength={10}
        />
        
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ''}
            success={touched.password && !errors.password}
            leftIcon={<Lock size={18} />}
            placeholder="Min 8 chars, 1 uppercase, 1 special"
            required
            showPasswordStrength
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
          className="w-full bg-stone-950 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-stone-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4 group"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="flex items-center gap-2">
              Begin Journey
            </span>
          )}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-stone-100 text-center">
        <p className="text-sm text-stone-500">
          Already a member? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary-700 font-bold hover:text-primary-800 transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
