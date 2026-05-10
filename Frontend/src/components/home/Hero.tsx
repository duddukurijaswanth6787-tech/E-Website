import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cmsService } from '../../api/services/cms.service';

/** Full-bleed luxury hero — premium typography + cinematic image */
const Hero = () => {
  const [heroData, setHeroData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const res = await cmsService.getHeroSection();
        if (res.data && res.data.isPublished) {
          setHeroData(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch Hero data:', error);
      }
    };
    fetchHeroData();
  }, []);

  const defaultHero = {
    badgeText: 'Luxury Indian Ethnic Wear',
    titleLine1: 'Elegance in Every',
    titleLine2: 'Thread',
    subtitle: 'Discover our curated collection of handwoven sarees, bespoke designer blouses, and bridal masterpieces.',
    backgroundImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2400&auto=format&fit=crop',
    mobileBackgroundImage: '',
    primaryButtonText: 'Shop Collection',
    primaryButtonLink: '/shop',
    secondaryButtonText: 'Custom Blouse',
    secondaryButtonLink: '/custom-blouse',
    overlayOpacity: 0.5
  };

  const data = heroData || defaultHero;

  // Determine which background to use based on screen size
  const currentBgImage = (isMobile && data.mobileBackgroundImage) ? data.mobileBackgroundImage : (data.backgroundImage || defaultHero.backgroundImage);

  return (
    <section className="relative w-full min-h-[100svh] min-h-[640px] overflow-hidden bg-neutral-black flex flex-col justify-center">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 14, ease: 'easeOut' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-[center_20%] bg-no-repeat transition-all duration-[2s] ease-in-out"
          style={{
            backgroundImage: `url('${currentBgImage}')`,
          }}
        />
        <div className="absolute inset-0 bg-black transition-opacity duration-1000" style={{ opacity: data.overlayOpacity }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 sm:pt-32 sm:pb-36 flex flex-col justify-center min-h-[100svh]">
        <div className="max-w-2xl mt-12 sm:mt-0">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-accent-bright/95 font-sans text-[0.65rem] sm:text-xs font-semibold tracking-[0.25em] sm:tracking-[0.35em] uppercase mb-4 sm:mb-5"
          >
            {data.badgeText}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="mb-5 sm:mb-6"
          >
            <h1 className="font-display text-white font-medium leading-[1.05]">
              <span className="block text-[clamp(2.5rem,8vw,3.75rem)] tracking-tight">{data.titleLine1}</span>
              <span className="block text-[clamp(3rem,9.5vw,4.5rem)] mt-0 sm:mt-1 italic font-medium text-accent-light drop-shadow-sm">
                {data.titleLine2}
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.35 }}
            className="font-sans text-white/85 text-sm sm:text-lg font-normal leading-relaxed max-w-md mb-8 sm:mb-10"
          >
            {data.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-5"
          >
            {data.primaryButtonText && (
              <Link
                to={data.primaryButtonLink || '#'}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:px-9 rounded-full text-[0.8rem] sm:text-sm font-semibold tracking-[0.1em] sm:tracking-[0.15em] uppercase text-white bg-primary-800 hover:bg-primary-700 border border-primary-700/40 shadow-lift shadow-black/15 transition-all duration-400 ease-smooth"
              >
                {data.primaryButtonText}
              </Link>
            )}
            {data.secondaryButtonText && (
              <Link
                to={data.secondaryButtonLink || '#'}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:px-9 rounded-full text-[0.8rem] sm:text-sm font-semibold tracking-[0.1em] sm:tracking-[0.15em] uppercase text-white border border-white/60 sm:border-2 sm:border-white/85 hover:bg-white/12 hover:border-white backdrop-blur-[2px] transition-all duration-400 ease-smooth"
              >
                {data.secondaryButtonText}
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50"
        aria-hidden
      >
        <span className="text-[0.65rem] tracking-[0.3em] uppercase font-medium">Scroll</span>
        <div className="w-[22px] h-9 rounded-full border border-white/40 flex justify-center pt-2 animate-float-y">
          <ChevronDown size={14} className="text-white/70" strokeWidth={2} />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
