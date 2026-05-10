import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { WorkflowStatus } from '../../api/services/tailorWorkflow.service';

interface KanbanColumnProps {
  id: WorkflowStatus;
  title: string;
  count: number;
  children: React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, count, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-80 flex flex-col bg-stone-100/50 rounded-xl border border-stone-200 transition-colors
        ${isOver ? 'bg-amber-50 border-amber-200' : ''}
      `}
    >
      <div className="p-4 flex items-center justify-between sticky top-0 bg-stone-100/80 backdrop-blur-sm rounded-t-xl z-10">
        <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
          {title}
          <span className="bg-white px-2 py-0.5 rounded-full border border-stone-200 text-[10px] text-stone-500">
            {count}
          </span>
        </h3>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto min-h-[500px]">
        {children}
      </div>
    </div>
  );
};

export default KanbanColumn;
