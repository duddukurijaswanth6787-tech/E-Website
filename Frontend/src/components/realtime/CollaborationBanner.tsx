import React from 'react';
import { ShieldAlert, Lock, UserCheck } from 'lucide-react';
import { type WorkflowCollaborator } from '../../realtime/collaborationStore';

interface CollaborationBannerProps {
  activeEditor: WorkflowCollaborator | null;
  isEditing: boolean;
  isConnected: boolean;
}

const CollaborationBanner: React.FC<CollaborationBannerProps> = ({ 
  activeEditor, 
  isEditing, 
  isConnected 
}) => {
  if (!isConnected) {
    return (
      <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 flex items-center gap-2 animate-pulse">
        <ShieldAlert size={14} className="text-stone-400" />
        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
          Syncing Collaboration State...
        </span>
      </div>
    );
  }

  if (activeEditor) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-amber-600" />
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">
            ReadOnly Mode
          </span>
          <span className="text-[10px] text-amber-700 ml-2 font-medium">
            {activeEditor.name} ({activeEditor.role}) is currently editing this workflow.
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[9px] font-bold text-amber-600 uppercase">Live Collaboration Active</span>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck size={14} className="text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest">
            Editing Mode
          </span>
          <span className="text-[10px] text-emerald-700 ml-2 font-medium">
            You have the active edit lock. Changes will be saved to production.
          </span>
        </div>
        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">
          Revision Guard Active
        </span>
      </div>
    );
  }

  return null;
};

export default CollaborationBanner;
