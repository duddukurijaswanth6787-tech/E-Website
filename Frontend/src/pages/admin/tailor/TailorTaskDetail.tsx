import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskDetails, useUpdateTaskStatus, useAddTailorNote } from '../../../hooks/useTailorWorkflows';
import { 
  ArrowLeft, 
  AlertTriangle, 
  MessageSquare,
  Scissors,
  Activity,
  History,
  Phone,
  Calendar,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { WORKFLOW_STAGES, PRIORITY_CONFIG } from '../../../utils/workflowPalette';
import { MEASUREMENT_SCHEMA } from '../../../utils/measurementSchema';
import { Loader } from '../../../components/common/Loader';

const TailorTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: response, isLoading, error } = useTaskDetails(id);
  const updateStatusMutation = useUpdateTaskStatus();
  const addNoteMutation = useAddTailorNote();

  const handleStatusChange = (status: string) => {
    if (!id) return;
    setIsUpdating(true);
    updateStatusMutation.mutate({ taskId: id, status }, {
      onSettled: () => setIsUpdating(false)
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || !id) return;
    addNoteMutation.mutate({ taskId: id, note }, {
      onSuccess: () => setNote('')
    });
  };

  if (isLoading) return <Loader fullPage message="Loading Task Details..." />;

  if (error || !response?.data) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <AlertTriangle size={48} className="mx-auto text-stone-300 mb-4" />
        <h2 className="text-xl font-bold text-stone-800 mb-2">Task Not Found</h2>
        <p className="text-stone-500 mb-6">This task might have been re-assigned or completed.</p>
        <button onClick={() => navigate('/tailor/tasks')} className="bg-[var(--admin-card)] text-[var(--admin-text-primary)] px-6 py-2 rounded-lg font-bold">Go Back</button>
      </div>
    );
  }

  const task = response.data;
  const stage = WORKFLOW_STAGES[task.status] || WORKFLOW_STAGES.Assigned;
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.Medium;
  const isOverdue = new Date(task.deadline) < new Date();

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button 
        onClick={() => navigate('/tailor/tasks')}
        className="flex items-center text-stone-400 hover:text-[var(--admin-text-primary)] mb-8 font-black text-[10px] uppercase tracking-widest transition-colors group"
      >
        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Task List
      </button>

      {/* Hero Header */}
      <div className="bg-[var(--admin-card)] rounded-3xl border border-[var(--admin-card-border)] shadow-sm overflow-hidden mb-8">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-widest">#{task.taskNumber}</span>
                 <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${priority.bgColor} ${priority.color} ${priority.borderColor}`}>
                    {task.priority}
                 </div>
              </div>
              <h1 className="text-3xl font-serif font-bold text-[var(--admin-text-primary)]">{task.taskDescription}</h1>
            </div>
            
            <div className="flex flex-col gap-2 w-full md:w-auto">
               <select 
                 value={task.status}
                 onChange={(e) => handleStatusChange(e.target.value)}
                 disabled={isUpdating}
                 className={`w-full md:w-64 font-black uppercase tracking-widest text-xs rounded-xl px-4 py-4 border-2 outline-none transition-all cursor-pointer shadow-sm
                   ${isUpdating ? 'opacity-50' : 'hover:border-primary-500'}
                   ${stage.bgColor} ${stage.color} ${stage.borderColor}`}
               >
                 {Object.values(WORKFLOW_STAGES).map(s => (
                   <option key={s.id} value={s.id}>{s.label}</option>
                 ))}
               </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[var(--admin-card-border)]">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--admin-card)] flex items-center justify-center text-stone-400">
                   <Calendar size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Deadline</p>
                   <p className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-[var(--admin-text-primary)]'}`}>
                     {format(new Date(task.deadline), 'MMM d, HH:mm')}
                   </p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--admin-card)] flex items-center justify-center text-stone-400">
                   <Phone size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Customer</p>
                   <p className="text-sm font-bold text-[var(--admin-text-primary)]">Verified Client</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--admin-card)] flex items-center justify-center text-stone-400">
                   <Activity size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Status</p>
                   <p className={`text-sm font-bold ${stage.color}`}>{stage.label}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Measurements Card */}
        <div className="bg-[var(--admin-card)] rounded-3xl border border-[var(--admin-card-border)] shadow-sm p-8">
          <h2 className="text-sm font-black text-[var(--admin-text-primary)] flex items-center gap-3 mb-8 uppercase tracking-widest">
            <Scissors size={18} className="text-primary-600" /> Specifications
          </h2>
          {task.measurementsSnapshot ? (
            <div className="space-y-8">
               {MEASUREMENT_SCHEMA.map(section => {
                 const sectionFields = section.fields.filter(f => task.measurementsSnapshot[f.name]);
                 if (sectionFields.length === 0) return null;
                 return (
                   <div key={section.id}>
                     <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <section.icon size={12} /> {section.title}
                     </h3>
                     <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {sectionFields.map(field => (
                          <div key={field.name} className="flex justify-between items-center border-b border-stone-50 pb-2">
                            <span className="text-xs text-stone-500 font-medium">{field.label}</span>
                            <span className="text-xs font-black text-[var(--admin-text-primary)]">{task.measurementsSnapshot[field.name]}"</span>
                          </div>
                        ))}
                     </div>
                   </div>
                 );
               })}
               
               {/* Style options from Snapshot */}
               <div>
                 <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Sparkles size={12} /> Style Details
                 </h3>
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
          ) : (
            <div className="py-12 text-center">
               <p className="text-xs text-stone-400 italic">No measurements recorded.</p>
            </div>
          )}
        </div>

        {/* Timeline/History Card */}
        <div className="bg-[var(--admin-card)] rounded-3xl border border-[var(--admin-card-border)] shadow-sm p-8">
          <h2 className="text-sm font-black text-[var(--admin-text-primary)] flex items-center gap-3 mb-8 uppercase tracking-widest">
            <History size={18} className="text-primary-600" /> Production Log
          </h2>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {task.eventHistory?.slice().reverse().map((event: any, idx: number) => (
              <div key={idx} className="relative pl-6 before:absolute before:left-1 before:top-2 before:bottom-0 before:w-px before:bg-stone-100 last:before:hidden">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-stone-300 border-2 border-white" />
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{event.eventType}</p>
                <p className="text-xs font-bold text-stone-800">{event.newState || 'Status Updated'}</p>
                <p className="text-[9px] text-stone-400 mt-1">{format(new Date(event.timestamp), 'MMM d, HH:mm')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production Notes */}
      <div className="bg-[var(--admin-card)] rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 border-b border-[var(--admin-card-border)]">
           <h2 className="text-sm font-black text-[var(--admin-text-primary)] flex items-center gap-3 uppercase tracking-[0.2em]">
              <MessageSquare size={18} className="text-primary-400" /> Production Briefing
           </h2>
        </div>

        <div className="p-8 border-b border-[var(--admin-card-border)] bg-amber-500/5">
           <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Manager Instructions</h3>
           <div className="space-y-4">
             {task.adminNotes?.map((n: any, idx: number) => (
               <div key={idx} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                 <p className="text-amber-100 text-xs leading-relaxed font-medium">{n.note}</p>
                 <p className="text-[8px] text-amber-500/60 mt-2 font-black uppercase tracking-widest">
                   {n.authorModel} • {format(new Date(n.createdAt), 'MMM d, HH:mm')}
                 </p>
               </div>
             ))}
             {(!task.adminNotes || task.adminNotes.length === 0) && (
               <p className="text-stone-600 text-[10px] italic">No specific manager instructions for this task.</p>
             )}
           </div>
        </div>
        
        <div className="p-8">
           <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Your Production Notes</h3>
          <div className="space-y-6 mb-8">
            {task.tailorNotes.map((n: any, idx: number) => (
              <div key={idx} className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-2xl p-6 ml-4 relative">
                <div className="absolute -left-10 top-6 w-8 h-8 bg-primary-900 text-[var(--admin-text-primary)] rounded-xl flex items-center justify-center font-black text-[10px] shadow-lg">
                   YOU
                </div>
                <p className="text-stone-200 text-sm leading-relaxed">{n.note}</p>
                <p className="text-[9px] text-stone-500 mt-4 font-black uppercase tracking-widest">{format(new Date(n.createdAt), 'MMM d, HH:mm')}</p>
              </div>
            ))}
            {task.tailorNotes.length === 0 && (
               <p className="text-center text-stone-500 text-xs italic py-8">No notes recorded for this task yet.</p>
            )}
          </div>

          <form onSubmit={handleAddNote} className="flex gap-4 items-center bg-[var(--admin-card)] p-2 rounded-2xl border border-[var(--admin-card-border)]">
            <input 
              type="text" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Report progress or issues..."
              className="flex-1 bg-transparent border-none text-[var(--admin-text-primary)] px-4 py-3 text-sm focus:outline-none placeholder:text-stone-600"
              disabled={addNoteMutation.isPending}
            />
            <button 
              type="submit"
              disabled={!note.trim() || addNoteMutation.isPending}
              className="bg-[var(--admin-card)] text-[var(--admin-text-primary)] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-400 transition-colors disabled:opacity-50"
            >
              Post Note
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TailorTaskDetail;


