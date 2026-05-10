import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
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
            <div className="w-20 h-20 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-2xl font-bold uppercase">{formData.name.substring(0,2)}</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{user?.name}</h3>
              <p className="text-gray-500 text-sm">Customer</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-gray-300 rounded px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input type="email" value={formData.email} disabled className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-sm text-gray-500 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary-950 text-white font-bold uppercase py-3.5 px-8 rounded">{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;
