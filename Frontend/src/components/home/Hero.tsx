import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cmsService } from '../../api/services/cms.service';
import { IMAGES } from '../../constants/assets';
import { SafeImage } from '../common/SafeImage';

export interface HeroSlideItem {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  badgeText?: string;
  backgroundImage?: string;
  mobileBackgroundImage?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const Hero = () => {
  const [heroData, setHeroData] = useState<any>(null);
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Default initial backup slide layout
  const defaultSlide: HeroSlideItem = {
    badgeText: 'Luxury Indian Ethnic Wear',
    titleLine1: 'Elegance in Every',
    titleLine2: 'Thread',
    subtitle: 'Discover our curated collection of handwoven sarees, bespoke designer blouses, and bridal masterpieces.',
    backgroundImage: IMAGES.hero.desktop,
    mobileBackgroundImage: IMAGES.hero.mobile,
    primaryButtonText: 'Shop Collection',
    primaryButtonLink: '/shop',
    secondaryButtonText: 'Custom Blouse',
    secondaryButtonLink: '/custom-blouse',
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchHeroData = async () => {
      try {
        const res = await cmsService.getHeroSection();
        if (abortController.signal.aborted) return;

        if (res.data && res.data.isPublished) {
          const fetched = res.data;
          setHeroData(fetched);
          const loadedSlides = (fetched.slides && fetched.slides.length > 0) ? fetched.slides : [{
            titleLine1: fetched.titleLine1 || defaultSlide.titleLine1,
            titleLine2: fetched.titleLine2 || defaultSlide.titleLine2,
            subtitle: fetched.subtitle || defaultSlide.subtitle,
            badgeText: fetched.badgeText || defaultSlide.badgeText,
            backgroundImage: fetched.backgroundImage || '',
            mobileBackgroundImage: fetched.mobileBackgroundImage || '',
            primaryButtonText: fetched.primaryButtonText || defaultSlide.primaryButtonText,
            primaryButtonLink: fetched.primaryButtonLink || defaultSlide.primaryButtonLink,
            secondaryButtonText: fetched.secondaryButtonText || '',
            secondaryButtonLink: fetched.secondaryButtonLink || '',
          }];
          setSlides(loadedSlides);
        } else {
          // If drafted or offline, present the premium baseline layout fallback
          setSlides([defaultSlide]);
          setHeroData({ overlayOpacity: 0.5, autoplayInterval: 5 });
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        setSlides([defaultSlide]);
        setHeroData({ overlayOpacity: 0.5, autoplayInterval: 5 });
        if (import.meta.env.DEV) {
          console.warn('[Hero] CMS configuration pending API linkage:', error.message);
        }
      }
    };
    fetchHeroData();

    return () => abortController.abort();
  }, []);

  // Automated Autoplay Cycle Engine
  useEffect(() => {
    if (slides.length <= 1) return;

    const intervalSeconds = heroData?.autoplayInterval || 5;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [slides.length, heroData?.autoplayInterval]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || defaultSlide;
  const overlayOpacity = heroData?.overlayOpacity ?? 0.5;

  // Determine appropriate asset geometry based on viewport breakpoints
  const currentBgSrc = (isMobile && currentSlide.mobileBackgroundImage) 
    ? currentSlide.mobileBackgroundImage 
    : (currentSlide.backgroundImage || defaultSlide.backgroundImage);

  return (
    <section 
      className="relative w-full min-h-[100svh] min-h-[640px] overflow-hidden bg-neutral-black flex flex-col justify-center select-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <SafeImage 
            src={currentBgSrc}
            srcSet={`${IMAGES.hero.mobile} 640w, ${IMAGES.hero.tablet} 1024w, ${IMAGES.hero.desktop} 1920w`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            alt={`Vasanthi Creations Creative Display - Slide ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full"
            fallback={IMAGES.hero.desktop}
            fetchPriority={currentIndex === 0 ? "high" : "auto"}
          />
          <div className="absolute inset-0 bg-black transition-opacity duration-700" style={{ opacity: overlayOpacity }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Primary Dynamic Content Column Overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 sm:pt-32 sm:pb-36 flex flex-col justify-center min-h-[100svh]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            className="max-w-2xl mt-12 sm:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {currentSlide.badgeText && (
              <p className="text-accent-bright/95 font-sans text-[0.65rem] sm:text-xs font-semibold tracking-[0.25em] sm:tracking-[0.35em] uppercase mb-4 sm:mb-5 drop-shadow">
                {currentSlide.badgeText}
              </p>
            )}

            <div className="mb-5 sm:mb-6">
              <h1 className="font-display text-white font-medium leading-[1.05]">
                <span className="block text-[clamp(2.5rem,8vw,3.75rem)] tracking-tight font-bold">
                  {currentSlide.titleLine1 || 'Elegance in Every'}
                </span>
                <span className="block text-[clamp(3rem,9.5vw,4.5rem)] mt-0 sm:mt-1 italic font-medium text-accent-light drop-shadow-sm">
                  {currentSlide.titleLine2 || 'Thread'}
                </span>
              </h1>
            </div>

            <p className="font-sans text-white/90 text-sm sm:text-lg font-normal leading-relaxed max-w-md mb-8 sm:mb-10 drop-shadow-sm">
              {currentSlide.subtitle || 'Discover our curated collection of handwoven sarees, bespoke designer blouses, and bridal masterpieces.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
              {currentSlide.primaryButtonText && (
                <Link
                  to={currentSlide.primaryButtonLink || '/shop'}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:px-9 rounded-full text-[0.8rem] sm:text-sm font-semibold tracking-[0.1em] sm:tracking-[0.15em] uppercase text-white bg-primary-800 hover:bg-primary-700 border border-primary-700/40 shadow-lift shadow-black/20 transition-all duration-400 ease-smooth text-center"
                >
                  {currentSlide.primaryButtonText}
                </Link>
              )}
              {currentSlide.secondaryButtonText && (
                <Link
                  to={currentSlide.secondaryButtonLink || '/custom-blouse'}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:px-9 rounded-full text-[0.8rem] sm:text-sm font-semibold tracking-[0.1em] sm:tracking-[0.15em] uppercase text-white border border-white/60 sm:border-2 sm:border-white/85 hover:bg-white/15 hover:border-white backdrop-blur-[4px] transition-all duration-400 ease-smooth text-center"
                >
                  {currentSlide.secondaryButtonText}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Floating Left/Right Carousel Side Controls */}
      {slides.length > 1 && (
        <div className="absolute inset-y-0 inset-x-0 flex items-center justify-between px-3 sm:px-8 pointer-events-none z-20">
          <button 
            onClick={handlePrev}
            aria-label="Slide Previous"
            className="pointer-events-auto p-3 sm:p-4 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-xl hover:scale-105"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={handleNext}
            aria-label="Slide Next"
            className="pointer-events-auto p-3 sm:p-4 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-xl hover:scale-105"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Bottom Slider Indices Progress Nodes */}
      {slides.length > 1 && (
        <div className="absolute bottom-20 sm:bottom-24 inset-x-0 flex justify-center items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Jump directly to creative view ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentIndex ? 'w-8 bg-accent-light shadow-md' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator chevrons */}
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
