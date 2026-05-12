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
  hero: {
    desktop: "/images/hero/hero-desktop.webp",
    tablet: "/images/hero/hero-tablet.webp",
    mobile: "/images/hero/hero-mobile.webp",
  },
  heroAvif: {
    desktop: "/images/hero/hero-desktop.avif",
    tablet: "/images/hero/hero-tablet.avif",
    mobile: "/images/hero/hero-mobile.avif",
  },
  heroBlur: {
    desktop: "/images/hero/hero-desktop-blur.webp",
    tablet: "/images/hero/hero-tablet-blur.webp",
    mobile: "/images/hero/hero-mobile-blur.webp",
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
