import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { addressService } from '../../api/services/address.service';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddressFormModal = ({ isOpen, onClose, onSuccess }: AddressFormModalProps) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home',
    landmark: '',
    altMobile: '',
    deliveryInstructions: ''
  });

  // Auto-fill from user profile when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        mobile: prev.mobile || user.mobile || ''
      }));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) return toast.error('Full Name is required');
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      return toast.error('Enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
    }
    if (!formData.line1.trim()) return toast.error('House / Flat details are required');
    if (!formData.line2.trim()) return toast.error('Street / Area details are required');
    if (!formData.city.trim()) return toast.error('City is required');
    if (!formData.state.trim()) return toast.error('State is required');
    if (!/^\d{6}$/.test(formData.pincode)) {
      return toast.error('Enter a valid 6-digit Pincode');
    }
    if (formData.altMobile && !/^[6-9]\d{9}$/.test(formData.altMobile)) {
       return toast.error('Alternate mobile must be a valid 10-digit number');
    }

    setLoading(true);
    try {
      await addressService.addAddress(formData);
      toast.success('Address saved successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm sm:items-center sm:p-0">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up sm:animate-scale-in relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-xl font-serif text-primary-950">Delivery Address</h2>
            <p className="text-xs text-gray-500 mt-0.5">Where should we deliver your order?</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="address-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 border-b pb-2">Contact Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter receiver full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number *</label>
                  <input 
                    type="tel" 
                    name="mobile" 
                    maxLength={10}
                    value={formData.mobile} 
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 border-b pb-2">Address Details</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 1 (House No, Flat No) *</label>
                <input 
                  type="text" 
                  name="line1" 
                  value={formData.line1} 
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="House No, Flat No, Building Name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 2 (Street, Area) *</label>
                <input 
                  type="text" 
                  name="line2" 
                  value={formData.line2} 
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Street, Area, Locality"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Landmark (Optional)</label>
                <input 
                  type="text" 
                  name="landmark" 
                  value={formData.landmark} 
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Near temple, school, mall, etc."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Hyderabad"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Telangana"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode *</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    maxLength={6}
                    value={formData.pincode} 
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="500001"
                  />
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 border-b pb-2">Preferences</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Address Type *</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="home">Home (All Day Delivery)</option>
                    <option value="work">Work (Between 10am - 6pm)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Alternate Mobile (Optional)</label>
                  <input 
                    type="tel" 
                    name="altMobile"
                    maxLength={10} 
                    value={formData.altMobile} 
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Another 10-digit number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Instructions (Optional)</label>
                <textarea 
                  name="deliveryInstructions" 
                  value={formData.deliveryInstructions} 
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                  placeholder="Call before delivery / Leave at security"
                />
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="address-form"
            disabled={loading}
            className="px-8 py-2.5 bg-primary-950 text-white rounded font-bold uppercase tracking-widest text-sm hover:bg-primary-800 focus:ring-2 focus:ring-offset-2 focus:ring-primary-900 transition-colors disabled:opacity-70 flex items-center justify-center min-w-[160px]"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Save Address'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
