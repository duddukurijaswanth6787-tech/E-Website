import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../../constants/assets';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  className?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'video' | 'auto';
}

/**
 * Enterprise Production SafeImage Component
 * Stabilized against hotlink drops and reactive rendering lags.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallback = IMAGES.placeholder,
  className = '',
  aspectRatio = 'auto',
  srcSet,
  sizes,
  fetchPriority,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setError(false);
    setLoaded(false);
    
    // Check if image is already cached
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [src]);

  const finalFallback = IMAGES.bundledFallback;
  const decodedSrc = typeof src === 'string' ? src.replace(/&amp;/g, '&') : src;
  const currentUrl = error ? finalFallback : (decodedSrc || finalFallback);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      default: return '';
    }
  };

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${getAspectClass()} ${className}`}>
      {/* Skeleton Shimmer */}
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 z-10" />
      )}

      <img
        ref={imgRef}
        src={currentUrl}
        alt={alt || 'Asset'}
        loading={fetchPriority === 'high' ? 'eager' : 'lazy'}
        fetchPriority={fetchPriority}
        onLoad={() => setLoaded(true)}
        onError={() => {
          console.warn(`[SafeImage] Failed to load: ${src}`);
          setError(true);
          setLoaded(true); // Stop shimmer
        }}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

SafeImage.displayName = 'SafeImage';
