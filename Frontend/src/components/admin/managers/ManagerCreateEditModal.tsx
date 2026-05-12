import React, { useEffect } from 'react';
import { X, Shield, User, Mail, Phone, Lock, Briefcase, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminManagerService } from '../../../api/services/adminManager.service';
import type { ManagerAdmin } from '../../../api/services/adminManager.service';
import { Input } from '../../common/Input';
import { useValidation } from '../../../utils/validation/useValidation';

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

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    setValues
  } = useValidation({
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
      setValues({
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        password: '',
        managerType: manager.managerType || 'FLOOR_MANAGER',
        department: manager.department || 'PRODUCTION',
        branchId: manager.branchId || PREDEFINED_BRANCHES[0].id,
        branchName: manager.branchName || PREDEFINED_BRANCHES[0].name,
      });
    } else {
      setValues({
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
  }, [manager, isOpen, setValues]);

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
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    const payload: any = { ...values };
    if (isEdit) {
      delete payload.password;
      delete payload.email;
    }

    mutation.mutate(payload);
  };

  const onBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = PREDEFINED_BRANCHES.find(b => b.id === e.target.value);
    if (selected) {
      setValues((prev: any) => ({ ...prev, branchId: selected.id, branchName: selected.name }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center px-10 py-8 border-b border-stone-50 bg-stone-50/50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center shadow-inner">
              <Shield size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-stone-950">{isEdit ? 'Edit Operational Leader' : 'Enlist New Manager'}</h2>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mt-1">Workforce Authority Console</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-stone-400 hover:text-stone-950 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-10 flex-1 custom-scrollbar">
          <form id="manager-form" onSubmit={handleSubmit} className="space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Full Legal Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name ? errors.name : ''}
                success={touched.name && !errors.name}
                leftIcon={<User size={18} />}
                placeholder="Manager's Name"
                required
              />
              <Input
                label="Corporate Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : ''}
                success={touched.email && !errors.email}
                disabled={isEdit}
                leftIcon={<Mail size={18} />}
                placeholder="staff@vasanthicreations.com"
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phone ? errors.phone : ''}
                success={touched.phone && !errors.phone}
                leftIcon={<Phone size={18} />}
                placeholder="10-digit mobile"
                required
                maxLength={10}
              />
              
              {!isEdit && (
                <Input
                  label="Initial Password"
                  name="password"
                  type="text"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password ? errors.password : ''}
                  success={touched.password && !errors.password && values.password.length > 0}
                  leftIcon={<Lock size={18} />}
                  placeholder="Strong access key"
                  required
                />
              )}
            </div>

            <div className="pt-8 border-t border-stone-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
                  <Briefcase size={16} />
                </div>
                <h3 className="text-xs font-black text-stone-500 uppercase tracking-[0.2em]">Assignment & Permissions</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Workshop Branch</label>
                  <div className="relative">
                    <select 
                      value={values.branchId} 
                      onChange={onBranchChange} 
                      className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                    >
                      {PREDEFINED_BRANCHES.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                    <Building size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Leadership Type</label>
                  <div className="relative">
                    <select 
                      name="managerType"
                      value={values.managerType} 
                      onChange={handleChange} 
                      className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                    >
                      {MANAGER_ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <Shield size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Target Department</label>
                  <div className="relative">
                    <select 
                      name="department"
                      value={values.department} 
                      onChange={handleChange} 
                      className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                    <Briefcase size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            
            {isEdit && (
              <div className="bg-blue-50/50 p-6 rounded-[1.5rem] border border-blue-100 flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Shield size={18} />
                </div>
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  Authentication protocols: To reset this leader's access key, please use the secure <strong className="text-blue-900">Reset Password</strong> terminal in the primary management matrix.
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-stone-50 bg-stone-50/50 flex justify-end gap-4">
          <button 
            onClick={onClose} 
            disabled={mutation.isPending} 
            className="px-8 py-4 border border-stone-200 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-stone-600 hover:bg-white hover:text-stone-950 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            form="manager-form" 
            type="submit" 
            disabled={mutation.isPending} 
            className="px-10 py-4 bg-stone-950 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-stone-800 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center min-w-[200px]"
          >
            {mutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : isEdit ? 'Authorize Update' : 'Initialize Leader'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ManagerCreateEditModal;
