import React, { useState } from 'react';
import { userService } from '../../api/services/user.service';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/common/Input';
import { Settings, Save, Key, Globe, Layout, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { StorefrontSettingsTab } from './StorefrontSettingsTab';

const AdminSettingsPage = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('STOREFRONT');

  // Customer Profile Settings Bindings bridging the /users/profile GAP
  const [profileForm, setProfileForm] = useState({
     name: user?.name || '',
     mobile: '',
  });

  const handleProfileSave = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     try {
        const res = await userService.updateProfile(profileForm);
        if (res.data?.success && res.data?.data) {
           updateUser(res.data.data);
           toast.success("Profile matrix synced securely.");
        }
     } catch (e: any) {
        toast.error("Failed to mutate Profile structure.");
     } finally {
        setLoading(false);
     }
  };

  const AdminTab = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors border-l-4 ${
        activeTab === id 
        ? 'bg-primary-50 text-primary-900 border-primary-700' 
        : 'text-gray-600 hover:bg-gray-50 border-transparent hover:border-gray-300'
      }`}
    >
      <Icon size={18} className={activeTab === id ? 'text-primary-700' : 'text-gray-400'} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
          <Settings className="w-6 h-6 mr-3 text-primary-700" /> Platform Architecture Config
        </h1>
        <p className="text-sm text-[var(--admin-text-secondary)]">Manage deep application-level parameters, system behaviors, and credential routing.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Axis */}
        <div className="md:w-64 flex-shrink-0 bg-[var(--admin-card)] border border-gray-200 rounded-lg overflow-hidden h-fit">
           <AdminTab id="STOREFRONT" label="Homepage Layout" icon={Layout} />
           <AdminTab id="THEME" label="UI & Aesthetics" icon={Layout} />
           <AdminTab id="PROFILE" label="Admin Profile" icon={User} />
           <AdminTab id="GLOBAL" label="Global Variables" icon={Globe} />
           <AdminTab id="SECRETS" label="Auth & Secrets" icon={Key} />
        </div>

        {/* Dynamic Frame Context */}
        <div className="flex-grow bg-[var(--admin-card)] border border-gray-200 rounded-lg p-6">
           {activeTab === 'PROFILE' && (
             <form onSubmit={handleProfileSave} className="space-y-6 max-w-xl">
               <h2 className="text-lg font-serif text-gray-900 mb-4 pb-2 border-b">SuperUser Access Configuration</h2>
               
               <div className="space-y-4">
                  <div>
                    <Input
                      label="Authorization Alias"
                      value={profileForm.name}
                      onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Input
                      label="Encrypted Root Email (Read Only)"
                      type="email"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                  <div>
                    <Input
                      label="Administrative Role Access"
                      value={(user?.role || '').toUpperCase()}
                      disabled
                      className="font-bold tracking-widest"
                    />
                  </div>
                </div>

               <div className="pt-4 border-t">
                 <button 
                   type="submit"
                   disabled={loading}
                   className="flex items-center px-6 py-2.5 bg-primary-950 text-[var(--admin-text-primary)] text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors disabled:opacity-50"
                 >
                   {loading ? (
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                   ) : <Save size={16} className="mr-2" />}
                   Patch Overrides
                 </button>
               </div>
             </form>
           )}

           {activeTab === 'STOREFRONT' && (
              <StorefrontSettingsTab />
           )}

           {activeTab !== 'PROFILE' && activeTab !== 'STOREFRONT' && (
             <div className="h-64 flex flex-col items-center justify-center text-center">
                 <Settings className="w-12 h-12 text-gray-300 mb-3 animate-[spin_10s_linear_infinite]" />
                 <h3 className="text-gray-900 font-medium">Integration Pathway Offline</h3>
                 <p className="text-[var(--admin-text-secondary)] text-sm mt-1 max-w-sm">The <code>{activeTab}</code> configuration routing nodes are pending downstream backend scalar APIs mapping. Functionality gracefully stubbed.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;


