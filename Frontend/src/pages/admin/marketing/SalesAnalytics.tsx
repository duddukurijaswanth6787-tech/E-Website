import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Download, 
  TrendingUp, Package,
  MapPin
} from 'lucide-react';
import { 
  ComposedChart, Bar, Line, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { marketingService } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';

const SalesAnalytics: React.FC = () => {
  const [period, setPeriod] = useState('7days');
  
  const { data: trendsRes, isLoading } = useQuery({
    queryKey: ['salesTrends', period],
    queryFn: () => marketingService.getSalesTrends(period)
  });

  const trends = useMemo(() => trendsRes?.data || [], [trendsRes]);

  if (isLoading) return <MarketingSkeleton />;

  const mockProductPerformance = [
    { name: 'Kanchipuram Silk Saree', sales: 420, revenue: 1250000 },
    { name: 'Designer Bridal Lehenga', sales: 180, revenue: 3400000 },
    { name: 'Embroidered Salwar Suit', sales: 840, revenue: 840000 },
    { name: 'Silk Dupatta Collection', sales: 1200, revenue: 360000 },
    { name: 'Custom Stitching Service', sales: 2400, revenue: 1200000 },
  ];

  const mockBranchData = [
    { name: 'Main Boutique', value: 45 },
    { name: 'Workshop Alpha', value: 25 },
    { name: 'Workshop Beta', value: 20 },
    { name: 'Online / Remote', value: 10 },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 p-4 sm:p-8 text-white space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <BarChart className="text-emerald-500" size={32} />
            Financial Intel
          </h1>
          <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Deep-dive into revenue streams and product performance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="bg-white/5 border border-white/10 p-1 rounded-2xl flex-grow md:flex-grow-0">
            {['7days', '30days', '90days'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 flex-grow md:flex-grow-0">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Main Revenue Chart */}
      <GlassCard 
        delay={0.1} 
        title="Revenue Performance" 
        subtitle="Transaction Volume vs Gross Revenue"
        icon={<TrendingUp size={24} className="text-emerald-400" />}
        headerAction={
          <div className="text-right">
            <p className="text-2xl font-black text-emerald-400">₹{(trends.reduce((acc: number, curr: any) => acc + curr.revenue, 0)).toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Period Revenue</p>
          </div>
        }
      >
        <div className="h-[450px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trends}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="_id" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => `₹${v/1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '16px' }}
                itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" fill="url(#revenueGradient)" stroke="#10b981" strokeWidth={4} name="Revenue (₹)" />
              <Bar yAxisId="right" dataKey="orders" barSize={30} fill="#6366f1" radius={[8, 8, 0, 0]} name="Orders" />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0a0a0a' }} name="Trend" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Performance Table */}
        <GlassCard 
          delay={0.2} 
          className="!p-0 overflow-hidden" 
          title="Unit Velocity" 
          subtitle="Top Moving Inventory Collections"
          icon={<Package size={20} className="text-blue-400" />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Product / Collection</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Sales</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockProductPerformance.map((product, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.03] transition-colors group/row">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-white/5 flex items-center justify-center text-blue-400 font-black text-xs group-hover/row:scale-110 transition-transform">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-200">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-black text-white">{product.sales}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-black text-emerald-400">₹{product.revenue.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Branch Distribution */}
        <GlassCard 
          delay={0.3} 
          title="Operational Distribution" 
          subtitle="Regional Sales Attribution"
          icon={<MapPin size={20} className="text-purple-400" />}
        >
          <div className="space-y-8 mt-6">
            {mockBranchData.map((branch) => (
              <div key={branch.name} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{branch.name}</span>
                  <span className="text-sm font-black text-white">{branch.value}%</span>
                </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                    <div 
                      style={{ width: `${branch.value}%` }}
                      className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-400 rounded-full transition-all duration-1000" 
                    />
                  </div>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
            <span>Last Audit: 2 Hours Ago</span>
            <span className="flex items-center gap-2 text-emerald-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              System Healthy
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SalesAnalytics;
