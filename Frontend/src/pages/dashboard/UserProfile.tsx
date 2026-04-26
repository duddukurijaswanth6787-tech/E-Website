import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../api/services/user.service';
import { orderService } from '../../api/services/order.service';
import { addressService } from '../../api/services/address.service';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { 
  Mail, Phone, 
  Package, Clock, CheckCircle, Truck, PackageCheck,
  MapPin, Heart, Scissors, AlertCircle, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../components/common/Skeleton';

interface ProfileStats {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  totalSpent: number;
  savedAddresses: number;
  wishlistItems: number;
  customRequests: number;
}

const UserProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [fullUser, setFullUser] = useState<any>(user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
    savedAddresses: 0,
    wishlistItems: 0,
    customRequests: 0
  });

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
        const [ordersRes, addressRes, userRes, wishlistRes, customRes] = await Promise.allSettled([
          orderService.getUserOrders(),
          addressService.getAddresses(),
          apiClient.get('/users/me'),
          apiClient.get('/wishlist').catch(() => null),
          apiClient.get('/custom-blouse/user').catch(() => null)
        ]);

        if (userRes.status === 'fulfilled' && userRes.value.data?.data) {
           setFullUser(userRes.value.data.data);
        }

        let orderData: any[] = [];
        let addressCount = 0;
        let wishlistCount = 0;
        let customCount = 0;

        if (ordersRes.status === 'fulfilled') {
          const rawOrders = (ordersRes.value as any)?.data?.data || (ordersRes.value as any)?.data || (ordersRes.value as any) || [];
          orderData = Array.isArray(rawOrders) ? rawOrders : [];
          setOrders(orderData.slice(0, 5));
        }

        if (addressRes.status === 'fulfilled') {
           const addrs = addressRes.value.data?.data || addressRes.value.data || [];
           addressCount = Array.isArray(addrs) ? addrs.length : 0;
        }

        if (wishlistRes.status === 'fulfilled' && wishlistRes.value?.data?.data) {
           const items = wishlistRes.value.data.data.items || [];
           wishlistCount = Array.isArray(items) ? items.length : 0;
        }

        if (customRes.status === 'fulfilled' && customRes.value) {
            const rawCustom = customRes.value.data?.data || customRes.value.data || [];
            customCount = Array.isArray(rawCustom) ? rawCustom.length : 0;
        }

        setStats({
          totalOrders: orderData.length,
          activeOrders: orderData.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED', 'PACKED'].includes((o.orderStatus || o.status || '').toUpperCase())).length,
          deliveredOrders: orderData.filter(o => (o.orderStatus || o.status || '').toUpperCase() === 'DELIVERED').length,
          totalSpent: orderData.reduce((acc, o) => acc + (o.totalAmount || o.total || 0), 0),
          savedAddresses: addressCount,
          wishlistItems: wishlistCount,
          customRequests: customCount
        });

      } catch (err) {
        console.error("Failed to load profile data", err);
        toast.error("Failed to load complete profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Full Name is required");
    if (formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile)) {
      return toast.error("Enter a valid 10-digit Indian mobile number");
    }

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
    if (s === 'PACKED' || s === 'PROCESSING') return 2;
    if (s === 'CONFIRMED') return 1;
    return 0; // Pending
  };

  const timelineSteps = [
    { label: 'Pending', icon: Clock },
    { label: 'Confirmed', icon: CheckCircle },
    { label: 'Packed', icon: Package },
    { label: 'Shipped', icon: Truck },
    { label: 'Delivered', icon: PackageCheck }
  ];

  if (loading) {
    return (
      <div className="w-full space-y-8">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const joinDate = fullUser?.createdAt ? new Date(fullUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';
  const initial = fullUser?.name ? fullUser.name.substring(0,2).toUpperCase() : 'CC';
  const isActive = !fullUser?.isBlocked;

  return (
    <div className="w-full bg-transparent">
      
      {/* 1. Profile Hero Card Full Width */}
      <div className="bg-[#FFF8F1] rounded-3xl shadow-[0_10px_40px_rgba(90,0,31,0.05)] overflow-hidden mb-10 relative border border-[#FFF8F1] transition-transform">
        {/* Luxury Background Gradient Top */}
        <div className="h-32 bg-gradient-to-br from-[#5A001F] via-[#7A0F35] to-[#A51648] relative overflow-hidden">
          {/* Subtle decorative glow overlay */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D4AF37] rounded-full blur-[80px] opacity-20"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay"></div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80"></div>
        </div>
        
        <div className="px-6 sm:px-12 pb-10 relative -mt-12 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
           
           {/* Avatar with Gold Ring */}
           <div className="w-28 h-28 shrink-0 rounded-full bg-[#FFF8F1] p-1.5 shadow-xl relative z-10 mx-auto md:mx-0 group">
              <div className="w-full h-full rounded-full border border-[#D4AF37]/50 overflow-hidden bg-white flex items-center justify-center text-4xl font-serif text-[#A51648] uppercase shadow-inner">
                {fullUser?.avatar ? (
                  <img src={fullUser.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  initial
                )}
              </div>
           </div>
           
           {/* Details block */}
           <div className="flex-1 pb-1 w-full text-center md:text-left">
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 border-b border-[#D4AF37]/20 pb-6 relative">
                 <div>
                   <h2 className="text-3xl font-serif text-[#1F1A1C] leading-none mb-1 tracking-wide flex items-center justify-center md:justify-start gap-2">
                     {fullUser?.name || 'Customer'}
                     {fullUser?.isEmailVerified && (
                        <div title="Verified Membership" className="w-5 h-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shadow-sm">
                           <CheckCircle className="w-3 h-3" />
                        </div>
                     )}
                   </h2>
                   <p className="text-[#A51648] text-[0.7rem] font-bold uppercase tracking-[0.2em] mb-4 opacity-80 flex items-center justify-center md:justify-start">
                     <Sparkles className="w-3 h-3 mr-1" /> Vasanthi Boutique Member
                   </p>
                   
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest shadow-sm ${isActive ? 'bg-[#FBEAF0] text-[#A51648] border border-[#A51648]/10' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {isActive ? 'Active Status' : 'Suspended'}
                      </span>
                      <span className="px-4 py-1.5 rounded-full text-[0.65rem] font-bold text-[#D4AF37] bg-white border border-[#D4AF37]/20 shadow-sm uppercase tracking-widest">
                         MEMBER SINCE {joinDate}
                      </span>
                   </div>
                 </div>
                 
                 {/* Decorative element right side */}
                 <div className="hidden xl:flex items-center justify-center w-16 h-16 rounded-full border border-[#D4AF37]/30 bg-white shadow-sm self-center">
                    <Heart className="w-6 h-6 text-[#A51648] opacity-80 fill-current" />
                 </div>
              </div>

              {/* Contact Info Row */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center md:justify-start gap-3 sm:gap-4 pt-6">
                 <div className="flex items-center text-[0.8rem] font-medium text-[#1F1A1C] bg-white px-5 py-2.5 rounded-full shadow-sm border border-[#FBEAF0] hover:border-[#D4AF37]/40 transition-colors">
                   <Mail className="w-4 h-4 text-[#D4AF37] mr-2.5" />
                   {fullUser?.email}
                 </div>
                 <div className="flex items-center text-[0.8rem] font-medium text-[#1F1A1C] bg-white px-5 py-2.5 rounded-full shadow-sm border border-[#FBEAF0] hover:border-[#D4AF37]/40 transition-colors">
                   <Phone className="w-4 h-4 text-[#D4AF37] mr-2.5" />
                   {fullUser?.mobile ? `+91 ${fullUser.mobile}` : <span className="text-[#1F1A1C]/50 italic font-normal">Add mobile number</span>}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Quick Summary Cards Grid */}
      <h3 className="font-serif text-xl tracking-wide text-[#5A001F] mb-4 px-2 flex items-center">
         Account Overview <div className="ml-4 h-[1px] flex-grow bg-gradient-to-r from-[#D4AF37]/40 to-transparent max-w-xs"></div>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5 mb-10">
         {[
           { icon: Package, value: stats.totalOrders, label: 'Total Orders', color: 'text-[#A51648]', bg: 'bg-[#FBEAF0]' },
           { icon: Clock, value: stats.activeOrders, label: 'In Progress', color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
           { icon: CheckCircle, value: stats.deliveredOrders, label: 'Delivered', color: 'text-emerald-700', bg: 'bg-emerald-50' },
           { icon: MapPin, value: stats.savedAddresses, label: 'Addresses', color: 'text-[#5A001F]', bg: 'bg-[#5A001F]/5' },
           { icon: Heart, value: stats.wishlistItems, label: 'Wishlist', color: 'text-rose-600', bg: 'bg-rose-50' },
           { icon: Scissors, value: stats.customRequests, label: 'Custom Fits', color: 'text-amber-700', bg: 'bg-amber-50' }
         ].map((stat, i) => (
           <div key={i} className="bg-gradient-to-b from-white to-[#FFF8F1] p-5 rounded-2xl shadow-[0_4px_15px_rgba(90,0,31,0.03)] border border-[#FBEAF0] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-default">
              <div className={`w-10 h-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                 <stat.icon className="w-5 h-5 stroke-[1.5]" />
              </div>
              <p className="text-3xl font-serif text-[#1F1A1C] leading-none mb-1.5">{stat.value}</p>
              <p className="text-[0.6rem] font-bold text-[#A51648]/70 uppercase tracking-[0.15em]">{stat.label}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 3. Edit Profile Card */}
        <div className="xl:col-span-1">
          <div className="bg-white p-7 md:p-9 rounded-3xl shadow-[0_8px_30px_rgba(90,0,31,0.04)] border border-[#FBEAF0] h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="mb-8 border-b border-[#D4AF37]/20 pb-5">
              <h3 className="font-serif text-xl tracking-wide text-[#5A001F] flex items-center">
                 Personal Information
              </h3>
              <p className="text-[0.75rem] font-medium text-[#1F1A1C]/60 mt-1">Update your basic account details</p>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
              <div>
                <label className="block text-[0.65rem] font-bold text-[#A51648] mb-2 uppercase tracking-[0.15em]">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your Name"
                  className="w-full bg-[#FFF8F1] border-none rounded-xl px-5 py-4 text-sm text-[#1F1A1C] font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] font-bold text-[#A51648] mb-2 uppercase tracking-[0.15em]">Mobile Number</label>
                <div className="relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] rounded-xl bg-[#FFF8F1] focus-within:ring-2 focus-within:ring-[#D4AF37]/50 focus-within:bg-white transition-all">
                  <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-[#1F1A1C]/50 text-sm font-semibold pointer-events-none">+91</span>
                  <input 
                    type="tel" 
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full bg-transparent border-none rounded-xl pl-12 pr-5 py-4 text-sm text-[#1F1A1C] font-medium focus:outline-none"
                  />
                </div>
                <div className="flex items-center mt-2.5 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#D4AF37] mr-1.5 opacity-80" />
                  <p className="text-[0.65rem] text-[#1F1A1C]/50 font-semibold tracking-wide">Standard 10-digit format</p>
                </div>
              </div>
              
              <div className="pt-8">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-[#5A001F] to-[#A51648] hover:from-[#7A0F35] hover:to-[#A51648] text-white font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(165,22,72,0.3)] hover:shadow-[0_6px_20px_rgba(165,22,72,0.4)] disabled:opacity-70 flex justify-center items-center text-xs"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 4. Recent Order Tracking */}
        <div className="xl:col-span-2">
          <div className="bg-white p-7 md:p-9 rounded-3xl shadow-[0_8px_30px_rgba(90,0,31,0.04)] border border-[#FBEAF0] h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FBEAF0]/50 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#D4AF37]/20 pb-5 gap-4 relative z-10">
              <div>
                <h3 className="font-serif text-xl tracking-wide text-[#5A001F]">Recent Orders & Tracking</h3>
                <p className="text-[0.75rem] font-medium text-[#1F1A1C]/60 mt-1">Track your boutique purchases</p>
              </div>
              <Link to="/my/orders" className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#A51648] bg-[#FBEAF0] px-5 py-2.5 rounded-full hover:bg-[#5A001F] hover:text-white transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm">
                View All Orders
              </Link>
            </div>

            {orders.length === 0 ? (
               <div className="text-center py-20 bg-[#FFF8F1] rounded-2xl border border-dashed border-[#D4AF37]/40 relative z-10">
                 <div className="w-20 h-20 bg-white border border-[#FBEAF0] shadow-[0_8px_20px_rgba(90,0,31,0.06)] rounded-full flex items-center justify-center mx-auto mb-5">
                   <Package className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                 </div>
                 <h4 className="text-xl font-serif text-[#5A001F] mb-1.5 tracking-wide">No Orders Yet</h4>
                 <p className="text-[0.8rem] text-[#1F1A1C]/60 mb-8 font-medium">Your premium wardrobe awaits its first addition.</p>
                 <Link to="/shop" className="bg-gradient-to-r from-[#D4AF37] to-[#B38D19] text-white px-9 py-3.5 rounded-full text-[0.65rem] font-bold uppercase tracking-[0.2em] hover:shadow-[0_4px_15px_rgba(212,175,55,0.4)] transition-all inline-flex items-center">
                   Shop Collections
                 </Link>
               </div>
            ) : (
              <div className="space-y-5 relative z-10">
                {orders.map((order, idx) => {
                  const orderStatus = (order.orderStatus || order.status || 'PENDING').toUpperCase();
                  const progressIndex = getOrderStatusProgress(orderStatus);
                  const isCancelled = progressIndex === -1;

                  return (
                    <div key={order._id || idx} className="border border-[#FBEAF0] rounded-2xl p-5 hover:border-[#D4AF37]/50 hover:shadow-[0_4px_20px_rgba(90,0,31,0.04)] transition-all bg-white flex flex-col md:flex-row gap-6">
                      
                      {/* Left: Product & Basics */}
                      <div className="flex items-center space-x-4 md:w-5/12 shrink-0">
                         <div className="w-16 h-20 rounded-xl bg-[#FFF8F1] border border-[#FBEAF0] flex-shrink-0 relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                            {order.items && order.items[0]?.product?.images?.[0] ? (
                              <img src={order.items[0].product.images[0]} alt="Product" className="w-full h-full object-cover" />
                            ) : order.items && order.items[0]?.image ? (
                              <img src={order.items[0].image} alt="Product" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/40"><Package size={20} strokeWidth={1.5} /></div>
                            )}
                         </div>
                         <div>
                            <p className="text-[0.6rem] font-bold text-[#A51648] uppercase tracking-[0.15em] mb-1.5 leading-none">ORDER #{String(order._id).substring(0,8).toUpperCase()}</p>
                            <div className="flex items-center text-[0.9rem] font-bold text-[#1F1A1C] mb-1.5 font-serif tracking-wide">
                              ₹{(order.totalAmount || order.total || 0).toLocaleString('en-IN')} 
                            </div>
                            <span className="text-[0.65rem] font-semibold text-[#1F1A1C]/50 tracking-wide uppercase">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} • {order.items?.length || 0} ITEM(S)
                            </span>
                         </div>
                      </div>

                      {/* Middle/Right: Visual Timeline Bar */}
                      <div className="flex-1 px-2 md:px-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#FBEAF0] pt-4 md:pt-0 md:pl-6">
                        {isCancelled ? (
                           <div className="flex items-center justify-between">
                             <div className="flex items-center text-[0.7rem] font-bold text-red-600 uppercase tracking-widest bg-red-50 rounded-lg border border-red-100 px-4 py-2">
                               <AlertCircle className="w-3 h-3 mr-1.5" /> Order Cancelled
                             </div>
                             <Link to={`/my/orders/${order._id}`} className="text-[#A51648] text-[0.65rem] font-bold uppercase tracking-widest hover:text-[#5A001F] transition-colors">Details <span className="text-xl leading-none relative top-[1px]">→</span></Link>
                           </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-4">
                               <span className={`text-[0.65rem] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full border shadow-sm ${orderStatus === 'DELIVERED' ? 'bg-[#FFF8F1] text-[#D4AF37] border-[#D4AF37]/30' : 'bg-[#FBEAF0] text-[#A51648] border-[#A51648]/10'}`}>
                                 {orderStatus} {orderStatus === 'DELIVERED' && <CheckCircle className="w-3 h-3 inline pb-0.5 ml-0.5" />}
                               </span>
                               <Link to={`/my/orders/${order._id}`} className="text-[#A51648] text-[0.65rem] font-bold uppercase tracking-widest hover:text-[#5A001F] transition-colors pb-1 border-b border-[#A51648]/30 hover:border-[#5A001F]">View Details</Link>
                            </div>
                            <div className="relative mx-3">
                              {/* Track Base */}
                              <div className="absolute left-0 right-0 top-3 h-[2px] bg-[#FBEAF0] rounded-full" />
                              {/* Track Fill */}
                              <div 
                                className="absolute left-0 h-[2px] bg-gradient-to-r from-[#A51648] to-[#D4AF37] rounded-full transition-all duration-700" 
                                style={{ width: `${(progressIndex / (timelineSteps.length - 1)) * 100}%` }} 
                              />
                              
                              <div className="relative flex justify-between">
                                {timelineSteps.map((step, stepIdx) => {
                                  const isActive = stepIdx <= progressIndex;
                                  return (
                                    <div key={stepIdx} className="flex flex-col items-center">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500 shadow-sm
                                        ${isActive ? 'bg-[#5A001F] border-[#5A001F] text-[#D4AF37]' : 'bg-white border-[#FBEAF0] text-[#FBEAF0]'} 
                                      `}>
                                        {stepIdx < progressIndex ? (
                                           <CheckCircle className="w-3 h-3 text-[#D4AF37]" strokeWidth={2.5} />
                                        ) : (
                                           <step.icon className={`w-2.5 h-2.5 ${isActive ? 'text-[#D4AF37]' : 'text-[#FBEAF0]'}`} strokeWidth={2.5} />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex justify-between mt-2.5 px-1 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[#1F1A1C]/40">
                              <span className={progressIndex >= 0 ? 'text-[#A51648]' : ''}>Start</span>
                              <span className={progressIndex >= 2 ? 'text-[#A51648] text-center w-full' : 'text-center w-full'}>Shipped</span>
                              <span className={progressIndex >= 4 ? 'text-[#D4AF37]' : ''}>Done</span>
                            </div>
                          </>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
