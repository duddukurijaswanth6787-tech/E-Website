import { Clock, AlertTriangle } from 'lucide-react';
import type { WorkflowTask } from '../../api/services/tailorWorkflow.service';

interface TaskCardProps {
  task: WorkflowTask;
  onClick: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Assigned':
    case 'Fabric Received':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Cutting':
    case 'Stitching':
    case 'Embroidery':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Trial Ready':
    case 'Alteration':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Rework':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Ready for QC':
    case 'Completed':
    case 'Delivered':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const isOverdue = new Date(task.deadline) < new Date();
  const isDueSoon = !isOverdue && new Date(task.deadline).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

  return (
    <div 
      onClick={() => onClick(task._id)}
      className={`bg-white border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
        task.escalationFlags.includes('Urgent') || task.escalationFlags.includes('Delayed') 
          ? 'border-red-300 ring-1 ring-red-100' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-gray-500 tracking-wider">{task.taskNumber}</span>
          <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">{task.taskDescription}</h3>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {task.priority === 'Urgent' && (
           <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
             <AlertTriangle size={12} className="mr-1" /> URGENT
           </span>
        )}
        {task.escalationFlags.map(flag => (
           <span key={flag} className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
             <AlertTriangle size={12} className="mr-1" /> {flag.toUpperCase()}
           </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
        <div className={`flex items-center font-medium ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-gray-500'}`}>
          <Clock size={16} className="mr-1.5" />
          {new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {isOverdue && <span className="ml-2 text-xs font-bold uppercase">(Overdue)</span>}
          {isDueSoon && <span className="ml-2 text-xs font-bold uppercase text-amber-600">(Due Today)</span>}
        </div>
        
        {task.referenceImages && task.referenceImages.length > 0 && (
          <div className="flex -space-x-2">
             <img src={task.referenceImages[0]} alt="Ref" className="w-8 h-8 rounded bg-gray-200 border-2 border-white object-cover" />
             {task.referenceImages.length > 1 && (
               <div className="w-8 h-8 rounded bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
                 +{task.referenceImages.length - 1}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
