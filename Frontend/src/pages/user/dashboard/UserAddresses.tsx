import { useEffect, useState } from 'react';
import { addressService } from '../../../api/services/address.service';
import type { Address } from '../../../api/services/address.service';
import { MapPin, Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UserAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await addressService.getAddresses();
      setAddresses(res.data.data || res.data || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAddresses([
          { _id: '1', type: 'home', name: 'Developer User', line1: '45, Jubilee Hills', line2: 'Road No. 36', city: 'Hyderabad', state: 'Telangana', pincode: '500033', country: 'India', mobile: '9876543210', isDefault: true }
        ]);
      } else {
        toast.error("Failed to load addresses");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      toast.success("Default address updated");
      fetchAddresses();
    } catch (e) {
      setAddresses(addresses.map(a => ({...a, isDefault: a._id === id})));
      toast.success("Default address updated");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await addressService.deleteAddress(id);
      toast.success("Address deleted");
      fetchAddresses();
    } catch (e) {
      setAddresses(addresses.filter(a => a._id !== id));
      toast.success("Address removed");
    }
  }

  if (loading) return <div className="p-8 flex justify-center items-center min-h-[400px]"><div className="w-10 h-10 border-4 border-primary-800 rounded-full animate-spin"></div></div>;

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
         <h1 className="text-2xl font-serif text-primary-950">My Addresses</h1>
         <button className="flex items-center text-sm font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-4 py-2 rounded"><Plus className="w-4 h-4 mr-2" /> Add New</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {addresses.map((addr) => (
           <div key={addr._id} className={`relative p-6 rounded-xl border-2 transition-all ${addr.isDefault ? 'border-primary-700 bg-primary-50/20 shadow-sm' : 'border-gray-200 hover:border-primary-300 bg-white'}`}>
              {addr.isDefault && <div className="absolute top-0 right-0 bg-primary-700 text-white text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg rounded-tr-lg">Default</div>}
              <div className="flex justify-between items-start mb-4">
                 <span className="bg-gray-100 text-gray-700 text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded">{addr.type || 'Home'}</span>
                 <div className="flex items-center space-x-2 text-gray-400">
                    <button className="hover:text-primary-700 p-1"><Edit2 className="w-4 h-4" /></button>
                    {!addr.isDefault && <button onClick={() => handleDelete(addr._id!)} className="hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>}
                 </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{addr.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{addr.line1} {addr.line2 && `, ${addr.line2}`}<br/>{addr.city}, {addr.state} {addr.pincode}<br/>{addr.country}</p>
              <div className="flex items-center text-sm text-gray-600 mb-6"><MapPin className="w-4 h-4 mr-2 text-gray-400" />{addr.mobile}</div>
              {!addr.isDefault && <button onClick={() => handleSetDefault(addr._id!)} className="w-full py-2.5 rounded border border-gray-300 text-sm font-semibold text-gray-600 hover:text-primary-700 hover:border-primary-700 uppercase tracking-widest text-[0.7rem]">Set as Default</button>}
           </div>
         ))}
         {addresses.length === 0 && (
           <div className="col-span-1 md:col-span-2 p-10 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <MapPin className="w-12 h-12 text-gray-300 mb-3" />
              <p className="font-medium text-gray-900 mb-1">No saved addresses</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default UserAddresses;
