import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../api/services/auth.service';
import toast from 'react-hot-toast';

const TailorLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  const redirect = searchParams.get('redirect') || '/tailor/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await authService.tailorLogin({ email, password });
      
      const { tailor, accessToken, refreshToken } = (res as any).data;
      
      // Map tailor object to match the user shape expected by AuthStore
      const mappedUser = {
        id: tailor._id,
        name: tailor.name,
        email: tailor.email,
        role: 'tailor', // Explicitly set role
        mobile: tailor.phone,
        avatar: tailor.profileImage,
      };

      setAuth(mappedUser, accessToken, refreshToken);
      
      toast.success('Tailor Session Established');
      navigate(redirect);
      
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials or account locked');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const res = await authService.tailorLogin({ email: 'tailor1@test.com', password: 'Tailor@123' });
      const { tailor, accessToken, refreshToken } = (res as any).data;
      
      const mappedUser = {
        id: tailor._id,
        name: tailor.name,
        email: tailor.email,
        role: 'tailor',
        mobile: tailor.phone,
        avatar: tailor.profileImage,
      };

      setAuth(mappedUser, accessToken, refreshToken);
      toast.success('Tailor Dev Session Established');
      navigate(redirect);
    } catch (err: any) {
      toast.error('Tailor quick login failed. Ensure database is seeded with Tailor accounts.');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">Production Portal</h1>
        <p className="text-gray-500">Sign in to access your assigned workflows.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tailor Email *</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-4 flex items-center justify-center text-gray-400 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gray-900 text-white font-bold uppercase tracking-widest py-4 rounded hover:bg-black transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center mb-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Access Workflow'
          )}
        </button>

        <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-widest">Dev Testing</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button 
          onClick={handleDevLogin}
          type="button" 
          className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold uppercase tracking-widest py-4 rounded hover:bg-gray-50 transition-colors shadow-sm flex justify-center items-center text-xs"
        >
            [Dev] Quick Login (tailor1@test.com)
        </button>
      </form>
    </div>
  );
};

export default TailorLoginPage;
