import { useState, useMemo, Suspense } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Package, Users, ShoppingBag, IndianRupee, 
  Settings, LogOut, Activity, Scissors, Menu, X, Shield,
  ChevronDown, Sun, Moon, Globe, Scale, TrendingUp, Zap, Layout
} from 'lucide-react';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationDrawer from '../components/notifications/NotificationDrawer';
import { MarketingSkeleton } from '../components/admin/marketing/MarketingComponents';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
  children?: { label: string; path: string; icon?: React.ReactNode }[];
}

const navItems: NavItem[] = [
    { label: 'Dashboard', icon: <BarChart size={18} />, path: '/admin', roles: ['admin', 'super_admin'] },
    
    // Marketing Cluster (ERP M-1 to M-16)
    { 
      label: 'Marketing Hub', 
      icon: <Activity size={18} />, 
      path: '/admin/marketing', 
      roles: ['admin', 'super_admin'],
      children: [
        { label: 'Control Center', path: '/admin/marketing' },
        { label: 'Marketing AI', path: '/admin/marketing/ai' },
        { label: 'Delivery Hub', path: '/admin/marketing/delivery' },
        { label: 'Influencer Hub', path: '/admin/marketing/influencers' },
        { label: 'Hero Banners', path: '/admin/marketing/banners' },
        { label: 'Promo Blocks', path: '/admin/marketing/promo-blocks' },
        { label: 'Welcome Banners', path: '/admin/marketing/welcome-banners' },
        { label: 'Onboarding Wizard', path: '/admin/marketing/onboarding-wizard' },
        { label: 'Sticky Offers', path: '/admin/marketing/sticky-offers' },
        { label: 'Social Pulse', path: '/admin/marketing/reviews' },
        { label: 'Smart Coupons', path: '/admin/marketing/coupons' },
        { label: 'Content Engine', path: '/admin/marketing/blogs' },
        { label: 'Funnel Intel', path: '/admin/marketing/funnel' },
        { label: 'Behavior Pulse', path: '/admin/marketing/behavior' },
        { label: 'Ad Intel', path: '/admin/marketing/ads' },
        { label: 'Festival Engine', path: '/admin/marketing/festivals' },
        { label: 'Financial Intel', path: '/admin/marketing/sales' },
        { label: 'Data Lifecycle', path: '/admin/marketing/retention' },
      ]
    },

    { label: 'Orders Pipeline', icon: <ShoppingBag size={18} />, path: '/admin/orders', roles: ['admin', 'super_admin'] },
    { label: 'Payments', icon: <IndianRupee size={18} />, path: '/admin/payments', roles: ['admin', 'super_admin'] },
    { label: 'Inventory', icon: <Package size={18} />, path: '/admin/products', roles: ['admin', 'super_admin'] },
    { label: 'Clients', icon: <Users size={18} />, path: '/admin/customers', roles: ['admin', 'super_admin'] },
    { label: 'Managers', icon: <Shield size={18} />, path: '/admin/managers', roles: ['admin', 'super_admin'] },
    
    // Production
    { label: 'Tailors Team', icon: <Scissors size={18} />, path: '/admin/tailors', roles: ['super_admin', 'manager', 'admin'] },
    { label: 'Workflows', icon: <Activity size={18} />, path: '/admin/workflows', roles: ['super_admin', 'manager', 'admin'] },
    { label: 'Workforce', icon: <Users size={18} />, path: '/admin/workforce', roles: ['super_admin', 'admin'] },
    
    // Management & Security
    { label: 'Audit Stream', icon: <Activity size={18} />, path: '/admin/audit-logs', roles: ['super_admin'] },
    { label: 'SEO Intelligence', icon: <Globe size={18} />, path: '/admin/seo', roles: ['super_admin'] },
    { label: 'Business Insights', icon: <TrendingUp size={18} />, path: '/admin/business-insights', roles: ['super_admin', 'admin'] },
    { label: 'System Monitoring', icon: <Zap size={18} />, path: '/admin/monitoring', roles: ['super_admin'] },
    { label: 'Legal Compliance', icon: <Scale size={18} />, path: '/admin/legal', roles: ['super_admin', 'admin'] },
    { label: 'Storefront Hero', icon: <Layout size={18} />, path: '/admin/hero', roles: ['super_admin', 'admin'] },
    { label: 'UI Settings', icon: <Settings size={18} />, path: '/admin/settings', roles: ['super_admin'] },

];

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Marketing Hub']);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const filteredNavItems = useMemo(() => navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  ), [user]);

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[var(--admin-bg)] overflow-hidden font-sans relative transition-colors duration-500">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 xl:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 w-72 bg-[var(--admin-sidebar)] text-[var(--admin-text-primary)] flex flex-col flex-shrink-0 border-r border-[var(--admin-card-border)] z-50 transform transition-transform duration-500 ease-in-out xl:relative xl:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-8 border-b border-[var(--admin-card-border)] justify-between bg-[var(--admin-sidebar)]/50 backdrop-blur-xl">
          <Link to="/admin" className="text-xl font-black text-[var(--admin-text-primary)] tracking-tighter flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">V</div>
            <span>VASANTHI <span className="text-blue-500">ERP</span></span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="xl:hidden text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto py-6 sidebar-scrollbar px-4 space-y-1.5">
          {filteredNavItems.map((item) => {
            const active = isActive(item.path);
            const hasChildren = item.children && item.children.length > 0;
            const expanded = expandedItems.includes(item.label);

            return (
              <div key={item.path} className="space-y-1">
                {hasChildren ? (
                  <div 
                    className={`
                      group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer select-none
                      ${active ? 'bg-blue-600/10 text-blue-500' : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-black/5 dark:hover:bg-white/[0.02]'}
                    `}
                    onClick={() => toggleExpand(item.label)}
                  >
                    <div className="flex items-center gap-3.5 flex-grow min-w-0">
                      <span className={`flex-shrink-0 transition-colors ${active ? 'text-blue-500' : 'group-hover:text-[var(--admin-text-primary)]'}`}>{item.icon}</span>
                      <span className="font-bold tracking-wide truncate">{item.label}</span>
                    </div>
                    <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 ml-2">
                      <ChevronDown size={14} className="opacity-50" />
                    </motion.div>
                  </div>
                ) : (
                  <Link 
                    to={item.path}
                    className={`
                      group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all select-none block
                      ${active ? 'bg-blue-600/10 text-blue-500 shadow-sm' : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-black/5 dark:hover:bg-white/[0.02]'}
                    `}
                  >
                    <div className="flex items-center gap-3.5 flex-grow min-w-0">
                      <span className={`flex-shrink-0 transition-colors ${active ? 'text-blue-500' : 'group-hover:text-[var(--admin-text-primary)]'}`}>{item.icon}</span>
                      <span className="font-bold tracking-wide truncate">{item.label}</span>
                    </div>
                  </Link>
                )}

                <AnimatePresence>
                  {hasChildren && expanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-11 space-y-1"
                    >
                      {item.children!.map(child => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`
                            block py-2 text-xs font-black uppercase tracking-widest transition-all
                            ${location.pathname === child.path ? 'text-blue-500' : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'}
                          `}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-[var(--admin-card-border)] bg-[var(--admin-bg)]/20 backdrop-blur-xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black shadow-xl text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-col flex min-w-0">
              <span className="text-sm font-black text-[var(--admin-text-primary)] truncate uppercase tracking-tighter">{user?.name || 'Admin'}</span>
              <span className="text-[10px] text-blue-500/70 uppercase tracking-[0.2em] font-black truncate">
                {user?.role?.replace(/_/g, ' ') || 'Master'}
              </span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center justify-center space-x-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-white hover:bg-rose-500/10 border border-rose-500/10 transition-all active:scale-95"
          >
            <LogOut size={16} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-grow w-0 relative z-0 min-w-0">
        <header className="h-20 bg-[var(--admin-header)] backdrop-blur-xl border-b border-[var(--admin-card-border)] flex items-center justify-between px-8 z-40 flex-shrink-0 transition-colors">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="xl:hidden mr-6 text-[var(--admin-text-primary)] hover:text-blue-500 transition-colors p-2 bg-white/5 rounded-xl border border-white/10 shadow-lg">
              <Menu size={24} />
            </button>
            <div className="text-[10px] font-black text-[var(--admin-text-secondary)] uppercase tracking-[0.3em] hidden sm:block">
              Vasanthi ERP / <span className="text-[var(--admin-text-primary)]">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-[var(--admin-card-border)] bg-[var(--admin-card)] text-[var(--admin-text-primary)] hover:bg-blue-600/10 hover:text-blue-500 transition-all duration-300 shadow-lg"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <NotificationBell className="hover:bg-white/5 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-all p-2 rounded-xl" />
            <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-400 transition-all px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/10">
              Live Store &rarr;
            </Link>
          </div>
        </header>

        <main className="flex-grow overflow-auto p-4 sm:p-8 bg-[var(--admin-bg)] custom-scrollbar transition-colors">
          <Suspense fallback={<MarketingSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <NotificationDrawer />
    </div>
  );
};

export default AdminLayout;
