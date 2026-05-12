import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { type WelcomeBanner } from '../../api/services/marketing.service';
import { publicApi } from '../../lib/api';
import { AnimatePresence, motion } from 'framer-motion';

const WelcomeBannerModal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeBanner, setActiveBanner] = useState<WelcomeBanner | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Exclusively render on the storefront home page
  const isStorefrontHome = location.pathname === '/';

  const trackAction = useMutation({
    mutationFn: ({ id, action }: { id: string, action: 'view' | 'click' }) => 
      publicApi.post(`/marketing/welcome-banners/${id}/track`, { action })
  });

  useEffect(() => {
    const fetchActiveBanners = async () => {
      if (!isStorefrontHome) return;
      try {
        const resp: any = await publicApi.get('/marketing/welcome-banners/active');
        const activeList: WelcomeBanner[] = resp?.data || [];

        if (activeList.length === 0) return;

        // Determine Audience
        const isFirstTime = !localStorage.getItem('vc_has_visited_before');
        const audienceContext = isFirstTime ? 'first_time' : 'returning';

        // Determine Device
        const isMobile = window.innerWidth < 768;
        const deviceContext = isMobile ? 'mobile' : 'desktop';

        // Filter and Sort
        let matchedBanners = activeList.filter(b => {
          const audienceMatch = b.targetAudience === 'all' || b.targetAudience === audienceContext;
          const deviceMatch = b.deviceTarget === 'all' || b.deviceTarget === deviceContext;
          return audienceMatch && deviceMatch;
        });

        // Developer Preview Fallback: Always show active banners during local testing to verify designs
        if (matchedBanners.length === 0 && import.meta.env.DEV) {
          matchedBanners = activeList;
        }

        if (matchedBanners.length === 0) return;

        // Sort: Priority (1st) > Audience specificity (2nd) 
        matchedBanners.sort((a, b) => {
          if (a.targetAudience !== 'all' && b.targetAudience === 'all') return -1;
          if (b.targetAudience !== 'all' && a.targetAudience === 'all') return 1;
          return b.priority - a.priority;
        });

        const selectedBanner = matchedBanners[0];

        // Check 24-hour limit (Bypassed in local development for easier preview testing)
        const lastSeenKey = `vc_welcome_banner_${selectedBanner._id}_last_seen`;
        const lastSeen = localStorage.getItem(lastSeenKey);
        
        if (lastSeen && !import.meta.env.DEV) {
          const hoursSinceLastSeen = (Date.now() - parseInt(lastSeen)) / (1000 * 60 * 60);
          if (hoursSinceLastSeen < 24) return; // Hide if seen in last 24h
        }

        // Delay popup slightly for better UX
        setTimeout(() => {
          setActiveBanner(selectedBanner);
          setIsVisible(true);
          
          // Mark as visited for future
          if (isFirstTime) {
            localStorage.setItem('vc_has_visited_before', 'true');
          }
          
          // Track View
          trackAction.mutate({ id: selectedBanner._id, action: 'view' });
        }, 1500);

      } catch (err) {
        console.error('Failed to load welcome banners', err);
      }
    };

    fetchActiveBanners();
  }, [location.pathname, isStorefrontHome]);

  const handleClose = () => {
    setIsVisible(false);
    if (activeBanner) {
      localStorage.setItem(`vc_welcome_banner_${activeBanner._id}_last_seen`, Date.now().toString());
    }
  };

  const handleRedirect = () => {
    if (!activeBanner?.redirectUrl) return;
    
    // Track click
    trackAction.mutate({ id: activeBanner._id, action: 'click' });
    
    setIsVisible(false);
    localStorage.setItem(`vc_welcome_banner_${activeBanner._id}_last_seen`, Date.now().toString());
    
    if (activeBanner.redirectUrl.startsWith('http')) {
      window.open(activeBanner.redirectUrl, '_blank');
    } else {
      navigate(activeBanner.redirectUrl);
    }
  };

  if (!isVisible || !activeBanner) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Banner Image */}
          <div 
            className="w-full aspect-[4/3] bg-stone-100 cursor-pointer relative"
            onClick={activeBanner.redirectUrl ? handleRedirect : undefined}
          >
            <img 
              src={activeBanner.imageUrl} 
              alt={activeBanner.title || 'Welcome'} 
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for text visibility if there is text */}
            {(activeBanner.title || activeBanner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            )}
          </div>

          {/* Banner Content (Only render if there is text to show) */}
          {(activeBanner.title || activeBanner.subtitle || activeBanner.buttonText) && (
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center bg-gradient-to-t from-black/90 to-transparent">
              {activeBanner.title && (
                <h2 className="text-3xl font-serif font-bold text-white mb-2 leading-tight">
                  {activeBanner.title}
                </h2>
              )}
              {activeBanner.subtitle && (
                <p className="text-white/80 text-sm mb-6 max-w-sm mx-auto">
                  {activeBanner.subtitle}
                </p>
              )}
              
              {activeBanner.buttonText && activeBanner.redirectUrl && (
                <button 
                  onClick={handleRedirect}
                  className="px-8 py-3 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl"
                >
                  {activeBanner.buttonText}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeBannerModal;
