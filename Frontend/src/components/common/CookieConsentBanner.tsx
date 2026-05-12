import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Shield, Cookie, X, CheckCircle } from 'lucide-react';

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });

  const location = useLocation();

  useEffect(() => {
    // Hide entirely on admin routes
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/manager') || location.pathname.startsWith('/tailor')) {
       return;
    }

    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1500);

      const handleImplicitConsent = () => {
        localStorage.setItem('cookie_consent', JSON.stringify({ essential: true, analytics: true, marketing: true }));
        setIsVisible(false);
        window.removeEventListener('scroll', handleImplicitConsent);
        window.removeEventListener('click', handleImplicitConsent);
      };

      // Add small delay to prevent immediate trigger on page load
      const timeout = setTimeout(() => {
        window.addEventListener('scroll', handleImplicitConsent, { once: true });
        window.addEventListener('click', handleImplicitConsent, { once: true });
      }, 3000);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('scroll', handleImplicitConsent);
        window.removeEventListener('click', handleImplicitConsent);
      };
    }
  }, [location.pathname]);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({ ...preferences, marketing: true }));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 z-[200] w-[calc(100%-2rem)] sm:w-auto"
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 relative overflow-hidden flex flex-col sm:flex-row items-center gap-4 max-w-sm sm:max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {!showPreferences ? (
              <>
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full shrink-0">
                    <Cookie size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
                      We use cookies to enhance your luxury shopping experience. 
                      <button onClick={() => setShowPreferences(true)} className="text-blue-600 hover:underline ml-1">Preferences</button>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleAcceptAll}
                  className="shrink-0 w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md whitespace-nowrap"
                >
                  Got It
                </button>
              </>
            ) : (
              <div className="relative animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-blue-500" />
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Privacy Preferences</h3>
                  </div>
                  <button onClick={() => setShowPreferences(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    { id: 'essential', label: 'Essential', desc: 'Required for site security and ordering', required: true },
                    { id: 'analytics', label: 'Analytics', desc: 'Helps us improve our fashion collections', required: false },
                    { id: 'marketing', label: 'Marketing', desc: 'Personalized styling and boutique offers', required: false }
                  ].map((cat) => (
                    <div key={cat.id} className="flex items-start justify-between gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{cat.label}</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">{cat.desc}</p>
                      </div>
                      <button 
                        disabled={cat.required}
                        onClick={() => setPreferences({ ...preferences, [cat.id]: !preferences[cat.id as keyof typeof preferences] })}
                        className={`w-10 h-5 rounded-full relative transition-all ${preferences[cat.id as keyof typeof preferences] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: preferences[cat.id as keyof typeof preferences] ? 22 : 2 }}
                          className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleSavePreferences}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} /> Save & Apply
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
