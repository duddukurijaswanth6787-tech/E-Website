import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, Smartphone, Monitor, Tablet,
  AlertTriangle, RefreshCw, Layers
} from 'lucide-react';
import { analyticsService } from '../../../api/services/analytics.service';
import { GlassCard } from '../../../components/common/GlassCard';
import { MarketingSkeleton } from '../../../components/admin/marketing/MarketingComponents';

const BehaviorHeatmaps: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('homepage');
  const [viewType, setViewType] = useState<'click' | 'rage' | 'dead'>('click');

  const { data: heatmapRes, isLoading } = useQuery({
    queryKey: ['heatmapData', currentPage, viewType],
    queryFn: () => analyticsService.getHeatmapData({ path: currentPage, type: viewType }),
    refetchInterval: 30000
  });

  const dots = heatmapRes?.data?.data || [];

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className=" space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Activity className="text-rose-500" size={32} />
            User Pulse
          </h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">
            Interaction heatmaps & behavioral friction intelligence
          </p>
        </div>
        <div className="flex bg-[var(--admin-card)] p-1 rounded-2xl border border-[var(--admin-card-border)] w-full lg:w-auto overflow-x-auto scrollbar-hide">
          {['homepage', 'shop', 'product-detail', 'checkout'].map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${currentPage === p ? 'bg-rose-600 text-[var(--admin-text-primary)] shadow-lg shadow-rose-600/20' : 'text-[var(--admin-text-secondary)] hover:text-gray-300'}`}
            >
              {p.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Interaction Map Visualizer */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {['click', 'rage', 'dead'].map((v) => (
                <button
                  key={v}
                  onClick={() => setViewType(v as any)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${viewType === v ? 'bg-rose-600/20 border-rose-600 text-rose-500' : 'bg-[var(--admin-card)] border-[var(--admin-card-border)] text-[var(--admin-text-secondary)]'}`}
                >
                  {v} maps
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
              <RefreshCw size={12} /> Auto-refreshing
            </div>
          </div>

          <div className="aspect-[16/9] bg-neutral-900 rounded-[2.5rem] border border-[var(--admin-card-border)] relative overflow-hidden group">
            {/* Visualizing the "Page" */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://vasanthicreations.com/placeholder-bg.jpg')] bg-cover bg-center grayscale" />
            
            {/* Heatmap Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {dots.map((dot: any, i: number) => (
                <div 
                  key={i}
                  className="absolute w-8 h-8 rounded-full blur-xl"
                  style={{ 
                    left: `${dot.x}%`, 
                    top: `${dot.y}%`, 
                    backgroundColor: viewType === 'click' ? `rgba(59, 130, 246, ${dot.intensity})` : viewType === 'rage' ? `rgba(244, 63, 94, ${dot.intensity})` : `rgba(245, 158, 11, ${dot.intensity})`
                  }}
                />
              ))}
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-8 left-8 z-20 flex items-center gap-4">
              <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-[var(--admin-card-border)] flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Activity: 42 Visitors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Behavioral Sidebar */}
        <div className="space-y-6">
          <GlassCard className="!p-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--admin-text-secondary)] mb-6 flex items-center gap-2">
              <Layers size={16} /> Device Spread
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Desktop', val: 65, icon: <Monitor size={14} /> },
                { label: 'Mobile', val: 28, icon: <Smartphone size={14} /> },
                { label: 'Tablet', val: 7, icon: <Tablet size={14} /> },
              ].map((d) => (
                <div key={d.label} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="flex items-center gap-2 text-gray-400">{d.icon} {d.label}</span>
                    <span className="text-[var(--admin-text-primary)]">{d.val}%</span>
                  </div>
                  <div className="w-full h-1 bg-[var(--admin-card)] rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${d.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="!p-6 border-amber-500/20">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-500 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} /> UX Friction
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Rage Clicks Detected</p>
                <p className="text-lg font-black text-[var(--admin-text-primary)] mt-1">"Apply Coupon" Button</p>
                <p className="text-[10px] text-gray-600 mt-2 font-bold uppercase tracking-tighter">Avg 4.2 clicks per attempt</p>
              </div>
              <button className="w-full py-3 bg-[var(--admin-card)] hover:bg-[var(--admin-card)]/10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-[var(--admin-card-border)] transition-all">
                Inspect Session Replays
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default BehaviorHeatmaps;


