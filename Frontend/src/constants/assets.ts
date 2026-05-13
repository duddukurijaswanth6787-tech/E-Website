/**
 * Boutique ERP - Centralized Asset Registry
 * Stabilizes external asset delivery and prevents 404s.
 */

import heroLocal from '../assets/hero.png';

export const IMAGES = {
  // Brand Assets
  logo: "/logo.png",
  logoWhite: "/logo-white.png",
  favicon: "/favicon.ico",

  // Homepage Hero & Banners
  // Using the bundled PNG directly — webp/avif variants are not yet generated
  hero: {
    desktop: heroLocal,
    tablet: heroLocal,
    mobile: heroLocal,
  },
  heroAvif: {
    desktop: heroLocal,
    tablet: heroLocal,
    mobile: heroLocal,
  },
  heroBlur: {
    desktop: heroLocal,
    tablet: heroLocal,
    mobile: heroLocal,
  },
  banners: {
    welcome: "/images/banners/welcome.webp",
  },
  bridal: "/images/products/bridal.webp",
  
  // Categories Fallbacks
  categories: {
    bridal: "/images/products/bridal.webp",
    kanchipuram: "/images/products/kanchipuram.webp",
    cotton: "/images/products/cotton.webp",
    designer: "/images/products/designer.webp",
    festive: "/images/products/festive.webp",
  },

  // Placeholders
  placeholder: "/images/placeholders/fallback.webp",
  errorFallback: "/images/placeholders/fallback.webp",
  emptyState: "/images/placeholders/fallback.webp",
  
  // Bundled native runtime fallback binary reference for instant client resilience
  bundledFallback: heroLocal,
};

export const FONTS = {
  luxury: "'Cormorant Garamond', Georgia, serif",
  sans: "'DM Sans', Inter, sans-serif",
};
