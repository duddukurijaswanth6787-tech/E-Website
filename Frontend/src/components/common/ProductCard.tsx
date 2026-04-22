import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tag?: string;
}

export const ProductCard = ({ product }: { product: ProductCardProps }) => {
  return (
    <motion.div 
      className="group relative flex flex-col bg-white overflow-hidden"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image Box */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-lg">
        <Link to={`/product/${product.slug}`}>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        {/* Optional Tag (e.g. Bestseller, New) or Discount */}
        {product.tag ? (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[0.65rem] font-bold uppercase tracking-widest text-primary-900 rounded shadow-sm">
            {product.tag}
          </div>
        ) : product.originalPrice && product.originalPrice > product.price ? (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-accent/90 backdrop-blur-sm text-[0.65rem] font-bold uppercase tracking-widest text-primary-950 rounded shadow-sm">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        ) : null}

        {/* Hover Actions */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <button className="w-9 h-9 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-soft hover:text-primary-700 hover:bg-primary-50 transition-colors">
            <Heart size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 transform translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
          <button className="w-full bg-primary-950/90 backdrop-blur-md text-white border border-primary-800 text-sm py-3 font-medium tracking-wide uppercase hover:bg-accent hover:text-primary-950 hover:border-accent transition-colors flex items-center justify-center shadow-lg">
            <ShoppingBag size={15} className="mr-2" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="pt-5 pb-2 text-center lg:text-left flex flex-col">
        <span className="text-xs text-gray-400 tracking-wider uppercase mb-1">
          {product.category}
        </span>
        <Link to={`/product/${product.slug}`} className="hover:text-primary-700 transition-colors">
          <h3 className="text-base font-medium text-gray-900 font-sans tracking-tight line-clamp-2 min-h-[2.75rem]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center justify-center lg:justify-start space-x-2">
          <span className="text-[0.95rem] font-semibold text-primary-800">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
