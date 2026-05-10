import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, TrendingUp, DollarSign, 
  MousePointer2, Award,
  Globe, Camera, Video
} from 'lucide-react';
// @ts-ignore
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { marketingService } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { StatWidget, MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';

const AdPerformance: React.FC = () => {
  const { isLoading } = useQuery({
    queryKey: ['adCampaigns'],
    queryFn: () => marketingService.getAdCampaigns()
  });

  // const campaigns = campaignsRes?.data || [];

  const chartData = [
    { name: 'Mon', spend: 400, revenue: 2400 },
    { name: 'Tue', spend: 300, revenue: 1398 },
    { name: 'Wed', spend: 200, revenue: 9800 },
    { name: 'Thu', spend: 278, revenue: 3908 },
    { name: 'Fri', spend: 189, revenue: 4800 },
    { name: 'Sat', spend: 239, revenue: 3800 },
    { name: 'Sun', spend: 349, revenue: 4300 },
  ];

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-950 p-4 sm:p-8 text-white space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <BarChart3 className="text-blue-500" size={32} />
            Ad Intel
          </h1>
          <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Cross-platform advertising performance & ROAS intelligence
          </p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">All Channels</button>
          <button className="px-6 py-2.5 text-gray-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Meta</button>
          <button className="px-6 py-2.5 text-gray-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Google</button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Ad Spend" value="₹24,500" icon={DollarSign} iconColor="text-blue-400" delay={0.1} />
        <StatWidget label="Ad Revenue" value="₹1.8L" icon={TrendingUp} iconColor="text-emerald-400" delay={0.2} />
        <StatWidget label="ROAS" value="7.3x" icon={Award} iconColor="text-purple-400" delay={0.3} />
        <StatWidget label="Avg. CPC" value="₹4.2" icon={MousePointer2} iconColor="text-amber-400" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart */}
        <GlassCard className="xl:col-span-2 min-h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg text-white">Spend vs Revenue Growth</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Revenue</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white/20" /> <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Spend</span></div>
            </div>
          </div>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 900 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 900 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="spend" stroke="#ffffff20" strokeWidth={2} fillOpacity={0.1} fill="#ffffff10" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Platform Breakdown */}
        <GlassCard className="flex flex-col">
          <h3 className="font-bold text-lg text-white mb-8">Channel ROI</h3>
          <div className="space-y-6 flex-grow">
            {[
              { name: 'Instagram', roi: '12.4x', spend: '12k', icon: <Camera size={18} className="text-pink-500" /> },
              { name: 'Facebook', roi: '5.2x', spend: '8k', icon: <Globe size={18} className="text-blue-600" /> },
              { name: 'YouTube', roi: '8.1x', spend: '4k', icon: <Video size={18} className="text-red-500" /> },
            ].map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5">{p.icon}</div>
                    <span className="font-bold text-white text-sm">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">ROI {p.roi}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Monthly Spend</span>
                    <span className="text-sm font-black text-white">₹{p.spend}</span>
                  </div>
                  <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: idx === 0 ? '80%' : idx === 1 ? '40%' : '20%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdPerformance;
