import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CollectionsPage = () => {
  return (
    <div className="min-h-screen bg-neutral-cream py-20 flex flex-col items-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif text-primary-950 mb-6">Our Collections</h1>
          <div className="h-0.5 w-16 bg-accent mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 leading-relaxed mb-12">
            Explore our curated lookbooks featuring seasonal campaigns, regional weaving specialties, and exclusive designer curations. This experience is currently under construction to bring you a premium visual narrative.
          </p>
          
          <Link 
            to="/shop" 
            className="inline-flex items-center text-sm font-semibold tracking-widest uppercase text-white bg-primary-950 px-8 py-4 rounded hover:bg-primary-900 transition-colors shadow-soft"
          >
            Shop All Products
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CollectionsPage;
