import { useMemo, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Heart, Scissors, MapPin, Shield, LayoutDashboard, LogOut, Menu, X, ChevronRight } from 'lucide-react';

const UserLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarLinks = useMemo(() => [
    { path: '/my', label: 'Overview', icon: LayoutDashboard },
    { path: '/my/profile', label: 'Profile', icon: User },
    { path: '/my/orders', label: 'Orders', icon: Package },
    { path: '/my/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/my/custom-requests', label: 'Custom Requests', icon: Scissors },
    { path: '/my/addresses', label: 'Addresses', icon: MapPin },
    { path: '/my/settings', label: 'Security & Auth', icon: Shield },
  ], []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8F1]">
      {/* Premium Header */}
      <header className="bg-white border-b border-[#FBEAF0] shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-[#A51648] hover:bg-[#FBEAF0] rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="text-xl font-serif font-bold text-[#A51648] tracking-wide">
              Vasanthi Creations
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="hidden sm:inline text-sm font-medium text-[#1F1A1C]">Hello, {user?.name || 'Customer'}</span>
            <button onClick={logout} className="flex items-center text-xs font-bold text-[#A51648] hover:text-[#5A001F] uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-[#FBEAF0] transition-colors">
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#5A001F] to-[#A51648]">
                <div className="text-white">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] opacity-80 decoration-[#D4AF37]">Customer Account</p>
                  <p className="font-serif text-lg font-bold">Navigation</p>
                </div>
                <button onClick={closeMenu} className="p-2 text-white/80 hover:text-white rounded-full bg-white/10">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {sidebarLinks.map(link => {
                  const isActive = location.pathname === link.path;
                  const Icon = link.icon;
                  return (
                    <Link 
                      key={link.path}
                      to={link.path}
                      onClick={closeMenu}
                      className={`flex items-center justify-between px-4 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                        isActive ? 'bg-[#5A001F] text-[#FFF8F1] shadow-lg' : 'text-[#1F1A1C]/70 hover:bg-[#FBEAF0]'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon size={18} className={`mr-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#A51648]'}`} />
                        {link.label}
                      </div>
                      {isActive && <ChevronRight size={16} className="text-[#D4AF37]" />}
                    </Link>
                  );
                })}
              </div>

              <div className="p-6 border-t border-gray-50 flex flex-col gap-4">
                 <button onClick={logout} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-red-100 text-red-600 font-bold uppercase tracking-widest text-xs hover:bg-red-50">
                    <LogOut size={16} /> Logout Account
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 flex gap-8">
        {/* Desktop Sidebar (Always Vertical) */}
        <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(90,0,31,0.05)] p-4 flex flex-col space-y-1.5 border border-[#FBEAF0] sticky top-24">
            <div className="px-4 py-3 mb-4 border-b border-[#D4AF37]/20 flex flex-col">
               <span className="text-[0.65rem] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Account Management</span>
               <span className="text-sm font-serif font-bold text-[#5A001F]">Control Center</span>
            </div>
            {sidebarLinks.map(link => {
              const isActive = location.pathname === link.path || (link.path !== '/my' && location.pathname.startsWith(link.path));
              const Icon = link.icon;
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`flex items-center px-5 py-4 text-[0.75rem] uppercase tracking-widest font-bold rounded-2xl transition-all relative group ${
                    isActive 
                      ? 'bg-[#5A001F] text-[#FFF8F1] shadow-[0_6px_20px_rgba(90,0,31,0.2)]' 
                      : 'text-[#1F1A1C]/70 hover:bg-[#FFF8F1] hover:text-[#A51648]'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#D4AF37]' : 'text-[#A51648]/60'}`} />
                  {link.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeLink"
                      className="absolute right-4 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-grow min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
