import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Filter, Users, Eye, ShoppingCart, 
  CreditCard, CheckCircle2, ArrowDown,
  AlertTriangle, Zap
} from 'lucide-react';
import { analyticsService } from '../../../api/services/analytics.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';
import { motion } from 'framer-motion';

const ConversionFunnel: React.FC = () => {
  const { data: insightsRes, isLoading } = useQuery({
    queryKey: ['executiveInsights'],
    queryFn: () => analyticsService.getExecutiveInsights()
  });

  const insights = insightsRes?.data?.data;
  const realFunnel = insights?.funnel || [];

  const funnelSteps = [
    { label: 'Visitors', icon: Users, count: realFunnel[0]?.count || 0, color: 'from-blue-500/20 to-blue-500/40', textColor: 'text-blue-400' },
    { label: 'Product Views', icon: Eye, count: realFunnel[1]?.count || 0, color: 'from-purple-500/20 to-purple-500/40', textColor: 'text-purple-400' },
    { label: 'Add to Cart', icon: ShoppingCart, count: realFunnel[2]?.count || 0, color: 'from-pink-500/20 to-pink-500/40', textColor: 'text-pink-400' },
    { label: 'Checkout', icon: CreditCard, count: realFunnel[3]?.count || 0, color: 'from-amber-500/20 to-amber-500/40', textColor: 'text-amber-400' },
    { label: 'Purchase', icon: CheckCircle2, count: realFunnel[4]?.count || 0, color: 'from-emerald-500/20 to-emerald-500/40', textColor: 'text-emerald-400' },
  ];

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className=" space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Filter className="text-purple-500" size={32} />
            Funnel Intel
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Behavioral conversion flow & abandonment intelligence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
        {/* Funnel Visualizer */}
        <div className="xl:col-span-2 space-y-6">
          {funnelSteps.map((step, idx) => {
            const nextStep = funnelSteps[idx + 1];
            const dropoff = nextStep ? ((1 - nextStep.count / step.count) * 100).toFixed(1) : 0;
            const width = 100 - (idx * 8);

            return (
              <React.Fragment key={step.label}>
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group"
                >
                  <div 
                    className={`h-24 bg-gradient-to-r ${step.color} rounded-[2rem] border border-[var(--admin-card-border)] p-6 flex items-center justify-between group-hover:border-white/20 transition-all shadow-xl`}
                    style={{ width: `${width}%`, marginLeft: `${idx * 4}%` }}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl bg-[var(--admin-card)] ${step.textColor}`}>
                        <step.icon size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)]">{step.label}</p>
                        <p className="text-2xl font-black text-[var(--admin-text-primary)]">{step.count.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)]">Conversion</p>
                      <p className="text-lg font-black text-[var(--admin-text-primary)]">{idx === 0 ? '100%' : ((step.count / funnelSteps[0].count) * 100).toFixed(1) + '%'}</p>
                    </div>
                  </div>
                </motion.div>
                
                {nextStep && (
                  <div className="flex justify-center py-2" style={{ marginLeft: `${(idx + 1) * 4}%`, width: `${100 - (idx + 1) * 8}%` }}>
                    <div className="flex flex-col items-center gap-1 opacity-40">
                      <ArrowDown size={16} className="text-gray-600" />
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{dropoff}% Drop-off</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Abandonment Insights */}
        <div className="space-y-8">
          <GlassCard className="border-rose-500/20">
            <div className="flex items-center gap-3 mb-6 text-rose-500">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-lg uppercase tracking-tight">Friction zones</h3>
            </div>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Cart Abandonment</p>
                <p className="text-2xl font-black text-[var(--admin-text-primary)]">42.8%</p>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-2">Users dropping out after adding items to cart. Higher than industry avg.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--admin-card)] border border-[var(--admin-card-border)]">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Checkout Friction</p>
                <p className="text-2xl font-black text-[var(--admin-text-primary)]">15.2%</p>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-2">Drop-off during payment processing. Check gateway health.</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-emerald-500/20">
            <div className="flex items-center gap-3 mb-6 text-emerald-500">
              <Zap size={24} />
              <h3 className="font-bold text-lg uppercase tracking-tight">Optimization</h3>
            </div>
            <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-[var(--admin-text-primary)] rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
              Run Retargeting Campaign
            </button>
            <p className="text-[10px] text-gray-600 font-black text-center mt-4 uppercase tracking-[0.2em]">Targeted at 1.2k cart abandoners</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ConversionFunnel;


