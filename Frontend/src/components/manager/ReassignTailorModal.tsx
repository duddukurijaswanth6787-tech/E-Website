import React, { useState } from 'react';
import { 
  X, 
  Search, 
  User, 
  AlertTriangle, 
  ShieldAlert,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import type { TailorProductivity } from '../../api/services/managerDashboard.service';
import { managerDashboardService } from '../../api/services/managerDashboard.service';
import { adminWorkflowService } from '../../api/services/adminWorkflow.service';
import toast from 'react-hot-toast';

interface ReassignTailorModalProps {
  taskId: string;
  taskNumber: string;
  currentTailorId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReassignTailorModal: React.FC<ReassignTailorModalProps> = ({ 
  taskId, 
  taskNumber, 
  currentTailorId, 
  isOpen, 
  onClose 
}) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTailorId, setSelectedTailorId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [override, setOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const { data: tailorsRes, isLoading } = useQuery({
    queryKey: ['managerTailorProductivity'],
    queryFn: managerDashboardService.getTailorProductivity,
    enabled: isOpen
  });

  const mutation = useMutation({
    mutationFn: (data: any) => adminWorkflowService.reassignTailor(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerWorkflows'] });
      queryClient.invalidateQueries({ queryKey: ['managerTailorProductivity'] });
      toast.success('Task reassigned successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Reassignment failed');
    }
  });

  const tailors = tailorsRes?.data || [];
  const filteredTailors = tailors.filter(t => 
    t.id !== currentTailorId &&
    (t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.tailorCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedTailor = tailors.find(t => t.id === selectedTailorId);
  const isOverloaded = selectedTailor?.status === 'OVERLOADED';

  const handleReassign = () => {
    if (!selectedTailorId) return toast.error('Please select a tailor');
    if (!reason) return toast.error('Reason for reassignment is mandatory');
    if (isOverloaded && !override) return toast.error('Target tailor is overloaded. Enable override if authorized.');
    if (override && !overrideReason) return toast.error('Override reason is required');

    mutation.mutate({
      tailorId: selectedTailorId,
      reason,
      override,
      overrideReason: override ? overrideReason : undefined
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-stone-900 p-6 flex justify-between items-center text-white">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Reassign Production Task</h3>
            <p className="text-xs font-bold text-stone-400 mt-1 uppercase tracking-widest">Task ID: #{taskNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[500px]">
          {/* Left: Tailor List */}
          <div className="w-full md:w-1/2 border-r border-stone-100 flex flex-col">
            <div className="p-4 bg-stone-50 border-b border-stone-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search available tailors..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoading ? (
                <div className="p-8 text-center text-stone-400 text-xs animate-pulse">Scanning workforce...</div>
              ) : filteredTailors.map(tailor => (
                <button
                  key={tailor.id}
                  onClick={() => setSelectedTailorId(tailor.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                    selectedTailorId === tailor.id 
                    ? 'bg-amber-50 border-amber-500 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-stone-50 hover:border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      selectedTailorId === tailor.id ? 'bg-amber-100 border-amber-200' : 'bg-stone-100 border-stone-200'
                    }`}>
                      <User className={`w-4 h-4 ${selectedTailorId === tailor.id ? 'text-amber-600' : 'text-stone-400'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">{tailor.name}</p>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">{tailor.tailorCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[9px] font-black uppercase ${
                      tailor.status === 'OVERLOADED' ? 'text-red-500' : 
                      tailor.status === 'HIGH' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {tailor.loadPercentage}% Load
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Reassignment Logic */}
          <div className="w-full md:w-1/2 p-6 flex flex-col bg-stone-50/50">
            {selectedTailor ? (
              <div className="space-y-5 flex-1">
                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Assignment Destination</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white text-xs font-black">
                      {selectedTailor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">{selectedTailor.name}</p>
                      <p className="text-[10px] font-medium text-stone-500">Current Load: {selectedTailor.currentAssignedCount} Tasks</p>
                    </div>
                  </div>
                  
                  {isOverloaded && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-red-800 uppercase tracking-tight">Capacity Threshold Exceeded</p>
                        <p className="text-[9px] text-red-600 leading-tight mt-0.5">This tailor is currently over their daily limit. Only Senior Managers can bypass this.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Reason for Reassignment</label>
                    <textarea 
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                      rows={3}
                      placeholder="e.g., Original tailor absent, Urgent deadline escalation..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  {isOverloaded && (
                    <div className="pt-2 border-t border-stone-200">
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input 
                          type="checkbox" 
                          className="rounded text-amber-500 focus:ring-amber-500"
                          checked={override}
                          onChange={(e) => setOverride(e.target.checked)}
                        />
                        <span className="text-xs font-bold text-red-600 uppercase tracking-tight flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" /> Authorize Workload Override
                        </span>
                      </label>
                      
                      {override && (
                        <textarea 
                          className="w-full p-3 bg-red-50/30 border border-red-100 rounded-xl text-xs text-red-800 focus:ring-2 focus:ring-red-500 transition-all outline-none"
                          rows={2}
                          placeholder="Provide mandatory override justification..."
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-stone-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">No Destination Selected</p>
                  <p className="text-[10px] text-stone-300 mt-1 font-medium">Select a tailor from the operational list to initiate transfer logic.</p>
                </div>
              </div>
            )}

            <div className="mt-auto pt-6">
              <button 
                disabled={!selectedTailorId || mutation.isPending}
                onClick={handleReassign}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                  selectedTailorId 
                  ? 'bg-stone-900 text-white hover:bg-black shadow-stone-900/20' 
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {mutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Finalize Transfer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReassignTailorModal;
