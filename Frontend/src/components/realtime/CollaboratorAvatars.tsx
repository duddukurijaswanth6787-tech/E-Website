import React from 'react';
import { type WorkflowCollaborator } from '../../realtime/collaborationStore';
import { cn } from '../../lib/utils';

interface CollaboratorAvatarsProps {
  collaborators: WorkflowCollaborator[];
  max?: number;
}

const CollaboratorAvatars: React.FC<CollaboratorAvatarsProps> = ({ collaborators, max = 3 }) => {
  const visible = collaborators.slice(0, max);
  const remaining = Math.max(0, collaborators.length - max);

  if (collaborators.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((c) => (
        <div 
          key={c.userId}
          className={cn(
            "w-7 h-7 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-600 relative group cursor-help",
            c.isEditing && "ring-2 ring-amber-500 ring-offset-1 border-amber-500"
          )}
          title={`${c.name} (${c.role})${c.isEditing ? ' - Editing' : ''}`}
        >
          {c.name.charAt(0)}
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-900 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            <span className="font-bold">{c.name}</span>
            <span className="opacity-60 ml-1">({c.role})</span>
            {c.isEditing && <span className="text-amber-500 ml-1 font-bold">● Editing</span>}
          </div>

          {/* Status Dot */}
          <span className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white",
            c.isEditing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
          )} />
        </div>
      ))}

      {remaining > 0 && (
        <div className="w-7 h-7 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center text-[9px] font-bold text-stone-500">
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default CollaboratorAvatars;
