import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Activity, Edit2, Ban, CheckCircle, Users, Trash2 } from 'lucide-react';
import { adminTailorService } from '../../api/services/adminTailor.service';
import type { TailorAdmin } from '../../api/services/adminTailor.service';
import TailorCreateEditModal from '../../components/admin/tailors/TailorCreateEditModal';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const getWorkloadIndicator = (assigned: number, capacity: number) => {
  const ratio = capacity > 0 ? assigned / capacity : 1;
  if (ratio >= 1) return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">OVERLOADED</span>;
  if (ratio > 0.6) return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded">MEDIUM LOAD</span>;
  return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">LOW LOAD</span>;
};

const getAvailabilityColor = (tailor: TailorAdmin) => {
  if (!tailor.isActive) return 'bg-gray-100 text-[var(--admin-text-secondary)]';
  if (!tailor.isAvailable) return 'bg-amber-100 text-amber-700';
  if (tailor.currentAssignedCount >= tailor.dailyCapacity) return 'bg-red-100 text-red-700';
  return 'bg-emerald-100 text-emerald-700';
};

const getAvailabilityText = (tailor: TailorAdmin) => {
  if (!tailor.isActive) return 'Disabled';
  if (!tailor.isAvailable) return 'Busy / Leave';
  if (tailor.currentAssignedCount >= tailor.dailyCapacity) return 'Max Capacity';
  return 'Available';
};

const AdminTailorsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTailor, setSelectedTailor] = useState<TailorAdmin | null>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const isSuperAdmin = user?.role === 'super_admin';

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminTailors'],
    queryFn: () => adminTailorService.getAllTailors(),
    refetchInterval: 60000, // Poll every minute for workload changes
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      adminTailorService.updateTailorStatus(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTailors'] });
      toast.success('Tailor status updated');
    },
    onError: () => toast.error('Failed to update tailor status')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminTailorService.deleteTailor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTailors'] });
      toast.success('Tailor account deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete tailor');
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete tailor "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const tailors = response?.data?.tailors || [];

  const handleEdit = (tailor: TailorAdmin) => {
    setSelectedTailor(tailor);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedTailor(null);
    setIsModalOpen(true);
  };

  const activeCount = tailors.filter(t => t.isActive && t.isAvailable).length;
  const totalAssigned = tailors.reduce((acc, t) => acc + t.currentAssignedCount, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tailors Team</h1>
          <p className="text-sm text-[var(--admin-text-secondary)] mt-1">Manage production personnel and daily workloads.</p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={handleCreate}
            className="mt-4 sm:mt-0 bg-primary-900 text-[var(--admin-text-primary)] px-4 py-2 rounded font-semibold text-sm hover:bg-primary-950 transition-colors flex items-center"
          >
            <Plus size={16} className="mr-2" /> Add Tailor
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--admin-card)] p-5 rounded-lg border border-gray-200 shadow-sm flex items-center">
          <div className="bg-blue-50 p-3 rounded-md text-blue-600 mr-4"><Users size={20} /></div>
          <div><p className="text-sm font-semibold text-[var(--admin-text-secondary)]">Total Tailors</p><p className="text-2xl font-bold text-gray-900">{tailors.length}</p></div>
        </div>
        <div className="bg-[var(--admin-card)] p-5 rounded-lg border border-gray-200 shadow-sm flex items-center">
          <div className="bg-emerald-50 p-3 rounded-md text-emerald-600 mr-4"><CheckCircle size={20} /></div>
          <div><p className="text-sm font-semibold text-[var(--admin-text-secondary)]">Available Now</p><p className="text-2xl font-bold text-gray-900">{activeCount}</p></div>
        </div>
        <div className="bg-[var(--admin-card)] p-5 rounded-lg border border-gray-200 shadow-sm flex items-center">
          <div className="bg-amber-50 p-3 rounded-md text-amber-600 mr-4"><Activity size={20} /></div>
          <div><p className="text-sm font-semibold text-[var(--admin-text-secondary)]">Active Workflows</p><p className="text-2xl font-bold text-gray-900">{totalAssigned}</p></div>
        </div>
      </div>

      <div className="bg-[var(--admin-card)] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Tailor</th>
                <th className="px-6 py-4 text-left text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Workload</th>
                <th className="px-6 py-4 text-left text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Specialization</th>
                <th className="px-6 py-4 text-right text-xs font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--admin-card)] divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--admin-text-secondary)]">Loading production team...</td></tr>
              ) : tailors.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--admin-text-secondary)]">No tailors found. Add one to begin production.</td></tr>
              ) : (
                tailors.map((tailor) => (
                  <tr key={tailor._id} className={!tailor.isActive ? 'bg-gray-50/50' : 'hover:bg-gray-50 transition-colors'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {tailor.profileImage ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={tailor.profileImage} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-900 text-[var(--admin-text-primary)] flex items-center justify-center font-bold">
                              {tailor.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{tailor.name}</div>
                          <div className="text-xs text-[var(--admin-text-secondary)] font-medium">{tailor.tailorCode} • {tailor.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full border ${getAvailabilityColor(tailor)} border-opacity-50`}>
                        {getAvailabilityText(tailor)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-black text-gray-900">{tailor.currentAssignedCount}<span className="text-xs font-semibold text-gray-400">/{tailor.dailyCapacity}</span></div>
                        <div className="mt-1">{getWorkloadIndicator(tailor.currentAssignedCount, tailor.dailyCapacity)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {tailor.specialization.map(spec => (
                          <span key={spec} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">{spec}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       {isSuperAdmin ? (
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => handleEdit(tailor)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded transition-colors" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => toggleStatusMutation.mutate({ id: tailor._id, isActive: !tailor.isActive })} 
                              className={`${tailor.isActive ? 'text-amber-600 hover:text-amber-900 bg-amber-50' : 'text-emerald-600 hover:text-emerald-900 bg-emerald-50'} p-2 rounded transition-colors`}
                              title={tailor.isActive ? 'Disable' : 'Enable'}
                            >
                              {tailor.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button 
                              onClick={() => handleDelete(tailor._id, tailor.name)} 
                              className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded transition-colors" 
                              title="Delete Permanently"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                       ) : (
                          <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">View Only</span>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <TailorCreateEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tailor={selectedTailor}
        />
      )}
    </div>
  );
};

export default AdminTailorsPage;


