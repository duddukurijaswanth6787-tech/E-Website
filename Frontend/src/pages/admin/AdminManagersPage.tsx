import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, Edit2, Ban, CheckCircle, Key, Eye, Search, Filter, Trash2 } from 'lucide-react';
import { adminManagerService } from '../../api/services/adminManager.service';
import type { ManagerAdmin } from '../../api/services/adminManager.service';
import ManagerCreateEditModal from '../../components/admin/managers/ManagerCreateEditModal';
import ResetManagerPasswordModal from '../../components/admin/managers/ResetManagerPasswordModal';
import ManagerDetailsDrawer from '../../components/admin/managers/ManagerDetailsDrawer';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const PREDEFINED_BRANCHES = [
  { id: 'BR-MAIN', name: 'Main Boutique' },
  { id: 'BR-WORKSHOP-A', name: 'Workshop Alpha' },
  { id: 'BR-WORKSHOP-B', name: 'Workshop Beta' },
  { id: 'BR-REMOTE', name: 'Remote Hub' }
];

const AdminManagersPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<ManagerAdmin | null>(null);
  
  // Filtering states
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [roleFilter] = useState('');
  
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isSuperAdmin = user?.role === 'super_admin';

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminManagers', branchFilter, roleFilter, search],
    queryFn: () => adminManagerService.getAllManagers({ 
      branchId: branchFilter || undefined, 
      managerType: roleFilter || undefined,
      search: search || undefined
    }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      adminManagerService.updateManagerStatus(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminManagers'] });
      toast.success('Manager status updated');
    },
    onError: () => toast.error('Failed to update manager status')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminManagerService.deleteManager(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminManagers'] });
      toast.success('Manager account deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete manager');
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete manager "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const managers = response?.data?.managers || [];
  const activeCount = managers.filter(m => m.isActive).length;

  const handleEdit = (manager: ManagerAdmin) => {
    setSelectedManager(manager);
    setIsCreateModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedManager(null);
    setIsCreateModalOpen(true);
  };

  const handleResetPassword = (manager: ManagerAdmin) => {
    setSelectedManager(manager);
    setIsResetModalOpen(true);
  };

  const handleViewDetails = (manager: ManagerAdmin) => {
    setSelectedManager(manager);
    setIsDetailsOpen(true);
  };

  const isOnline = (lastActiveAt?: string) => {
    if (!lastActiveAt) return false;
    const lastActive = new Date(lastActiveAt).getTime();
    const now = new Date().getTime();
    return (now - lastActive) < 5 * 60 * 1000; // 5 mins
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manager Accounts</h1>
          <p className="text-sm text-[var(--admin-text-secondary)] mt-1 font-medium">Enterprise command center for workshop operational leaders.</p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={handleCreate}
            className="mt-4 sm:mt-0 bg-blue-700 text-[var(--admin-text-primary)] px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-800 transition-all shadow-sm flex items-center"
          >
            <Plus size={18} className="mr-2" /> Add New Manager
          </button>
        )}
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--admin-card)] p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600 mr-4"><Shield size={20} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Leaders</p><p className="text-2xl font-bold text-gray-900">{managers.length}</p></div>
        </div>
        <div className="bg-[var(--admin-card)] p-5 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600 mr-4"><CheckCircle size={20} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Status</p><p className="text-2xl font-bold text-gray-900">{activeCount}</p></div>
        </div>
        <div className="md:col-span-2 bg-[var(--admin-card)] p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or code..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 border-l pl-3 border-gray-100">
             <Filter size={18} className="text-gray-400" />
             <select 
               className="bg-transparent text-sm font-semibold text-gray-600 outline-none"
               value={branchFilter}
               onChange={(e) => setBranchFilter(e.target.value)}
             >
               <option value="">All Branches</option>
               {PREDEFINED_BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
             </select>
          </div>
        </div>
      </div>

      <div className="bg-[var(--admin-card)] rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Operational Leader</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Branch Assignment</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Operational Role</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--admin-card)] divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading managers...</td></tr>
              ) : managers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No managers found matching criteria.</td></tr>
              ) : (
                managers.map((manager) => (
                  <tr key={manager._id} className={!manager.isActive ? 'bg-gray-50/50 grayscale' : 'hover:bg-blue-50/30 transition-all cursor-pointer'} onClick={() => handleViewDetails(manager)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-xl bg-blue-600 text-[var(--admin-text-primary)] flex items-center justify-center font-bold text-sm shadow-sm">
                            {manager.name.charAt(0)}
                          </div>
                          {isOnline(manager.lastLoginAt) && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" title="Online now" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{manager.name}</div>
                          <div className="text-xs text-[var(--admin-text-secondary)] font-medium flex items-center">
                            {manager.managerCode} • {manager.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{manager.branchName || 'GLOBAL'}</div>
                      <div className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Dept: {manager.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                        {manager.managerType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${manager.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {manager.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                       {isSuperAdmin ? (
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => handleViewDetails(manager)} className="text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 p-2 rounded-lg transition-all" title="View Audit">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleResetPassword(manager)} className="text-amber-600 hover:text-amber-900 bg-amber-50 p-2 rounded-lg transition-all" title="Secure Reset">
                              <Key size={16} />
                            </button>
                            <button onClick={() => handleEdit(manager)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition-all" title="Edit Profile">
                              <Edit2 size={16} />
                            </button>
                             <button 
                               onClick={() => toggleStatusMutation.mutate({ id: manager._id, isActive: !manager.isActive })} 
                               className={`${manager.isActive ? 'text-amber-600 hover:text-amber-900 bg-amber-50' : 'text-emerald-600 hover:text-emerald-900 bg-emerald-50'} p-2 rounded-lg transition-all`}
                               title={manager.isActive ? 'Suspend' : 'Activate'}
                             >
                               {manager.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                             </button>
                             <button 
                               onClick={() => handleDelete(manager._id, manager.name)} 
                               className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition-all" 
                               title="Delete Permanently"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                       ) : (
                          <button onClick={() => handleViewDetails(manager)} className="text-gray-400 hover:text-blue-600 flex items-center ml-auto font-black text-[10px] uppercase tracking-widest">
                            <Eye size={14} className="mr-1" /> View Audit
                          </button>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <ManagerCreateEditModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          manager={selectedManager}
        />
      )}

      {isResetModalOpen && selectedManager && (
        <ResetManagerPasswordModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          manager={selectedManager}
        />
      )}

      {isDetailsOpen && selectedManager && (
        <ManagerDetailsDrawer
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          manager={selectedManager}
        />
      )}
    </div>
  );
};

export default AdminManagersPage;


