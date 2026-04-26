import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { itemCount } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const cartCount = itemCount();

  const isHome = location.pathname === '/';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  /** Primary nav matches premium hero reference */
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Custom Blouse', path: '/custom-blouse' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const extraLinks = [
    { name: 'Collections', path: '/collections' },
    { name: 'Blogs', path: '/blogs' },
  ];

  /** Theme classes based on route location */
  const headerBg = isHome 
    ? 'bg-transparent' 
    : 'bg-white/95 backdrop-blur-md shadow-sm';
  const navShell = isHome ? '[text-shadow:0_1px_3px_rgba(0,0,0,0.55)]' : '';
  const textLogo = isHome ? 'text-white' : 'text-primary-900';
  const textSubLogo = isHome ? 'text-white/85' : 'text-primary-600';
  const linkBase = isHome ? 'text-white/95 hover:text-white' : 'text-gray-600 hover:text-primary-900';
  const linkActive = isHome ? 'text-white' : 'text-primary-950';
  const linkUnderline = isHome ? 'bg-accent-light' : 'bg-primary-900';
  const iconClass = isHome ? 'text-white hover:text-white/90' : 'text-gray-700 hover:text-primary-900';

  return (
    <>
      {location.pathname !== '/' && (
        <div className="bg-primary-950 text-accent font-serif text-xs sm:text-sm tracking-widest text-center py-2 px-4 shadow-inner">
          FREE PREMIUM SHIPPING ON DOMESTIC ORDERS OVER ₹5,000 ✨
        </div>
      )}

      <header
        className={`z-50 transition-colors duration-500 ${headerBg} ${
          isHome
            ? 'fixed top-0 left-0 right-0 py-5 sm:py-6'
            : 'sticky top-0 py-4 sm:py-5 border-b border-gray-100'
        }`}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${navShell}`}>
          <div className="relative flex items-center justify-between gap-4">
            <button
              type="button"
              className={`lg:hidden p-1 rounded-md transition-colors z-10 ${iconClass}`}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>

            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 flex-shrink-0 flex flex-col items-center lg:items-start z-10 lg:min-w-[160px]"
            >
              <span className={`font-display text-2xl sm:text-3xl font-semibold tracking-[0.12em] uppercase transition-colors ${textLogo}`}>
                Vasanthi
              </span>
              <span className={`text-[0.6rem] sm:text-[0.65rem] tracking-[0.45em] font-medium uppercase mt-0.5 transition-colors ${textSubLogo}`}>
                Creations
              </span>
            </Link>

            <nav className="hidden lg:flex items-center justify-center flex-1 gap-x-8 xl:gap-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-semibold tracking-[0.2em] uppercase transition-colors relative py-1 ${
                    location.pathname === link.path ? linkActive : linkBase
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <span className={`absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full ${linkUnderline}`} />
                  )}
                </Link>
              ))}
            </nav>

            <div className={`flex items-center justify-end gap-4 sm:gap-5 flex-shrink-0 min-w-[88px] lg:min-w-[200px] z-10`}>
              <button type="button" title="Search" className={`hidden sm:block transition-colors ${iconClass}`}>
                <Search size={20} strokeWidth={1.5} />
              </button>
              <Link to="/my/wishlist" title="Wishlist" className={`hidden sm:block transition-colors ${iconClass}`}>
                <Heart size={20} strokeWidth={1.5} />
              </Link>
              <Link to={isAuthenticated ? (user?.role === 'admin' || user?.role === 'super_admin' ? '/admin' : '/my/profile') : '/login'} title="Account" className={`transition-colors ${iconClass}`}>
                <User size={20} strokeWidth={1.5} />
              </Link>
              <Link to="/cart" title="Cart" className={`relative transition-colors ${iconClass}`}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 text-[0.6rem] font-bold h-4 min-w-[1rem] px-0.5 rounded-full flex items-center justify-center bg-red-600 text-white [text-shadow:none]">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-neutral-cream z-[70] shadow-premium flex flex-col lg:hidden"
            >
              <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex flex-col bg-primary-50 px-4 py-2 rounded-md">
                  <span className="font-display text-xl font-semibold text-primary-700 tracking-wider uppercase">
                    Vasanthi
                  </span>
                  <span className="text-[0.6rem] tracking-[0.35em] text-accent-dark font-medium uppercase mt-0.5">
                    Creations
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-primary-700 hover:bg-primary-50 rounded-full transition"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex flex-col space-y-0.5">
                  {[...navLinks, ...extraLinks].map((link) => (
                    <Link
                      key={link.path + link.name}
                      to={link.path}
                      className={`px-6 py-3.5 text-sm font-medium tracking-wide uppercase transition-colors ${
                        location.pathname === link.path
                          ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700 border-l-4 border-transparent'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="mt-6 px-6 pt-6 border-t border-gray-200">
                    <Link to="/my/wishlist" className="flex items-center gap-3 text-gray-600 py-3">
                      <Heart size={20} strokeWidth={1.5} />
                      <span className="text-sm uppercase tracking-wide">Wishlist</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
