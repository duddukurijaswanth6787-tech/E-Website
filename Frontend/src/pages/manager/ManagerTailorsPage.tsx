import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// import type { TailorProductivity } from '../../api/services/managerDashboard.service';
import { managerDashboardService } from '../../api/services/managerDashboard.service';
import TailorWorkloadHeatmap from '../../components/manager/TailorWorkloadHeatmap';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle,
  Download
} from 'lucide-react';

const ManagerTailorsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tailorsRes, isLoading, refetch } = useQuery({
    queryKey: ['managerTailorProductivity'],
    queryFn: managerDashboardService.getTailorProductivity,
    refetchInterval: 30000,
  });

  const tailors = tailorsRes?.data || [];

  const filteredTailors = tailors.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tailorCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overloadedCount = tailors.filter(t => t.status === 'OVERLOADED').length;
  const availableCount = tailors.filter(t => t.status === 'AVAILABLE').length;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-stone-500 font-medium uppercase tracking-widest text-xs font-bold">Scanning Production Force...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">Production Workforce</h1>
          </div>
          <p className="text-stone-500 text-sm font-medium">Real-time workload heatmap and productivity tracking.</p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10">
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Operational</span>
          </div>
          <h3 className="text-3xl font-black text-stone-900 mb-1">{availableCount}</h3>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Available Tailors</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase">Critical</span>
          </div>
          <h3 className="text-3xl font-black text-stone-900 mb-1">{overloadedCount}</h3>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Overloaded Personnel</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl shadow-stone-900/10 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <RefreshCw className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <h3 className="text-3xl font-black mb-1">
            {Math.round((tailors.reduce((acc, t) => acc + t.loadPercentage, 0) / Math.max(tailors.length, 1)))}%
          </h3>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Avg. Capacity Utilized</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by name or tailor code..." 
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 transition-all">
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
          <button 
            onClick={() => refetch()}
            className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Heatmap Table */}
      <TailorWorkloadHeatmap 
        tailors={filteredTailors} 
        onSelectTailor={(t) => console.log('Selected tailor', t)} 
      />
    </div>
  );
};

export default ManagerTailorsPage;
