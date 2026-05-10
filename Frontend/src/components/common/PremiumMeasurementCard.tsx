import React from 'react';
import { Ruler, Scissors, User, Sparkles, FileText, ChevronRight, Copy, Trash2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MeasurementProfile } from '../../utils/measurementSchema';
import { MEASUREMENT_SCHEMA } from '../../utils/measurementSchema';

interface PremiumMeasurementCardProps {
  profile: MeasurementProfile;
  onEdit?: (profile: MeasurementProfile) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  variant?: 'compact' | 'full';
}

const PremiumMeasurementCard: React.FC<PremiumMeasurementCardProps> = ({ 
  profile, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onSetDefault,
  variant = 'full' 
}) => {
  const getIconForSection = (sectionId: string) => {
    switch (sectionId) {
      case 'body': return <User size={14} />;
      case 'sleeve': return <Scissors size={14} />;
      case 'neck': return <Ruler size={14} />;
      case 'style': return <Sparkles size={14} />;
      default: return <FileText size={14} />;
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white border border-stone-200 rounded-2xl p-4 hover:border-primary-900 hover:shadow-lg transition-all group"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-stone-900 uppercase tracking-tighter">{profile.name}</h4>
              {profile.isDefault && (
                <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-[8px] font-black rounded uppercase">Default</span>
              )}
            </div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{profile.category}</p>
          </div>
          <button 
            onClick={() => onEdit?.(profile)}
            className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-primary-900 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="flex gap-2">
          {onDuplicate && (
            <button 
              onClick={() => onDuplicate(profile._id!)}
              className="flex-1 flex items-center justify-center gap-1 py-2 bg-stone-50 rounded-lg text-[9px] font-black text-stone-500 uppercase hover:bg-primary-50 hover:text-primary-900 transition-all"
            >
              <Copy size={12} /> Copy
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(profile._id!)}
              className="p-2 bg-stone-50 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all border-l-4 border-l-primary-900">
      <div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-serif font-bold text-stone-950">{profile.name}</h3>
              {profile.isDefault && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-primary-900 text-white text-[9px] font-black rounded-full uppercase tracking-widest">
                  <Star size={8} fill="currentColor" /> Premium Default
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-primary-900 uppercase tracking-[0.2em]">{profile.category}</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Updated {new Date(profile.updatedAt!).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!profile.isDefault && onSetDefault && (
              <button 
                onClick={() => onSetDefault(profile._id!)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-[10px] font-black text-stone-600 uppercase tracking-widest hover:bg-white hover:border-primary-900 transition-all"
              >
                Set Default
              </button>
            )}
            <button 
              onClick={() => onEdit?.(profile)}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-primary-900 transition-all shadow-sm"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {MEASUREMENT_SCHEMA.map(section => {
            const hasData = section.fields.some(f => profile.measurements[f.name]);
            if (!hasData) return null;

            return (
              <div key={section.id} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                  <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500">
                    {getIconForSection(section.id)}
                  </div>
                  <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">{section.title}</h4>
                </div>
                <div className="space-y-3">
                  {section.fields.map(field => (
                    profile.measurements[field.name] && (
                      <div key={field.name} className="flex justify-between items-center group">
                        <span className="text-[11px] font-medium text-stone-500">{field.label}</span>
                        <span className="text-xs font-bold text-stone-900 bg-stone-50 px-2 py-1 rounded-md group-hover:bg-primary-50 group-hover:text-primary-900 transition-colors">
                          {profile.measurements[field.name]} {field.unit}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {profile.notes && (
          <div className="mt-8 p-4 bg-amber-50/30 border border-amber-100/50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={12} className="text-amber-600" />
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Tailoring Notes</span>
            </div>
            <p className="text-xs text-stone-600 italic leading-relaxed">"{profile.notes}"</p>
          </div>
        )}
      </div>

      <div className="px-8 py-4 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
        <div className="flex gap-4">
           {onDuplicate && (
             <button 
               onClick={() => onDuplicate(profile._id!)}
               className="flex items-center gap-1.5 text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-primary-900 transition-colors"
             >
               <Copy size={12} /> Duplicate
             </button>
           )}
        </div>
        {onDelete && (
          <button 
            onClick={() => onDelete(profile._id!)}
            className="flex items-center gap-1.5 text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-red-600 transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default PremiumMeasurementCard;
