import React from 'react';
import type { TailorProductivity } from '../../api/services/managerDashboard.service';
import { 
  User, 
  AlertCircle, 
  CheckCircle, 
  BarChart3,
  Scissors
} from 'lucide-react';

interface TailorWorkloadHeatmapProps {
  tailors: TailorProductivity[];
  onSelectTailor: (tailor: TailorProductivity) => void;
}

const TailorWorkloadHeatmap: React.FC<TailorWorkloadHeatmapProps> = ({ tailors, onSelectTailor }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-900 text-stone-400 text-[10px] font-bold uppercase tracking-widest border-b border-stone-800">
              <th className="px-6 py-4">Tailor Identification</th>
              <th className="px-6 py-4">Specialization</th>
              <th className="px-6 py-4">Current Workload</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Performance</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {tailors.map((tailor) => (
              <tr 
                key={tailor.id} 
                className="hover:bg-stone-50/80 transition-colors group cursor-pointer"
                onClick={() => onSelectTailor(tailor)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                      <User className="w-5 h-5 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">{tailor.name}</p>
                      <p className="text-[10px] font-medium text-stone-400 uppercase tracking-tighter">{tailor.tailorCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {tailor.specialization?.map(spec => (
                      <span key={spec} className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[9px] font-bold border border-stone-200 uppercase">
                        {spec}
                      </span>
                    )) || <span className="text-[10px] text-stone-300 italic uppercase">Unspecified</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="w-full max-w-[120px]">
                      <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                        <span className="text-stone-500 uppercase">{tailor.currentAssignedCount} / {tailor.dailyCapacity}</span>
                        <span className={tailor.loadPercentage >= 100 ? 'text-red-500' : 'text-stone-400'}>{tailor.loadPercentage}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            tailor.loadPercentage >= 100 ? 'bg-red-500' : 
                            tailor.loadPercentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(tailor.loadPercentage, 100)}%` }}
                        />
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4 text-center">
                   {tailor.status === 'OVERLOADED' ? (
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 uppercase">
                        <AlertCircle className="w-3 h-3" /> Overloaded
                     </span>
                   ) : tailor.status === 'HIGH' ? (
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 uppercase">
                        <BarChart3 className="w-3 h-3" /> High Load
                     </span>
                   ) : (
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 uppercase">
                        <CheckCircle className="w-3 h-3" /> Available
                     </span>
                   )}
                </td>
                <td className="px-6 py-4 text-right">
                   <p className="text-xs font-bold text-stone-900">{tailor.completedOrdersCount}</p>
                   <p className="text-[10px] text-stone-400 uppercase font-medium">Total Orders</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-stone-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all group-hover:translate-x-1">
                    <Scissors className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TailorWorkloadHeatmap;
