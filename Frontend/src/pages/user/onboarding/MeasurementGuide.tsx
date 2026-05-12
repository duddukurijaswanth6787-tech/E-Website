import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ruler, ChevronRight, ChevronLeft, CheckCircle, 
  HelpCircle, Video, BookOpen, Scissors 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const measurementSteps = [
  {
    id: 'bust',
    title: 'Bust Measurement',
    content: 'Measure around the fullest part of your bust. Keep the tape parallel to the floor.',
    tip: 'Wear a non-padded bra for the most accurate measurement.',
    icon: '📏'
  },
  {
    id: 'waist',
    title: 'Natural Waist',
    content: 'Measure around your natural waistline, which is the narrowest part of your torso.',
    tip: 'Don’t pull the tape too tight; keep it comfortably snug.',
    icon: '🧵'
  },
  {
    id: 'shoulder',
    title: 'Shoulder Width',
    content: 'Measure from the edge of one shoulder bone to the other across your upper back.',
    tip: 'Ask a friend to help with this measurement for better accuracy.',
    icon: '🧥'
  },
  {
    id: 'length',
    title: 'Blouse Length',
    content: 'Measure from the high point of your shoulder down to where you want the blouse to end.',
    tip: 'Standard length is usually 14-15 inches for most designs.',
    icon: '📐'
  }
];

const MeasurementGuide = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < measurementSteps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const step = measurementSteps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      {/* Hero Section */}
      <div className="relative py-24 overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/5">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-500/5 blur-[120px] rounded-full -mr-24 -mt-24" />
        
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-4">
            <Ruler size={14} /> Precision Fitting
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none uppercase mb-6">
            The Perfect Fit <br /> <span className="text-gray-300 dark:text-gray-700">Guide</span>
          </h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest max-w-xl">
            A step-by-step visual guide to taking your own measurements for a bespoke Vasanthi Creations masterpiece.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Visual Aid */}
        <div className="relative aspect-[3/4] bg-white dark:bg-gray-900 rounded-[48px] shadow-2xl overflow-hidden border border-white/20 dark:border-white/5 group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Placeholder for real illustration/video */}
          <div className="w-full h-full flex flex-col items-center justify-center p-20 text-center">
            <div className="w-full h-full border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[40px] flex flex-col items-center justify-center">
              <span className="text-8xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-700">{step.icon}</span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Visual Illustration</p>
            </div>
          </div>

          <div className="absolute bottom-10 left-10 right-10">
            <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
              <div className="flex items-center gap-3 text-white mb-2">
                <HelpCircle size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Expert Tip</span>
              </div>
              <p className="text-sm text-white/80 font-medium">{step.tip}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            {measurementSteps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1 flex-1 transition-all duration-700 rounded-full ${
                  idx <= currentStep ? 'bg-amber-500' : 'bg-gray-100 dark:bg-white/5'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                  {currentStep + 1}. {step.title}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                  {step.content}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-3 text-amber-600 mb-3">
                    <BookOpen size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">How to Measure</span>
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Follow the visual markers on the left for precise placement.</p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-3 text-blue-600 mb-3">
                    <Video size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Video Tutorial</span>
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Watch our 15-second guide for this specific measurement.</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-4 pt-8">
            <button
              onClick={prev}
              disabled={currentStep === 0}
              className="p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 transition-all disabled:opacity-30"
            >
              <ChevronLeft size={24} />
            </button>
            
            {currentStep < measurementSteps.length - 1 ? (
              <button
                onClick={next}
                className="flex-1 flex items-center justify-center gap-3 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all"
              >
                Next Measurement <ChevronRight size={18} />
              </button>
            ) : (
              <Link
                to="/my/measurements"
                className="flex-1 flex items-center justify-center gap-3 py-5 bg-amber-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all"
              >
                Save My Profile <CheckCircle size={18} />
              </Link>
            )}
          </div>

          <div className="pt-12 border-t border-gray-100 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <Scissors size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Need Expert Help?</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Book a 1-on-1 WhatsApp video consultation with our stylist.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementGuide;
