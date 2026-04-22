import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

/** Full-bleed luxury hero — premium typography + cinematic image */
const Hero = () => {
  return (
    <section className="relative w-full min-h-[100svh] min-h-[640px] overflow-hidden bg-neutral-black flex flex-col justify-center">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 14, ease: 'easeOut' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-[center_20%] bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2400&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-28 pb-32 sm:pt-32 sm:pb-36">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-accent-bright/95 font-sans text-[0.7rem] sm:text-xs font-semibold tracking-[0.35em] uppercase mb-5"
          >
            Luxury Indian Ethnic Wear
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="font-display text-white font-medium leading-[1.05]">
              <span className="block text-[clamp(2.25rem,6vw,3.75rem)] tracking-tight">Elegance in Every</span>
              <span className="block text-[clamp(2.75rem,7.5vw,4.5rem)] mt-1 italic font-medium text-accent-light drop-shadow-sm">
                Thread
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.35 }}
            className="font-sans text-white/85 text-base sm:text-lg font-normal leading-relaxed max-w-md mb-10"
          >
            Discover our curated collection of handwoven sarees, bespoke designer blouses, and bridal masterpieces.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-5"
          >
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-9 py-3.5 rounded-full text-sm font-semibold tracking-[0.15em] uppercase text-white bg-primary-800 hover:bg-primary-700 border border-primary-700/40 shadow-lift shadow-black/15 transition-all duration-400 ease-smooth"
            >
              Shop Collection
            </Link>
            <Link
              to="/custom-blouse"
              className="inline-flex items-center justify-center px-9 py-3.5 rounded-full text-sm font-semibold tracking-[0.15em] uppercase text-white border-2 border-white/85 hover:bg-white/12 hover:border-white backdrop-blur-[2px] transition-all duration-400 ease-smooth"
            >
              Custom Blouse
            </Link>
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
