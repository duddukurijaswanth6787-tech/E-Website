import React, { useState, useEffect } from 'react';
import { IMAGES } from '../../constants/assets';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  className?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'video' | 'auto';
}

/**
 * Enterprise Production SafeImage Component
 * Stabilized against hotlink drops, infinite fallback loops, and layout shifts.
 */
export const SafeImage: React.FC<SafeImageProps> = React.memo(({
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
  const [errorCount, setErrorCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Reset metrics if the master asset pointer switches actively
  useEffect(() => {
    setErrorCount(0);
    setLoaded(false);
  }, [src]);

  // Derive stable fallback target ensuring absolute local bundling resilience
  const finalFallback = errorCount >= 1 ? IMAGES.bundledFallback : fallback;

  // Intercept hotlinked arrays and unseeded local paths instantly to silence console warnings
  const getSanitizedUrl = (rawUrl: string | undefined) => {
    if (!rawUrl) return finalFallback;
    
    // Automatically map third-party hotlinking blocks directly to bundled physical master files
    if (rawUrl.includes('unsplash.com')) {
      return IMAGES.bundledFallback;
    }

    // If local paths have not yet been dynamically generated via physical file scripts, route straight to memory
    if (rawUrl.includes('/images/') && errorCount > 0) {
      return IMAGES.bundledFallback;
    }

    return rawUrl;
  };

  const currentUrl = errorCount > 0 ? finalFallback : getSanitizedUrl(src);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      default: return '';
    }
  };

  // Derive AVIF-ready paths if the base string contains WebP definitions
  const deriveAvifSrcSet = (baseStr?: string) => {
    if (!baseStr) return undefined;
    return baseStr.replaceAll('.webp', '.avif');
  };

  // Derive highly compressed low-quality progressive blur placeholder target
  const deriveBlurUrl = (targetUrl: string) => {
    if (targetUrl.includes('hero-desktop.webp')) return IMAGES.heroBlur.desktop;
    if (targetUrl.includes('hero-tablet.webp')) return IMAGES.heroBlur.tablet;
    if (targetUrl.includes('hero-mobile.webp')) return IMAGES.heroBlur.mobile;
    if (targetUrl.includes('.webp')) return targetUrl.replace('.webp', '-blur.webp');
    return undefined;
  };

  const isWebpTarget = currentUrl.includes('.webp') && errorCount === 0;
  const targetSrcSet = errorCount > 0 ? undefined : srcSet;
  const avifSrcSet = isWebpTarget ? deriveAvifSrcSet(targetSrcSet || currentUrl) : undefined;
  const webpSrcSet = isWebpTarget ? (targetSrcSet || currentUrl) : undefined;
  const blurUrl = errorCount === 0 ? deriveBlurUrl(currentUrl) : undefined;

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${getAspectClass()} ${className}`}>
      {/* Dynamic Native Skeleton Shimmer Wrapper */}
      {!loaded && errorCount === 0 && !blurUrl && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
      )}

      {/* Instant High-Performance Blur Placeholder Overlay (LQIP Pipeline) */}
      {blurUrl && errorCount === 0 && (
        <img
          src={blurUrl}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover scale-105 filter blur-lg transition-opacity duration-700 ${
            loaded ? 'opacity-0' : 'opacity-60'
          }`}
        />
      )}

      <picture className="w-full h-full block">
        {avifSrcSet && (
          <source type="image/avif" srcSet={avifSrcSet} sizes={errorCount > 0 ? undefined : sizes} />
        )}
        {webpSrcSet && (
          <source type="image/webp" srcSet={webpSrcSet} sizes={errorCount > 0 ? undefined : sizes} />
        )}
        <img
          src={currentUrl}
          alt={alt || 'Vasanthi Creations Masterwork Asset'}
          loading={fetchPriority === 'high' ? 'eager' : 'lazy'}
          fetchPriority={fetchPriority}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErrorCount(prev => {
              const nextCount = prev + 1;
              
              // Only log the first failure and only in development to reduce noise
              if (nextCount === 1 && import.meta.env.DEV) {
                console.warn(`[SafeImage] Asset load failed: ${src}. Applying fallback.`);
              }
              
              return nextCount;
            });
          }}
          className={`w-full h-full object-cover relative z-10 transition-opacity duration-500 ${
            loaded || errorCount > 0 ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      </picture>
    </div>
  );
});

SafeImage.displayName = 'SafeImage';
