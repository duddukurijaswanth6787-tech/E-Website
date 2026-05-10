import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, Users, ShoppingCart, DollarSign, 
  Activity, Target, Zap, Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { marketingService } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { StatWidget, MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';
import { MOCK_TRAFFIC_DATA, MOCK_SOURCE_DATA, MOCK_FEED_EVENTS } from '../../../api/mocks/marketing.mock';

const MarketingDashboard: React.FC = () => {
  const { data: statsRes, isLoading } = useQuery({
    queryKey: ['marketingStats'],
    queryFn: () => marketingService.getMarketingStats(),
    refetchInterval: 30000 
  });

  const stats = useMemo(() => statsRes?.data, [statsRes]);
  const kpis = stats?.kpis;

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-950 p-4 sm:p-8 text-white space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white flex items-center gap-3">
            <Zap className="text-blue-500 fill-blue-500/20" size={32} />
            Command Center
          </h1>
          <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Enterprise Real-time Ad & Campaign Monitoring
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-gray-300">
            <Calendar size={16} />
            <span className="text-xs font-black uppercase tracking-widest">May 01 - May 09</span>
          </div>
          <button className="flex-grow lg:flex-grow-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95">
            <Target size={18} /> Run Campaign
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget 
          label="Total Revenue" 
          value={`₹${kpis?.totalRevenue?.toLocaleString() || '0'}`}
          trend={12.5}
          icon={DollarSign}
          iconColor="text-emerald-400"
          delay={0.1}
        />
        <StatWidget 
          label="Conversion Rate" 
          value={`${kpis?.conversionRate || '0'}%`}
          trend={2.1}
          icon={TrendingUp}
          iconColor="text-blue-400"
          delay={0.2}
        />
        <StatWidget 
          label="Active Coupons" 
          value={kpis?.activeCoupons || 0}
          trend={-5}
          trendLabel="vs last week"
          icon={ShoppingCart}
          iconColor="text-purple-400"
          delay={0.3}
        />
        <StatWidget 
          label="Total Leads" 
          value={kpis?.totalCustomers || 0}
          trend={18.4}
          icon={Users}
          iconColor="text-amber-400"
          delay={0.4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard 
          className="lg:col-span-2" 
          title="Multi-Channel Traffic" 
          subtitle="Real-time Audience Acquisition Vectors"
          icon={<Activity size={20} className="text-blue-400" />}
          delay={0.5}
        >
          <div className="h-[350px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_TRAFFIC_DATA}>
                <defs>
                  <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val: number) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="organic" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorOrganic)" />
                <Area type="monotone" dataKey="paid" stroke="#a855f7" strokeWidth={4} fillOpacity={1} fill="url(#colorPaid)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard 
          title="Traffic Attribution" 
          subtitle="Top Conversion Sources"
          icon={<Target size={20} className="text-emerald-400" />}
          delay={0.6}
        >
          <div className="h-[250px] relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_SOURCE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {MOCK_SOURCE_DATA.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-black">12.4k</p>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Visitors</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {MOCK_SOURCE_DATA.map((source) => (
              <div key={source.name} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">{source.name}</span>
                </div>
                <span className="font-black text-sm">{(source.value / 1200 * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Bottom Grid: Campaigns & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard 
          title="Ongoing Campaigns" 
          subtitle="Real-time Performance Metrics"
          headerAction={<button className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">View All</button>}
          delay={0.7}
        >
          <div className="space-y-4">
            {stats?.recentCampaigns.map((camp: any, idx: number) => (
              <div key={idx} className="group/item bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl p-5 flex items-center justify-between transition-all">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${camp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'} border border-white/5 group-hover/item:scale-110 transition-transform`}>
                    <Target size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">{camp.name}</h4>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${camp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {camp.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">{camp.roas}</p>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">ROAS Index</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard 
          title="Live Activity Feed" 
          subtitle="Real-time System Audit"
          headerAction={<span className="bg-rose-500/20 text-rose-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse border border-rose-500/20">Live Stream</span>}
          delay={0.8}
        >
          <div className="space-y-8 relative">
            <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-white/5" />
            {MOCK_FEED_EVENTS.map((event) => (
              <div key={event.id} className="relative pl-10">
                <div className={`absolute left-0 top-1 h-6 w-6 rounded-lg bg-neutral-900 border-2 border-white/10 flex items-center justify-center z-10`}>
                  <div className={`w-2 h-2 rounded-full ${event.color === 'blue' ? 'bg-blue-400' : event.color === 'emerald' ? 'bg-emerald-400' : 'bg-purple-400'} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                </div>
                <p className="text-sm font-bold text-gray-200">{event.message}</p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase font-black tracking-[0.2em]">{event.time}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default MarketingDashboard;
