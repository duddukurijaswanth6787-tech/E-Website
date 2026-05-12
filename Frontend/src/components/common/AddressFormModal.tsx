import { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, Landmark, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { addressService } from '../../api/services/address.service';
import { Input } from './Input';
import { useValidation } from '../../utils/validation/useValidation';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddressFormModal = ({ isOpen, onClose, onSuccess }: AddressFormModalProps) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (isOpen && user) {
      setValues((prev: any) => ({
        ...prev,
        name: prev.name || user.name || '',
        mobile: prev.mobile || user.mobile || ''
      }));
    }
  }, [isOpen, user, setValues]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the address form');
      return;
    }

    setLoading(true);
    try {
      await addressService.addAddress(values);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-stone-50 bg-stone-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-stone-950">Shipping Details</h2>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider mt-0.5">Bespoke Delivery Destination</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-stone-400 hover:text-stone-950 rounded-2xl hover:bg-white hover:shadow-sm transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form id="address-form" onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Receiver Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name ? errors.name : ''}
                success={touched.name && !errors.name}
                leftIcon={<User size={18} />}
                placeholder="Full Name"
                required
              />
              <Input
                label="Mobile Number"
                name="mobile"
                type="tel"
                value={values.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.mobile ? errors.mobile : ''}
                success={touched.mobile && !errors.mobile}
                leftIcon={<Phone size={18} />}
                placeholder="10-digit number"
                required
                maxLength={10}
              />
            </div>

            <div className="space-y-6">
              <Input
                label="Flat / House / Building"
                name="line1"
                value={values.line1}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.line1 ? errors.line1 : ''}
                leftIcon={<Landmark size={18} />}
                placeholder="Address Line 1"
                required
              />
              <Input
                label="Street / Area / Locality"
                name="line2"
                value={values.line2}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.line2 ? errors.line2 : ''}
                leftIcon={<MapPin size={18} />}
                placeholder="Address Line 2"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input
                label="City"
                name="city"
                value={values.city}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.city ? errors.city : ''}
                placeholder="City"
                required
              />
              <Input
                label="State"
                name="state"
                value={values.state}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.state ? errors.state : ''}
                placeholder="State"
                required
              />
              <Input
                label="Pincode"
                name="pincode"
                value={values.pincode}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.pincode ? errors.pincode : ''}
                success={touched.pincode && !errors.pincode}
                placeholder="6-digit PIN"
                required
                maxLength={6}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="w-full">
                <label className="block text-xs font-black text-stone-500 uppercase tracking-widest mb-1.5 ml-1">Address Type</label>
                <select 
                  name="type" 
                  value={values.type} 
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="home">🏠 Home (All Day)</option>
                  <option value="work">🏢 Work (10am - 6pm)</option>
                  <option value="other">📍 Other</option>
                </select>
              </div>
              <Input
                label="Alternate Mobile"
                name="altMobile"
                type="tel"
                value={values.altMobile}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.altMobile ? errors.altMobile : ''}
                leftIcon={<Phone size={18} />}
                placeholder="Optional 10-digit"
                maxLength={10}
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-black text-stone-500 uppercase tracking-widest mb-1.5 ml-1">Delivery Instructions</label>
              <textarea 
                name="deliveryInstructions" 
                value={values.deliveryInstructions} 
                onChange={handleChange}
                rows={3}
                className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none placeholder-stone-400"
                placeholder="Special notes for our delivery team..."
              />
              <Truck size={18} className="absolute top-10 right-5 text-stone-300" />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-stone-50 bg-stone-50/50 flex flex-col sm:flex-row justify-end gap-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-8 py-4 border border-stone-200 rounded-2xl font-bold uppercase tracking-widest text-xs text-stone-600 hover:bg-white hover:text-stone-950 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="address-form"
            disabled={loading}
            className="px-10 py-4 bg-stone-950 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-stone-800 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center min-w-[200px]"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Save Destination'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
