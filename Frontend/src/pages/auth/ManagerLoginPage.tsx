import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { managerAuthService } from '../../api/services/managerAuth.service';
import { Building2, Lock, Mail, ArrowRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await managerAuthService.login({ email, password });
      
      if (response.status === 'success' && response.data) {
        setAuth(
          {
            id: response.data.manager.id,
            role: 'manager',
            name: response.data.manager.name,
            email: response.data.manager.email,
          },
          response.data.accessToken,
          response.data.refreshToken
        );
        toast.success('Welcome to Operations Control');
        navigate('/manager/dashboard');
      }
    } catch (error: any) {
      // Handled globally by apiClient, but we can stop loading
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Industrial Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Activity className="h-8 w-8 text-stone-900" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-stone-900 uppercase tracking-wider">
          Operations Center
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          Manager Authentication Gateway
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-black/5 sm:rounded-xl sm:px-10 border border-stone-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Official Email
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-500" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 rounded-lg border-0 py-2.5 bg-stone-50 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-200 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6 placeholder-stone-400"
                  placeholder="manager@vasanthi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">
                Access Code / Password
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-500" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 rounded-lg border-0 py-2.5 bg-stone-50 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-200 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6 placeholder-stone-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-amber-500 px-3 py-3 text-sm font-bold text-stone-900 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-70 transition-all uppercase tracking-wide"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-stone-900" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Establish Link
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-stone-500 flex items-center justify-center gap-1">
              <Building2 className="w-3 h-3" /> Unauthorized access is strictly prohibited
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerLoginPage;
