import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, UserPlus, Search, TrendingUp, 
  DollarSign, Award,
  Link as LinkIcon
} from 'lucide-react';
import { marketingService } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { StatWidget, MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';

const InfluencerManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: influencersRes, isLoading } = useQuery({
    queryKey: ['influencers'],
    queryFn: () => marketingService.getInfluencers()
  });

  const influencers = influencersRes?.data || [];

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-950 p-4 sm:p-8 text-white space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Users className="text-pink-500" size={32} />
            Influencer Hub
          </h1>
          <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Manage creators, commissions & attribution ROI
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0 min-w-[200px] sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search creators..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:border-pink-500/50 outline-none transition-all placeholder:text-gray-600"
            />
          </div>
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-pink-600/20 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto">
            <UserPlus size={18} /> Onboard Influencer
          </button>
        </div>
      </div>

      {/* Stats Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget 
          label="Total Affiliate Sales" 
          value="₹4.2L"
          icon={TrendingUp}
          iconColor="text-emerald-400"
          delay={0.1}
        />
        <StatWidget 
          label="Active Creators" 
          value={influencers.length}
          icon={Users}
          iconColor="text-pink-400"
          delay={0.2}
        />
        <StatWidget 
          label="Total Payouts" 
          value="₹42k"
          icon={DollarSign}
          iconColor="text-amber-400"
          delay={0.3}
        />
        <StatWidget 
          label="Avg. ROAS" 
          value="8.4x"
          icon={Award}
          iconColor="text-purple-400"
          delay={0.4}
        />
      </div>

      {/* Influencer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {influencers.map((creator: any, idx: number) => (
          <GlassCard key={creator._id} delay={idx * 0.1} className="group/card">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl font-black border border-white/10">
                  {creator.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">{creator.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <LinkIcon size={12} className="text-pink-400" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">@{creator.handle}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${creator.status === 'active' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                {creator.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Commission</p>
                <p className="text-lg font-black text-white">{creator.commissionRate}%</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Referral Code</p>
                <p className="text-lg font-black text-pink-500 uppercase">{creator.referralCode}</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-6">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-500">Attributed Revenue</span>
                <span className="text-emerald-400 font-black">₹{(creator.analytics?.totalRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-600 uppercase">Clicks</span>
                    <span className="text-xs font-bold text-white">{creator.analytics?.totalClicks || 0}</span>
                  </div>
                  <div className="w-[1px] h-4 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-600 uppercase">Sales</span>
                    <span className="text-xs font-bold text-white">{creator.analytics?.totalSales || 0}</span>
                  </div>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-pink-500 hover:text-pink-400 transition-all">
                  View Analytics &rarr;
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default InfluencerManager;
