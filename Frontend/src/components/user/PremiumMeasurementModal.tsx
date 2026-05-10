import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  HelpCircle, 
  Sparkles,
  Info,
  History,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MEASUREMENT_SCHEMA, STYLE_OPTIONS, MEASUREMENT_CATEGORIES } from '../../utils/measurementSchema';
import type { MeasurementProfile } from '../../utils/measurementSchema';
import { useMeasurementStore } from '../../store/measurementStore';
import toast from 'react-hot-toast';

interface PremiumMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const PremiumMeasurementModal: React.FC<PremiumMeasurementModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData?.measurements || initialData || {});
  const [profileName, setProfileName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || MEASUREMENT_CATEGORIES[0]);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const { profiles, addProfile, updateProfile, fetchProfiles } = useMeasurementStore();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleFieldChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyProfile = (profile: MeasurementProfile) => {
    setFormData(profile.measurements);
    toast.success(`Applied "${profile.name}" profile`);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error('Please enter a profile name');
      return;
    }
    setIsSavingProfile(true);
    try {
      if (initialData?._id) {
        await updateProfile(initialData._id, {
          name: profileName,
          category,
          measurements: formData,
          notes
        });
        toast.success('Profile updated successfully');
      } else {
        await addProfile({
          name: profileName,
          category,
          measurements: formData,
          isDefault: false,
          notes
        });
        toast.success('Profile saved successfully');
      }
      setIsSavingProfile(false);
    } catch (err) {
      toast.error('Failed to save profile');
      setIsSavingProfile(false);
    }
  };

  const currentSection = MEASUREMENT_SCHEMA[activeStep];
  const isLastStep = activeStep === MEASUREMENT_SCHEMA.length; // Step for Notes & Finalize

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[850px]"
      >
        {/* Sidebar - Progress & Profiles */}
        <div className="w-full md:w-72 bg-stone-50 border-r border-stone-200 p-8 flex flex-col">
          <div className="mb-10">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-6">Fitting Progress</h3>
            <div className="space-y-4">
              {MEASUREMENT_SCHEMA.map((section, idx) => (
                <div 
                  key={section.id}
                  className={`flex items-center gap-3 transition-all ${idx === activeStep ? 'text-primary-900 scale-105 origin-left' : 'text-stone-400'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all
                    ${idx < activeStep ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                      idx === activeStep ? 'bg-white border-primary-900 shadow-sm text-primary-900' : 'bg-transparent border-stone-200'}`}
                  >
                    {idx < activeStep ? <CheckCircle2 size={16} /> : <section.icon size={16} />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">{section.title}</span>
                </div>
              ))}
              <div className={`flex items-center gap-3 ${isLastStep ? 'text-primary-900' : 'text-stone-400'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all
                  ${isLastStep ? 'bg-white border-primary-900 shadow-sm text-primary-900' : 'bg-transparent border-stone-200'}`}>
                  <Sparkles size={16} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Finalize</span>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-stone-200 pt-8">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <History size={12} /> Saved Profiles
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
              {profiles.map(p => (
                <button 
                  key={p._id}
                  onClick={() => handleApplyProfile(p)}
                  className="w-full text-left p-3 rounded-xl border border-stone-200 bg-white hover:border-primary-900 hover:shadow-sm transition-all group"
                >
                  <p className="text-[10px] font-black text-stone-900 uppercase tracking-tighter truncate">{p.name}</p>
                  <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest">{p.category}</p>
                </button>
              ))}
              {profiles.length === 0 && (
                <p className="text-[10px] text-stone-400 italic">No profiles saved yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="p-6 md:p-8 border-b border-stone-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-950">
                {isLastStep ? 'Finalize Your Fitting' : currentSection.title}
              </h2>
              <p className="text-xs text-stone-400 mt-1">Guided tailoring experience for premium boutique finish.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <X size={20} className="text-stone-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {!isLastStep ? (
                <motion.div 
                  key={currentSection.id}
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {currentSection.fields.map(field => (
                    <div key={field.name} className="space-y-3 group">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                          {field.label}
                          <div className="relative group/tip">
                            <HelpCircle size={10} className="text-stone-300 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-stone-900 text-white text-[8px] leading-relaxed rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              {field.helper}
                            </div>
                          </div>
                        </label>
                        <span className="text-[10px] font-bold text-primary-700">{field.unit}</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.5"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={`${field.min} - ${field.max}`}
                          className="w-full pl-4 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-900 focus:border-transparent transition-all outline-none"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Visual Aid Placeholder */}
                  <div className="md:col-span-2 mt-4 p-6 bg-amber-50/50 rounded-3xl border border-amber-100 flex gap-4 items-start">
                     <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-amber-200 flex-shrink-0 text-amber-600">
                        <Info size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Boutique Tip</p>
                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                          Measurements are preferred in inches for maximum accuracy. For bridal wear, we recommend measuring over the actual innerwear you plan to wear.
                        </p>
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="space-y-10"
                >
                  {/* Style Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {Object.entries(STYLE_OPTIONS).map(([key, options]) => (
                       <div key={key} className="space-y-3">
                          <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{key.replace(/_/g, ' ')}</label>
                          <select 
                            value={formData[key] || ''}
                            onChange={(e) => handleFieldChange(key, e.target.value)}
                            className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-900 outline-none appearance-none"
                          >
                             <option value="">Select Option</option>
                             {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                       </div>
                     ))}
                  </div>

                  {/* Save as Profile Section */}
                  <div className="p-8 bg-primary-950 rounded-[2.5rem] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                      <Sparkles size={120} />
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-lg font-serif font-bold mb-2">Save for Future Orders</h3>
                      <p className="text-xs text-stone-400 mb-8 leading-relaxed max-w-md">Save this fit profile to your private tailoring room. We'll reuse these measurements for your future bridal or casual orders.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <input 
                          type="text" 
                          placeholder="Profile Name (e.g. My Wedding Fit)" 
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 placeholder:text-stone-500"
                        />
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                          {MEASUREMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="mb-6">
                        <textarea 
                          placeholder="Special Tailoring Notes (e.g. Loose fit on arms, deep back)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 placeholder:text-stone-500 min-h-[100px]"
                        />
                      </div>
                      
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-stone-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-200 transition-all disabled:opacity-50"
                      >
                        {isSavingProfile ? 'Saving...' : <><Save size={14} /> {initialData?._id ? 'Update Profile' : 'Save Profile'}</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="p-6 md:p-8 bg-stone-50 border-t border-stone-200 flex justify-between items-center sticky bottom-0 z-10">
            <button 
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="flex items-center gap-2 text-xs font-black text-stone-400 uppercase tracking-widest hover:text-stone-900 transition-all disabled:opacity-0"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            
            <div className="flex gap-4">
              {!isLastStep ? (
                <button 
                  onClick={() => setActiveStep(prev => prev + 1)}
                  className="flex items-center gap-3 px-8 py-4 bg-stone-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Next Step <ChevronRight size={14} />
                </button>
              ) : (
                <button 
                  onClick={() => onSave(formData)}
                  className="flex items-center gap-3 px-10 py-4 bg-primary-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:scale-105 transition-all shadow-lg"
                >
                  <Sparkles size={14} /> Apply to Order
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumMeasurementModal;
