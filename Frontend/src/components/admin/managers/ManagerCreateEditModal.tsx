import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminManagerService } from '../../../api/services/adminManager.service';
import type { ManagerAdmin } from '../../../api/services/adminManager.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  manager?: ManagerAdmin | null;
}

const PREDEFINED_BRANCHES = [
  { id: 'BR-MAIN', name: 'Main Boutique', code: 'HQ-01' },
  { id: 'BR-WORKSHOP-A', name: 'Workshop Alpha', code: 'WS-A' },
  { id: 'BR-WORKSHOP-B', name: 'Workshop Beta', code: 'WS-B' },
  { id: 'BR-REMOTE', name: 'Remote Hub', code: 'REM-01' }
];

const MANAGER_ROLES = [
  { value: 'FLOOR_MANAGER', label: 'Floor Manager' },
  { value: 'PRODUCTION_LEAD', label: 'Production Lead' },
  { value: 'QUALITY_INSPECTOR', label: 'Quality Inspector' },
  { value: 'STORE_MANAGER', label: 'Store Manager' }
];

const DEPARTMENTS = [
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'QUALITY_CONTROL', label: 'Quality Control' },
  { value: 'GENERAL', label: 'General / Store' }
];

const ManagerCreateEditModal: React.FC<Props> = ({ isOpen, onClose, manager }) => {
  const isEdit = !!manager;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    managerType: 'FLOOR_MANAGER',
    department: 'PRODUCTION',
    branchId: PREDEFINED_BRANCHES[0].id,
    branchName: PREDEFINED_BRANCHES[0].name,
  });

  useEffect(() => {
    if (manager) {
      setFormData({
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        password: '', // Hidden for edit
        managerType: manager.managerType || 'FLOOR_MANAGER',
        department: manager.department || 'PRODUCTION',
        branchId: manager.branchId || PREDEFINED_BRANCHES[0].id,
        branchName: manager.branchName || PREDEFINED_BRANCHES[0].name,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        managerType: 'FLOOR_MANAGER',
        department: 'PRODUCTION',
        branchId: PREDEFINED_BRANCHES[0].id,
        branchName: PREDEFINED_BRANCHES[0].name,
      });
    }
  }, [manager, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit 
      ? adminManagerService.updateManager(manager!._id, data)
      : adminManagerService.createManager(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminManagers'] });
      toast.success(isEdit ? 'Manager updated successfully' : 'Manager created successfully');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !formData.password) {
      toast.error('Password is required for new managers');
      return;
    }

    if (!isEdit && formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const payload: any = { ...formData };
    if (isEdit) {
      delete payload.password; // Admin uses separate reset flow for existing
      delete payload.email; // Email typically non-editable
    }

    mutation.mutate(payload);
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = PREDEFINED_BRANCHES.find(b => b.id === e.target.value);
    if (selected) {
      setFormData({ ...formData, branchId: selected.id, branchName: selected.name });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Shield size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Manager Account' : 'Create Manager Account'}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="manager-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                <input required disabled={isEdit} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none ${isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} />
                {isEdit && <p className="text-xs text-gray-400 mt-1">Email cannot be changed after creation.</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              
              {!isEdit && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Initial Password *</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Min 8 characters" />
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Role & Assignment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Branch / Workshop</label>
                  <select 
                    value={formData.branchId} 
                    onChange={handleBranchChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                  >
                    {PREDEFINED_BRANCHES.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Manager Type</label>
                  <select 
                    value={formData.managerType} 
                    onChange={e => setFormData({...formData, managerType: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                  >
                    {MANAGER_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                  <select 
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {isEdit && (
              <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 mt-4">
                <Shield className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-sm text-blue-800">
                  To reset this manager's password, use the secure <strong>Reset Password</strong> option from the main managers table.
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
          <button onClick={onClose} disabled={mutation.isPending} className="px-4 py-2 font-semibold text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button form="manager-form" type="submit" disabled={mutation.isPending} className="px-6 py-2 font-semibold text-white bg-blue-700 rounded hover:bg-blue-800 transition-colors disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Manager' : 'Create Manager'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ManagerCreateEditModal;
