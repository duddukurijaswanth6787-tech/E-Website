import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
// Extraneous icons removed
import toast from 'react-hot-toast';

const UserSettings = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate updating API execution
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile settings updated successfully!');
    }, 1000);
  };

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <h1 className="text-2xl font-serif text-primary-950 mb-8">Profile Settings</h1>
      
      <div className="max-w-2xl bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-100">
            <div className="w-20 h-20 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
              {formData.name.substring(0,2)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{user?.name}</h3>
              <p className="text-gray-500 text-sm">Customer</p>
            </div>
          </div>
        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              disabled
              className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email address cannot be changed. Contact support for help.</p>
          </div>

          <div className="pt-4 mt-8 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto bg-primary-950 text-white font-bold uppercase tracking-widest px-8 py-3.5 rounded hover:bg-primary-800 transition-colors shadow-soft disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="max-w-2xl mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
         <h3 className="font-semibold text-gray-900 mb-2">Password Management</h3>
         <p className="text-sm text-gray-600 mb-4">Protect your account using a strong password.</p>
         <button className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 font-semibold text-sm px-6 py-2.5 rounded hover:bg-gray-50 hover:text-primary-800 transition-colors">
            Reset Password
         </button>
      </div>
    </div>
  );
};

export default UserSettings;
