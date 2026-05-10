import React from 'react';
import { 
  Ruler, 
  Trash2, 
  Edit3, 
  Copy,
  Star,
  CheckCircle2
} from 'lucide-react';
import type { MeasurementProfile } from '../../utils/measurementSchema';

interface PremiumMeasurementCardProps {
  profile: MeasurementProfile;
  onEdit: (profile: MeasurementProfile) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const PremiumMeasurementCard: React.FC<PremiumMeasurementCardProps> = ({ 
  profile, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onSetDefault 
}) => {
  return (
    <div className={`bg-white rounded-[2.5rem] border transition-all overflow-hidden ${profile.isDefault ? 'border-primary-900 shadow-xl' : 'border-stone-200 hover:border-stone-300 shadow-sm'}`}>
      <div className="p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profile.isDefault ? 'bg-primary-900 text-white' : 'bg-stone-50 text-stone-400'}`}>
              <Ruler size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-serif font-bold text-stone-900">{profile.name}</h4>
                {profile.isDefault && (
                  <span className="px-2 py-0.5 bg-primary-50 text-primary-900 text-[8px] font-black uppercase tracking-widest rounded-full border border-primary-100 flex items-center gap-1">
                    <Star size={8} fill="currentColor" /> Default Fit
                  </span>
                )}
              </div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{profile.category}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {Object.entries(profile.measurements).slice(0, 4).map(([key, value]) => (
              <div key={key}>
                <p className="text-[8px] font-black text-stone-400 uppercase tracking-tighter mb-0.5">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm font-bold text-stone-900">{value} in</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-stone-100 pt-6 md:pt-0 md:pl-8">
          <button 
            onClick={() => onEdit(profile)}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-50 text-stone-600 hover:bg-stone-900 hover:text-white transition-all group"
          >
            <Edit3 size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Edit</span>
          </button>
          <button 
            onClick={() => onDuplicate(profile._id!)}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-50 text-stone-600 hover:bg-stone-900 hover:text-white transition-all group"
          >
            <Copy size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Clone</span>
          </button>
          {!profile.isDefault && (
            <button 
              onClick={() => onSetDefault(profile._id!)}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all group"
            >
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Default</span>
            </button>
          )}
          <button 
            onClick={() => onDelete(profile._id!)}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all group"
          >
            <Trash2 size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumMeasurementCard;
