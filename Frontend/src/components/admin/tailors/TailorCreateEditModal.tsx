import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTailorService } from '../../../api/services/adminTailor.service';
import type { TailorAdmin } from '../../../api/services/adminTailor.service';

interface TailorCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tailor?: TailorAdmin | null;
}

const TailorCreateEditModal = ({ isOpen, onClose, tailor }: TailorCreateEditModalProps) => {
  const isEdit = !!tailor;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: [] as string[],
    experienceYears: 0,
    dailyCapacity: 5,
  });

  useEffect(() => {
    if (tailor) {
      setFormData({
        name: tailor.name,
        email: tailor.email,
        phone: tailor.phone,
        password: '',
        specialization: tailor.specialization || [],
        experienceYears: tailor.experienceYears || 0,
        dailyCapacity: tailor.dailyCapacity || 5,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        specialization: [],
        experienceYears: 0,
        dailyCapacity: 5,
      });
    }
  }, [tailor, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit 
      ? adminTailorService.updateTailor(tailor!._id, data)
      : adminTailorService.createTailor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTailors'] });
      toast.success(isEdit ? 'Tailor updated successfully' : 'Tailor created successfully');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !formData.password) {
      toast.error('Password is required for new tailors');
      return;
    }

    const payload: any = { ...formData };
    if (isEdit && !payload.password) {
      delete payload.password; // Don't send empty password on update
    }

    mutation.mutate(payload);
  };

  const handleSpecToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  const specOptions = ['Blouse', 'Lehenga', 'Embroidery', 'Alteration', 'General'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Tailor Profile' : 'Add New Tailor'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="tailor-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {isEdit ? 'Reset Password (optional)' : 'Initial Password *'}
                </label>
                <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none" />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Operational Capacity</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Experience (Years)</label>
                  <input type="number" min="0" value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Daily Capacity (Tasks)</label>
                  <input type="number" min="1" value={formData.dailyCapacity} onChange={e => setFormData({...formData, dailyCapacity: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {specOptions.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleSpecToggle(spec)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                        formData.specialization.includes(spec)
                          ? 'bg-primary-900 text-white border-primary-900'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
          <button onClick={onClose} disabled={mutation.isPending} className="px-4 py-2 font-semibold text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button form="tailor-form" type="submit" disabled={mutation.isPending} className="px-6 py-2 font-semibold text-white bg-primary-900 rounded hover:bg-primary-950 transition-colors disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Tailor' : 'Create Tailor'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TailorCreateEditModal;
