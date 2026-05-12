import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Ruler, Heart, ShoppingBag, Star, Gift, X } from 'lucide-react';
import { marketingService, type OnboardingWizardStep } from '../../../api/services/marketing.service';

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Sparkles,
  Heart,
  Ruler,
  ShoppingBag,
  Star,
  Gift
};

const WelcomeWizard: React.FC = () => {
  const [steps, setSteps] = useState<OnboardingWizardStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Exclusively render on the storefront home page
        if (window.location.pathname !== '/') return;

        const hasSeenWizard = localStorage.getItem('onboarding_wizard_seen');
        // If seen in production/user path, we skip unless in local dev mode testing
        if (hasSeenWizard && !import.meta.env.DEV) return;

        const res = await marketingService.getActiveOnboardingWizard();
        const wizard = res?.data;

        if (wizard && wizard.isActive && wizard.steps && wizard.steps.length > 0) {
          setSteps(wizard.steps);
          // Small delay for clean presentation
          const timer = setTimeout(() => setIsVisible(true), 1200);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('Failed to load active onboarding wizard config:', err);
      }
    };

    fetchConfig();
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem('onboarding_wizard_seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible || steps.length === 0) return null;

  const current = steps[currentStep] || steps[0];
  const CurrentIcon = iconMap[current.icon] || Sparkles;

  // Derive CSS color literal tokens safely
  const colorAccents: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-600' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600' }
  };

  const accent = colorAccents[current.color] || colorAccents.blue;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl border border-white/10 overflow-hidden relative"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />

            {/* Exit Trigger */}
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all z-10"
              title="Close Tour"
            >
              <X size={16} />
            </button>

            <div className="p-10 sm:p-12 relative">
              <div className="flex flex-col items-center text-center">
                {/* Dynamic Vector Icon Indicator */}
                <motion.div
                  key={`icon-${currentStep}`}
                  initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  className={`p-6 ${accent.bg} ${accent.text} rounded-[32px] mb-8`}
                >
                  <CurrentIcon size={48} strokeWidth={1.5} />
                </motion.div>

                {/* Slides Main Descriptors */}
                <motion.div
                  key={`text-${currentStep}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                    {current.title}
                  </h2>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.25em] mb-5">
                    {current.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-md mx-auto mb-10">
                    {current.content}
                  </p>
                </motion.div>

                {/* Micro-Progress Pagination Dots */}
                <div className="flex items-center gap-2 mb-10">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`h-1.5 transition-all duration-500 rounded-full ${
                        idx === currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300'
                      }`}
                      title={`Go to step ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Action Pipeline Trigger */}
                <button
                  onClick={handleNext}
                  className="group flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                >
                  {currentStep === steps.length - 1 ? 'Start Exploring' : 'Continue Journey'}
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Premium Dynamic Linear Gradient footer stroke */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-rose-500 to-amber-500" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeWizard;
