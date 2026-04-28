import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { settingsService } from '../../api/services/settings.service';

const DEFAULT_BRIDAL = {
  title: 'The Bridal Edit',
  subtitle: 'Legacy of Opulence & Grace.',
  description: 'Your special day deserves the finest craftsmanship. Explore our exclusive bridal catalog featuring handcrafted zari work, heirloom quality silks, and custom-tailored designer blouses.',
  image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1500&auto=format&fit=crop',
  ctaText: 'Explore Bridal Wear',
  ctaPath: '/category/bridal'
};

const BridalSpotlight = () => {
  const [data, setData] = useState(DEFAULT_BRIDAL);

  useEffect(() => {
    const fetchBridal = async () => {
      try {
        const res = await settingsService.getPublicSettings();
        const settingsData = res.data?.data || res.data;
        if (settingsData && settingsData.homepage_bridal_spotlight) {
          setData(settingsData.homepage_bridal_spotlight);
        }
      } catch (err) {
        console.warn('Bridal Spotlight fallback triggered');
      }
    };
    fetchBridal();
  }, []);

  return (
    <section className="py-20 lg:py-32 bg-primary-950 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-accent opacity-10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 flex flex-col items-start"
          >
            <div className="inline-flex items-center space-x-3 mb-6">
              <span className="h-[1px] w-8 bg-accent"></span>
              <span className="text-accent text-sm font-bold uppercase tracking-[0.2em]">The Bridal Edit</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white leading-tight mb-8">
              {data.title.split(' ').map((word, i, arr) => (
                <span key={i}>
                  {word}{' '}
                  {i === arr.length - 2 && <br/>}
                </span>
              ))}
              <span className="italic font-light opacity-90">{data.subtitle}</span>
            </h2>
            
            <p className="text-primary-100 text-lg leading-relaxed mb-10 max-w-md font-light">
              {data.description}
            </p>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-5 w-full">
              <Link 
                to={data.ctaPath} 
                className="w-full sm:w-auto bg-accent text-primary-950 px-6 sm:px-8 py-3.5 sm:py-4 rounded text-sm sm:text-base font-semibold uppercase tracking-wider hover:bg-accent-light transition-colors text-center shadow-premium"
              >
                {data.ctaText}
              </Link>
              <Link 
                to="/custom-blouse" 
                className="w-full sm:w-auto bg-transparent border border-primary-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded text-sm sm:text-base font-semibold uppercase tracking-wider hover:bg-primary-900 transition-colors text-center"
              >
                Book Consultation
              </Link>
            </div>
          </motion.div>

          {/* Image/Visual Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative aspect-[4/5] max-w-md mx-auto lg:max-w-none w-full">
              {/* Premium offset border frame effect */}
              <div className="absolute inset-4 border border-accent/40 z-20 rounded-t-full rounded-b-xl pointer-events-none translate-x-4 -translate-y-4" />
              
              <div className="relative h-full w-full rounded-t-full rounded-b-xl overflow-hidden shadow-2xl">
                <img 
                  src={data.image} 
                  alt="Vasanthi Creations Bridal Saree" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-primary-950/20 mix-blend-overlay"></div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default BridalSpotlight;
