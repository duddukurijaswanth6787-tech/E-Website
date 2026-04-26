import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />
    </div>
  );
};

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
}

import { useState } from 'react';

export const ImageWithSkeleton = ({ 
  src, 
  alt, 
  className = '', 
  containerClassName = '',
  loading = 'lazy'
}: ImageWithSkeletonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      {!isLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        loading={loading}
      />
    </div>
  );
};

export const ProductCardSkeleton = () => (
  <div className="flex flex-col animate-pulse">
    <Skeleton className="aspect-[3/4] rounded-lg w-full mb-4" />
    <Skeleton className="h-4 w-1/3 mb-2" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-5 w-1/4 mt-auto" />
  </div>
);
