import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  // Replace useEffect fetch with instantaneous React Query
  const { data: queryData } = useQuery({
    queryKey: ['hero', 'storefront'],
    queryFn: () => cmsService.getHeroSection(),
  });

  useEffect(() => {
    if (queryData?.success && queryData.data && queryData.data.isPublished) {
      const fetched = queryData.data;
      setHeroData(fetched);

      const validSlides = Array.isArray(fetched.slides) ? fetched.slides : [];

      if (validSlides.length > 0) {
        const cleanedSlides = validSlides.map((s: any) => ({
          ...s,
          backgroundImage: s.backgroundImage?.replace(/&amp;/g, '&'),
          mobileBackgroundImage: s.mobileBackgroundImage?.replace(/&amp;/g, '&')
        }));
        setSlides(cleanedSlides);
      } else {
        setSlides([defaultSlide]);
      }
    } else if (queryData) {
      // Data exists but failed validation
      setSlides([defaultSlide]);
      setHeroData({ overlayOpacity: 0.5, autoplayInterval: 5 });
    }
  }, [queryData]);

  // Automated Autoplay Cycle Engine
  useEffect(() => {
    // Autoplay requires at least 2 slides and published state
    if (slides.length <= 1) {
      if (currentIndex !== 0) setCurrentIndex(0);
      return;
    }

    const intervalSeconds = heroData?.autoplayInterval || 5;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [slides.length, heroData?.autoplayInterval, currentIndex]);

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

  if (import.meta.env.DEV && slides.length > 0) {
    console.log(`[Hero] Slide ${currentIndex + 1}/${slides.length} | Asset:`, currentBgSrc);
  }

  return (
    <section
      className="relative w-full min-h-[100svh] min-h-[640px] overflow-hidden bg-neutral-black flex flex-col justify-center select-none"
    >
      {/* Background Image Layer - Cinematic Overlap Crossfade */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`hero-slide-bg-${currentIndex}`}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        >
          {/* Preload all background images to eliminate transition lag */}
          <div className="hidden">
            {slides.map((s, i) => (
              <img
                key={`preload-${i}`}
                src={(isMobile && s.mobileBackgroundImage) ? s.mobileBackgroundImage : (s.backgroundImage || defaultSlide.backgroundImage)}
                alt="preload"
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
              />
            ))}
          </div>

          <SafeImage
            key={`hero-asset-${currentIndex}`}
            src={currentBgSrc}
            alt={`Vasanthi Creations Creative Display - Slide ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full"
            imgClassName="object-[68%_center] sm:object-center"
            fallback={IMAGES.hero.desktop}
            fetchPriority={currentIndex === 0 ? "high" : "auto"}
          />
          <div
            className="absolute inset-0 bg-black transition-opacity duration-1000"
            style={{ opacity: isMobile ? Math.min(overlayOpacity, 0.3) : overlayOpacity }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Primary Dynamic Content Column Overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top)] pb-24 sm:pb-36 flex flex-col justify-end sm:justify-center items-start min-h-[100svh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="max-w-[280px] sm:max-w-2xl mb-24 sm:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {currentSlide.badgeText && (
              <p className="text-accent-bright/95 font-sans text-[0.65rem] sm:text-xs font-semibold tracking-[0.25em] sm:tracking-[0.35em] uppercase mb-4 sm:mb-5 drop-shadow">
                {currentSlide.badgeText}
              </p>
            )}

            <div className="mb-4 sm:mb-6">
              <h1 className="font-display text-white font-medium leading-[0.95] sm:leading-[1.05]">
                <span className="block text-[clamp(2.6rem,8vw,4rem)] sm:text-[clamp(2.5rem,8vw,3.75rem)] tracking-tight font-bold">
                  {currentSlide.titleLine1 || 'Elegance in Every'}
                </span>
                <span className="block text-[clamp(2.8rem,9vw,4.2rem)] sm:text-[clamp(3rem,9.5vw,4.5rem)] mt-0 sm:mt-1 italic font-medium text-accent-light drop-shadow-sm">
                  {currentSlide.titleLine2 || 'Thread'}
                </span>
              </h1>
            </div>

            <p className="font-sans text-white/90 text-sm sm:text-lg font-normal leading-relaxed max-w-[300px] sm:max-w-md mb-8 sm:mb-10 drop-shadow-sm opacity-90 sm:opacity-100">
              {currentSlide.subtitle || 'Discover our curated collection of handwoven sarees, bespoke designer blouses, and bridal masterpieces.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-10 sm:mt-0 items-start">
              {currentSlide.primaryButtonText && (
                <Link
                  to={currentSlide.primaryButtonLink || '/shop'}
                  className="w-auto min-h-[46px] sm:min-h-0 inline-flex items-center justify-center px-8 py-3 sm:px-10 rounded-full text-[0.7rem] sm:text-sm font-semibold tracking-[0.18em] sm:tracking-[0.15em] uppercase text-white bg-primary-800 hover:bg-primary-700 border border-primary-700/40 shadow-sm transition-all duration-400 ease-smooth text-center"
                >
                  {currentSlide.primaryButtonText}
                </Link>
              )}
              {currentSlide.secondaryButtonText && (
                <Link
                  to={currentSlide.secondaryButtonLink || '/custom-blouse'}
                  className="w-auto min-h-[46px] sm:min-h-0 inline-flex items-center justify-center px-8 py-3 sm:px-10 rounded-full text-[0.7rem] sm:text-sm font-semibold tracking-[0.18em] sm:tracking-[0.15em] uppercase text-white border border-white/60 sm:border-2 sm:border-white/85 hover:bg-white/15 hover:border-white backdrop-blur-[4px] transition-all duration-400 ease-smooth text-center"
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
        <div className="absolute inset-y-0 inset-x-0 hidden md:flex items-center justify-between px-3 sm:px-8 pointer-events-none z-20">
          <button
            onClick={handlePrev}
            aria-label="Slide Previous"
            className="hidden md:block pointer-events-auto p-2 sm:p-2.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-xl hover:scale-105"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Slide Next"
            className="hidden md:block pointer-events-auto p-2 sm:p-2.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-95 shadow-xl hover:scale-105"
          >
            <ChevronRight size={18} />
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
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-accent-light shadow-md' : 'w-2 bg-white/40 hover:bg-white/70'
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
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50"
        aria-hidden
      >
        <span className="text-[0.6rem] sm:text-[0.65rem] tracking-[0.3em] uppercase font-medium">Scroll</span>
        <div className="w-[18px] sm:w-[22px] h-7 sm:h-9 rounded-full border border-white/40 flex justify-center pt-1 sm:pt-2 animate-float-y">
          <ChevronDown size={12} sm:size={14} className="text-white/70" strokeWidth={2} />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
