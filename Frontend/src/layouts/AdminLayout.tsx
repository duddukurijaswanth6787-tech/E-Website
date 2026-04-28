import { useState, useMemo } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Package, Users, ShoppingBag, 
  Settings, LogOut, FileText, Image as ImageIcon,
  DollarSign, Activity, Lock, Shield, Bell, Heart, Layout, MessageSquare, Share2, Bookmark, Layers,
  X, Menu
} from 'lucide-react';

const navItems = [
    // Core Operational Loop
    { label: 'Dashboard', icon: <BarChart size={18} />, path: '/admin', roles: ['admin', 'super_admin'] },
    { label: 'Orders Pipeline', icon: <ShoppingBag size={18} />, path: '/admin/orders', roles: ['admin', 'super_admin'] },
    { label: 'Custom Blouses', icon: <Package size={18} />, path: '/admin/custom-requests', roles: ['admin', 'super_admin'] },
    { label: 'Blouse Config', icon: <Settings size={18} />, path: '/admin/custom-blouse-options', roles: ['admin', 'super_admin'] },
    { label: 'Inventory', icon: <Package size={18} />, path: '/admin/products', roles: ['admin', 'super_admin'] },
    
    // CRM Target
    { label: 'Clients / Identity', icon: <Users size={18} />, path: '/admin/customers', roles: ['admin', 'super_admin'] },
    { label: 'Product Reviews', icon: <MessageSquare size={18} />, path: '/admin/reviews', roles: ['admin', 'super_admin'] },
    { label: 'Support Queue', icon: <Bell size={18} />, path: '/admin/support', roles: ['admin', 'super_admin'] },
    
    // Core Marketing & Configuration Matrix
    { label: 'SEO Categories', icon: <Share2 size={18} />, path: '/admin/categories', roles: ['admin', 'super_admin'] },
    { label: 'Sub Categories', icon: <Layers size={18} />, path: '/admin/categories/subcategory-support', roles: ['admin', 'super_admin'] },
    { label: 'Thematic Collections', icon: <Layout size={18} />, path: '/admin/collections', roles: ['admin', 'super_admin'] },
    { label: 'Promotions', icon: <Bookmark size={18} />, path: '/admin/coupons', roles: ['admin', 'super_admin'] },
    { label: 'Blogs & Editorials', icon: <FileText size={18} />, path: '/admin/blogs', roles: ['admin', 'super_admin'] },
    
    // Deep Governance & Execution Hooks
    { label: 'Logistics', icon: <Package size={18} />, path: '/admin/shipping', roles: ['super_admin'] },
    { label: 'CMS Components', icon: <FileText size={18} />, path: '/admin/content', roles: ['super_admin'] },
    { label: 'Hero Banners', icon: <ImageIcon size={18} />, path: '/admin/banners', roles: ['super_admin'] },
    { label: 'Media Library', icon: <ImageIcon size={18} />, path: '/admin/media', roles: ['super_admin'] },
    
    { label: 'Financial Intel', icon: <DollarSign size={18} />, path: '/admin/payments', roles: ['super_admin'] },
    { label: 'Global Traffic', icon: <BarChart size={18} />, path: '/admin/analytics', roles: ['super_admin'] },
    { label: 'Wishlist Conversions', icon: <Heart size={18} />, path: '/admin/wishlist-insights', roles: ['super_admin'] },
    
    // Hard Security Boundary Layer
    { label: 'Admin Map', icon: <Shield size={18} />, path: '/admin/admins', roles: ['super_admin'] },
    { label: 'Roles Matrix', icon: <Lock size={18} />, path: '/admin/roles', roles: ['super_admin'] },
    { label: 'Audit Stream', icon: <Activity size={18} />, path: '/admin/audit-logs', roles: ['super_admin'] },
    { label: 'OTP Gateways', icon: <Lock size={18} />, path: '/admin/otp', roles: ['super_admin'] },
    { label: 'UI Settings', icon: <Settings size={18} />, path: '/admin/settings', roles: ['super_admin'] },
  ];

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // RBAC Filter: Only show nav items the user has permission for
  const filteredNavItems = useMemo(() => navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  ), [user]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 xl:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-primary-950 to-neutral-900 text-neutral-cream flex flex-col flex-shrink-0 shadow-2xl z-30 transform transition-transform duration-300 xl:relative xl:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-primary-900 border-opacity-30 justify-between">
          <Link to="/admin" className="text-xl font-serif font-bold text-accent tracking-widest uppercase">
            Vasanthi Admin
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="xl:hidden text-neutral-cream">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto py-6 sidebar-scrollbar">
          <nav className="px-3 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-primary-800 transition-colors"
              >
                <span className="opacity-80">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-primary-900 border-opacity-30 bg-black/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-800 border border-primary-700/50 flex items-center justify-center text-accent font-bold shadow-inner text-lg">
              {user?.name?.trim()
                ? user.name.trim().charAt(0).toUpperCase()
                : user?.role === 'super_admin'
                  ? 'S'
                  : 'A'}
            </div>
            <div className="flex-col flex min-w-0">
              <span className="text-sm font-bold text-white truncate">{user?.name?.trim() || 'Admin'}</span>
              <span className="text-[0.65rem] text-accent/70 uppercase tracking-widest font-black truncate">
                {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : user?.role?.replace(/_/g, ' ') || '—'}
              </span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-95"
          >
            <LogOut size={14} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow w-0 relative z-0 min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 sm:px-8 z-10 flex-shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="xl:hidden mr-4 text-gray-500 hover:text-primary-800 focus:outline-none p-1 -ml-1 rounded"
            >
              <Menu size={24} />
            </button>
            <div className="text-sm font-medium text-gray-400 uppercase tracking-widest hidden sm:block">
              Management Portal
            </div>
          </div>
          <div className="flex items-center space-x-4 ml-auto">
            <Link to="/" className="text-sm text-primary-600 hover:text-primary-800 font-medium font-sans">
              Live Store &rarr;
            </Link>
          </div>
        </header>

        <main className="flex-grow overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
