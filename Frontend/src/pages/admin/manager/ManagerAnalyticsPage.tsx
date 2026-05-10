import { useQuery } from '@tanstack/react-query';
import { managerDashboardService } from '../../../api/services/managerDashboard.service';
import { 
  LineChart as LineChartIcon, 
  TrendingUp, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

const ManagerAnalyticsPage = () => {
  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['managerDashboardAnalytics'],
    queryFn: managerDashboardService.getDashboardAnalytics,
  });

  const analytics = analyticsRes?.data;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-stone-500 font-bold uppercase tracking-widest text-xs font-bold">Aggregating Production Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <LineChartIcon className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">Operational Intelligence</h1>
        </div>
        <p className="text-stone-500 text-sm font-medium">Production performance metrics, quality ratios, and SLA adherence trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
           <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <Activity className="w-4 h-4" /> Production Throughput
           </h3>
           <div className="flex items-end gap-1 h-48 mb-6">
              {[65, 45, 78, 52, 90, 85, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full bg-stone-100 rounded-t-lg group-hover:bg-amber-500 transition-all duration-300 relative"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h} Units
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">Day {i+1}</span>
                </div>
              ))}
           </div>
           <div className="flex justify-between items-center pt-6 border-t border-stone-100">
              <div>
                <p className="text-2xl font-black text-stone-900">480</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase">Weekly Output</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4" /> +12%
                </p>
                <p className="text-[10px] font-bold text-stone-400 uppercase">vs Prev Week</p>
              </div>
           </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-xl text-white">
           <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-6 flex items-center gap-2">
             <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Quality Control Ratios
           </h3>
           
           <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">First-Pass Yield</span>
                  <span className="text-xs font-black">94.2%</span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[94.2%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Rework Rate</span>
                  <span className="text-xs font-black text-red-400">5.8%</span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[5.8%]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                 <div className="bg-stone-800/50 p-4 rounded-2xl border border-stone-800">
                    <p className="text-xl font-black text-white">{analytics?.reworkCount || 0}</p>
                    <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Items in Rework</p>
                 </div>
                 <div className="bg-stone-800/50 p-4 rounded-2xl border border-stone-800">
                    <p className="text-xl font-black text-white">12h</p>
                    <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Avg. Repair Time</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
           <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <Clock className="w-4 h-4" /> SLA Adherence Trend
           </h3>
           <div className="flex items-center justify-center py-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-stone-100" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-amber-500" strokeWidth="4" strokeDasharray="85, 100" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-stone-900">85%</span>
                  <span className="text-[9px] font-bold text-stone-400 uppercase">On-Time</span>
                </div>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-stone-600 uppercase">Delivered On-Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-stone-100" />
                <span className="text-[10px] font-bold text-stone-600 uppercase">Delayed / Overdue</span>
              </div>
           </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
           <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <AlertTriangle className="w-4 h-4 text-red-500" /> Production Bottlenecks
           </h3>
           <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-red-900 uppercase">Cutting Stage</p>
                  <p className="text-[10px] text-red-600 font-medium">Avg. Wait Time: 4.2 Hours</p>
                </div>
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-amber-900 uppercase">Stitching Queue</p>
                  <p className="text-[10px] text-amber-600 font-medium">Current Backlog: 18 Units</p>
                </div>
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalyticsPage;
