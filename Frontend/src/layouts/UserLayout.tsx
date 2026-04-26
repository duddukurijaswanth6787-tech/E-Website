import { useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User, Package, Heart, Scissors, MapPin, Shield, LayoutDashboard, LogOut } from 'lucide-react';

const UserLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const sidebarLinks = useMemo(() => [
    { path: '/my/profile', label: 'Profile', icon: User },
    { path: '/my/orders', label: 'Orders', icon: Package },
    { path: '/my/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/my/custom-requests', label: 'Custom Requests', icon: Scissors },
    { path: '/my/addresses', label: 'Addresses', icon: MapPin },
    { path: '/my/settings', label: 'Security & Auth', icon: Shield },
    { path: '/my', label: 'Overview', icon: LayoutDashboard },
  ], []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8F1]">
      {/* Simple header for user dashboard */}
      <header className="bg-white border-b border-[#FBEAF0] shadow-[0_4px_20px_rgba(90,0,31,0.03)] sticky top-0 z-40 relative">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-serif font-bold text-[#A51648] tracking-wide">
            Vasanthi Creations
          </Link>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="hidden sm:inline text-sm font-medium text-[#1F1A1C]">Hello, {user?.name || 'Customer'}</span>
            <button onClick={logout} className="flex items-center text-xs font-bold text-[#A51648] hover:text-[#5A001F] uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-[#FBEAF0] transition-colors">
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar / Mobile Tabs */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(90,0,31,0.04)] p-2 md:p-4 flex flex-row overflow-x-auto md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 border border-[#FBEAF0] hide-scroll snap-x snap-mandatory pb-2 md:pb-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20"></div>
            {sidebarLinks.map(link => {
              const isActive = location.pathname === link.path || (link.path !== '/my' && location.pathname.startsWith(link.path));
              const Icon = link.icon;
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`flex items-center flex-shrink-0 snap-center px-4 py-3 md:py-3.5 text-[0.8rem] uppercase tracking-widest font-bold rounded-xl transition-all whitespace-nowrap relative ${
                    isActive 
                      ? 'bg-[#5A001F] text-[#FFF8F1] shadow-md transform scale-[1.02]' 
                      : 'text-[#1F1A1C]/70 hover:bg-[#FBEAF0] hover:text-[#A51648]'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-[#A51648]/60'}`} />
                  {link.label}
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#D4AF37] rounded-r-md hidden md:block"></div>}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-grow bg-transparent overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
