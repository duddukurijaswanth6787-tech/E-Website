import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../api/services/auth.service';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get('redirect') || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await authService.register(formData);
      toast.success(res.message || 'Registration successful. Please verify email.');
      setLoading(false);
      navigate(`/otp-verification?email=${encodeURIComponent(formData.email)}&redirect=${encodeURIComponent(redirect)}`);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-primary-950 mb-2">Create an Account</h1>
        <p className="text-gray-600">Join Vasanthi Creations for a seamless bespoke experience.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Create a password"
            minLength={6}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary-950 text-white font-bold uppercase tracking-widest py-4 rounded hover:bg-primary-800 transition-colors shadow-soft disabled:opacity-70 flex justify-center items-center mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
