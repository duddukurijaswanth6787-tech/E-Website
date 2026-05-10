import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  Clock, 
  User, 
  ChevronRight,
  Lock,
  Activity
} from 'lucide-react';
import type { WorkflowTask } from '../../api/services/tailorWorkflow.service';
import { format } from 'date-fns';
import { useCollaborationStore } from '../../realtime/collaborationStore';
import { useAuthStore } from '../../store/authStore';
import CollaboratorAvatars from '../realtime/CollaboratorAvatars';
import { WORKFLOW_STAGES, PRIORITY_CONFIG } from '../../utils/workflowPalette';

interface WorkflowCardProps {
  task: WorkflowTask;
  onClick: (task: WorkflowTask) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: task,
  });

  const user = useAuthStore((s) => s.user);
  const collaborators = useCollaborationStore((s) => s.occupancy[task._id] || []);
  const otherCollaborators = collaborators.filter(c => c.userId !== user?.id);
  const activeEditor = collaborators.find(c => c.isEditing);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const stage = WORKFLOW_STAGES[task.status] || WORKFLOW_STAGES.Assigned;
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.Medium;

  const isOverdue = new Date(task.deadline) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`
        bg-white rounded-xl border p-4 shadow-sm hover:shadow-md 
        transition-all cursor-grab active:cursor-grabbing group mb-3 relative overflow-hidden
        ${task.isSlaViolated || isOverdue ? 'border-red-200' : 'border-stone-200'}
        ${priority.glow}
      `}
    >
      {/* Delayed indicator */}
      {(task.isSlaViolated || isOverdue) && (
        <div className="absolute top-0 right-0">
          <div className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl uppercase tracking-tighter animate-pulse">
            Delayed
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">#{task.taskNumber}</span>
          {activeEditor && (
             <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase bg-amber-50 px-1 rounded animate-pulse">
               <Lock size={8} /> Editing
             </div>
          )}
        </div>
        <div className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${priority.bgColor} ${priority.color} ${priority.borderColor}`}>
          {task.priority}
        </div>
      </div>

      <h4 className="text-sm font-bold text-stone-800 line-clamp-2 mb-3 leading-tight group-hover:text-primary-800 transition-colors">
        {task.taskDescription}
      </h4>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${stage.bgColor} flex items-center justify-center`}>
            <stage.icon className={`w-3.5 h-3.5 ${stage.color}`} />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${stage.color}`}>
            {stage.label}
          </span>
        </div>
        
        {/* Progress Pulse */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-50 rounded-full">
           <Activity size={10} className="text-stone-400" />
           <div className="w-12 h-1 bg-stone-200 rounded-full overflow-hidden">
              <div className={`h-full ${stage.color.replace('text-', 'bg-')} transition-all duration-500`} style={{ width: '40%' }}></div>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
          <User className="w-3.5 h-3.5 text-stone-400" />
        </div>
        <span className="text-xs font-semibold text-stone-600 truncate">
          {task.tailorId?.name || 'Unassigned'}
        </span>
      </div>

      <div className="pt-3 border-t border-stone-50 flex items-center justify-between">
        <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-bold' : 'text-stone-400'}`}>
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium">
            {format(new Date(task.deadline), 'MMM d, HH:mm')}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
           <CollaboratorAvatars collaborators={otherCollaborators} max={2} />
           <button className="text-stone-300 group-hover:text-primary-600 transition-colors">
             <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
