import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageWithSkeleton } from './Skeleton';
import { useCartStore } from '../../store/cartStore';
import { useState } from 'react';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tag?: string;
  rating?: number;
  ratingCount?: number;
  rewardPoints?: number;
  isTrending?: boolean;
}

export const ProductCard = memo(({ product }: { product: ProductCardProps }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    setIsAdding(true);
    
    await addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    
    setIsAdding(false);
  };

  return (
    <motion.div 
      className="group relative flex flex-col bg-white overflow-hidden"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image Box */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-lg">
        <Link to={`/product/${product.slug}`}>
          <ImageWithSkeleton 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
            containerClassName="w-full h-full"
            loading="lazy"
          />
        </Link>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isTrending && (
            <div className="px-2.5 py-1 bg-pink-500/90 backdrop-blur-sm text-[0.6rem] font-black uppercase tracking-widest text-white rounded shadow-sm">
              Trending
            </div>
          )}
          {product.tag ? (
            <div className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[0.65rem] font-bold uppercase tracking-widest text-primary-900 rounded shadow-sm">
              {product.tag}
            </div>
          ) : product.originalPrice && product.originalPrice > product.price ? (
            <div className="px-2.5 py-1 bg-accent/90 backdrop-blur-sm text-[0.65rem] font-bold uppercase tracking-widest text-primary-950 rounded shadow-sm">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </div>
          ) : null}
        </div>

        {/* Hover Actions (Desktop Only) */}
        <div className="hidden lg:flex absolute top-3 right-3 flex-col space-y-2 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <button className="w-9 h-9 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-soft hover:text-primary-700 hover:bg-primary-50 transition-colors">
            <Heart size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Quick Add Button (Desktop Only) */}
        <div className="hidden lg:block absolute bottom-0 left-0 w-full p-4 opacity-0 transform translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-10">
          <button 
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="w-full bg-primary-950/90 backdrop-blur-md text-white border border-primary-800 text-sm py-3 font-medium tracking-wide uppercase hover:bg-accent hover:text-primary-950 hover:border-accent transition-colors flex items-center justify-center shadow-lg disabled:opacity-80"
          >
            {isAdding ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <>
                 <ShoppingBag size={15} className="mr-2" />
                 Quick Add
               </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="pt-3 sm:pt-5 pb-2 text-center lg:text-left flex flex-col">
        <span className="text-[0.65rem] sm:text-xs text-gray-400 tracking-wider uppercase mb-1">
          {product.category}
        </span>
        <Link to={`/product/${product.slug}`} className="hover:text-primary-700 transition-colors">
          <h3 className="text-xs sm:text-base font-medium text-gray-900 font-sans tracking-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem]">
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
        
        {/* Rating & Rewards Row */}
        <div className="mt-2 flex items-center justify-center lg:justify-start space-x-3">
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
              <span className="text-[10px] text-gray-400 ml-1">({product.ratingCount})</span>
            </div>
          )}

          {product.rewardPoints !== undefined && product.rewardPoints > 0 && (
            <div className="flex items-center px-1.5 py-0.5 bg-primary-50 rounded text-[9px] font-bold text-primary-700 uppercase tracking-tight">
              <span className="mr-1">🎁</span>
              {product.rewardPoints} Pts
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}, (prev, next) => prev.product.id === next.product.id && prev.product.price === next.product.price);
