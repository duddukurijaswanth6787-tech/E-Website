import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GlassCard } from '../../common/GlassCard';

interface StatWidgetProps {
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export const StatWidget: React.FC<StatWidgetProps> = React.memo(({ 
  label, value, trend, trendLabel, icon: Icon, iconColor = 'text-blue-400', delay = 0 
}) => {
  const isPositive = trend && trend > 0;

  return (
    <GlassCard delay={delay} hoverable className="h-full">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
          <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${iconColor}`}>
          <Icon size={24} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-6 flex items-center gap-2 text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(trend)}%</span>
          <span className="text-gray-500 font-medium">{trendLabel || 'vs last month'}</span>
        </div>
      )}
    </GlassCard>
  );
});

export const MarketingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex justify-between items-center">
        <div className="h-10 w-64 bg-white/5 rounded-xl" />
        <div className="h-10 w-32 bg-white/5 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-white/5 rounded-[2rem]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px] bg-white/5 rounded-[2.5rem]" />
        <div className="h-[400px] bg-white/5 rounded-[2.5rem]" />
      </div>
    </div>
  );
};
