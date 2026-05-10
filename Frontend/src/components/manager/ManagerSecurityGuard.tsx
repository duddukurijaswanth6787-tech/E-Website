import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { managerAuthService } from '../../api/services/managerAuth.service';
import { ShieldAlert, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  children: React.ReactNode;
}

const ManagerSecurityGuard: React.FC<Props> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If not a manager or doesn't need to change password, just render children
  if (user?.role !== 'manager' || !user?.mustChangePassword) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await managerAuthService.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully. Please log in again.');
      // After password change, backend revokes refresh tokens, so we should log out
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-amber-500 p-8 text-center text-stone-900">
          <div className="inline-flex p-4 bg-black/10 rounded-full mb-4">
            <ShieldAlert size={48} className="animate-bounce" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Security Action Required</h2>
          <p className="text-sm font-medium opacity-80 mt-1">For your security, you must update your temporary password before accessing the Ops Center.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-stone-500 uppercase tracking-widest mb-2">Current Temporary Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border-stone-200 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div>
                <label className="block text-xs font-black text-stone-500 uppercase tracking-widest mb-2">New Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border-stone-200 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border-stone-200 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-stone-900 text-amber-500 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? 'Updating Security...' : (
                <>
                  Secure My Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full text-xs font-bold text-stone-400 hover:text-stone-600 uppercase tracking-widest transition-colors"
            >
              Sign Out and return later
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerSecurityGuard;
