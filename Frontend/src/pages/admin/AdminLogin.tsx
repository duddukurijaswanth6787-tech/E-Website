import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowRight } from 'lucide-react';

import { authService } from '../../api/services/auth.service';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Protect the route if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && user && ['admin', 'super_admin'].includes(user.role)) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } else if (isAuthenticated && user && !['admin', 'super_admin'].includes(user.role)) {
       // If customer accidentally ends up here, boot them to shop
       toast.error("Unauthorized access payload");
       navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter admin credentials');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.adminLogin({ email, password });
      
      if ((res as any).data.requiresOtp || res.data.requiresOtp) {
          toast.success('MFA Gate Activated');
          navigate(`/otp-verification?email=${email}&type=admin&redirect=/admin`);
          return;
      }

      const { admin, accessToken, refreshToken } = (res as any).data;
      setAuth(admin as any, accessToken, refreshToken);
      toast.success("Authentication payload verified");
    } catch (error: any) {
      console.error('Admin Auth Error:', error);
      toast.error(error?.response?.data?.message || 'Invalid administrative credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary-600 mb-4">
           <AlertCircle className="w-16 h-16" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Admin Portal Access
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Vasanthi Creations Control Center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-widest text-[0.7rem]">
                Admin Email ID
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-600 bg-white rounded-md shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="sysadmin@vasanthicreations.local"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-widest text-[0.7rem]">
                Access Token / Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-600 bg-white rounded-md shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded bg-white"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember secure session
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                  Reset Node?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold uppercase tracking-widest text-white bg-primary-950 hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="flex items-center">Authenticate <ArrowRight className="w-4 h-4 ml-2" /></span>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
             <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
               <div className="flex">
                 <div className="flex-shrink-0">
                   <AlertCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                 </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Local Development Hook</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>DB Seed Credentials:<br/>admin@vasanthicreations.com / Admin@12345!</p>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;


