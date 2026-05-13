import React, { useState, useEffect, useRef } from 'react';
import { IMAGES } from '../../constants/assets';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  className?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'video' | 'auto';
}

// Module-level cache: tracks URLs that have already failed so we never retry
// them and never spam the console across re-renders or remounts.
const _failedUrlCache = new Set<string>();

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
  // Use the module-level cache to pre-seed error state for known-bad URLs
  const initialError = !!src && _failedUrlCache.has(src);
  const [errorCount, setErrorCount] = useState(initialError ? 1 : 0);
  const [loaded, setLoaded] = useState(false);
  const hasLoggedRef = useRef(false);

  // Reset metrics if the master asset pointer switches actively
  useEffect(() => {
    const isKnownBad = !!src && _failedUrlCache.has(src);
    setErrorCount(isKnownBad ? 1 : 0);
    setLoaded(false);
    hasLoggedRef.current = isKnownBad; // don't re-log known-bad URLs
  }, [src]);

  // Derive stable fallback target ensuring absolute local bundling resilience
  const finalFallback = IMAGES.bundledFallback;

  // Intercept hotlinked arrays and unseeded local paths instantly to silence console warnings
  const getSanitizedUrl = (rawUrl: string | undefined) => {
    if (!rawUrl) return finalFallback;
    // Automatically map third-party hotlinking blocks directly to bundled physical master files
    if (rawUrl.includes('unsplash.com')) return IMAGES.bundledFallback;
    // If this URL is already in our failed cache, skip straight to fallback
    if (_failedUrlCache.has(rawUrl)) return finalFallback;
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

  // Only attempt AVIF/WebP <picture> source hints when serving a real webp/avif
  // (not for bundled PNG fallbacks which have a hash-based Vite path)
  const isWebpTarget = currentUrl.includes('.webp') && errorCount === 0;
  const targetSrcSet = errorCount > 0 ? undefined : srcSet;
  const avifSrcSet = isWebpTarget && targetSrcSet ? targetSrcSet.replace(/\.webp/g, '.avif') : undefined;
  const webpSrcSet = isWebpTarget ? (targetSrcSet || undefined) : undefined;

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${getAspectClass()} ${className}`}>
      {/* Dynamic Native Skeleton Shimmer Wrapper */}
      {!loaded && errorCount === 0 && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
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
          alt={alt || 'Vasanthi Creations Asset'}
          loading={fetchPriority === 'high' ? 'eager' : 'lazy'}
          fetchPriority={fetchPriority}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (errorCount > 0) return; // already in fallback — stop
            const failedUrl = src || '';
            // Add to module-level cache so future renders skip this URL immediately
            if (failedUrl) _failedUrlCache.add(failedUrl);
            // Log only once, only in DEV, only for the first failure of this URL
            if (!hasLoggedRef.current && import.meta.env.DEV) {
              hasLoggedRef.current = true;
              console.warn(`[SafeImage] Asset load failed: ${failedUrl}`);
            }
            setErrorCount(1);
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
