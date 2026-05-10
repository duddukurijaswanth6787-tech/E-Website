import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  History, 
  User, 
  Scissors,
  Flag,
  FileText,
  ChevronRight,
  RefreshCw,
  Phone,
  Package,
  Calendar,
  MessageSquare,
  Hash,
  Activity,
  Sparkles,
  Ruler
} from 'lucide-react';
import type { WorkflowTask } from '../../api/services/tailorWorkflow.service';
import { WorkflowStatus } from '../../api/services/tailorWorkflow.service';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminWorkflowService } from '../../api/services/adminWorkflow.service';
import ReassignTailorModal from './ReassignTailorModal';
import toast from 'react-hot-toast';
import { WORKFLOW_STAGES, PRIORITY_CONFIG } from '../../utils/workflowPalette';
import { MEASUREMENT_SCHEMA } from '../../utils/measurementSchema';

interface WorkflowDetailDrawerProps {
  task: WorkflowTask;
  isOpen: boolean;
  onClose: () => void;
}

const WorkflowDetailDrawer: React.FC<WorkflowDetailDrawerProps> = ({ task, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'notes'>('timeline');
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [managerNote, setManagerNote] = useState('');

  const escalateMutation = useMutation({
    mutationFn: (data: { escalationSeverity: string; reason: string }) => 
      adminWorkflowService.escalateWorkflow(task._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerWorkflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', task._id] });
      toast.success('Workflow escalated');
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: (note: string) => adminWorkflowService.addAdminNote(task._id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerWorkflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', task._id] });
      setManagerNote('');
      toast.success('Production note added');
    }
  });

  if (!isOpen) return null;

  const stage = WORKFLOW_STAGES[task.status] || WORKFLOW_STAGES.Assigned;
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.Medium;

  // Dynamic progress calculation
  const statusOrder = [
    WorkflowStatus.ASSIGNED, 
    WorkflowStatus.FABRIC_RECEIVED, 
    WorkflowStatus.CUTTING, 
    WorkflowStatus.STITCHING, 
    WorkflowStatus.EMBROIDERY, 
    WorkflowStatus.TRIAL_READY, 
    WorkflowStatus.QC, 
    WorkflowStatus.COMPLETED
  ];
  const currentIdx = statusOrder.indexOf(task.status as any);
  const progressPercent = currentIdx === -1 ? 0 : Math.round(((currentIdx + 1) / statusOrder.length) * 100);

  const handleAddNote = () => {
    if (!managerNote.trim()) return;
    addNoteMutation.mutate(managerNote);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[101] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-stone-200">
        
        {/* Header */}
        <div className="bg-stone-950 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Package size={120} />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 text-xs font-black uppercase tracking-widest text-amber-500">
                  #{task.taskNumber}
                </div>
                <div className={`px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-widest ${priority.bgColor} ${priority.color} ${priority.borderColor}`}>
                   {task.priority}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-serif font-bold leading-tight mb-6">{task.taskDescription}</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <User className="w-5 h-5 text-stone-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Tailor</p>
                  <p className="text-sm font-bold text-white">{task.tailorId?.name || 'Unassigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Calendar className="w-5 h-5 text-stone-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Deadline</p>
                  <p className={`text-sm font-bold ${task.isSlaViolated ? 'text-red-400' : 'text-white'}`}>
                    {format(new Date(task.deadline), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Product Quick View */}
        <div className="bg-stone-50 border-b border-stone-200 px-8 py-4 grid grid-cols-2 gap-4">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center text-primary-700">
                <Phone size={14} />
              </div>
              <div>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">Customer Contact</p>
                <p className="text-xs font-bold text-stone-900">+91 {task.orderId ? '98XXXXXX21' : 'Verified'}</p>
              </div>
           </div>
           <div className="flex items-center gap-3 border-l border-stone-200 pl-4">
              <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Hash size={14} />
              </div>
              <div>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">Order Link</p>
                <p className="text-xs font-bold text-stone-900">ORD-{task._id.substring(0,6).toUpperCase()}</p>
              </div>
           </div>
        </div>

        {/* Workflow Progression */}
        <div className="px-8 py-6 border-b border-stone-100">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-600" /> Current Stage
              </h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${stage.bgColor} ${stage.color}`}>
                {stage.label} ({progressPercent}%)
              </span>
           </div>
           <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className={`absolute top-0 left-0 h-full ${stage.color.replace('text-', 'bg-')} transition-all duration-1000 shadow-[0_0_8px_rgba(var(--tw-shadow-color),0.5)]`}
              />
           </div>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-stone-200 bg-white sticky top-0 z-10">
          {[
            { id: 'timeline', label: 'Timeline', icon: History },
            { id: 'details', label: 'Specifications', icon: Scissors },
            { id: 'notes', label: 'Production Notes', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === tab.id ? 'border-primary-900 text-primary-900' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
          {activeTab === 'timeline' && (
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100">
              {task.eventHistory?.slice().reverse().map((event, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10
                    ${idx === 0 ? 'bg-primary-900' : 'bg-stone-300'}`} 
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{event.eventType}</span>
                      <span className="text-[10px] text-stone-400 font-medium">{format(new Date(event.timestamp), 'MMM d, HH:mm')}</span>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                      <p className="text-xs font-bold text-stone-800">
                        {event.newState ? `${event.previousState || 'Inception'} → ${event.newState}` : 'Update recorded'}
                      </p>
                      {event.reason && (
                        <p className="text-xs text-stone-500 mt-2 italic leading-relaxed border-l-2 border-stone-200 pl-2">
                          "{event.reason}"
                        </p>
                      )}
                      <p className="text-[9px] text-stone-400 mt-2 font-black uppercase tracking-tighter">By {event.changedByModel || 'System'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3">
                       <FileText size={20} className="text-primary-700" />
                    </div>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-bold text-stone-900">{task.status}</p>
                 </div>
                 <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-3">
                       <Scissors size={20} className="text-primary-700" />
                    </div>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Pattern</p>
                    <p className="text-sm font-bold text-stone-900">Custom Cut</p>
                 </div>
              </div>

              <div className="space-y-6">
                {task.measurementsSnapshot ? (
                  <>
                    {MEASUREMENT_SCHEMA.map(section => {
                      const sectionFields = section.fields.filter(f => task.measurementsSnapshot[f.name]);
                      if (sectionFields.length === 0) return null;
                      return (
                        <div key={section.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                          <div className="bg-stone-50 px-6 py-3 border-b border-stone-100">
                             <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                               <section.icon size={12} /> {section.title}
                             </h4>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                              {sectionFields.map(field => (
                                <div key={field.name} className="flex justify-between items-center border-b border-stone-50 pb-2">
                                  <span className="text-xs text-stone-500 font-medium">{field.label}</span>
                                  <span className="text-xs font-black text-stone-900">{task.measurementsSnapshot[field.name]}"</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                       <div className="bg-stone-50 px-6 py-3 border-b border-stone-100">
                          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={12} /> Style Details
                          </h4>
                       </div>
                       <div className="p-6">
                         <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {Object.entries(task.measurementsSnapshot)
                              .filter(([key]) => !MEASUREMENT_SCHEMA.some(s => s.fields.some(f => f.name === key)) && typeof task.measurementsSnapshot[key] === 'string')
                              .map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center border-b border-stone-50 pb-2">
                                  <span className="text-xs text-stone-500 font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                                  <span className="text-xs font-black text-primary-700">{String(val)}</span>
                                </div>
                              ))}
                         </div>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    <Ruler size={32} className="mx-auto text-stone-300 mb-2" />
                    <p className="text-xs text-stone-400 italic">No measurements recorded.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">Manager Remarks</h4>
                <div className="space-y-4">
                  {task.adminNotes?.map((n: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">M</div>
                      <div className="flex-1 bg-stone-50 rounded-2xl p-4 border border-stone-100">
                        <p className="text-xs text-stone-800 leading-relaxed">{n.note}</p>
                        <p className="text-[9px] text-stone-400 mt-2 font-bold uppercase">{format(new Date(n.createdAt), 'MMM d, HH:mm')}</p>
                      </div>
                    </div>
                  ))}
                  {(!task.adminNotes || task.adminNotes.length === 0) && (
                    <p className="text-xs text-stone-400 italic text-center py-4">No manager notes yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl p-6 text-white">
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Tailor Briefings</h4>
                {task.tailorNotes?.length > 0 ? (
                  <div className="space-y-4">
                    {task.tailorNotes.map((n, i) => (
                      <div key={i} className="border-l-2 border-primary-500 pl-4 py-1">
                        <p className="text-xs text-white leading-relaxed">{n.note}</p>
                        <p className="text-[9px] text-stone-500 mt-1 uppercase tracking-tighter">{format(new Date(n.createdAt), 'MMM d')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">No notes from production floor.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-stone-200 flex items-center gap-4">
           <div className="flex-1 relative">
             <input 
              type="text" 
              value={managerNote}
              onChange={(e) => setManagerNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              placeholder="Post production note..." 
              className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
             />
             <button 
               onClick={handleAddNote}
               disabled={addNoteMutation.isPending}
               className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-stone-950 text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
             >
               {addNoteMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <ChevronRight className="w-4 h-4" />}
             </button>
           </div>
           <div className="flex gap-2">
             <button 
               onClick={() => setIsReassignModalOpen(true)}
               title="Reassign Tailor"
               className="p-3 bg-white border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 shadow-sm transition-all"
             >
               <RefreshCw size={18} />
             </button>
             <button 
               onClick={() => escalateMutation.mutate({ escalationSeverity: 'Urgent', reason: 'Priority Escalation' })}
               title="Mark Urgent"
               className="p-3 bg-white border border-stone-200 rounded-xl text-red-600 hover:bg-red-50 border-red-100 shadow-sm transition-all"
             >
               <Flag size={18} />
             </button>
           </div>
        </div>
      </div>

      <ReassignTailorModal 
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        taskId={task._id}
        taskNumber={task.taskNumber}
        currentTailorId={task.tailorId?._id || task.tailorId}
      />
    </>
  );
};

export default WorkflowDetailDrawer;
