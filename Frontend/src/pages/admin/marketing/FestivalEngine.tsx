import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Sparkles, Gift, Calendar, Zap, Palette, Plus, Play, TrendingUp
} from 'lucide-react';
import { marketingService } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';

const StatWidget: React.FC<{ label: string, value: string | number, icon: any, iconColor: string, delay: number }> = ({ label, value, icon: Icon, iconColor, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <GlassCard className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-white/5 ${iconColor}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </GlassCard>
  </motion.div>
);

const FestivalEngine: React.FC = () => {

  const { data: campaignsRes, isLoading } = useQuery({
    queryKey: ['festivalCampaigns'],
    queryFn: () => marketingService.getFestivalCampaigns()
  });

  const campaigns = campaignsRes?.data || [];

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-950 p-4 sm:p-8 text-white space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Sparkles className="text-amber-500" size={32} />
            Festival Control
          </h1>
          <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Automated Indian festival campaign management
          </p>
        </div>
        <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-600/20 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto">
          <Plus size={18} /> Schedule Festival
        </button>
      </div>

      {/* Stats Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatWidget 
          label="Active Campaigns" 
          value={campaigns.filter((c: any) => c.status === 'active').length}
          icon={Play}
          iconColor="text-emerald-400"
          delay={0.1}
        />
        <StatWidget 
          label="Projected Revenue" 
          value="₹12.5L"
          icon={TrendingUp}
          iconColor="text-amber-400"
          delay={0.2}
        />
        <StatWidget 
          label="Next Event" 
          value="Diwali Blast"
          icon={Calendar}
          iconColor="text-blue-400"
          delay={0.3}
        />
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {campaigns.map((campaign: any, idx: number) => (
          <GlassCard key={campaign._id} delay={idx * 0.1} className="relative overflow-hidden group/card !p-0">
            {/* Visual Indicator */}
            <div 
              className="h-2 w-full" 
              style={{ backgroundColor: campaign.themeConfig?.primaryColor || '#f59e0b' }} 
            />
            
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-amber-500">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{campaign.name}</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                      {campaign.festivalType} Edition
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${campaign.status === 'active' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                  {campaign.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    <Calendar size={12} />
                    Duration
                  </div>
                  <p className="text-xs font-bold text-gray-300">
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    <Zap size={12} />
                    Takeover
                  </div>
                  <p className="text-xs font-bold text-emerald-400">Theme Auto-Applied</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Orders</p>
                    <p className="text-sm font-black text-white">{(campaign.analytics?.totalOrders || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Value</p>
                    <p className="text-sm font-black text-white">₹{(campaign.analytics?.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-gray-400 hover:text-white">
                    <Palette size={18} />
                  </button>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-600/20">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.02] rounded-[2rem] border border-white/5">
          <div className="p-6 bg-white/5 rounded-full text-gray-700">
            <Calendar size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-400">No Festival Campaigns</h3>
            <p className="text-sm text-gray-600 max-w-xs mt-1">Plan your next big sale event. Sankranti, Diwali, or New Year Takeovers.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FestivalEngine;
