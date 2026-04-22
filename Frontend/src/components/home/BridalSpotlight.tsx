import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BridalSpotlight = () => {
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
              A Legacy Of <br/>
              <span className="italic font-light opacity-90">Opulence</span> & Grace.
            </h2>
            
            <p className="text-primary-100 text-lg leading-relaxed mb-10 max-w-md font-light">
              Your special day deserves the finest craftsmanship. Explore our exclusive bridal catalog featuring handcrafted zari work, heirloom quality silks, and custom-tailored designer blouses.
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                to="/category/bridal" 
                className="bg-accent text-primary-950 px-8 py-4 rounded font-semibold uppercase tracking-wider hover:bg-accent-light transition-colors text-center shadow-premium"
              >
                Explore Bridal Wear
              </Link>
              <Link 
                to="/custom-blouse" 
                className="bg-transparent border border-primary-700 text-white px-8 py-4 rounded font-semibold uppercase tracking-wider hover:bg-primary-900 transition-colors text-center"
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
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1500&auto=format&fit=crop" 
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
