import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { userService } from '../../../api/services/user.service';
import { orderService } from '../../../api/services/order.service';
import apiClient from '../../../api/client';
import toast from 'react-hot-toast';
import { 
  Mail, Phone, 
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Loader } from '../../../components/common/Loader';

const UserProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [fullUser, setFullUser] = useState<any>(user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    mobile: ''
  });

  useEffect(() => {
    if (fullUser) {
      setFormData({
        name: fullUser.name || '',
        mobile: fullUser.mobile || ''
      });
    }
  }, [fullUser]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [ordersRes, userRes] = await Promise.allSettled([
          orderService.getUserOrders(),
          apiClient.get('/users/me')
        ]);
        if (userRes.status === 'fulfilled' && userRes.value.data?.data) {
           setFullUser(userRes.value.data.data);
        }
        let orderData: any[] = [];
        if (ordersRes.status === 'fulfilled') {
          const rawOrders = (ordersRes.value as any)?.data?.data || (ordersRes.value as any)?.data || (ordersRes.value as any) || [];
          orderData = Array.isArray(rawOrders) ? rawOrders : [];
          setOrders(orderData.slice(0, 5));
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Full Name is required");
    try {
      setSaving(true);
      await userService.updateProfile({
        name: formData.name.trim(),
        mobile: formData.mobile.trim()
      });
      updateUser({ name: formData.name.trim() });
      const userRes = await apiClient.get('/users/me');
      if (userRes.data?.data) setFullUser(userRes.data.data);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getOrderStatusProgress = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'CANCELLED') return -1;
    if (s === 'DELIVERED') return 4;
    if (s === 'SHIPPED') return 3;
    if (s === 'PACKED') return 2;
    if (s === 'CONFIRMED' || s === 'PROCESSING') return 1;
    return 0;
  };

  if (loading) return <Loader fullPage message="Accessing your profile catalog..." />;


  return (
    <div className="w-full bg-transparent">
      <div className="bg-[#FFF8F1] rounded-3xl shadow-sm overflow-hidden mb-10 relative border transition-transform">
        <div className="h-32 bg-gradient-to-br from-[#5A001F] via-[#7A0F35] to-[#A51648] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>
        </div>
        <div className="px-6 sm:px-12 pb-10 relative -mt-12 flex flex-col md:flex-row items-center md:items-end gap-6">
           <div className="w-28 h-28 shrink-0 rounded-full bg-[#FFF8F1] p-1.5 shadow-xl mx-auto md:mx-0">
              <div className="w-full h-full rounded-full border border-[#D4AF37]/50 overflow-hidden bg-white flex items-center justify-center text-4xl font-serif text-[#A51648]">
                {fullUser?.avatar ? <img src={fullUser.avatar} alt="" className="w-full h-full object-cover" /> : fullUser?.name?.substring(0,2).toUpperCase()}
              </div>
           </div>
           <div className="flex-1 pb-1 w-full text-center md:text-left">
              <h2 className="text-3xl font-serif text-[#1F1A1C] leading-none mb-1">{fullUser?.name || 'Customer'}</h2>
              <p className="text-[#A51648] text-[0.7rem] font-bold uppercase tracking-[0.2em] mb-4">Vasanthi Boutique Member</p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center md:justify-start gap-4 pt-6">
                 <div className="flex items-center text-[0.8rem] font-medium text-[#1F1A1C] bg-white px-5 py-2.5 rounded-full shadow-sm border border-[#FBEAF0]"><Mail className="w-4 h-4 text-[#D4AF37] mr-2.5" />{fullUser?.email}</div>
                 <div className="flex items-center text-[0.8rem] font-medium text-[#1F1A1C] bg-white px-5 py-2.5 rounded-full shadow-sm border border-[#FBEAF0]"><Phone className="w-4 h-4 text-[#D4AF37] mr-2.5" />{fullUser?.mobile || 'Add mobile'}</div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <div className="bg-white p-7 md:p-9 rounded-3xl shadow-sm border border-[#FBEAF0]">
            <h3 className="font-serif text-xl tracking-wide text-[#5A001F] mb-6">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-[0.65rem] font-bold text-[#A51648] mb-2 uppercase tracking-[0.15em]">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FFF8F1] border-none rounded-xl px-5 py-4 text-sm font-medium" />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-[#A51648] mb-2 uppercase tracking-[0.15em]">Mobile Number</label>
                <input type="tel" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full bg-[#FFF8F1] border-none rounded-xl px-5 py-4 text-sm font-medium" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-[#5A001F] to-[#A51648] text-white font-bold uppercase py-4 rounded-xl shadow-md">{saving ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white p-7 md:p-9 rounded-3xl shadow-sm border border-[#FBEAF0]">
            <div className="flex justify-between mb-8 pb-5 border-b border-[#D4AF37]/20">
              <h3 className="font-serif text-xl tracking-wide text-[#5A001F]">Recent Orders</h3>
              <Link to="/my/orders" className="text-[0.65rem] font-bold uppercase tracking-widest text-[#A51648] bg-[#FBEAF0] px-6 py-3 rounded-full">View All</Link>
            </div>
            {orders.length === 0 ? (
               <div className="text-center py-20 bg-[#FFF8F1] rounded-2xl border border-dashed border-[#D4AF37]/40">
                 <Package className="w-8 h-8 text-[#D4AF37] mx-auto mb-5" />
                 <h4 className="text-xl font-serif text-[#5A001F]">No Orders Yet</h4>
                 <Link to="/shop" className="bg-gradient-to-r from-[#D4AF37] to-[#B38D19] text-white px-9 py-3.5 rounded-full text-[0.65rem] font-bold uppercase mt-6 inline-block">Shop Collections</Link>
               </div>
            ) : (
              <div className="space-y-5">
                {orders.map((order, idx) => (
                    <div key={order._id || idx} className="border border-[#FBEAF0] rounded-2xl p-5 bg-white flex flex-col md:flex-row gap-6">
                      <div className="flex items-center space-x-4 md:w-5/12 shrink-0">
                         <div className="w-16 h-20 rounded-xl bg-[#FFF8F1] border border-[#FBEAF0] overflow-hidden">
                            {order.items && order.items[0]?.image && <img src={typeof order.items[0].image === 'string' ? order.items[0].image : order.items[0].image?.url} alt="" className="w-full h-full object-cover" />}
                         </div>
                         <div>
                            <p className="text-[0.6rem] font-bold text-[#A51648] uppercase tracking-[0.15em] mb-1.5">ORDER #{String(order._id).substring(0,8).toUpperCase()}</p>
                            <div className="text-[0.9rem] font-bold text-[#1F1A1C] mb-1.5 font-serif">₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</div>
                         </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#FBEAF0] pt-4 md:pt-0 md:pl-6">
                        <div className="flex items-center justify-between mb-6">
                           <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full bg-[#FBEAF0] text-[#A51648]">{order.status}</span>
                           <Link to={`/my/orders/${order._id}`} className="text-[#A51648] text-[0.65rem] font-bold uppercase tracking-widest">View Details →</Link>
                        </div>
                        <div className="relative mx-4 h-1 flex items-center bg-[#FBEAF0] rounded-full">
                           <div className="h-full bg-[#A51648] rounded-full" style={{ width: `${(getOrderStatusProgress(order.status || 'PENDING') / 4) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
