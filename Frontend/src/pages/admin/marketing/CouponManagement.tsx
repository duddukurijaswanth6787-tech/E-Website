import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, 
  Copy, Check, Ticket,
  Clock, CheckCircle2, TrendingUp, DollarSign
} from 'lucide-react';
import { couponService } from '../../../api/services/coupon.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';
import toast from 'react-hot-toast';

const StatWidget: React.FC<{ label: string, value: string | number, icon: any, iconColor: string, delay: number }> = ({ label, value, icon: Icon, iconColor, delay }) => (
  <GlassCard delay={delay} className="p-6">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-[var(--admin-card)] ${iconColor}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-[var(--admin-text-primary)]">{value}</p>
      </div>
    </div>
  </GlassCard>
);

const CouponManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: couponsRes, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: () => couponService.getCoupons()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      toast.success('Coupon invalidated successfully');
    }
  });

  const coupons = useMemo(() => {
    const list = couponsRes?.data || [];
    return list.filter((c: any) => 
      c.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [couponsRes, searchTerm]);

  const stats = useMemo(() => {
    const totalRevenue = coupons.reduce((acc, curr) => acc + (curr.revenueGenerated || 0), 0);
    const totalRedemptions = coupons.reduce((acc, curr) => acc + (curr.usedCount || 0), 0);
    const activeCount = coupons.filter(c => c.isActive).length;
    return { totalRevenue, totalRedemptions, activeCount };
  }, [coupons]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success('Code copied to buffer');
  };

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className=" space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Ticket className="text-purple-500" size={32} />
            Reward Engine
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Manage promotional codes & attribution revenue
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0 min-w-[200px] sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)]" size={18} />
            <input 
              type="text" 
              placeholder="Search rewards..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-600"
            />
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-[var(--admin-text-primary)] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto">
            <Plus size={18} /> New Reward
          </button>
        </div>
      </div>

      {/* Analytics Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatWidget 
          label="Reward Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-emerald-400"
          delay={0.1}
        />
        <StatWidget 
          label="Total Redemptions" 
          value={stats.totalRedemptions.toLocaleString()}
          icon={TrendingUp}
          iconColor="text-blue-400"
          delay={0.2}
        />
        <StatWidget 
          label="Active Rewards" 
          value={stats.activeCount}
          icon={CheckCircle2}
          iconColor="text-purple-400"
          delay={0.3}
        />
      </div>

      {/* Coupon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {coupons.map((coupon: any, idx: number) => (
          <GlassCard 
            key={coupon._id} 
            delay={0.1 * (idx % 6)} 
            className="group/card flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[var(--admin-card)] border border-[var(--admin-card-border)] text-purple-400 group-hover/card:scale-110 transition-transform">
                  <Ticket size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[var(--admin-text-primary)] tracking-tight">{coupon.code}</h3>
                  <p className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest mt-1">
                    {coupon.type === 'percentage' ? `${coupon.value}% Discount` : `₹${coupon.value} Flat OFF`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => copyToClipboard(coupon.code)}
                  className="p-2.5 bg-[var(--admin-card)] hover:bg-[var(--admin-card)]/10 rounded-xl border border-[var(--admin-card-border)] transition-all text-gray-400 hover:text-[var(--admin-text-primary)]"
                >
                  {copiedCode === coupon.code ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Usage Progress</span>
                  <span className="text-[var(--admin-text-primary)]">{coupon.usedCount} / {coupon.maxUses || '∞'}</span>
                </div>
                <div className="w-full h-2.5 bg-[var(--admin-card)] rounded-full overflow-hidden border border-[var(--admin-card-border)] p-[2px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min((coupon.usedCount / (coupon.maxUses || 100)) * 100, 100)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-[var(--admin-card-border)] py-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Attributed Sales</p>
                  <p className="text-lg font-black text-emerald-400">₹{(coupon.revenueGenerated || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Min. Order</p>
                  <p className="text-lg font-black text-[var(--admin-text-primary)]">₹{coupon.minOrderAmount?.toLocaleString() || 0}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Validity</span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
                    <Clock size={12} className="text-[var(--admin-text-secondary)]" />
                    <span>Expires {new Date(coupon.validTo).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 bg-[var(--admin-card)] hover:bg-[var(--admin-card)]/10 rounded-xl border border-[var(--admin-card-border)] transition-all">
                    <Edit2 size={16} className="text-gray-400" />
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(coupon._id)}
                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/10 transition-all"
                  >
                    <Trash2 size={16} className="text-rose-500" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-[var(--admin-card)]/[0.02] rounded-[2rem] border border-[var(--admin-card-border)]">
          <div className="p-6 bg-[var(--admin-card)] rounded-full text-gray-700">
            <Ticket size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-400">No Rewards Active</h3>
            <p className="text-sm text-gray-600 max-w-xs mt-1">Create a new promotional reward to drive conversion velocity.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;


