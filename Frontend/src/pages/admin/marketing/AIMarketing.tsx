import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Zap, TrendingUp, Users, 
  AlertTriangle, Sparkles, Brain, 
  Target, RefreshCw
} from 'lucide-react';
// @ts-ignore
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { marketingService } from '../../../api/services/marketing.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { StatWidget, MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';

const AIMarketing: React.FC = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: () => marketingService.getAIInsights()
  });

  const { data: predictions } = useQuery({
    queryKey: ['aiPredictions'],
    queryFn: () => marketingService.getAIPredictions()
  });

  const forecastData = [
    { month: 'Jan', actual: 4000, pred: 4100 },
    { month: 'Feb', actual: 3000, pred: 3200 },
    { month: 'Mar', actual: 5000, pred: 4800 },
    { month: 'Apr', actual: 4700, pred: 4900 },
    { month: 'May', actual: null, pred: 5500 },
    { month: 'Jun', actual: null, pred: 6200 },
  ];

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className=" space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Brain className="text-purple-500" size={32} />
            Marketing AI
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Predictive Intelligence & Automated Optimization
          </p>
        </div>
        <div className="flex items-center gap-3 bg-purple-500/10 px-6 py-3 rounded-2xl border border-purple-500/20">
          <RefreshCw size={18} className="text-purple-500 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">AI Model Training...</span>
        </div>
      </div>

      {/* Predictive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget 
          label="Next Month Forecast" 
          value="₹5.2L" 
          icon={TrendingUp} 
          iconColor="text-emerald-400" 
          delay={0.1} 
        />
        <StatWidget 
          label="High Churn Risk" 
          value={(insights as any)?.data?.churnRisk || 0} 
          icon={AlertTriangle} 
          iconColor="text-rose-400" 
          delay={0.2} 
        />
        <StatWidget 
          label="Predicted LTV" 
          value="₹4,200" 
          icon={Users} 
          iconColor="text-blue-400" 
          delay={0.3} 
        />
        <StatWidget 
          label="AI Opt. Score" 
          value="94/100" 
          icon={Sparkles} 
          iconColor="text-purple-400" 
          delay={0.4} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Forecast Chart */}
        <GlassCard className="xl:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg text-[var(--admin-text-primary)]">Revenue Forecasting (AI)</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /> <span className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest">Predicted</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--admin-card)]/20" /> <span className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest">Actual</span></div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 900 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 900 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '16px' }}
                />
                <Area type="monotone" dataKey="pred" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorPred)" />
                <Area type="monotone" dataKey="actual" stroke="#ffffff20" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* AI Recommendations */}
        <div className="space-y-6">
          <GlassCard className="border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-purple-500" size={24} />
              <h3 className="font-bold text-lg text-[var(--admin-text-primary)] uppercase tracking-tight">Smart Actions</h3>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Launch Diwali Pre-sale', desc: 'Predicted 22% higher conversion for "Loyal" segment.', icon: <TrendingUp size={16} /> },
                { title: 'Optimize Saree Banner', desc: 'CTR is dropping. AI suggests high-contrast visuals.', icon: <Target size={16} /> },
                { title: 'Churn Alert: 12 Users', desc: 'Offer 15% discount to prevent fallout.', icon: <Zap size={16} /> },
              ].map((rec, i) => (
                <div key={i} className="p-4 rounded-2xl bg-black/40 border border-[var(--admin-card-border)] hover:border-purple-500/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-purple-400">{rec.icon}</div>
                    <span className="text-xs font-black text-[var(--admin-text-primary)] group-hover:text-purple-400 transition-colors uppercase tracking-widest">{rec.title}</span>
                  </div>
                  <p className="text-[10px] text-[var(--admin-text-secondary)] font-bold ml-7">{rec.desc}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-4 mt-6 bg-purple-600 hover:bg-purple-700 text-[var(--admin-text-primary)] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-600/20 transition-all active:scale-95">
              Execute All Smart Actions
            </button>
          </GlassCard>
        </div>
      </div>

      {/* Customer Scoring */}
      <GlassCard className="overflow-hidden !p-0">
        <div className="p-8 border-b border-[var(--admin-card-border)] flex justify-between items-center">
          <h3 className="font-bold text-lg text-[var(--admin-text-primary)]">High-Value Customer Predictions</h3>
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-all">View All Scores &rarr;</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--admin-card)] border-b border-[var(--admin-card-border)]">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Engagement Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest">Predicted CLV</th>
                <th className="px-8 py-5 text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-widest text-right">Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(predictions as any)?.data?.data?.map((pred: any) => (
                <tr key={pred._id} className="hover:bg-[var(--admin-card)]/[0.02] transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--admin-card)] flex items-center justify-center text-xs font-black border border-[var(--admin-card-border)]">
                        {pred.customer?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--admin-text-primary)]">{pred.customer?.name}</p>
                        <p className="text-[10px] text-[var(--admin-text-secondary)] font-bold">{pred.customer?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-1.5 bg-[var(--admin-card)] rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${pred.score * 100}%` }} />
                      </div>
                      <span className="text-xs font-black text-[var(--admin-text-primary)]">{(pred.score * 100).toFixed(0)}/100</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-emerald-400">₹{pred.type === 'ltv' ? pred.score * 10000 : '4,200'}</td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-xs font-black text-[var(--admin-text-primary)] bg-[var(--admin-card)] px-3 py-1 rounded-lg">High Probability</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default AIMarketing;


