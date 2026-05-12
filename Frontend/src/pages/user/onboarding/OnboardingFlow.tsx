import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Sparkles, 
  ChevronRight, ArrowLeft, Check, Stars
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    interests: [] as string[],
    style: '',
    colors: [] as string[]
  });

  const toggleInterest = (id: string) => {
    setSelections(prev => ({
      ...prev,
      interests: prev.interests.includes(id) 
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const finish = () => {
    localStorage.setItem('customer_onboarding_complete', 'true');
    localStorage.setItem('customer_preferences', JSON.stringify(selections));
    navigate('/shop');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 flex gap-1 z-50">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`flex-1 transition-all duration-700 ${s <= step ? 'bg-blue-600' : 'bg-gray-100 dark:bg-white/5'}`} 
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-xl text-center"
            >
              <div className="p-4 bg-blue-500/10 text-blue-600 rounded-[24px] inline-flex mb-8">
                <Sparkles size={32} />
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">What are you looking for?</h1>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-12">Select your primary interests</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {[
                  { id: 'bridal', label: 'Bridal Masterpieces', desc: 'Handcrafted wedding blouses & sarees' },
                  { id: 'designer', label: 'Designer Wear', desc: 'Contemporary fashion for events' },
                  { id: 'custom', label: 'Custom Tailoring', desc: 'Bespoke stitching services' },
                  { id: 'ready', label: 'Ready to Wear', desc: 'Quick fashion for daily luxury' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`p-6 rounded-[32px] border transition-all duration-300 group ${
                      selections.interests.includes(item.id)
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-600/10'
                        : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.label}</span>
                      {selections.interests.includes(item.id) && <Check size={16} className="text-blue-600" />}
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{item.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={nextStep}
                disabled={selections.interests.length === 0}
                className="mt-12 group flex items-center gap-3 px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
              >
                Next Step
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-xl text-center"
            >
              <button onClick={prevStep} className="mb-12 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
              
              <div className="p-4 bg-rose-500/10 text-rose-600 rounded-[24px] inline-flex mb-8">
                <Heart size={32} />
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Style Preference</h1>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-12">Choose your aesthetic</p>

              <div className="grid grid-cols-1 gap-4 text-left">
                {[
                  { id: 'traditional', label: 'Royal Traditional', desc: 'Heavy embroidery, zari work, and classic cuts' },
                  { id: 'minimal', label: 'Modern Minimalist', desc: 'Clean lines, subtle details, and contemporary fits' },
                  { id: 'bold', label: 'Bold & Experimental', desc: 'Unique fabrics, trendy patterns, and standout designs' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelections({ ...selections, style: item.id })}
                    className={`p-6 rounded-[32px] border transition-all duration-300 ${
                      selections.style === item.id
                        ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-600/10'
                        : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.label}</span>
                      {selections.style === item.id && <Check size={16} className="text-rose-600" />}
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{item.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={nextStep}
                disabled={!selections.style}
                className="mt-12 group flex items-center gap-3 px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
              >
                Almost There
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-xl text-center"
            >
              <button onClick={prevStep} className="mb-12 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
              
              <div className="p-4 bg-amber-500/10 text-amber-600 rounded-[24px] inline-flex mb-8">
                <Stars size={32} />
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Refining Your Palette</h1>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-12">Preferred color families</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'gold', label: 'Gold & Ivory', color: '#c9a961' },
                  { id: 'red', label: 'Deep Reds', color: '#440817' },
                  { id: 'pastels', label: 'Soft Pastels', color: '#fbccda' },
                  { id: 'blue', label: 'Royal Blues', color: '#1e3a8a' },
                  { id: 'green', label: 'Emeralds', color: '#064e3b' },
                  { id: 'pink', label: 'Rose Gold', color: '#f17293' },
                  { id: 'black', label: 'Noir Luxury', color: '#1a1a1a' },
                  { id: 'white', label: 'Pearl White', color: '#ffffff' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelections(prev => ({
                      ...prev,
                      colors: prev.colors.includes(item.id) 
                        ? prev.colors.filter(c => c !== item.id)
                        : [...prev.colors, item.id]
                    }))}
                    className={`group relative p-2 rounded-full transition-all ${
                      selections.colors.includes(item.id) ? 'ring-2 ring-amber-500 ring-offset-4' : ''
                    }`}
                  >
                    <div 
                      className="w-16 h-16 rounded-full border border-gray-100 dark:border-white/10 shadow-inner"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="mt-3 block text-[9px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={finish}
                className="mt-16 group flex items-center gap-3 px-16 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
              >
                Complete Onboarding
                <Stars size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;
